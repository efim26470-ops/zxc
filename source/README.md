# quietpress — GitHub Pages + iOS PWA

A static React/Vite music-label site prepared for GitHub Pages. The repository root contains the compiled site; editable sources are in `source/`.

## What changed

- payment recipient template is saved automatically in `localStorage` when checkout opens;
- completed manual checkout saves an order receipt and unlocks purchased music on the current device;
- each of the four releases unlocks 255 full three-minute cuts;
- unpurchased cuts play as 30-second previews;
- Playback Salon now has **All tracks**, **Purchased**, and **Favorites** filters;
- purchased releases show an **Owned** badge in Anthology;
- favicon, Apple Touch icon, 192/512 PWA icons, maskable icons and a web app manifest were added;
- a service worker and iPhone safe-area adjustments were added;
- the app can be installed from Safari with **Share → Add to Home Screen**.

## Important payment limitation

This is still a static GitHub Pages project. A browser cannot create a template inside the T-Bank app or securely verify that a bank transfer arrived. The current flow:

1. saves the T-Bank/phone template inside quietpress on this device;
2. opens the official T-Bank transfer page and provides copy buttons for number and amount;
3. unlocks the purchased tracks only after the buyer presses **“Я оплатил · добавить музыку”**;
4. stores the receipt and owned releases in this browser.

For automatic payment confirmation, connect T-Business acquiring/SBP and verify bank notifications on a backend or serverless function. Do not place acquiring secrets in GitHub Pages source code.

## Recipient and test pricing

- Bank: **Т-Банк**
- Phone: **+7 952 926-21-55**
- Test release prices: **10 ₽, 35 ₽, 70 ₽, 100 ₽**

## Deploy from a branch

1. Upload the contents of this archive to the repository root.
2. Open **Settings → Pages**.
3. Select **Deploy from a branch**.
4. Select `main` and `/ (root)`.
5. Save and wait for publication.

## GitHub Actions deployment

The included `.github/workflows/deploy-pages.yml` builds the editable project from `source/`. In **Settings → Pages**, select **GitHub Actions** to use it.

## iPhone installation

1. Open the published site in Safari.
2. Tap **Share**.
3. Tap **Add to Home Screen**.
4. Confirm **Add**.

The installed PWA uses the quietpress icon, standalone display mode, iPhone safe areas and local storage for favorites, payment template, receipts and purchased music.

## Local development

```bash
cd source
npm ci
npm run dev
```

Production build:

```bash
npm run build
```
