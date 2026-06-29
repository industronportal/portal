# Industron Customer Requirement Collection Portal

A multi-step web portal that collects customer testing requirements, generates a
branded PDF, and emails it to the Industron team.

## Tech Stack

- **Frontend:** static HTML / CSS / JavaScript (served from `public/`)
- **Backend:** Node.js + Express
- **PDF:** PDFKit
- **Email:** Nodemailer (Gmail SMTP)

## Project Structure

```
.
├── public/                  # Front-end (served as static files)
│   ├── index.html           # Welcome page
│   ├── requirement-overview.html
│   ├── test-configuration.html
│   ├── review.html
│   ├── success.html
│   ├── css/style.css
│   ├── js/
│   └── images/logo.png
├── server.js                # Express API + PDF + email
├── counter.json             # Reference-number counter
├── generated/               # Generated PDFs (git-ignored)
├── .env                      # Secrets (git-ignored)
├── .env.example
└── package.json
```

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file (copy from the example):

   ```bash
   cp .env.example .env
   ```

   Fill in your Gmail address and a Gmail **App Password**
   (Google Account → Security → 2-Step Verification → App passwords).

3. Start the server:

   ```bash
   npm start
   ```

4. Open the app:

   ```
   http://localhost:3000
   ```

The frontend talks to the backend using a relative `/submit` URL, so it works
on any host without code changes.

## Deployment

The app is a single Node service that serves both the API and the frontend, so
it can run on any Node host (Render, Railway, Fly.io, a VPS, etc.).

### Deploy on Render (recommended, free tier available)

1. Push this project to a GitHub repository.
   (`.env`, `node_modules/`, and `generated/` are git-ignored.)
2. On https://render.com create a **New → Web Service** and connect the repo.
3. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add environment variables (from your `.env`):
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `EMAIL_TO`
   - (`PORT` is provided automatically by Render.)
5. Deploy. Your portal will be live at the Render URL.

### Deploy on Railway / Fly.io / Heroku-style hosts

A `Procfile` (`web: node server.js`) is included. Set the same environment
variables in the platform dashboard and deploy.

### Deploy on Vercel (serverless)

Vercel runs the app in a serverless model, so the project is set up to work
there without `server.js`:

- The frontend in `public/` is served as static files.
- The `/submit` endpoint runs as a serverless function (`api/submit.js`),
  configured via `vercel.json`.
- The PDF is generated **in memory** and emailed directly (no disk writes).
- Reference numbers are **time-based** (e.g. `ITS-2026-0629AB12`) because
  serverless has no shared counter file.

Steps:

1. Push this project to GitHub.
2. On https://vercel.com → **Add New → Project** and import the repo.
3. Framework Preset: **Other** (leave build/output settings as default —
   `vercel.json` handles routing).
4. Add Environment Variables (Project → Settings → Environment Variables):
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `EMAIL_TO`
5. Deploy. The portal will be live at your `*.vercel.app` URL.

> Note: `server.js` and `counter.json` are only used for local/Node hosting.
> Vercel ignores them and uses `api/submit.js` instead.

### Deploy on Netlify (serverless)

Netlify support is configured via `netlify.toml`:

- The frontend in `public/` is published as static files.
- The `/submit` endpoint runs as a Netlify Function (`netlify/functions/submit.js`)
  and is reached through a redirect from `/submit`.
- The PDF is generated **in memory** and emailed directly (no disk writes).
- Reference numbers are **time-based** (e.g. `ITS-2026-0629AB12`).

Steps:

1. Push this project to GitHub.
2. On https://app.netlify.com → **Add new site → Import an existing project**
   and connect the repo.
3. Build settings (usually auto-detected from `netlify.toml`):
   - **Build command:** *(leave empty)*
   - **Publish directory:** `public`
   - **Functions directory:** `netlify/functions`
4. Add Environment Variables (Site settings → Environment variables):
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `EMAIL_TO`
5. Deploy. The portal will be live at your `*.netlify.app` URL.

> The `netlify.toml` ships PDFKit's font files with the function
> (`included_files`) and uses the `nft` bundler so PDF generation works
> reliably on Netlify.

## Notes / Limitations

- **Reference numbers:**
  - On Node hosts (`server.js`), a sequential counter is stored in
    `counter.json`. On ephemeral filesystems this can reset on redeploy.
  - On Vercel (`api/submit.js`), numbers are time-based and unique per
    submission, but not sequential.
  - For guaranteed sequential numbers in production, use a database.
- **Generated PDFs** are emailed immediately. The local server also saves a copy
  in `generated/`; the Vercel function keeps the PDF in memory only.
- Gmail sending requires an **App Password** and 2-Step Verification enabled.
