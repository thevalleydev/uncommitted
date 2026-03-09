---
title: "Home Assistant, MQTT That Finally Clicked, and Two Timezone Bugs I Made Myself"
description: "Returning to Home Assistant after nearly a decade away, getting solar monitoring back online with MQTT, and debugging two timezone issues I caused."
date: "2026-03-09"
updated: "2026-03-09"
tags:
  - home-assistant
  - mqtt
  - homelab
  - solar-tracker
  - timescaledb
readingTime: "7 min read"
cover: ""
---

About eight or nine years ago, I tried to set up Home Assistant as a Z-Wave hub. I do not remember the details of what went wrong, only that it went wrong, and I walked away frustrated and stuck with a Vera hub I have been using ever since. The UI on the Vera is bad. It has always been bad. I kept it because I did not want to go through the setup process again.

That changed this past weekend.

## Why I Came Back

The short version is solar monitoring. My Raspberry Pi running Solar Assistant died a while back, and then, as I covered [in my last post](/blog/well-i-embarrassed-myself-even-sooner-than-expected-a-modular-psu-cables-tale), I made the situation worse by frying an SSD with the wrong PSU cables. Rather than rebuild the old setup from scratch, a friend pushed me toward Home Assistant. I had been putting it off for obvious reasons.

The longer version is in [part one](/blog/solar-monitoring-part-1-the-python-build) and [part two](/blog/solar-monitoring-part-2-the-typescript-rebuild) of the solar monitoring series, where I go into the full stack rebuild. For this post I want to focus on the Home Assistant experience itself, specifically two parts of it: MQTT, and the timezone confusion that made my dashboards look completely wrong for the better part of a day.

## The Setup Was Not What I Expected

I set Home Assistant up on an existing machine over the weekend. Within a day I had it running, my solar poller reconnected, and data flowing through an MQTT broker into Home Assistant sensors. A day. The last time I attempted this it took longer than that to decide I was done.

Home Assistant has changed a lot in the years I was not paying attention. The onboarding is clean. The integrations catalog is massive. The built-in Energy Dashboard has features I would have spent weeks building by hand previously. I am still figuring out some of it, but the barrier to getting something useful running is genuinely low now.

## MQTT Finally Made Sense

MQTT is a protocol I have been circling for years without actually committing to. I understood the concept, a publish-subscribe message bus where sensors publish values and consumers subscribe to topics, but every time I tried to learn it I bounced off the setup complexity before I got to anything interesting.

Home Assistant changes that dynamic. When you install the Mosquitto broker add-on and connect the MQTT integration, the auto-discovery mechanism does most of the work. Any device or service that publishes a configuration payload to the right topic becomes a Home Assistant entity automatically. No YAML. No manual entity setup. The device announces itself, Home Assistant listens, the sensor appears.

The discovery topic pattern looks like this:

```
homeassistant/sensor/<device-id>/<metric>/config
```

The payload is a JSON object describing the sensor, including its name, state topic, unit of measurement, and device class. Once that message is retained on the broker, the entity exists in Home Assistant and updates any time a new value is published to the state topic.

```json
{
  "name": "battery_soc",
  "state_topic": "solar/battery_soc",
  "unit_of_measurement": "%",
  "device_class": "battery",
  "state_class": "measurement",
  "unique_id": "sph5048_battery_soc",
  "device": {
    "identifiers": ["sph5048"],
    "name": "Solar Inverter"
  }
}
```

My solar poller publishes about 30 of these at startup. Thirty sensors just appear, grouped under a "Solar Inverter" device, without me touching a single config file. That is the part that clicked for me. The overhead I had always imagined was not there.

MQTT as an integration layer also removes a problem I had with the old stack: everything had to speak HTTP and know about my custom API. Now anything that wants solar data subscribes to `solar/#` on the broker. Multiple consumers, one publisher, no coupling between them.

## The Data Looked Wrong

A day or two after getting things running, I had some time to actually build out a solar dashboard. I wanted a view with daily production totals, some trend charts, and a quick read on current battery state. I pulled the data into Lovelace cards and the numbers immediately looked off.

Some sensors were showing values that did not match what I knew the inverter had been doing. Aggregates were misaligned. Daily totals were not adding up in ways that made sense. The raw sensor readings were fine, it was the grouped and summarized data that was confusing.

Two separate issues turned out to be responsible, both timezone-related, and both entirely my fault.

## Timezone Issue One: Home Assistant

Home Assistant stores timestamps internally. If the timezone setting in Home Assistant does not match your actual timezone, those timestamps are wrong relative to your local time, and anything that depends on them, including Energy Dashboard bucketing and history graphs, shifts accordingly.

The fix is in Settings > System > General. There is a timezone field. Mine was not set correctly. I updated it to the right timezone, restarted, and the history graphs snapped into alignment.

This one is easy to overlook because the live sensor values look fine. The inverter is pushing a number, Home Assistant is displaying it, all is well. The timezone setting only reveals itself when you start asking "what happened at 2pm yesterday" and Home Assistant is working from a different definition of 2pm than you are.

Worth noting: if you run Home Assistant in Docker, the container also needs to have the right timezone set. Passing `TZ` as an environment variable in your Compose file handles it:

```yaml
services:
  homeassistant:
    image: ghcr.io/home-assistant/home-assistant:stable
    environment:
      TZ: America/New_York
```

The UI setting and the container environment variable are separate things. Both need to be correct.

## Timezone Issue Two: TimescaleDB

The second issue was in my TimescaleDB setup. I use TimescaleDB for long-term storage of solar metrics, which I may write a full post on at some point because it has been a genuinely good tool for this use case. The short version is that it is PostgreSQL with a time-series extension that adds automatic data partitioning, compression, and continuous aggregates.

The problem: TimescaleDB's `time_bucket` function, when used on `TIMESTAMPTZ` columns, buckets by UTC midnight by default. If you are in a timezone that is offset from UTC, your "daily" aggregates do not align to your actual days. A bucket labeled "March 8" might contain data from 7pm local time on March 7 through 6:59pm local time on March 8, depending on your offset.

For a solar system, this matters a lot. Daily production totals are one of the most useful metrics, and if the day boundaries are shifted by several hours, the numbers look wrong and, more importantly, they are wrong.

```sql
-- This buckets by UTC midnight, which may not be what you want
SELECT time_bucket('1 day', ts) AS bucket, sum(value)
FROM inverter_metrics
WHERE key = 'pv1_energy_kwh'
GROUP BY bucket;
```

The way I fixed it was by setting the `TZ` environment variable in my Docker Compose `.env` file and passing it through to the TimescaleDB container. PostgreSQL respects the `TZ` variable and uses it for timezone-aware operations.

```yaml
# docker-compose.yml
services:
  timescaledb:
    image: timescale/timescaledb:latest-pg16
    environment:
      TZ: ${TZ}
      POSTGRES_DB: solar
      POSTGRES_USER: solar
      POSTGRES_PASSWORD: ${DB_PASSWORD}
```

```bash
# .env
TZ=America/New_York
DB_PASSWORD=...
```

With that set, `CURRENT_TIMESTAMP` inside PostgreSQL reflects local time, and daily buckets align to local midnight. The data I had already stored with UTC-offset timestamps does not retroactively fix itself, so the aggregates for the previous few days still look a little strange. In a couple of days the new data, bucketed correctly, should look clean.

If you need timezone-aware bucketing in queries right now without waiting, the `time_bucket` function has an `origin` parameter that lets you shift the bucket start point:

```sql
-- Shift buckets to align with local midnight (UTC-5 example)
SELECT time_bucket('1 day', ts, '2026-01-01 00:00:00-05'::timestamptz) AS bucket,
       sum(value)
FROM inverter_metrics
WHERE key = 'pv1_energy_kwh'
GROUP BY bucket;
```

Or you can cast the timestamp to a specific timezone before bucketing:

```sql
SELECT time_bucket('1 day', ts AT TIME ZONE 'America/New_York') AS local_bucket,
       sum(value)
FROM inverter_metrics
WHERE key = 'pv1_energy_kwh'
GROUP BY local_bucket;
```

The environment variable approach is simpler for a single-user setup and catches all the places where timezone matters, not just the one query you thought to fix.

## What This Weekend Produced

A day to get Home Assistant running and data flowing. Another day to debug why the dashboards looked wrong and fix both timezone issues. Net result: a solar monitoring setup that is actually better than what I had before, maintained largely by tools I did not write, and running reliably since I got it working.

MQTT finally feels like something I understand instead of something I keep reading about. The Home Assistant integration made the learning curve concrete, there was a goal, a working outcome to aim at, and the auto-discovery mechanism meant I was seeing results quickly enough to stay interested.

The timezone bugs were frustrating in the way that bugs always are when the root cause is obvious in hindsight. Both of them came down to "set the right environment variable in the right place." Neither required code changes or schema migrations. The fix was faster than the diagnosis.

TimescaleDB is still earning its spot in the stack. I will probably write more about it separately, the continuous aggregates feature alone warrants its own writeup.
