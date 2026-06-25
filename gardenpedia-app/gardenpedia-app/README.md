# GardenPedia Workbench

A static, single-page workbench for GardenPedia editorial work. It connects directly to the Anthropic API from your browser and applies the GardenPedia house rules to every request.

Sections: Home, Chat, Fact Finder, Research, Settings, About.

## What it does

- **Chat.** A working conversation with your GardenPedia AI. Every message is reframed into RCTIO and answered under house rules.
- **Fact Finder.** Generates facts across the four fixed categories and checks each one in the browser against the format ranges (223 to 354 characters, 35 to 59 words, 35 to 58 spaces, three sentences). The metric strip under each card is the specimen label: green is within range, ochre is out of range.
- **Research.** A single sourced answer with a named source list and explicit [MISSING INFO] flags.
- **Settings.** Connect your Anthropic API key and choose a model.

## How the Claude connection works

There is no server. The site calls `https://api.anthropic.com/v1/messages` directly from your browser, using an API key you enter in Settings. The key is stored only in your browser's local storage and is sent only to Anthropic. It is never written to this repository or to GitHub.

Do not enter your key on a shared or public computer. To revoke it, clear it in Settings or rotate the key in your Anthropic console.

If you later want the key hidden from the browser entirely, point the `fetch` call in `assets/app.js` at a small serverless proxy (for example a free Cloudflare Worker) that holds the key as a secret. The rest of the frontend does not change.

## Deploy to GitHub Pages

1. Create a new repository, for example `gardenpedia-app`.
2. Add these files at the repository root: `index.html`, the `assets/` folder, `.nojekyll`, and this `README.md`.
3. Commit and push.
4. In the repository, open **Settings, Pages**.
5. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose the `main` branch and the `/ (root)` folder, then save.
6. Wait for the green tick, then open the published URL (it looks like `https://YOUR-USERNAME.github.io/gardenpedia-app/`).
7. Open **Settings** in the site, paste your Anthropic API key, choose a model, and click **Test connection**.

On a free GitHub account the repository and the published site are public. That is fine here, because the key lives only in your browser and never in the repository. Anyone else who opens the site would need to supply their own key.

## Editing the rules

All GardenPedia behaviour lives in one file: `assets/gardenpedia-config.js`. It holds the house style, the RCTIO instruction, the research format, and the Fact Finder specification and validation ranges.

These rules were reconstructed from prior GardenPedia work, not read from a canonical skill repo. When you push your real skill files (`SKILL.md`, `references/rctio-method.md`, `references/gardenpedia.md`, `references/conventions.md`), reconcile `gardenpedia-config.js` against them so the site and the skill stay in step.

## Files

```
index.html
assets/
  styles.css              visual design
  app.js                  routing, API calls, Fact Finder validation
  gardenpedia-config.js   house rules and system prompts (edit here)
.nojekyll                 tells GitHub Pages to serve files as-is
README.md
```
