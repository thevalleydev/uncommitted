---
title: "DIY Solar Monitoring With a Sungoldpower SPH5048: The Python Build"
description: "How I built a custom solar inverter monitoring stack with Python, Modbus RTU, TimescaleDB, and a hand-rolled dashboard — and how a PSU cable killed it."
date: "2026-03-09"
updated: "2026-03-09"
tags:
  - solar-tracker
  - homelab
  - python
  - modbus
  - timescaledb
series: "Solar Monitoring Stack"
seriesPart: 1
readingTime: "8 min read"
cover: ""
---

This is part one of a two-part series on building a DIY solar inverter monitoring system for a Sungoldpower SPH5048. [Part two covers the rebuild](/blog/solar-monitoring-part-2-the-typescript-rebuild) after the whole stack was taken out by a PSU cable mistake.

---

When I first got my solar setup running, I did what any homelab person does: I wanted numbers. Not just the numbers on the inverter's tiny LCD, but historical numbers, trending numbers, "why did the battery only charge to 80% yesterday" numbers.

The Sungoldpower SPH5048 is a 5 kW, 48V hybrid/off-grid inverter with split-phase output. It does a lot of things well. Out-of-the-box monitoring is not one of them. The bundled app is unreliable on a local network, and I had no interest in sending my power data to a cloud I don't control.

My first attempt at fixing this was the easy path: I paid for [Solar Assistant](https://solar-assistant.io) and ran it on a Raspberry Pi. It was a solid solution for about three months, until the Pi's SD card corrupted and took everything with it. That was the first time I lost all my solar tracking data, and I had nothing running for the next four months while I figured out what to do next.

The answer I landed on was to build my own stack. That way I understood every piece, could fix every piece, and wasn't dependent on anyone else's hardware or subscription.

So I built my own stack. And it worked great, right up until it didn't.

## The Hardware Connection

The SPH5048 exposes a Modbus RTU interface over a USB-RS485 adapter. You plug the adapter into the inverter's RS485 port, plug the other end into a USB port on your server, and the inverter shows up as `/dev/ttyUSB0` (or similar, depending on your udev rules).

Modbus RTU is a serial protocol. It's old, reliable, and almost entirely undocumented for any specific device unless you happen to have the right PDF. I eventually found a register map for a close enough variant of the SPH5048 and started mapping registers to the metrics I cared about.

What I wanted to track:

- Battery state of charge (SOC), voltage, current
- PV1 power, voltage, current (I have one PV string)
- Grid power, voltage, frequency
- Load power and apparent power
- Inverter temperatures
- Inverter state (charging, discharging, grid-tied, island mode)

## The Poller

Before I had a working poller, I had a very much not-working one.

My first instinct was to probe the serial connection to figure out what the inverter was doing. Not structured Modbus reads, just throwing bytes at the port to see what came back. What came back was a voltage anomaly. I had flooded the USB/serial interface badly enough that the inverter briefly took everything connected to it offline. No damage, but it was a genuinely scary few seconds watching my whole solar setup drop.

After consulting with an AI about what I was doing wrong, I learned I had been going about it completely backwards. The inverter expects structured Modbus RTU requests. Not probing, not discovery, just: send the right frame, read the response, move on. Once I understood that, everything got simpler.

The Python script that read all of this was built around `pymodbus`. A polling loop ran every 5 seconds, reading register blocks from the inverter and writing the results to TimescaleDB.

```python
from pymodbus.client import ModbusSerialClient

client = ModbusSerialClient(
    port="/dev/ttyUSB0",
    baudrate=9600,
    parity="N",
    stopbits=1,
    bytesize=8,
    timeout=3,
)

def read_register(address, count=1, unit=1):
    result = client.read_input_registers(address, count, slave=unit)
    if result.isError():
        # Some registers are holding registers, not input registers
        result = client.read_holding_registers(address, count, slave=unit)
    if result.isError():
        return None
    return result.registers
```

That fallback between input registers (function code 0x04) and holding registers (function code 0x03) turned out to be load-bearing. The SPH5048 uses both, and the register map doesn't always tell you which is which. You have to try one and fall back to the other.

### The Modbus Quirks Nobody Warned Me About

Modbus RTU sounds simple on paper. In practice, it has opinions.

**Not every documented register is implemented.** The register map listed PV2 registers and a set of P02 area addresses. When I queried them, the inverter returned `Illegal data address` errors. They just don't exist on this hardware revision, even though they're in the spec. I had to build a hardcoded allowlist of registers that actually work.

**Reading too many registers in one request fails.** Modbus has a limit on how many registers you can read in a single request, but the real constraint here was more subtle: the inverter rejects requests that span non-contiguous register areas, even if the span is within spec limits. The solution was to group only contiguous registers into minimal read blocks and issue one request per block.

```python
def group_contiguous(registers):
    """Group registers into contiguous blocks for efficient batch reads."""
    if not registers:
        return []
    sorted_regs = sorted(registers)
    blocks = []
    start = sorted_regs[0]
    prev = sorted_regs[0]
    for reg in sorted_regs[1:]:
        if reg != prev + 1:
            blocks.append((start, prev - start + 1))
            start = reg
        prev = reg
    blocks.append((start, prev - start + 1))
    return blocks
```

**The baud rate matters more than you'd think.** At 9600 baud, a 10-second polling interval is fine. Push it faster and you start seeing timeout errors, especially if anything else on the serial bus is competing. I left it at 5 seconds and never had issues.

## The Database: TimescaleDB

I used TimescaleDB for storage, which is a PostgreSQL extension that turns a regular table into a time-series hypertable. The schema was intentionally simple:

```sql
CREATE TABLE inverter_metrics (
    ts        TIMESTAMPTZ NOT NULL,
    key       TEXT        NOT NULL,
    value     DOUBLE PRECISION
);

SELECT create_hypertable('inverter_metrics', 'ts');

CREATE INDEX ON inverter_metrics (key, ts DESC);
```

Every metric stored as a `(timestamp, key, value)` row. Not the most query-friendly schema for wide tables, but simple to write to and easy to add new metrics without migrations. The inverter had about 30 metrics, so the data volume was manageable: roughly 360 rows every 30 seconds, about 43,000 rows per hour.

TimescaleDB's automatic chunk management and compression made this basically zero-maintenance. I turned on chunk compression after 7 days and it kept the database small without any application-level work.

## The API and Dashboard

Rather than expose TimescaleDB directly to the browser, I put a lightweight TypeScript REST API in front of it. It handled current readings, historical data over a window, and daily/hourly aggregates. Nothing fancy, just a thin layer between the database and the browser.

The dashboard was hand-built HTML, CSS, and vanilla JavaScript. Power flow diagram in the center, SOC gauge on the left, historical charts at the bottom using Chart.js. It looked exactly like what it was: a personal tool someone built over a few weekends.

Building it was genuinely enjoyable. Watching live SOC numbers tick up as the sun came over the panels, seeing the power flow diagram animate between charging and discharging — that was satisfying in a way that a commercial monitoring app would never be, because I made all of it.

Maintaining it was less enjoyable. Every time I wanted to add a metric or change a chart, I was wading back into three layers of code: the schema, the API endpoint, and the dashboard component. Nothing was hard individually. Together, it added up.

## The Stack, Visualized

```
Sungoldpower SPH5048
        |
   RS485 / USB
        |
  Python Poller (pymodbus)
  [10-second poll]
        |
  TimescaleDB (PostgreSQL)
        |
  TypeScript REST API
        |
  Custom HTML/JS Dashboard
```

It was simple at the architecture level. Everything was custom at the implementation level.

## What Worked

The setup ran well. The poller reconnected automatically if the serial connection dropped. TimescaleDB never complained. I had about 10-11 days of 10-second resolution solar data and could query any of it.

I could see exactly when the battery hit 100% and the inverter shifted to grid export. I could track the effect of season changes on daily solar yield. I could see the load jump when the HVAC turned on.

The thing I wanted from the beginning, continuous visibility into my own power system, was working.

## The Loss

Then I killed it myself.

While doing a server upgrade, I mixed a Corsair SATA power cable with an EVGA PSU. The physical connector fits. The pinouts do not match. I wrote an entire post about that incident [here](/blog/well-i-embarrassed-myself-even-sooner-than-expected-a-modular-psu-cables-tale), but the short version is: the mismatch sent wrong voltages to the drives and that was that.

The server came back up. The custom code did not. I had pushed exactly nothing to a repository. The Python poller, the TypeScript API, the dashboard templates, the Chart.js configuration — all of it was gone. I could recreate the TimescaleDB schema from memory, but the application code existed only on that machine.

Second time losing solar monitoring data. This one stung more because I built it myself.

If you have custom code sitting only on a local machine, please go push it somewhere right now. I'll wait.

---

The good news is it forced a rethink. The rebuild wasn't just a restore operation. It was a chance to reconsider what the original stack was actually costing me to run and make different choices.

That's what [part two is about](/blog/solar-monitoring-part-2-the-typescript-rebuild).
