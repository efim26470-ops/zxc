# quietpress hero — GitHub Pages edition

A full-screen static hero built with React, TypeScript, Tailwind CSS, Vite, and `lucide-react`.

## Deploy to GitHub Pages

1. Create a new GitHub repository.
2. Upload all files from this project to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, select **GitHub Actions** as the source.
5. Push or commit to the `main` or `master` branch.
6. Open the **Actions** tab and wait for the **Deploy quietpress to GitHub Pages** workflow to complete.

The deployed site will be available at one of these addresses:

- `https://USERNAME.github.io/`
- `https://USERNAME.github.io/REPOSITORY/`

No repository-name edit is required. Vite uses relative asset paths through `base: './'`, so the same build works at both root and project Pages URLs.

## Run locally

```bash
npm install
npm run dev
```

## Test the production build

```bash
npm run build
npm run preview
```

## Included GitHub Pages support

- Automatic deployment with `.github/workflows/deploy-pages.yml`
- Relative Vite asset paths for repository subfolders
- `public/.nojekyll` to disable Jekyll processing
- A prebuilt `dist` directory

The CloudFront background video is loaded directly in the browser. After its first playback, supported browsers capture frames and switch to the canvas-based boomerang loop.
