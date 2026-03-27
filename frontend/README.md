# Workout Tracker Frontend (React JS)

## What this is
A complete React frontend for your FitSense workout tracker backend:
- JWT login/register
- Dashboard
- Workout CRUD
- Analytics charts
- Suggestions form
- Profile update + password change

## Run steps

1. Copy `.env.example` to `.env`
   - Set `VITE_API_BASE_URL=http://localhost:5000/api`

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the app:
   ```bash
   npm run dev
   ```

## Backend endpoints used
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/profile`
- `PUT /api/auth/password`
- `GET /api/workouts`
- `POST /api/workouts`
- `GET /api/workouts/:id`
- `PUT /api/workouts/:id`
- `DELETE /api/workouts/:id`
- `PATCH /api/workouts/:id/favorite`
- `GET /api/analytics`
- `GET /api/analytics/overview`
- `GET /api/analytics/streak`
- `GET /api/analytics/badges`
- `POST /api/suggestion`
- `GET /api/suggestion/types`

## Notes
- The sidebar is hidden on small screens and the layout becomes mobile-friendly.
- The workout form accepts `exercises` as JSON text for strength sessions.
- All protected routes expect a JWT in `localStorage.token`.
