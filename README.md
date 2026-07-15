# quietpress — GitHub Pages edition

A full-screen React/Vite vinyl-label site with a catalogue, artists, sound diary, cart, a large CC0 music player and a manual СБП checkout.

## Fast deployment: Deploy from a branch

1. Upload the contents of this folder to the root of the repository.
2. Open **Settings → Pages**.
3. Select **Deploy from a branch**.
4. Choose `main` and `/ (root)`.
5. Save and wait for the Pages deployment to finish.

The repository root already contains the compiled static site. GitHub does not need to compile TypeScript for this deployment mode.

## GitHub Actions deployment

The included `.github/workflows/deploy-pages.yml` builds the editable project from `source/`. In **Settings → Pages**, select **GitHub Actions** to use it.

## Music library

Playback Salon contains **1,020 playable three-minute cuts across 34 genres**. They are sliced from 55+ hours of the **New Midnight Cassette System** recordings by Frank Edward Nora.

The source collection is released under **CC0 1.0** and explicitly permits editing, cutting, commercial use and non-commercial use. The player includes:

- search and 34 genre filters;
- favorites stored in `localStorage`;
- previous/next controls;
- seeking inside every three-minute cut;
- automatic transition to the next cut;
- progressive rendering in groups of 72 so the 1,020-track catalogue remains responsive.

The 1,020 entries are separate playable cuts from 34 long generative recordings, not 1,020 independently released songs.

Source: https://archive.org/details/New_Midnight_Cassette_System

## СБП checkout

Test prices remain between **10 ₽ and 100 ₽**.

Recipient details:

- Bank: **Т-Банк**
- Phone: **+7 952 926-21-55**

The previous QR contained plain text, so banking applications could not process it as a payment. The corrected checkout now:

- generates a QR that opens the official Т-Банк transfer page;
- separately copies the recipient phone, amount or all order details;
- opens the official transfer page after copying the phone;
- requires the payer to verify the recipient name inside the banking application;
- does not falsely claim that a payment was automatically verified.

A universal one-tap СБП payment QR cannot be derived from only a phone number. It must contain an official payment token/link issued by the bank or acquiring service. When such a link is available, paste it into `SBP_OFFICIAL_PAYMENT_URL` in `source/src/App.tsx`; the same checkout and QR will then use it automatically.

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
