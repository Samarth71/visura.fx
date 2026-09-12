# Visuraa — Sentimental Time Capsules (Vercel version)

This version is built to deploy directly on Vercel — no server to keep
running yourself.

## How it's different from a normal Node server

Vercel doesn't keep a process alive in the background, so two things
had to change from a typical setup:

- **Storage**: instead of a local JSON file, capsules are stored in
  **Upstash Redis** (a free database you connect through Vercel's
  Marketplace).
- **Scheduling**: instead of `node-cron` running inside the app,
  Vercel's own **Cron Jobs** feature calls `/api/cron/deliver` on a
  schedule and that function checks for anything due.

## Step-by-step deploy

### 1. Push this folder to GitHub
Create a new repo and push this project to it (Vercel deploys from Git).

### 2. Import the project on Vercel
Go to https://vercel.com/new, select the repo, and deploy. No build
settings needed — it's plain Node.js functions plus a static
`index.html`.

### 3. Add a Redis database
In your Vercel project: **Storage** tab → **Marketplace** → search
**Upstash Redis** → create a free database → connect it to this
project. This automatically adds two environment variables for you:
`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

### 4. Add your email credentials
In your Vercel project: **Settings** → **Environment Variables**, add:

| Name | Value |
|---|---|
| `EMAIL_USER` | your Gmail address |
| `EMAIL_PASS` | a Gmail **app password** (not your normal password) |
| `CRON_SECRET` | any random string you make up (secures the cron endpoint) |

To get a Gmail app password: turn on 2-Step Verification at
https://myaccount.google.com/security, then create one at
https://myaccount.google.com/apppasswords.

### 5. Redeploy
Trigger a redeploy (Vercel does this automatically after you add env
vars, or push any small change) so the new variables take effect.

## About the cron schedule

`vercel.json` schedules `/api/cron/deliver` for `0 9 * * *` — once a
day, around 9am UTC. This is the **Vercel Hobby plan limit**: free
accounts can only run cron jobs once per day, not hourly. That's fine
here, since a capsule's delivery date is a whole day, not an exact
minute — worst case it goes out a few hours into the day it was due.

If you upgrade to Vercel Pro later, you can tighten this to e.g. every
hour (`0 * * * *`) for more precise timing.

## Testing without waiting for the cron

1. Seal a capsule with today's date on the live site.
2. Get its `id` — call `GET https://your-project.vercel.app/api/capsules`
   to see the list (message/email are hidden there for privacy, so
   instead check your Upstash database dashboard directly, or
   temporarily log it).
3. Trigger delivery manually:
   ```
   curl -X POST https://your-project.vercel.app/api/capsules/PASTE_ID/send-now
   ```
4. Check the recipient inbox (and spam folder).

You can also test the cron function itself directly:
```
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-project.vercel.app/api/cron/deliver
```

## File map

```
index.html               the frontend, served as the homepage
api/capsules/index.js     GET (list) and POST (create) a capsule
api/capsules/[id]/index.js       DELETE a capsule
api/capsules/[id]/send-now.js    manually trigger delivery (testing)
api/cron/deliver.js       the scheduled job Vercel calls automatically
lib/db.js                 Redis read/write helpers
lib/mailer.js             the email template and send logic
vercel.json               the cron schedule
```

## Swapping Gmail for a dedicated email service

Gmail works fine for personal use but has a daily sending cap. For a
real multi-user product, replace the `transporter` in `lib/mailer.js`
with SendGrid, Resend, or Mailgun's SMTP details — everything else
(the API routes, the cron, the frontend) stays the same.
