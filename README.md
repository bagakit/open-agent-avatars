# @bagakit/open-agent-avatars

A ready-to-use set of avatar SVGs (with small built-in animations) for quickly bootstrapping other projects.

## Install

```bash
npm i @bagakit/open-agent-avatars
```

## Use

### Browse / search

```js
import { avatars } from "@bagakit/open-agent-avatars";

// Example: pick all Panda avatars from batch 20260201
const panda = avatars.filter(
  (a) => a.batch === "20260201" && a.tokens[0] === "Panda"
);
```

Each entry includes:
- `batch`, `filename`, `path`, `stem`, `title`, `tokens`, optional `timestamp`, and `url`

### Use batch-grouped constants (recommended)

```js
import { B260201 } from "@bagakit/open-agent-avatars";

const img = document.createElement("img");
img.src = B260201.BRAVE_WARRIOR_OWL;
document.body.appendChild(img);
```

Notes:
- `B260201` maps to the `20260201/` batch directory (format: `B` + `YYMMDD`).
- Constants are derived from the filename stem (without the trailing timestamp). If multiple versions exist, the latest timestamp wins.

### Raw file access (bundler-specific)

You can also deep-import the SVG file directly (how it loads depends on your tooling):

```js
import svgPath from "@bagakit/open-agent-avatars/20260201/Panda_Code_Master_20260201061459.svg";
```

## Maintenance

When you add new batch folders (e.g. `YYYYMMDD/`) or add/remove SVGs, regenerate exports:

```bash
npm run generate
```
