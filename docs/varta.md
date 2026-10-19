# Varta energy dashboard (`/varta`)

Live view of the VARTA element 6 kWh battery, read directly from the battery over the home network (Modbus TCP). Read-only: the client only sends Modbus function 03, so it cannot change any battery setting.

## Files

| File | Purpose |
| --- | --- |
| `lib/modbus.js` | Minimal read-only Modbus TCP client (no dependencies) |
| `lib/varta.js` | Varta register map, decoding and sanity checks |
| `pages/api/varta/status.js` | `GET /api/varta/status`: JSON, 2 s shared cache |
| `pages/varta.js` | Dashboard, polls every 5 s, pauses while the tab is hidden |
| `lib/varta_history.js` | History collector (every 10 s) and aggregation |
| `pages/api/varta/history.js` | `GET /api/varta/history?range=1h\|6h\|24h\|7d\|30d` |
| `components/varta_charts.js` | History charts (Chart.js) |
| `instrumentation.js` | Starts the collector when the server starts |

## Configuration

In `.env.local` (not committed):

```
VARTA_HOST=192.168.178.58
VARTA_PORT=502
VARTA_UNIT_ID=255
```

Without `VARTA_HOST` the API responds 404 and the page shows "Available on the home network only". That is what happens on the public (Vercel) deployment, which can't reach the home network anyway.

## Running and testing

```
npm run dev
curl localhost:3000/api/varta/status
open http://localhost:3000/varta
```

Responses: `200` with readings, `503` `{ connected: false, error }` when the battery doesn't answer or returns implausible values, `404` when not configured, `405` for non-GET.

## History

While the Next.js server runs, a collector stores one reading every 10 s in `data/varta/YYYY-MM-DD.jsonl` (git-ignored, ~0.5 MB/day):

```
{"t":1792432836481,"soc":82,"bp":-359,"gp":-11,"ct":7874223}
```

`t` ms timestamp · `soc` % · `bp` battery W (+ charging) · `gp` grid W (+ import) · `ct` lifetime charged Wh.

The history API buckets these into ~360 points per range and calculates energy per range and per day. Charged energy comes from the battery's own counter; discharged, imported and exported energy are integrated from power, skipping gaps longer than 60 s. History only exists for times the server was running: gaps show as breaks in the charts, and the "recorded" share is shown with the totals.

## Registers

Source: Varta "Modbus TCP documentation" v13.4, community configs (Home Assistant, evcc) and live readings on 2026-10-19. Holding registers, unit ID 255.

| Register | Meaning | Type | Status |
| --- | --- | --- | --- |
| 1000 / 1017 / 1034 | EMS / ENS / software version (17 registers, one character each) | string | Used (cached 10 min) |
| 1051 | Modbus table version | uint16 | Used (12) |
| 1052–1053 | Battery clock, Unix seconds (low word first) | uint32 | Used (matched the web interface clock to the second) |
| 1054–1063 | Serial number (one character per register) | string | Used |
| 1064 | Installed battery modules | uint16 | Used |
| 1065 | State: 0 Busy, 1 Run, 2 Charge, 3 Discharge, 4 Standby, 5 Error, 6 Service, 7 Islanding | uint16 | Used (3 matched live discharge) |
| 1066 | Battery active power, W, + charging / − discharging | int16 | Used |
| 1068 | State of charge, % | uint16 | Used |
| 1071 | Usable capacity, × 10 Wh | uint16 | Used (587 → 5.87 kWh) |
| 1078 | Grid power at the house connection, W, + import / − export | int16 | Used (sign checked against the Varta app: Netzeinspeisung 2 W ↔ −3 W) |
| 1069–1070 | Lifetime charged energy, Wh (uint32, low word first) | uint32 | Used (7,874,223 Wh ↔ app "Gespeicherte Energie (gesamt)" 7,869 kWh) |
| 1067 | Apparent power, VA | int16 | Used (power factor) |
| 1074 / 1075 | Max discharge / charge power limit, W (writable, unofficial) | int16 | Read only, shown as limits; never written |
| 1076 | Unknown (−7315 on test) | int16 | Not used |
| 1079–1081 | Unknown (2188, 2778, 22992 on test; 1081 may be grid voltage × 100) | uint16 | Not used |
| 1100–1101 | Unknown, writable (0) | uint16 | Not used |

A read-only scan of 1064–1140 and 2000–2140 found only 1064–1081 and 1100–1101. Solar production, household consumption and the grid import/export totals shown in the Varta app come from Varta's cloud, not the battery.

The web interface's `cgi/info.js` (no login) also gives the energy meter serial. More data (`cgi/ems_data.js`, `cgi/energy.js`: production power, per-phase values, energy totals) needs a web login.

The element has no PV or household consumption registers. Those will come from the Kostal inverter (Modbus TCP, usually port 1502).

## To do

- Re-check the grid sign (1078) once at a larger flow (the first check was at only 2 W).
- Add the Kostal inverter: solar production and household consumption.
- History: a collector that stores snapshots, then charts by day/week/month/year.
