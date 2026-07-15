# quietpress — GitHub Pages edition

A full-screen React/Vite vinyl-label experience with a working catalogue, artist roster, local sound diary, cart and streaming CC0 music player.

## Fastest deployment: Deploy from a branch

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

## Music licence

The player streams selected tracks from **New Midnight Cassette System** by Frank Edward Nora on Internet Archive. The collection is released under CC0 1.0. A source link is included inside Playback salon.
