# FCT Blueprint Decoder Encoder <a href="https://github.com/OstinUA"><img align="right" src="https://img.shields.io/badge/OstinUA-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"></a>

> Decode, inspect, patch, and re-encode Factorio blueprint strings without leaving your browser.

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue?style=for-the-badge)](LICENSE)
[![Version](https://img.shields.io/badge/version-v3.8-5c7cfa?style=for-the-badge)](https://github.com/FCTostin-team)
[![Frontend](https://img.shields.io/badge/frontend-HTML%2FCSS%2FJS-orange?style=for-the-badge)](#tech-stack)
[![Localization](https://img.shields.io/badge/i18n-12_languages-success?style=for-the-badge)](#features)
[![Factorio](https://img.shields.io/badge/Factorio-Blueprints-ff9f1a?style=for-the-badge)](https://factorio.com/)

A production-friendly web utility for working with Factorio blueprint strings (`zlib + base64`). The app gives you a full decode/edit/encode round-trip pipeline with a CodeMirror-powered JSON editing workflow, search/replace tooling, local history persistence, and multilingual UI support.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Technical Notes](#technical-notes)
  - [Project Structure](#project-structure)
  - [Key Design Decisions](#key-design-decisions)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Usage](#usage)
- [Configuration](#configuration)
- [License](#license)
- [Community and Support](#community-and-support)
- [Support the Development](#support-the-development)
- [Contacts](#contacts)

## Features

- **Blueprint decode/encode pipeline**
  - Decodes Factorio blueprint strings into pretty-printed JSON.
  - Re-encodes edited JSON back into game-ready blueprint string format.
  - Handles the standard Factorio leading version prefix (`0`) gracefully.

- **CodeMirror-driven JSON editor UX**
  - Syntax highlighting and line numbers.
  - Auto-close brackets + bracket matching.
  - Active-line and selection match visualization.
  - Pretty-print normalization after successful encode.

- **JSON search and replace workflow**
  - Inline find with next/previous navigation.
  - Global replace for repetitive bulk changes.
  - Search match highlighting for easier scanning in big payloads.

- **Session-friendly blueprint history**
  - Stores up to `30` unique blueprint strings in browser `localStorage`.
  - One-click restore from history to resume previous edits.
  - History clear action for quick cleanup.

- **Localization and language switching**
  - Runtime language switching from a built-in dropdown.
  - Shipped with `12` locale profiles: `ru`, `en`, `uk`, `kk`, `cs`, `nl`, `sv`, `de`, `pl`, `fr`, `zh`, `ja`.
  - Automatic language persistence between sessions.

- **Quality-of-life details**
  - Adaptive font size for large blueprint text blobs.
  - Copy-to-clipboard output action.
  - Input validation and user-facing error handling.

## Tech Stack

Core stack:
- **HTML5** for semantic page layout.
- **CSS3** for custom UI styling and responsive layout.
- **Vanilla JavaScript (ES6+)** for app logic and DOM orchestration.

Third-party runtime dependencies (loaded via CDN):
- **[CodeMirror 5](https://codemirror.net/5/)** for JSON editing UX.
- **[Pako](https://github.com/nodeca/pako)** for `zlib` inflate/deflate operations in the browser.

Platform assumptions:
- Runs as a static web app (no backend required).
- Works in modern evergreen browsers with `localStorage` and Clipboard API support.

## Technical Notes

### Project Structure

```text
.
├── index.html          # app shell, layout, and CDN dependency wiring
├── style.css           # styling, components, responsive behavior
├── script.js           # core application logic, state, encode/decode, i18n wiring
├── profiles/
│   ├── ru.js           # translation dictionary: Russian
│   ├── en.js           # translation dictionary: English
│   └── ...             # other locale dictionaries
├── CODE_OF_CONDUCT.md
├── LICENSE
└── README.md
```

### Key Design Decisions

- **Client-side only architecture**
  - No server round-trips, no blueprint data leaving the user’s browser.
  - Ideal for privacy-sensitive or offline-like workflows.

- **DOM-first state model**
  - Lightweight app state (`dom`, editor instance, history array) instead of a full framework runtime.
  - Keeps bundle complexity low and maintenance straightforward.

- **Local persistence by design**
  - Uses `localStorage` for history and language preference.
  - Fallback behavior is safe if storage access fails.

- **Translation profiles as standalone files**
  - Locale dictionaries are split into isolated scripts for easy community-driven translation updates.

## Getting Started

### Prerequisites

You only need:
- A modern browser (`Chrome`, `Firefox`, `Edge`, `Safari`).
- Internet access for CDN-loaded dependencies (CodeMirror and Pako).

Optional for local serving:
- `Python 3.x` (for `http.server`) or
- `Node.js` (for `npx serve`) or
- Any static file server you already use.

### Installation

1. Clone the repository:

```bash
git clone https://github.com/<your-org-or-user>/blueprints-decoder_encoder.git
cd blueprints-decoder_encoder
```

2. Run with a local static server (recommended):

```bash
# Python
python -m http.server 8080
```

3. Open the app:

```text
http://localhost:8080
```

Quick-and-dirty alternative:
- Open `index.html` directly in your browser.
- Note: some browser security settings may limit clipboard behavior on `file://` origin.

## Testing

This repository currently has no formal automated test suite, so validation is done through smoke checks and manual scenario testing.

Suggested local checks:

```bash
# 1) Serve the app
python -m http.server 8080

# 2) Open app in browser and run core flow manually:
# - decode default sample
# - edit JSON
# - encode output
# - copy encoded blueprint
# - switch language
# - restore from history
```

Recommended contributor-level quality gates:
- Validate decode/encode round-trip on at least one known-good Factorio blueprint string.
- Verify invalid JSON shows encode error feedback.
- Verify search and replace do not break JSON syntax unexpectedly.
- Verify history limit behavior near 30 entries.

## Deployment

Because this is a static frontend, deployment is straightforward.

### Static hosting options

- **GitHub Pages**
- **Netlify**
- **Vercel (static output)**
- **Any Nginx/Apache static bucket setup**

### Minimal deployment workflow

1. Push repository to your Git provider.
2. Configure hosting target to serve project root.
3. Ensure `index.html` is the default entry point.
4. Enable HTTPS for Clipboard API compatibility in stricter browser contexts.

### Optional containerized deployment

You can also ship the app through a tiny web server container (for example, Nginx serving static files) and integrate it into your CI/CD pipeline.

## Usage

Typical workflow:

```text
1) Paste a Factorio blueprint string into the input panel.
2) Click DECODE to inflate and parse into JSON.
3) Edit JSON in the CodeMirror editor.
4) Use Search/Replace for bulk tweaks.
5) Click ENCODE to generate a new blueprint string.
6) Copy the result and paste it back into Factorio.
```

Practical tips:

```text
# Use language switcher if collaborating across different communities.
# Keep an eye on history panel for quick rollback to older inputs.
# If encode fails, validate JSON syntax first (missing commas/brackets are common).
```

## Configuration

This project has no `.env` or backend config. Runtime behavior is controlled by constants in `script.js`.

Main tunables:

- `MAX_HISTORY_ITEMS`
  - Controls how many blueprint strings are persisted in local history.

- `LANGUAGE_STORAGE_KEY`
  - `localStorage` key used to persist current UI language.

- `HISTORY_STORAGE_KEY`
  - `localStorage` key used for saved blueprint history.

To change defaults, update those constants and reload the app.

## License

Distributed under the **GPL-3.0** license. See [`LICENSE`](LICENSE) for full legal text.

## Community and Support

Project created with the support of the FCTostin community.

[![YouTube](https://img.shields.io/badge/YouTube-Channel-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/@FCT-Ostin)
[![Telegram](https://img.shields.io/badge/Telegram-Join_Chat-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/FCTostin)
[![Steam](https://img.shields.io/badge/Steam-Join_Group-1b2838?style=for-the-badge&logo=steam&logoColor=white)](https://steamcommunity.com/groups/FCTgroup)

## Support the Development

[![Patreon](https://img.shields.io/badge/Patreon-Support-F96854?style=for-the-badge&logo=patreon&logoColor=white)](https://www.patreon.com/c/OstinFCT)
[![Boosty](https://img.shields.io/badge/Boosty-Donate-F15F2C?style=for-the-badge&logo=boosty&logoColor=white)](https://boosty.to/ostinfct)

## Contacts

- GitHub: [OstinUA](https://github.com/OstinUA)
- Team page: [FCTostin-team](https://github.com/FCTostin-team)
- Main community channels: YouTube, Telegram, Steam (links above)
