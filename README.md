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

### Use a versioned module (recommended; best for tree-shaking)

```js
import CAPYBARA_CRAFTING from "@bagakit/open-agent-avatars/20260202/CAPYBARA_CRAFTING";

const img = document.createElement("img");
img.src = CAPYBARA_CRAFTING;
document.body.appendChild(img);
```

Notes:
- `20260202/` is a versioned batch folder.
- Export names are derived from the filename stem (without the trailing timestamp). If multiple versions exist, the latest timestamp wins.
- You can also import from the version index:
  ```js
  import { CAPYBARA_CRAFTING } from "@bagakit/open-agent-avatars/20260202";
  ```

### Raw SVG access

If you need raw SVGs, use the repo files directly (this package primarily exposes per-icon JS modules).

## Maintenance

When you add new batch folders (e.g. `YYYYMMDD/`) or add/remove SVGs, regenerate exports:

```bash
npm run generate
```

To (re)generate the `20260202/` batch assets locally (repo maintainers):

```bash
node ./scripts/generate-new-avatars.mjs
```
