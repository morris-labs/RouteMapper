# MorrisLabs site design system

This document covers the visual identity, header, and footer for morrislabs.app
so that any app under the domain can match the home page.

Live home page: https://morrislabs.app/

---

## Design tokens

All brand colors are CSS custom properties prefixed `--ml-`. Import
`morrislabs-tokens.css` (from this repo: `/home/prime/Bin/morrislabs.app/morrislabs-tokens.css`)
into the app's global CSS file (after any `@tailwind` directives) to get them.

| Token | Light | Dark |
|---|---|---|
| `--ml-ground` | `#E5EDF7` | `#0C1620` |
| `--ml-sidebar` | `#E5EDF7` | `#0C1620` |
| `--ml-surface` | `#FFFFFF` | `#162030` |
| `--ml-ink` | `#0D1B2A` | `#E4EDF7` |
| `--ml-muted` | `#5A6E82` | `#6E90B0` |
| `--ml-accent-fg` | `#1D68E1` | `#4F90F5` |
| `--ml-accent-bg` | `#EBF2FE` | `#0F2040` |
| `--ml-border` | `#DCE5F0` | `#1F3048` |

`--ml-sidebar` is for panel/sidebar backgrounds when you want them slightly
tinted against a white content area. It shares the same value as `--ml-ground`
today but exists as its own token so it can diverge independently.

**Prefix convention**: the `morrislabs.app` homepage CSS uses the same palette
under unprefixed names (`--ground`, `--surface`, etc.) to keep the plain-HTML
stylesheet self-contained. React apps use the `--ml-` prefix to avoid
collision with Tailwind or any other CSS already on the page.

Dark mode is handled automatically via `@media (prefers-color-scheme: dark)` and
`[data-theme="dark"]` overrides. Light/dark stamps on `:root` win over the media query.

---

## Typefaces

Three faces from Google Fonts — add this `<link>` to `index.html`, or the equivalent
`@import` in CSS:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=Space+Mono:wght@400&display=swap">
```

| Role | Face | Usage |
|---|---|---|
| Display / headings | Syne 700–800 | Page titles, card headings |
| Body | DM Sans 400/500 | All running text, nav, labels |
| Label / mono | Space Mono 400 | Uppercase section labels, technical metadata |

---

## Header

**Structure:** Sticky, 56 px tall, `--ml-surface` background, `--ml-border` bottom border.
Left side: MorrisLabs wordmark (`Morris` in `--ml-ink`, `Labs` in `--ml-accent-fg`, Syne 800).
Right side: nav with two items — a **Home** link and an **Apps** dropdown.

The Apps dropdown lists all apps under morrislabs.app. When adding a new app,
add it to both the header dropdown and the `APPS` array in `Header.jsx`.

**React component:** `/home/prime/Bin/morrislabs.app/Header.jsx`

```jsx
import Header from '/path/to/Header.jsx';

// In your app's root layout:
<Header currentApp="routemapper" />   // highlights RouteMapper in dropdown
<Header currentApp="weathermapper" /> // highlights WeatherMapper in dropdown
```

Requires: `morrislabs-tokens.css` imported globally, Google Fonts loaded.

**Plain HTML version** (for static pages):

```html
<header style="position:sticky;top:0;z-index:100;background-color:var(--ml-surface);border-bottom:1px solid var(--ml-border);">
  <div style="max-width:1080px;margin-inline:auto;padding-inline:1.5rem;display:flex;align-items:center;justify-content:space-between;height:56px;">
    <a href="/" style="font-family:'Syne',sans-serif;font-weight:800;font-size:1.05rem;letter-spacing:-0.025em;color:var(--ml-ink);text-decoration:none;">
      Morris<span style="color:var(--ml-accent-fg);">Labs</span>
    </a>
    <nav><!-- Home link + Apps dropdown (see index.html for full markup) --></nav>
  </div>
</header>
```

See `/home/prime/Bin/morrislabs.app/public/index.html` for the complete dropdown markup and
the small JS toggle script at the bottom of the file.

---

## Footer

**Structure:** `--ml-surface` background, `--ml-border` top border. Single line: copyright text only.
No nav links in the footer — the header dropdown handles app navigation.

**React component:** `/home/prime/Bin/morrislabs.app/Footer.jsx`

```jsx
import Footer from '/path/to/Footer.jsx';

<Footer />
```

**Plain HTML version:**

```html
<footer style="border-top:1px solid var(--ml-border);background-color:var(--ml-surface);">
  <div style="max-width:1080px;margin-inline:auto;padding-inline:1.5rem;padding-block:1.125rem;">
    <p style="font-family:'DM Sans',system-ui,sans-serif;font-size:0.8rem;color:var(--ml-muted);margin:0;">
      &copy; 2026 MorrisLabs
    </p>
  </div>
</footer>
```

---

## Integrating into a React/Vite app

1. Copy `morrislabs-tokens.css` contents into the app's `src/index.css` (after `@tailwind` lines).
2. Add the Google Fonts `<link>` to the app's `index.html`.
3. Copy `Header.jsx` and `Footer.jsx` into the app's `src/components/`.
4. In `App.jsx`, wrap the existing layout:

```jsx
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header currentApp="routemapper" />
      <main style={{ flex: 1 }}>
        {/* existing app content */}
      </main>
      <Footer />
    </div>
  );
}
```

5. If the app currently uses `height: 100%` on `html, body, #root` (check `index.css`),
   change those to `min-height: 100%` so the footer sits below the content instead of
   being cut off at viewport height.

---

## Files in this repo

| File | Purpose |
|---|---|
| `public/index.html` | Static home page source |
| `public/style.css` | Home page CSS (tokens + all styles) |
| `index.js` | Express server (port 3000, serves `public/`) |
| `morrislabs-tokens.css` | Token-only CSS file for React apps to import |
| `Header.jsx` | React header component |
| `Footer.jsx` | React footer component |
| `deploy/deploy.sh` | Re-deploy home page to EC2 |
| `deploy/nginx/morrislabs.conf` | nginx `location /` proxy block |
| `deploy/systemd/morrislabs.service` | systemd unit for the Node server |
