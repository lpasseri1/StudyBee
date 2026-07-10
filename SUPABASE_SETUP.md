# Supabase setup

1. In your Supabase project, run the migrations in `supabase/migrations/` in order — `0001_init.sql`,
   `0002_avatar_outfits.sql`, `0003_core_data.sql`, and `0004_cosmetics.sql` (SQL Editor, or
   `supabase db push` if you use the CLI). Together they create `avatars`, `credits`,
   `focus_sessions`, `avatar_outfits`, `classes`, `schedule_events`, `grades`, `notes`, `tasks`,
   and `cosmetic_purchases` — all with Row Level Security scoped to `auth.users.id`.
2. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project Settings → API.
   - `SUPABASE_SERVICE_ROLE_KEY` — same page. **Server-only**, used exclusively by
     `app/api/account/delete/route.ts` to remove the auth user. Never expose this to the client.
   - Spotify vars are optional — leave blank to keep the Focus Study "Connect Spotify" button
     showing a config error instead of failing silently. Apple Music isn't wired up yet (see below).
3. `pnpm install` (or npm/yarn) to pick up `@supabase/supabase-js` and `@supabase/ssr`,
   added to `package.json`.
4. In Supabase Auth settings, decide whether to require email confirmation. The signup form in
   `app/login/page.tsx` handles both cases (immediate session vs. "check your email").

## What's stubbed vs. real

- **Classes, Schedule, Grades, Notes, Tasks**: now fully Supabase-backed (`lib/core-data.ts`),
  same RLS pattern as everything else. This used to live in browser `localStorage` only — if you
  had existing local data from before this migration, it won't automatically transfer; it's still
  sitting in that browser's `localStorage` under the `studybee:data:v1*` keys if you want to
  manually re-enter anything from it.

- **Auth, Settings, Profile, Credits, Focus Study timer/breaks, global font**: fully wired to
  Supabase as described in the task doc.
- **Cosmetics catalog/shop**: now real — `/shop` page, `cosmetic_purchases` table, and the
  `purchase_cosmetic` Postgres function (atomically spends credits + records ownership, so a
  purchase can't partially fail). Currently 7 hats; accessories aren't built yet but would follow
  the identical pattern (catalog entry in `lib/cosmetics.ts`, artwork in `bee-avatar.tsx`'s
  `AccessoryLayer`, same purchase flow with `category: 'accessory'`).
- **Spotify**: a real OAuth flow (`app/api/auth/spotify/*`), but token storage is a short-lived
  cookie rather than a persisted table — fine for testing, worth upgrading to a
  `spotify_tokens` table (same RLS pattern as the other tables) before shipping. Note: as of
  mid-2026 Spotify requires the *developer account that owns the app* to have Premium before
  its Web API access is unblocked (separate from any end-user Premium requirement for playback).
- **Apple Music**: also fully wired now (`app/api/auth/apple-music/token`, `lib/apple-music.ts`,
  and the Connect button in `music-controls.tsx`). Unlike Spotify, there's no redirect — the
  server signs a developer token (JWT) and the browser loads Apple's MusicKit JS SDK, which
  pops up Apple's own consent screen for the user. To set it up:
  1. Enroll in the [Apple Developer Program](https://developer.apple.com/programs/) ($99/year) if
     you haven't already.
  2. In [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list),
     create a **MusicKit** identifier (or reuse an existing App ID with MusicKit enabled).
  3. Under **Keys**, create a new key with the **MusicKit** service enabled. Download the `.p8`
     file — Apple only lets you download it once.
  4. Note the **Key ID** (shown on the key's page) and your **Team ID** (top-right of the
     Apple Developer account page).
  5. Add to `.env.local`:
     ```
     APPLE_MUSIC_TEAM_ID=your-team-id
     APPLE_MUSIC_KEY_ID=your-key-id
     APPLE_MUSIC_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
     ...paste the full contents of the .p8 file here, including these header/footer lines...
     -----END PRIVATE KEY-----"
     ```
     Keep it wrapped in double quotes with real line breaks — Next.js's env loader supports
     multi-line quoted values. (If your tooling strips newlines and flattens it to a single
     line with literal `\n` sequences, that's also handled — the token route unescapes them.)
  6. Restart the dev server, go to `/study/focus`, and click **Connect** under Apple Music.
     It'll prompt you to log into Apple Music and approve access.
  7. Note: like Spotify, actually *playing* audio (not just authorizing) requires the
     listening user to have an active Apple Music subscription — that's an Apple restriction,
     not something this app can bypass.
