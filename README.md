# John's Garage API

Express API backed by Firestore. Frontend: `johns-garage-web`.

## Setup

1. Create a Firebase project and enable Firestore.
2. Download a service account key to `serviceAccountKey.json` (gitignored).
3. Copy `.env.example` to `.env` and set `FIREBASE_PROJECT_ID`.

```bash
npm install
npm run import -- --clear
npm run dev
```

Health: http://localhost:3000/api/health

Import script: `src/scripts/import-cars.ts`. CSV: `data/Automobile.csv`.
`?` horsepower → null, year `70` → `1970`, origin `1/2/3` → usa/europe/japan.

## Scripts

- `npm run dev` - port 3000
- `npm run import -- --clear` - wipe and reload cars
- `npm run build` / `npm start`

## Routes

- `GET /api/cars` - `q`, `origin`, `cylinders`, `minYear`, `maxYear`, `minMpg`, `maxMpg`, `sort`, `order`
- `POST /api/cars`
- `GET /api/cars/export` - same query params, CSV of the filtered list

Don't commit `.env` or `serviceAccountKey.json`.
