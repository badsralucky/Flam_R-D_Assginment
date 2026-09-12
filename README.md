# PlantPulse

## Frontend R&D Assignment — Performance-Critical Data Visualization Dashboard

PlantPulse is a small environmental telemetry dashboard built with React and TypeScript.

I chose this assignment because it connects naturally with my previous data/ML work involving plant-health data and environmental features such as soil moisture, temperature, humidity and light.

### What the user can do

- Switch between North Greenhouse, Rooftop Garden and Lab Nursery.
- Search locations, zones and location types.
- Switch between four sensor streams.
- Change the visible time window.
- Hover over the chart to inspect a reading and timestamp.
- Pause and resume simulated live readings.
- View sensor status, flagged anomalies and monitoring thresholds from the sidebar.

### Main engineering idea

The interesting part is handling many readings efficiently.

Each stream contains 12,000 sample points. Rather than rendering thousands of SVG/DOM elements, the application:

1. Keeps the stream data in memory.
2. Divides the visible data into buckets.
3. Keeps the minimum and maximum point in each bucket.
4. Draws the reduced series on a Canvas.

Min/max is useful because averaging can hide short spikes that may matter in telemetry.

### Why simulated data?

The supplied assignment asks for a frontend R&D submission and does not require a real sensor backend. Generated telemetry makes the performance and interaction behavior reproducible without external hardware.

### Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

### Submission

See `SUBMISSION.md` for the plain-language explanation.

### Future work

A production version could replace the generated data with FastAPI/WebSocket ingestion, store historical readings in MongoDB, move heavy decimation to a Web Worker, and connect anomaly flags to an actual ML model.
