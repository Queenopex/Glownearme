# GlowNearMe Backend

Simple Node backend for the GlowNearMe frontend with JSON-file persistence.

## Run

```bash
cd backend
npm run dev
```

The API runs on `http://localhost:4000`.

## Endpoints

- `POST /auth/login`
- `GET /health`
- `GET /artists`
- `GET /artists/:id`
- `GET /bookings`
- `POST /bookings`
- `PATCH /bookings/:id`
- `GET /saved-artists?clientId=client-1`
- `POST /saved-artists`
- `DELETE /saved-artists`
- `GET /conversations`
- `POST /messages`

## Demo login

- Client: `maya@glownearme.com` / `demo123`
- Artist: `chioma@glownearme.com` / `demo123`

## Persistence

The backend now saves changes to `backend/data/store.json`, so bookings, saved artists, conversations, and artist profile edits survive server restarts.

Booking protection flow:
- New bookings are created with `status: pending_artist_response`
- Payment starts as `paymentStatus: authorized`
- `PATCH /bookings/:id` with `accept` captures payment
- `PATCH /bookings/:id` with `decline` voids or refunds payment and opens rematch eligibility
- `PATCH /bookings/:id` with `cancel_by_artist` refunds the client and marks the booking for rematch protection

## Recommended next step

Replace the JSON file with a real database when you are ready:

- Fast MVP: Supabase
- More custom backend: Express or NestJS with PostgreSQL
