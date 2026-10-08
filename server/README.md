# Push notification server

This is a small [Cloudflare Worker](https://workers.cloudflare.com/) that makes
closed-app push notifications work: it stores push subscriptions in a D1
database and, once an hour, sends a notification to anyone whose local time
is in the 9pm/11pm "at risk" window — even if their browser or phone isn't
open. It's on Cloudflare's free tier and doesn't need a credit card.

Without this deployed, the app still works fine — notifications just only
fire while the app is open or running in the background.

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

4. **Create the D1 database**:
   ```sh
   npm run db:create
   ```
   This prints a `database_id`. Copy it into `wrangler.toml`, replacing
   `REPLACE_WITH_YOUR_DATABASE_ID`.

5. **Apply the database schema**:
   ```sh
   npm run db:migrate:remote
   ```

6. **Generate your own VAPID keys** (the cryptographic identity your server
   uses to sign pushes — don't reuse anyone else's):
   ```sh
   npx web-push generate-vapid-keys --json
   ```
   This prints a `publicKey` and `privateKey`.

7. **Set the secrets** on the deployed Worker:
   ```sh
   npx wrangler secret put VAPID_PUBLIC_KEY
   npx wrangler secret put VAPID_PRIVATE_KEY
   ```
   Paste the matching value from step 6 when prompted for each.

8. **Edit `VAPID_SUBJECT`** in `wrangler.toml` to a `mailto:` address or
   `https://` URL that identifies you — this is what push services use to
   contact you if there's ever a problem with your traffic. It's not secret.

9. **Deploy**:
   ```sh
   npm run deploy
   ```
   This prints your Worker's URL, e.g. `https://75hard-push-server.<your-subdomain>.workers.dev`.

## Wire it up to the app

Back in the project root, copy `.env.example` to `.env` and fill in:

```
VITE_VAPID_PUBLIC_KEY=<the publicKey from step 6>
VITE_PUSH_API_URL=<the Worker URL from step 9, no trailing slash>
```

Then rebuild and redeploy the app (`npm run build`, then push to `main` to
redeploy GitHub Pages). Enabling notifications in Settings will now also
subscribe to push, and reminders will arrive even when the app is fully
closed (on platforms that support it — see note below).

## Local development

`wrangler dev --local` runs the Worker and a local D1 database entirely on
your machine, no Cloudflare account calls needed, which is useful for
testing changes to `src/index.js` before deploying. Put your test VAPID
keys in a `.dev.vars` file (gitignored) as `VAPID_PUBLIC_KEY=...` and
`VAPID_PRIVATE_KEY=...`.

## Platform notes

- Push notifications work on Chrome/Edge/Firefox on desktop and Android,
  and on Safari on macOS and iOS 16.4+ (iOS requires the app be
  [installed to the home screen](https://support.apple.com/guide/iphone/iph42ab2f3a7/ios)
  first).
- This Worker sends a plain reminder at the right local time; it doesn't
  know whether you've actually finished today's tasks (that state never
  leaves your device), so you may occasionally get a nudge after you've
  already finished — same tradeoff as a dumb daily alarm.
