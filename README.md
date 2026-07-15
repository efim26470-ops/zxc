# quietpress — GitHub Pages fixed edition

This repository works with either GitHub Pages publishing mode:

## Recommended: Deploy from a branch

1. Upload **all files and folders from this archive** to the repository root.
2. Delete old repository files first, especially the previous root `index.html` and `src` folder.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` (or `master`) and `/ (root)`, then save.

The repository root contains a precompiled static site, so GitHub Pages does not need to process TypeScript or Vite source files.

## Alternative: GitHub Actions

Under **Settings → Pages**, choose **GitHub Actions**. The included workflow builds the editable Vite project from `source/` and deploys `source/dist`.

## Editing the React/Vite source

The editable project is in `source/`:

```bash
cd source
npm install
npm run dev
```

After editing, rebuild with:

```bash
npm run build
```

For branch-based deployment, copy everything from `source/dist/` back to the repository root.

## Why the previous version showed a white screen

The old root `index.html` referenced `/src/main.tsx`. GitHub Pages serves static files and cannot compile TSX when using **Deploy from a branch**, leaving the React root empty. This edition puts compiled JavaScript and CSS directly in the root.
