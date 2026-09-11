# MoonMethod Paladin Threat Lab

An editable, dependency-free Classic Era Paladin threat calculator. It compares:

- Greater Blessing of Kings threat per active enemy
- Rank 5 Consecration threat per enemy over its full duration
- Rank 8 Judgement of Righteousness threat on its target

The Hakkar-style preset uses four buffed players and 200 spell power. The Flamegor-style preset uses eight buffed Warriors and 200 spell power.

## Edit it

The whole site is four files:

- `index.html` — page content and structure
- `styles.css` — colours, layout and visual design
- `app.mjs` — controls and interaction behaviour
- `calc.mjs` — threat formulas

No framework, package installation or build command is required. Open `index.html` through a local web server to preview it. For example:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Publish with GitHub Pages

1. Put the files on the repository's `main` branch.
2. Open **Settings → Pages** in GitHub.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Select `main` and `/ (root)`, then save.

GitHub will provide a URL in the form `https://YOUR-NAME.github.io/REPOSITORY/`.

## Formula model

```text
GBoK per enemy = (players buffed × 60 × RF multiplier) ÷ active enemies
Consecration R5 = (384 + 0.336 × spell power) × RF multiplier
Judgement R8 = (170 + 0.5 × spell power) × RF multiplier
```

Improved Righteous Fury uses a `1.9` multiplier. Consecration is shown over its full duration, and the comparison is threat per enemy per use rather than sustained TPS.
