# EMBERHOLD — Life RPG

A full-stack Life RPG built from the supplied project conversation and technical specification.

## What is implemented

- Secure signup/login with HTTP-only session cookies
- Per-user SQLite persistence for users, deeds, completion history, inventory and attributes
- Create/read/update/delete deeds
- Non-linear XP progression
- Level-up and rank progression
- Daily activity streaks
- Four trainable attributes: Might, Lore, Craft, Guile
- Crowns economy
- Armoury with themes and badges
- Optimistic UI for deed completion and purchases
- Loading skeletons, retry/error states and an error boundary
- Responsive mobile/desktop layout
- Keyboard-friendly controls and semantic labels
- Reduced-motion support
- SEO metadata
- Server-side validation and ownership checks
- Production Express server serves the Vite build
- No primary application data is stored in localStorage; only the visual theme preference is

## Run locally

Requirements: Node.js 18+.

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173

The API runs on http://localhost:4000.

## Production

```bash
npm install
npm run build
npm start
```

Open http://localhost:4000

## GitHub submission checklist

The supplied brief requires a public repository, at least 3 chronological commits, a live deployment and a 90–180 second public walkthrough video under 100MB.

Suggested commits:

1. `chore: initialize emberhold full stack`
2. `feat: add authentication and RPG API`
3. `feat: add responsive RPG frontend and armoury`

The ZIP cannot contain a live URL or a video recording; add those to the repository/README before submission.

## Database

SQLite is created automatically at `data/emberhold.db`. It is server-side persistence, not browser localStorage.

## API

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/me`
- `GET/POST /api/quests`
- `PATCH/DELETE /api/quests/:id`
- `POST /api/quests/:id/complete`
- `GET /api/history`
- `GET /api/armory`
- `POST /api/armory/:id/buy`

## Notes

For a cloud deployment, use persistent disk/storage for SQLite or change the database adapter to PostgreSQL. The UI is already separated from the API so that migration is straightforward.
