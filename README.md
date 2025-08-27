# Task2

# Food Nutrient Component REST API (Node.js + Express + MongoDB)

## Overview
A RESTful API exposing food nutrient component data imported from the provided Excel file. Built with Node.js, Express and MongoDB (Mongoose). Includes import script, Swagger (OpenAPI) UI, Docker & docker-compose.

## Files
- `app.js` - main server
- `models/Food.js` - Mongoose schema
- `routes/foods.js` - routes (CRUD + search)
- `import_data.js` - imports Excel rows into MongoDB
- `Dockerfile`, `docker-compose.yml`
- `.env.example`

## Quickstart (Docker, recommended)
1. Put the Excel file in `/mnt/data` on the host (or adjust volumes in `docker-compose.yml`).
2. Update `docker-compose.yml` `EXCEL_PATH` to the exact filename under `/data`.
3. Start:
```bash
docker-compose up --build
