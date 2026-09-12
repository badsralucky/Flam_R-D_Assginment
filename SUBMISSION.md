# PlantPulse — Assignment Explanation

## In one sentence

**PlantPulse is a React/TypeScript dashboard that lets a user explore environmental sensor data from multiple growing spaces while demonstrating a practical approach to rendering a large number of data points efficiently.**

## Why I built it

I selected the **Performance-Critical Data Visualization Dashboard** option.

My previous work includes data/ML projects around plant health and environmental variables. This assignment gave me a way to combine that background with frontend engineering.

I wanted the project to answer a simple question:

> How can a frontend display a large, continuously changing sensor stream without unnecessarily rendering thousands of visual elements?

## What is inside the dashboard?

There are three sample locations:

- North Greenhouse
- Rooftop Garden
- Lab Nursery

Each has four streams:

- Soil moisture
- Temperature
- Humidity
- Light exposure

The values are intentionally different between locations so that switching locations visibly changes the dashboard.

## User flow

1. Choose a location.
2. Choose a sensor.
3. Choose a time range.
4. Inspect readings by hovering over the graph.
5. Pause/resume the live stream.
6. Use the sidebar to inspect sensors, anomalies and thresholds.

The search field can find a location by its name, type or zone.

## Performance approach

Each sensor stream has 12,000 sample points.

Rendering every sample as an HTML or SVG object would create unnecessary browser work.

Instead, PlantPulse uses:

**12,000 points → min/max bucket reduction → Canvas rendering**

The reduction keeps the low and high point from each bucket. This is deliberately simple and easy to explain.

For example, if a short spike occurs inside a bucket, keeping only the average could hide it. Keeping the maximum preserves that visual event.

## What is simulated?

The sensor data and anomaly flags are generated locally. This is a frontend prototype, not a real IoT system.

I have deliberately kept this distinction clear: the current project demonstrates frontend performance and interaction. A real deployment could connect the same UI to an API or WebSocket stream.

## Technology

- React
- TypeScript
- Canvas 2D API
- Vite
- Lucide React

## What I would improve next

If this became a production application, I would add:

- FastAPI/WebSocket data ingestion
- MongoDB historical storage
- Web Worker-based processing for very large streams
- Real anomaly detection
- Authentication
- Persistent threshold configuration
- Automated performance measurements

## Short explanation for the reviewer

> I chose the performance-critical visualization option because it overlaps with my existing data and frontend experience. PlantPulse is a greenhouse telemetry dashboard with three locations and four sensor streams. The main engineering problem I focused on is large-volume rendering. Instead of creating thousands of DOM or SVG elements, I keep the raw stream in memory, reduce it with min/max buckets and render the visible series using Canvas. I also added practical interactions such as location search, sensor switching, time ranges, hover inspection, live pause/resume, anomaly views and thresholds.
