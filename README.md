# quietpress — GitHub Pages edition

A full-screen React/Vite vinyl-label site with a working catalogue, artist roster, local sound diary, cart, 34-track CC0 player and a test СБП checkout.

## Fast deployment: Deploy from a branch

1. Upload the contents of this folder to the root of the repository.
2. Open **Settings → Pages**.
3. Select **Deploy from a branch**.
4. Choose `main` and `/ (root)`.
5. Save and wait for the Pages build to complete.

The repository root already contains the compiled static site. Vite is not required on GitHub Pages.

## GitHub Actions deployment

The included `.github/workflows/deploy-pages.yml` builds the editable project from `source/`. In **Settings → Pages**, select **GitHub Actions** to use it.

## Local development

```bash
cd source
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Copy the contents of `source/dist/` to the repository root when using branch deployment.

## Music library

Playback salon streams all 34 genre sessions from **New Midnight Cassette System** by Frank Edward Nora on Internet Archive. The collection is released under CC0 1.0. Search, genre filtering, previous/next playback, progress, volume and favorites are included.

## Test СБП checkout

The catalogue uses test prices from 10 ₽ to 100 ₽. The checkout generates a QR locally in the browser with the order amount and recipient details:

- Bank: Т-Банк
- Phone: +7 952 926-21-55
- Recipient display name: Ефим Железкин

This is a static/manual СБП flow, not bank acquiring. The site cannot check whether money arrived. Change `SBP_RECIPIENT` in `source/src/App.tsx` if the recipient display name or details need updating.
