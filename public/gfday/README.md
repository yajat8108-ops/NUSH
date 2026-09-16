# REWIND — a tape for nush

A standalone, single-page interactive site for National Girlfriends Day. No build step, no npm install — just static HTML/CSS/JS.

## How to run it

**Easiest:** double-click `index.html` to open it in a browser.

**Recommended (for the certificate download at the end to work reliably in every browser):** serve it from a tiny local server instead of opening the file directly, e.g. from this folder run:

```
npx serve .
```

or, if you have Python:

```
python3 -m http.server 8000
```

then open the printed `localhost` URL. A couple of browsers (Firefox especially) are stricter about generating a downloadable image from a `file://` page.

## To host it for real (so you can just send Nush a link)

Drag this whole folder onto [Netlify Drop](https://app.netlify.com/drop), or run `npx serve .` and share via a tunnel, or push it to GitHub Pages. It's fully static — any static host works.

## What's inside

- `index.html` — all seven "reels" (splash, scroll-timeline, memory match, quiz, corkboard, jukebox, finale)
- `css/style.css` — design tokens + the persistent camcorder viewfinder chrome
- `css/sections.css` — styles per section
- `js/app.js` — all interactivity: state, animations, and the six mini-games
- `assets/photos`, `assets/videos` — your media, already wired in

Progress (the love meter) is saved to the browser's local storage, so closing the tab and coming back later picks up where you left off.
