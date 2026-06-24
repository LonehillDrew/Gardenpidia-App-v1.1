# GardenPedia Workbench

A modern, production-ready editorial workbench for sourced South African garden knowledge. It connects directly to the Anthropic API from your browser and applies strict GardenPedia house rules to every request.

**Key Features:**
- ✅ Chat with auto-saving history and RCTIO reframing
- ✅ Fact Finder with real-time format validation (223-354 chars, 35-59 words, 3 sentences, 35-58 spaces)
- ✅ Research with structured sourced answers and [MISSING INFO] flagging
- ✅ Input validation and error recovery
- ✅ Keyboard shortcuts (Cmd/Ctrl+K, Escape)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ No server required - your key stays in your browser only
- ✅ Multiple model support (Sonnet 4.6, Opus 4.8, Haiku 4.5)

## What it does

- **Chat.** A working conversation with your GardenPedia AI. Every message is reframed into RCTIO and answered under house rules. Chat history auto-saves to your browser.
- **Fact Finder.** Generates facts across the four fixed categories and checks each one in real-time against the format ranges (223 to 354 characters, 35 to 59 words, 35 to 58 spaces, three sentences). The metric strip under each card is the specimen label: green is within range, ochre is out of range. Shows pass rate percentage.
- **Research.** A single sourced answer with a named source list and explicit [MISSING INFO] flags. Input validation ensures quality questions.
- **Settings.** Connect your Anthropic API key, choose a model, test your connection, and manage API settings securely in-browser.

## How the Claude connection works

There is no server. The site calls `https://api.anthropic.com/v1/messages` directly from your browser, using an API key you enter in Settings. The key is stored only in your browser's local storage and is sent only to Anthropic. It is never written to this repository or to GitHub.

Do not enter your key on a shared or public computer. To revoke it, clear it in Settings or rotate the key in your Anthropic console.

If you later want the key hidden from the browser entirely, point the `fetch` call in `assets/app.js` at a small serverless proxy (for example a free Cloudflare Worker) that holds the key as a secret. The rest of the frontend does not change.

## Quick Start

### Get Your API Key
1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Create an API key
4. Copy it securely

### Use the App
1. Open the site (live URL or local)
2. Go to **Settings**
3. Paste your API key (starts with `sk-ant-`)
4. Choose your preferred model
5. Click **Test connection** to verify
6. Start using Chat, Fact Finder, or Research

## Deploy to GitHub Pages

### New Repository
1. Create a new repository, e.g. `gardenpedia-app`
2. Clone it locally
3. Copy these files to the repo root: `index.html`, `assets/` folder, `.nojekyll`, `README.md`
4. Commit: `git add . && git commit -m "Initial commit: GardenPedia Workbench"`
5. Push: `git push -u origin main`

### Enable GitHub Pages
1. In your repository, open **Settings → Pages**
2. Under **Source**, select **Deploy from a branch**
3. Choose `main` branch and `/ (root)` folder
4. Save and wait for the green tick
5. Your site is live at `https://YOUR-USERNAME.github.io/gardenpedia-app/`

### Security Note
The API key lives **only in your browser** (localStorage) and never touches GitHub. Anyone visiting needs their own key. Rotate your key anytime in your Anthropic console.

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
