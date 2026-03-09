---
title: "DIY Solar Monitoring Rebuilt: TypeScript, MQTT, and Home Assistant"
description: "After a PSU cable mistake took out my solar monitoring stack, I rebuilt it with TypeScript, MQTT, and Home Assistant — and it's better than the original."
date: "2026-03-09"
updated: "2026-03-09"
tags:
  - solar-tracker
  - homelab
  - typescript
  - mqtt
  - home-assistant
  - timescaledb
series: "Solar Monitoring Stack"
seriesPart: 2
readingTime: "9 min read"
cover: ""
---

This is part two of a two-part series. [Part one covers the original build](/blog/solar-monitoring-part-1-the-python-build) and how it ended. This is the story of what came next.

---

Losing your own work stings. But there's a particular flavor of losing work that only hits when you realize the thing you rebuilt is actually better than the thing you lost.

After a [PSU cable mix-up](/blog/well-i-embarrassed-myself-even-sooner-than-expected-a-modular-psu-cables-tale) took out the drives in my server, I lost all the custom code for my solar monitoring stack. The Python poller, the TypeScript API, the hand-built dashboard — gone. I had two choices: rebuild the same stack, or rethink it.

The new stack is TypeScript, Node.js, MQTT, TimescaleDB, and Home Assistant. It runs in Docker Compose, every piece of it fits in a `git push`, and adding a new sensor takes about three lines of code.

## What I Changed and Why

The original stack wasn't around long enough for the refactoring costs to become truly painful, but there was one thing I already knew I didn't want to carry forward: the custom dashboard. A hand-built web interface is satisfying to build and tedious to keep current. Every new metric meant touching the schema, the API, and the dashboard component. The stack worked, but the dashboard was the part I least wanted to rebuild.

So I didn't. The new approach delegates the dashboard to Home Assistant. Not because Home Assistant is perfect, but because someone else maintains it.

## The New Poller: TypeScript and modbus-serial

The poller was rewritten in TypeScript on Node.js 20. I used `modbus-serial` for the Modbus RTU communication and the `mqtt` library for publishing. The polling interval stayed at 5 seconds.

```typescript
import ModbusRTU from "modbus-serial";
import mqtt from "mqtt";

const client = new ModbusRTU();
await client.connectRTUBuffered("/dev/ttyUSB0", {
  baudRate: 9600,
  parity: "none",
  stopBits: 1,
  dataBits: 8,
});
client.setID(1);
client.setTimeout(3000);
```

The register layout maps about 30 metrics across two protocol areas. P01 covers battery and PV data (input registers), P02 covers inverter state, grid, and load (a mix of input and holding registers). Same fallback logic as the original, but now with TypeScript types so the register definitions are explicit:

```typescript
type RegisterDef = {
  address: number;
  name: string;
  scale: number;
  unit: string;
  deviceClass?: string;
  stateClass?: string;
};

const REGISTERS: RegisterDef[] = [
  { address: 0x0100, name: "battery_soc",     scale: 1,    unit: "%",  deviceClass: "battery",     stateClass: "measurement" },
  { address: 0x0101, name: "battery_voltage",  scale: 0.1,  unit: "V",  deviceClass: "voltage",     stateClass: "measurement" },
  { address: 0x0102, name: "battery_current",  scale: 0.1,  unit: "A",  deviceClass: "current",     stateClass: "measurement" },
  { address: 0x0107, name: "pv1_voltage",      scale: 0.1,  unit: "V",  deviceClass: "voltage",     stateClass: "measurement" },
  { address: 0x0108, name: "pv1_current",      scale: 0.1,  unit: "A",  deviceClass: "current",     stateClass: "measurement" },
  { address: 0x0109, name: "pv1_power",        scale: 1,    unit: "W",  deviceClass: "power",       stateClass: "measurement" },
  // ...~24 more
];
```

Having types here pays off immediately. In Python, a missing key in a dictionary fails at runtime. In TypeScript with strict mode, the wrong shape fails at compile time. I caught two register scaling bugs during the rewrite that would have silently produced wrong numbers in the original.

### Auto-Grouping Contiguous Registers

The same contiguous grouping logic from the Python version is here, but typed:

```typescript
function groupContiguous(regs: RegisterDef[]): Array<{ start: number; count: number; defs: RegisterDef[] }> {
  const sorted = [...regs].sort((a, b) => a.address - b.address);
  const blocks: Array<{ start: number; count: number; defs: RegisterDef[] }> = [];
  let group: RegisterDef[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].address === sorted[i - 1].address + 1) {
      group.push(sorted[i]);
    } else {
      blocks.push({ start: group[0].address, count: group.length, defs: group });
      group = [sorted[i]];
    }
  }
  blocks.push({ start: group[0].address, count: group.length, defs: group });
  return blocks;
}
```

This runs once at startup, so there's no overhead per poll cycle.

## MQTT Replaces the Custom API

In the original stack, the TypeScript API was the integration layer. Anything that wanted solar data had to know the API's endpoints and speak HTTP.

The new integration layer is MQTT, specifically Eclipse Mosquitto running in the same Docker Compose stack. The poller publishes each metric as a retained message on a per-sensor topic:

```
solar/battery_soc        → "87"
solar/battery_voltage    → "52.3"
solar/pv1_power          → "1840"
solar/inverter_state     → "charging"
```

Retained messages mean any new subscriber immediately gets the last known value without waiting for the next poll cycle. Everything that wants solar data subscribes to the relevant topics. Nothing needs to know about the poller, TimescaleDB, or Modbus. MQTT is the contract.

## Home Assistant Auto-Discovery

This is the part that changed the maintenance picture most dramatically.

The poller publishes Home Assistant MQTT discovery configs at startup. Each sensor definition maps directly to a discovery message:

```typescript
function publishDiscovery(mqttClient: mqtt.MqttClient, reg: RegisterDef): void {
  const config = {
    name: reg.name.replace(/_/g, " "),
    state_topic: `solar/${reg.name}`,
    unit_of_measurement: reg.unit,
    device_class: reg.deviceClass,
    state_class: reg.stateClass,
    unique_id: `sph5048_${reg.name}`,
    device: {
      identifiers: ["sph5048"],
      name: "Solar Inverter",
      model: "SPH5048",
      manufacturer: "Sungoldpower",
    },
  };

  mqttClient.publish(
    `homeassistant/sensor/sph5048/${reg.name}/config`,
    JSON.stringify(config),
    { retain: true }
  );
}
```

When Home Assistant sees these discovery messages, it creates all 30+ sensors automatically under a "Solar Inverter" device. No YAML config files. No manual entity setup. They just appear.

Adding a new register to the `REGISTERS` array automatically adds a new sensor in Home Assistant on the next container restart. Removing a register removes it. The definition is the source of truth.

## Energy Tracking With Trapezoidal Integration

The original stack had no energy tracking. It stored power values (watts) but never accumulated them into energy values (kWh). That meant I couldn't use Home Assistant's Energy Dashboard, which needs `total_increasing` sensors with kWh units.

The rebuild adds software energy accumulators. Every poll cycle, the poller calculates the energy added since the last poll using the trapezoidal rule: average the current and previous power readings, multiply by the elapsed time interval.

```typescript
class EnergyAccumulator {
  private totalKwh: number;
  private lastPowerW: number | null;
  private lastTs: number | null;

  constructor(initialKwh = 0) {
    this.totalKwh = initialKwh;
    this.lastPowerW = null;
    this.lastTs = null;
  }

  update(powerW: number, nowMs: number): number {
    if (this.lastPowerW !== null && this.lastTs !== null) {
      const dtHours = (nowMs - this.lastTs) / 3_600_000;
      const avgW = (powerW + this.lastPowerW) / 2;
      this.totalKwh += (avgW * dtHours) / 1000;
    }
    this.lastPowerW = powerW;
    this.lastTs = nowMs;
    return this.totalKwh;
  }

  get value(): number {
    return this.totalKwh;
  }
}
```

Accumulators run for: solar generation (PV1 power), load consumption, grid import, and grid export. On container restart, the poller queries TimescaleDB for the current day's accumulated values and restores the accumulators from there. Daily totals survive reboots.

These publish as `total_increasing` energy sensors, which Home Assistant's Energy Dashboard understands natively. I get daily, weekly, and monthly energy breakdowns with no custom charting code at all.

## TimescaleDB: Continuous Aggregates and Retention

The schema is the same basic approach as before, `(timestamp, key, value)` rows in a hypertable. The difference is continuous aggregates.

TimescaleDB can maintain pre-computed rollups that stay current automatically:

```sql
CREATE MATERIALIZED VIEW inverter_hourly
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 hour', ts) AS bucket,
  key,
  avg(value)  AS avg_val,
  min(value)  AS min_val,
  max(value)  AS max_val
FROM inverter_metrics
GROUP BY bucket, key;

SELECT add_continuous_aggregate_policy('inverter_hourly',
  start_offset => INTERVAL '3 hours',
  end_offset   => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 hour'
);
```

Daily aggregates use `time_bucket_gapfill` with timezone offset so buckets align to local midnight rather than UTC midnight. This matters when you want to show "today's solar yield" and you're not on UTC.

Raw data has a 30-day retention policy. The continuous aggregates keep hourly and daily summaries indefinitely. This keeps the database small while preserving the data that actually gets queried.

## The Full Stack in Docker Compose

Everything runs in a single Compose file:

```yaml
services:
  mosquitto:
    image: eclipse-mosquitto:2
    volumes:
      - ./mosquitto/config:/mosquitto/config
      - mosquitto-data:/mosquitto/data
    ports:
      - "1883:1883"

  timescaledb:
    image: timescale/timescaledb:latest-pg16
    environment:
      POSTGRES_DB: solar
      POSTGRES_USER: solar
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - tsdb-data:/var/lib/postgresql/data
      - ./sql/init.sql:/docker-entrypoint-initdb.d/init.sql

  poller:
    build: ./poller
    depends_on:
      - mosquitto
      - timescaledb
    environment:
      MQTT_HOST: mosquitto
      DB_HOST: timescaledb
      DB_PASSWORD: ${DB_PASSWORD}
      TZ: ${TZ}
    devices:
      - /dev/ttyUSB0:/dev/ttyUSB0
    restart: unless-stopped

volumes:
  mosquitto-data:
  tsdb-data:
```

A `.env` file carries the timezone and any secrets. The whole stack rebuilds from scratch in under a minute on a fresh machine.

The Mosquitto broker is also shared with other Docker Compose stacks on the same host via an external Docker network. Solar metrics, mining stats, and general homelab monitoring all flow through one broker. Any service that wants solar data subscribes to `solar/#`. The poller has no idea who's listening.

## What Got Better

**No more custom dashboard.** The Home Assistant Energy Dashboard gives daily and monthly breakdowns out of the box. Lovelace cards give me live gauges and power flow visualization. All of it is maintained by the HA community, not by me.

**Adding a metric takes three lines.** Drop a new entry in the `REGISTERS` array with the address, name, scale, and unit. TypeScript compilation catches mistakes. The sensor appears in Home Assistant on the next deploy.

**The whole stack fits in a repository.** `docker compose up -d` on a new machine and everything is back. That lesson cost me twice before I learned it.

**Energy tracking works.** The trapezoidal accumulators and TimescaleDB continuous aggregates give me accurate daily kWh numbers without writing any aggregation code in the application layer.

## What I Learned

The biggest lesson isn't about MQTT or TypeScript. It's that a custom dashboard is a liability, not just an asset. Building it was satisfying. Maintaining it was a cost I was paying every time I wanted to change anything. Handing that responsibility to Home Assistant removed the biggest maintenance surface from the whole stack.

MQTT as an integration layer is genuinely more flexible than a custom REST API. Anything can subscribe. Multiple consumers can get the same data without the poller knowing about them. New integrations (future me wants InfluxDB, apparently) just subscribe to the existing topics.

TimescaleDB continuous aggregates are one of the more underrated features in any database I've used. I write 5-second raw data and hourly and daily rollups maintain themselves. No cron jobs, no application-level aggregation, no stale numbers if the poller restarts.

And the thing that should have been obvious: push your code to a repository. Not someday. Before you deploy it.

---

The solar setup is running the new stack right now. If you want to build something similar, the architecture is straightforward. Modbus RTU over USB, 5-second polling, MQTT for distribution, Home Assistant for visualization, TimescaleDB for history. None of it requires specialized hardware or expensive software.

If you have the same inverter or a similar Modbus-speaking one, drop a comment. The register mapping is the hardest part, and the more documentation exists in public, the less time anyone spends reverse-engineering the same spec.
