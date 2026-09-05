# 🍅 Pomato Timer

A cozy, tomato-themed Pomodoro timer for the web — no frameworks, no build step, just HTML, CSS, and vanilla JS.

**[Live demo →](https://pomato.sm314.com)**

## Features

- **Pomodoro modes** — Focus (25 min), Short break (5 min), and Long break (15 min), each one tap away.
- **Animated dial** — a draining progress ring, a sweeping clock hand, and 60 tick marks around a glossy tomato.
- **Tomato varieties** — switch the whole color theme between Beefsteak, Green Zebra, Black Krim, and Tomacco, each with its own gradient, stripe pattern, and shadow tones.
- **Harvest tracker** — a row of pips fills in as you complete focus sessions.
- **Gentle chime** — a three-note tone generated with the Web Audio API when a session ends (no audio files needed).
- **Keyboard shortcuts** — `Space` to start/pause, `R` to reset.
- **Accessible & responsive** — ARIA-labeled controls, `aria-pressed` state on toggles, `aria-live` time readout, and reduced-motion support.

## Getting started

This is a static site — just open it in a browser.

```bash
git clone <this-repo>
cd pomato-timer
open index.html   # or double-click the file
```

No dependencies, no build tools, no server required.

## Project structure

```
.
├── index.html          # Main app markup
├── style.css           # All styling, animations, and variety themes
├── app.js              # Timer logic, dial rendering, chime, event handling
└── tomato-timer.html   # Self-contained single-file version (HTML + CSS + JS inline)
```

`index.html` + `style.css` + `app.js` make up the standard multi-file app. `tomato-timer.html` is a standalone bundle of the same experience for easy sharing or embedding.

## How it works

- The timer tracks an `endAt` timestamp and re-derives `remaining` time on each animation frame via `requestAnimationFrame`, so it stays accurate even if the tab is backgrounded.
- The dial's progress ring and clock hand are driven by CSS custom properties (`stroke-dashoffset`, `transform`) updated each frame.
- Tomato varieties are implemented entirely through CSS custom properties scoped to `body[data-variety="..."]`, so switching themes is just a `data-variety` attribute swap.
- Completed focus sessions increment a counter and redraw a row of "harvest" pips.

## License

Feel free to fork and tomato-ify it further. Add a license of your choice here.
