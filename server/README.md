# Account + plan server

This is a small [Cloudflare Worker](https://workers.cloudflare.com/) that backs
everything server-side: account signup/login, syncing your plan and progress
across devices, and (optionally) closed-app push notifications. It's on
Cloudflare's free tier and doesn't need a credit card.

**Accounts are required to use the app** — there's no guest/local-only mode.
This is deliberate: the personalized plan, onboarding answers, and daily
progress are now too much to keep device-local only, so creating an account
is how your data gets a durable home and syncs across devices.

> Already deployed this Worker before (e.g. for push notifications)? You
> only need steps 5, 7, and 10 below — the database and account already
> exist, you're just adding the new tables and secret.

## One-time setup

1. **Create a free Cloudflare account** at https://dash.cloudflare.com/sign-up
   if you don't have one.

2. **Install dependencies** (from this `server/` folder):
   ```sh
   npm install
   ```

3. **Log in to Cloudflare from the CLI**:
   ```sh
   npx wrangler login
   ```
   This opens a browser tab to authorize — no credit card needed for what
   we're using (Workers + D1 free tiers).

4. **Create the D1 database** (skip if you already have one from an earlier
   setup):
   ```sh
   npm run db:create
   ```
   This prints a `database_id`. Copy it into `wrangler.toml`, replacing
   `REPLACE_WITH_YOUR_DATABASE_ID`.

5. **Apply the database schema**:
   ```sh
   npm run db:migrate:remote
   ```
   This is safe to re-run — it only applies migrations that haven't run yet,
   so it works the same whether this is a fresh database or one that already
   has the push-notification table from an earlier setup.

6. **Generate your own VAPID keys** (only needed for push notifications —
   skip this and step 8's `VAPID_*` secrets if you don't want those):
   ```sh
   npx web-push generate-vapid-keys --json
   ```

7. **Generate a session signing secret** (this one's required — it's what
   signs login sessions):
   ```sh
   openssl rand -base64 32
   ```
   Copy the output.

8. **Set the secrets** on the deployed Worker:
   ```sh
   npx wrangler secret put SESSION_HMAC_SECRET
   ```
   Paste step 7's output when prompted. If you're also setting up push
   notifications:
   ```sh
   npx wrangler secret put VAPID_PUBLIC_KEY
   npx wrangler secret put VAPID_PRIVATE_KEY
   ```
   Paste the matching values from step 6.

9. **Edit `VAPID_SUBJECT`** in `wrangler.toml` to a `mailto:` address or
   `https://` URL that identifies you (only relevant if you're using push
   notifications). Not secret.

10. **Deploy**:
    ```sh
    npm run deploy
    ```
    This prints your Worker's URL, e.g. `https://75hard-push-server.<your-subdomain>.workers.dev`.
    It's the same URL for everything — accounts, syncing, and push.

## Wire it up to the app

Back in the project root, copy `.env.example` to `.env` and fill in:

```
VITE_API_URL=<the Worker URL from step 10, no trailing slash>
```

(If you already had `VITE_PUSH_API_URL` set from an earlier push-notification
setup pointing at the same Worker, you technically don't need to add
`VITE_API_URL` too — the app falls back to `VITE_PUSH_API_URL` — but setting
both explicitly avoids confusion later.)

Then rebuild and redeploy the app (`npm run build`, then push to `main` to
redeploy GitHub Pages). For the **live** site, add `VITE_API_URL` as a GitHub
repository secret the same way you did for the push notification variables
(Settings → Secrets and variables → Actions → New repository secret), then
re-run the `Deploy to GitHub Pages` workflow.

## Important: no password recovery

There's no email service here, so there's no "forgot password" flow. If you
lose your password, that account can't be recovered. Use **Settings → Export
my data** once you're signed in to keep a backup of your plan and progress,
just in case.

## Local development

`wrangler dev --local` runs the Worker and a local D1 database entirely on
your machine, no Cloudflare account calls needed. Put your test secrets in a
`.dev.vars` file (gitignored):
```
SESSION_HMAC_SECRET=any-random-string-for-local-testing
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```

## Platform notes (push notifications only)

- Push notifications work on Chrome/Edge/Firefox on desktop and Android,
  and on Safari on macOS and iOS 16.4+ (iOS requires the app be
  [installed to the home screen](https://support.apple.com/guide/iphone/iph42ab2f3a7/ios)
  first).
- This Worker sends a plain reminder at the right local time; it doesn't
  know whether you've actually finished today's tasks (that state never
  leaves your device), so you may occasionally get a nudge after you've
  already finished — same tradeoff as a dumb daily alarm.
