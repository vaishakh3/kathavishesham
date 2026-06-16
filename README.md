# Katha Vishesham

Premium one-page website for Katha Vishesham, an AI video production and cinematic storytelling studio.

## Live Site

- Production: https://kathavishesham.vercel.app
- Repository: https://github.com/vaishakh3/kathavishesham

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The project uses Vite with:

- Build command: `npm run build`
- Output directory: `dist`

## Admin Panel

- Admin URL: `/admin`
- Local admin/API dev server: `npm run dev:vercel`
- Required env vars are listed in `.env.example`.

The admin panel signs in through Vercel serverless functions, uploads preview images directly to Cloudinary with a signed upload request, and saves portfolio, service and pricing rows to Google Sheets. Until the Google Sheet env vars are connected, the website/admin use the built-in fallback content.

Google Sheet tabs are created automatically when the service account has editor access to the spreadsheet:

- `Works`
- `Services`
- `Pricing`

## Current Placeholders

- Replace generated portfolio thumbnails with final original posters when available.
- Replace Facebook page fallback links with individual video links when available.
- Replace the CSS KV mark with the final logo asset when available.
- Add a custom domain in Vercel if needed.

## Deployment Note

The project is linked and deployed on Vercel. Direct production deployment is available through:

```bash
npx vercel deploy --prod --yes
```

Automatic GitHub push-to-deploy requires adding a GitHub Login Connection to the active Vercel account, then running:

```bash
npx vercel git connect https://github.com/vaishakh3/kathavishesham.git
```
