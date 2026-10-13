# YouTube Background Coloring

Extention allows you to change your YouTube background color giving you more options than just light mode or dark mode. This extension only changes background visuals — it does not modify or remove any YouTube content, controls, or text.

Features
- Floating button in the top-left when active
- Close "X" to hide the extension button
- On/off toggle to enable or disable background changes without removing the UI
- Multiple retro, vibrant, and two-tone "Discord-like" presets
- Saves your chosen theme between pages
- Works across YouTube pages (watch, home, browse)
- Keyboard shortcut: Shift+Y to show/hide the control button

Files added
- manifest.json (already present)
- content_script.js
- styles.css
- README.md

How it works
- The extension injects a small control UI in the top-left of YouTube when active.
- Selecting a preset applies an injected stylesheet that sets backgrounds on YouTube containers only (html, body, ytd-app, #content, etc.).
- The on/off switch disables the injected styles but keeps the UI available so you can re-enable it quickly.
- The "X" button hides the UI; press Shift+Y to bring it back.

Installation (Chrome / Edge)
1. Clone or download this repository to a folder on your computer.
2. Open Chrome and go to chrome://extensions
3. Enable "Developer mode" (toggle in top-right).
4. Click "Load unpacked" and select the folder for this repository (the folder that contains manifest.json).
5. Open youtube.com. You should see a small 🎨 button in the top-left. Click it to open the panel.

Installation (Firefox Developer)
1. Clone or download this repository to a folder on your computer.
2. Open Firefox and go to about:debugging#/runtime/this-firefox
3. Click "Load Temporary Add-on" and select manifest.json from this repository.
4. Open youtube.com and use the control.

Usage
- Click the top-left 🎨 button to open the panel.
- Toggle "Enabled" to turn backgrounds on or off.
- Click any preset to change the background.
- Click the ✕ in the panel header to hide the button. Press Shift+Y to re-show it.

Screenshots / Previews

Below are tiny inline previews of some included themes. These are simple SVG thumbnails rendered inline.

Retro Neon

![Retro Neon](data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='360' height='80'><defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'><stop offset='0' stop-color='%23ff7eb3'/><stop offset='1' stop-color='%2365d6ff'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g)' rx='8'/></svg>)

Discord Blue Duo

![Discord Blue Duo](data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='360' height='80'><defs><linearGradient id='g2' x1='0' x2='0' y1='0' y2='1'><stop offset='0' stop-color='%237289da'/><stop offset='1' stop-color='%2399a9ee'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g2)' rx='8'/></svg>)

Troubleshooting
- If you don't see the button: ensure the content script was loaded (check extension page), or press Shift+Y to reveal it.
- If your theme doesn't apply consistently: YouTube is a single-page app; our script observes DOM changes and re-applies styles, but if you use heavy custom YouTube skins, there may be conflicts.
- To fully disable the extension, toggle the extension off from your browser's extensions page.

Privacy & Security
- This extension only uses chrome.storage to save your settings (enabled, selected theme, hidden state). It does not transmit any data off your machine.

Known limitations
- The "Close X" hides the button and stores the state locally; to permanently re-open the control you can press Shift+Y.

License
- MIT

