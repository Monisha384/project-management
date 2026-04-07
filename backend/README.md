# Backend Setup

## Run backend

1. Install dependencies:
   - `npm install`
2. Optional MongoDB setup:
   - copy `.env.example` to `.env`
   - update `MONGO_URI`
3. Start API:
   - `npm run dev`

Backend URL:
- `http://localhost:4001`

Health check:
- `http://localhost:4001/api/health`

If `MONGO_URI` is not set, backend uses in-memory sample data.
