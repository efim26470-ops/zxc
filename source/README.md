# Editable quietpress source

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

The output is written to `dist/`.

## Main configuration

`src/App.tsx` contains:

- `SBP_RECIPIENT` — bank and phone;
- `SBP_OFFICIAL_PAYMENT_URL` — optional official payment link issued by a bank/acquirer;
- the 34-source music library and generation of 1,020 three-minute CC0 cuts.

Without an official payment link, checkout uses the official Т-Банк transfer page and a manual copy/open workflow. A valid universal СБП QR cannot be generated from a phone number alone.
