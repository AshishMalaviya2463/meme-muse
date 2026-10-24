# MemeMuse

A frontend-only, responsive GIF discovery site built with React and Vite. It has real GIPHY search and trending requests, paginated results, stable search URLs, category pages, sharing/copy/WhatsApp actions, error/loading states, information pages, and static crawl files.

## Run locally

Copy `.env.example` to `.env.local`, add a GIPHY web API key, then run `npm install` and `npm run dev`. Use `npm run build` for a production build.

The supplied environment’s Node/npm executable fails before package resolution with an `EPERM lstat C:\Users\pc` error, so installation/build could not be executed here. The app intentionally displays a configuration error instead of fake memes if no API key is set.

## Deploy

Deploy `dist/` to any static host after building. Configure SPA fallback rules for `/about`, `/contact`, `/privacy-policy`, `/terms`, and `/categories/*`; update `VITE_SITE_URL`, contact email, `public/robots.txt`, and `public/sitemap.xml` before release. For fully pre-rendered route-specific SEO, migrate the UI to Next.js once package installation works.

Legal pages are launch drafts requiring appropriate legal review. Contact opens a mail client—there is no backend form submission. See `docs/API_DECISIONS.md` for provider limitations and official sources.
