// content_script.js
// Content script for YouTube Background Coloring extension

(function () {
  const THEMES = [
    // Darker / dual-tone and vibrant presets
    { id: 'midnight-slate', name: 'Midnight Slate', css: 'linear-gradient(135deg, #0b1020 0%, #1f2937 100%)' },
    { id: 'obsidian-blue', name: 'Obsidian Blue', css: 'linear-gradient(135deg, #050814 0%, #0f1724 40%, #0b3a66 100%)' },
    { id: 'deep-space', name: 'Deep Space', css: 'linear-gradient(135deg, #020204 0%, #0b0f1a 50%, #0f1724 100%)' },
    { id: 'charcoal-duo', name: 'Charcoal Duo', css: 'linear-gradient(180deg, #1f2328 0%, #2b2f36 100%)' },
    { id: 'midnight-purple-duo', name: 'Midnight Purple Duo', css: 'linear-gradient(180deg, #0f0826 0%, #321b6b 100%)' },
    { id: 'forest-night', name: 'Forest Night', css: 'linear-gradient(135deg, #08120b 0%, #0b2a1b 100%)' },
    { id: 'cyberpunk-neon', name: 'Cyberpunk Neon', css: 'linear-gradient(135deg, #0f0c29 0%, #302b63 35%, #ff00cc 100%)' },
    { id: 'sunset-wave', name: 'Sunset Wave', css: 'linear-gradient(135deg, #ff7b00 0%, #ffb347 28%, #ff5e7a 55%, #9b5de5 100%)' },
    { id: 'aurora-glow', name: 'Aurora Glow', css: 'radial-gradient(circle at 20% 10%, #00ffd5 0%, rgba(0,255,213,0.15) 18%, transparent 35%), radial-gradient(circle at 80% 80%, #ff00bf 0%, rgba(255,0,191,0.15) 18%, transparent 35%), linear-gradient(135deg, #0e1d36 0%, #1d3557 40%, #2a9d8f 100%)' },
    { id: 'vibrant-retro-1', name: 'Retro Neon', css: 'linear-gradient(135deg, #ff7eb3 0%, #65d6ff 100%)' },
    { id: 'vibrant-retro-2', name: 'Miami Sunset', css: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 25%, #f6d365 100%)' },
    { id: 'discord-duotone-1', name: 'Blue Duo', css: 'linear-gradient(180deg, #2b2f44 0%, #7289da 100%)' },
    { id: 'discord-duotone-2', name: 'Purple Duo', css: 'linear-gradient(180deg, #1f1140 0%, #6e44ff 100%)' },
    { id: 'vibrant-aurora', name: 'Aurora Glow Lite', css: 'radial-gradient(circle at 20% 10%, #00ffd5, transparent 20%), radial-gradient(circle at 80% 80%, #ff00bf, transparent 20%), linear-gradient(90deg,#1e3c72,#2a5298)' },
    { id: 'soft-pastel', name: 'Soft Pastel', css: 'linear-gradient(135deg, #ffd1ff 0%, #d1fdff 100%)' },
    { id: 'violet-crush', name: 'Violet Crush', css: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 30%, #f472b6 100%)' }
  ];

  const STORAGE_KEYS = {
    ENABLED: 'yt_bg_enabled',
    THEME: 'yt_bg_theme',
    MINIMIZED: 'yt_bg_minimized' // whether panel is minimized to button
  };

  let injectedStyle = null;
  let appContainer = null;

  function createUI() {
    const container = document.createElement('div');
    container.id = 'yt-bg-coloring-root';
    container.innerHTML = `
      <div id="yt-bg-top">
        <button id="yt-bg-toggle" title="YouTube Background Coloring" aria-label="YouTube Background Coloring"></button>
      </div>
      <div id="yt-bg-panel" aria-hidden="true">
        <div id="yt-bg-panel-header">
          <strong>YouTube Backgrounds</strong>
          <button id="yt-bg-close" aria-label="Minimize">✕</button>
        </div>
        <div id="yt-bg-controls">
          <label class="yt-bg-row">Enabled: <input id="yt-bg-enabled" type="checkbox"/></label>
        </div>
        <div id="yt-bg-presets"></div>
        <div id="yt-bg-footer">Tip: use the Enabled switch to disable the effect</div>
      </div>
    `;

    // Try to place the control inside YouTube's masthead (next to the logo).
    const masthead = document.querySelector('ytd-masthead') || document.querySelector('#masthead-container') || document.querySelector('header');
    if (masthead && masthead instanceof HTMLElement) {
      // insert after the logo element if present
      const logo = masthead.querySelector('#logo') || masthead.querySelector('#logo-icon') || masthead.querySelector('a#logo');
      if (logo && logo.parentNode) {
        logo.parentNode.insertBefore(container, logo.nextSibling);
      } else {
        // fallback: append to masthead
        masthead.appendChild(container);
      }
      // add a class to style when inside masthead
      container.classList.add('yt-bg-in-masthead');
    } else {
      // fallback to fixed position in the page
      document.documentElement.appendChild(container);
    }

    // event listeners
    const toggle = container.querySelector('#yt-bg-toggle');
    const panel = container.querySelector('#yt-bg-panel');
    const close = container.querySelector('#yt-bg-close');
    const enabledCheckbox = container.querySelector('#yt-bg-enabled');

    // toggle panel open/close when clicking the button
    toggle.addEventListener('click', () => {
      const isHidden = panel.getAttribute('aria-hidden') === 'true';
      panel.setAttribute('aria-hidden', isHidden ? 'false' : 'true');
      // update minimized state
      setStorage(STORAGE_KEYS.MINIMIZED, panel.getAttribute('aria-hidden') === 'true');
    });

    // minimize to button (do not remove the button)
    close.addEventListener('click', async () => {
      panel.setAttribute('aria-hidden', 'true');
      await setStorage(STORAGE_KEYS.MINIMIZED, true);
    });

    // enable toggle
    enabledCheckbox.addEventListener('change', async (e) => {
      const enabled = !!e.target.checked;
      await setStorage(STORAGE_KEYS.ENABLED, enabled);
      applyCurrentSettings();
    });

    // populate presets
    const presetsEl = container.querySelector('#yt-bg-presets');
    THEMES.forEach((t) => {
      const item = document.createElement('button');
      item.className = 'yt-bg-preset';
      item.title = t.name;
      item.dataset.id = t.id;
      item.innerHTML = `<span class="yt-bg-swatch" style="background: ${t.css};"></span><span class="yt-bg-name">${t.name}</span>`;
      item.addEventListener('click', async () => {
        await setStorage(STORAGE_KEYS.THEME, t.id);
        await setStorage(STORAGE_KEYS.ENABLED, true);
        if (enabledCheckbox) enabledCheckbox.checked = true;
        // ensure style element and class are present
        document.documentElement.classList.add('yt-bg-coloring-active');
        await applyThemeById(t.id);
      });
      presetsEl.appendChild(item);
    });

    return container;
  }

  async function getStorage(key) {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get([key], (res) => resolve(res[key]));
      } catch (err) {
        console.error('Storage get error', err);
        resolve(undefined);
      }
    });
  }

  async function setStorage(key, value) {
    return new Promise((resolve) => {
      try {
        const obj = {}; obj[key] = value; chrome.storage.local.set(obj, () => resolve());
      } catch (err) {
        console.error('Storage set error', err); resolve();
      }
    });
  }

  async function applyThemeById(id) {
    const theme = THEMES.find((t) => t.id === id);
    if (!theme) return;
    ensureInjectedStyle();
    const css = generateBackgroundCSS(theme.css);
    injectedStyle.textContent = css;
  }

  function generateBackgroundCSS(bgValue) {
    return `
      /* YouTube Background Coloring - injected styles */
      html.yt-bg-coloring-active,
      html.yt-bg-coloring-active body,
      html.yt-bg-coloring-active ytd-app,
      html.yt-bg-coloring-active ytd-page-manager,
      html.yt-bg-coloring-active #page-manager,
      html.yt-bg-coloring-active #content,
      html.yt-bg-coloring-active ytd-browse,
      html.yt-bg-coloring-active ytd-watch-flexy {
        background: ${bgValue} !important;
        background-image: none !important;
        background-color: transparent !important;
      }
      html.yt-bg-coloring-active #page-manager, html.yt-bg-coloring-active #content, html.yt-bg-coloring-active ytd-app {
        background: ${bgValue} !important;
      }
    `;
  }

  function ensureInjectedStyle() {
    if (injectedStyle) return;
    injectedStyle = document.createElement('style');
    injectedStyle.id = 'yt-bg-coloring-style';
    document.head.appendChild(injectedStyle);
  }

  async function applyCurrentSettings() {
    const enabled = await getStorage(STORAGE_KEYS.ENABLED);
    const themeId = await getStorage(STORAGE_KEYS.THEME);
    const minimized = await getStorage(STORAGE_KEYS.MINIMIZED);

    const container = document.getElementById('yt-bg-coloring-root');
    const panel = container ? container.querySelector('#yt-bg-panel') : null;
    const enabledCheckbox = container ? container.querySelector('#yt-bg-enabled') : null;

    const isEnabled = enabled === true; // default off
    if (enabledCheckbox) enabledCheckbox.checked = isEnabled;

    if (isEnabled && themeId) {
      document.documentElement.classList.add('yt-bg-coloring-active');
      applyThemeById(themeId);
    } else {
      document.documentElement.classList.remove('yt-bg-coloring-active');
      if (injectedStyle) injectedStyle.textContent = '';
    }

    // minimization: if minimized true, hide panel but keep button
    if (panel) panel.setAttribute('aria-hidden', minimized ? 'true' : 'false');
  }

  function watchForNavigation() {
    const observer = new MutationObserver(() => {
      if (document.documentElement.classList.contains('yt-bg-coloring-active')) ensureInjectedStyle();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  (async function init() {
    try {
      if (document.readyState === 'loading') await new Promise(r => document.addEventListener('DOMContentLoaded', r));
      if (document.getElementById('yt-bg-coloring-root')) return;
      appContainer = createUI();
      await applyCurrentSettings();
      watchForNavigation();
    } catch (err) {
      console.error('yt-bg-coloring init error', err);
    }
  })();
})();
