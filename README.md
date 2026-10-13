# YouTube Background Coloring

A small browser extension that lets you change YouTube’s page background using vibrant gradients and a two‑tone look. It only changes background visuals — it does not alter videos, text, buttons or other YouTube functionality.

Quick summary
- Floating control button in the top-left while browsing YouTube
- Pick from several retro, neon, aurora and duo‑tone presets
- Toggle extension on/off without uninstalling it
- Close (✕) the control button; press Shift + Y to show/hide it again
- Selected theme is saved in your browser so it persists between pages

Files in this repository (important ones)
- `manifest.json` — extension manifest
- `content_script.js` — injects the control UI and applies background styles
- `styles.css` — styles for the floating button and settings panel
- `README.md` — this file

Install (Chrome / Edge / Brave)
1. Download or clone this repository to a folder on your computer.
2. Open your browser and go to `chrome://extensions`.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and choose the folder that contains `manifest.json`.
5. Open youtube.com and the small 🎨 button should appear in the top-left.

Install (Firefox)
1. Download or clone this repository to a folder on your computer.
2. Open `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on** and select the `manifest.json` file from this folder.
4. Open youtube.com and look for the 🎨 button.

How to use
1. Click the top-left 🎨 button to open the panel.
2. Use the Enabled checkbox to switch the background effects on or off.
3. Pick any preset to apply it immediately.
4. Click ✕ in the panel header to hide the extension UI. Press Shift + Y to reveal it again.

Included presets (examples)
- Cyberpunk Neon — deep night with neon highlights
- Sunset Wave — warm orange → purple gradient
- Aurora Glow — layered radial accents over a dark gradient
- Retro Neon, Miami Sunset — bright retro gradients
- Discord Blue Duo, Discord Purple Duo — two‑tone app‑style backgrounds
- Soft Pastel, Violet Crush — softer/feminine palettes

Behavior and design goals
- Backgrounds only: the extension injects CSS that targets YouTube containers so text, controls and video playback remain untouched.
- Minimal and reversible: Use the on/off toggle to disable backgrounds without removing the extension.
- Local-only settings: theme choice and button hidden state are stored locally in browser storage.

Keyboard shortcuts
- Shift + Y — show or hide the floating control button

Troubleshooting
- I don’t see the button: make sure the extension is loaded and enabled in the browser extensions page; try refreshing the YouTube tab.
- Theme not applying consistently: YouTube is a single-page app and sometimes replaces parts of the DOM. The extension observes DOM changes and re-applies styles, but you can refresh the tab if needed.
- To fully remove the effect: disable the extension from the browser’s extension page.

Privacy
- The extension stores only your preferences (enabled state, chosen theme, button hidden) in the browser using local storage.
- No data is sent to any server.

Developer notes
- The extension uses a content script to insert a small UI and a dynamically updated stylesheet.
- If you want additional presets or polish (animations, thumbnails, accessibility improvements), open an issue or submit a PR.

License
MIT — see the repository LICENSE file for details.

