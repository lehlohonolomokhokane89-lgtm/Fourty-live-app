# 4FORTY LIVE

A production-ready static web app for South African taxi route booking, live tracking, group chat, and verification badge flows.

## Features
- Route discovery and booking flow
- Live GPS tracking map
- Group and private chat flow
- R100 verification badge request flow
- Facebook and WhatsApp sharing
- Supabase-ready database integrations
- Real-time-friendly polling for live taxis
- Modern responsive UI

## Project structure
- `index.html` – app shell
- `style.css` – all styling
- `app.js` – application logic
- `supabase.sql` – database setup
- `vercel.json` – Vercel static hosting hints

## Local development
Open `index.html` directly in a browser, or run a static server:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Deploy to Vercel
1. Push this repo to GitHub.
2. Open https://vercel.com
3. Import this repository.
4. Set framework to "Other" / static site.
5. Use the default settings and click Deploy.
6. Vercel will publish the app at a live URL.

## Supabase setup
1. Create a Supabase project.
2. Open the SQL editor.
3. Run the contents of `supabase.sql`.
4. Update the `SUPABASE_URL` and `SUPABASE_ANON` values in `app.js` if needed.

## Important notes
- This app is designed as a static frontend and works well on Vercel.
- Real-time updates are simulated with polling to the Supabase `taxis` table.
- For production, replace the demo WhatsApp and invite links with your real brand links.
- Never expose service-role keys in the browser. This app uses the public anonymous key only.

## Recommended next steps
- Add authentication for drivers and riders
- Move live geolocation updates to a real WebSocket or Pusher setup
- Add admin approval dashboard for R100 verification requests
- Add route filtering by city, distance, and price
- Add booking status notifications and push alerts

