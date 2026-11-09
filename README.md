# ChromaShift — Theme Studio

An image-to-theme tool built with HTML, CSS, and JavaScript. The repository keeps its original `menu-maker` name, but the application is now a theme generator.

Upload a photo to extract a six-color palette, adjust its harmony and saturation, and preview it across four interface mockups: analytics, music, storefront, and UI controls. Export the active palette as a Tailwind configuration, CSS custom properties, JSON tokens, or SCSS.

## Run locally

Requires Node.js 22 or later.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:8795. No account, API key, database, or build step is needed. Alternatively, serve this directory with `python -m http.server 8795`.

1. Upload an image or start with the included sample.
2. Adjust harmony, saturation, hue, light/dark mode, and corner radius.
3. Choose **Expected Result** to browse the four previews.
4. Choose **Export theme**, select a format, and copy or download the result.

Images are processed in the browser and are not uploaded. Interface mockups demonstrate the theme; their sample sales, music, and shopping controls are not connected to live services. External Google Fonts are optional; system font fallbacks work without them.

## Checks

```sh
npx playwright install chromium
npm test
```

Browser checks cover startup without JavaScript errors, photo extraction, all four previews, light mode, JSON downloads, closing the export dialog by keyboard, and preserving the last valid theme after a damaged image upload. GitHub Actions runs the same checks on pushes and pull requests.

## Files

- `index.html`, `style.css`, `app.js`: application and theme engine
- `assets/`: bundled sample images
- `scripts/serve.cjs`: local static server
- `tests/`: browser regression checks

