// content_script.js
// Content script for YouTube Background Coloring extension

(function () {
  const THEMES = [
    {
      id: 'vibrant-retro-1',
      name: 'Retro Neon',
      css: 'linear-gradient(135deg, #ff7eb3 0%, #65d6ff 100%)'
    },
    {
      id: 'vibrant-retro-2',
      name: 'Miami Sunset',
      css: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 25%, #f6d365 100%)'
    },
    {
      id: 'discord-duotone-1',
      name: 'Discord Blue Duo',
      css: 'linear-gradient(180deg, #7289da 0%, #99a9ee 100%)'
    },
    {
      id: 'discord-duotone-2',
      name: 'Discord Purple Duo',
      css: 'linear-gradient(180deg, #6e44ff 0%, #b68cff 100%)'
    },
    {
      id: 'vibrant-aurora',
      name: 'Aurora Glow',
      css: 'radial-gradient(circle at 20% 10%, #00ffd5, transparent 20%), radial-gradient(circle at 80% 80%, #ff00bf, transparent 20%), linear-gradient(90deg,#1e3c72,#2a5298)'
    },
    {
      id: 'soft-pastel',
      name: 'Soft Pastel',
      css: 'linear-gradient(135deg, #ffd1ff 0%, #d1fdff 100%)'
    }
  ];

  const STORAGE_KEYS = {
    ENABLED: 'yt_bg_enabled',
    THEME: 'yt_bg_theme',
    BUTTON_HIDDEN: 'yt_bg_button_hidden'
  };

  // Create persistent style element we will update
  let injectedStyle = null;
  let appContainer = null;

  function createUI() {
    // root container
    const container = document.createElement('div');
    container.id = 'yt-bg-coloring-root';
    container.innerHTML = `
      <button id="yt-bg-toggle" title="YouTube Background Coloring">🎨</button>
      <div id="yt-bg-panel" aria-hidden="true">
        <div id="yt-bg-panel-header">
          <strong>YouTube Backgrounds</strong>
          <button id="yt-bg-close" aria-label="Close">✕</button>
        </div>
        <div id="yt-bg-controls">
          <label class="yt-bg-row">Enabled: <input id="yt-bg-enabled" type="checkbox"/></label>
        </div>
        <div id="yt-bg-presets"></div>
        <div id="yt-bg-footer">Tip: press Shift+Y to show/hide the control button</div>
      </div>
    `;

    document.documentElement.appendChild(container);

    // add event listeners
    const toggle = document.getElementById('yt-bg-toggle');
    const panel = document.getElementById('yt-bg-panel');
    const close = document.getElementById('yt-bg-close');
    const enabledCheckbox = document.getElementById('yt-bg-enabled');

    // toggle panel
    toggle.addEventListener('click', () => {
      const visible = panel.getAttribute('aria-hidden') === 'false';
      panel.setAttribute('aria-hidden', visible ? 'true' : 'false');
    });

    // close/hide the whole button (user asked for an X on the top of the button to close the extension button)
    close.addEventListener('click', async () => {
      // hide the entire root
      container.style.display = 'none';
      await setStorage(STORAGE_KEYS.BUTTON_HIDDEN, true);
    });

    // enable toggle
    enabledCheckbox.addEventListener('change', async (e) => {
      const enabled = e.target.checked;
      await setStorage(STORAGE_KEYS.ENABLED, enabled);
      applyCurrentSettings();
    });

    // populate presets
    const presetsEl = document.getElementById('yt-bg-presets');
    THEMES.forEach((t) => {
      const item = document.createElement('button');
      item.className = 'yt-bg-preset';
      item.title = t.name;
      item.dataset.id = t.id;
      item.innerHTML = `<span class="yt-bg-swatch" style="background: ${t.css};"></span><span class="yt-bg-name">${t.name}</span>`;
      item.addEventListener('click', async () => {
        await setStorage(STORAGE_KEYS.THEME, t.id);
        applyThemeById(t.id);
      });
      presetsEl.appendChild(item);
    });

    // keyboard shortcut to show/hide the button
    window.addEventListener('keydown', (e) => {
      if (e.shiftKey && (e.key === 'Y' || e.key === 'y')) {
        const hidden = container.style.display === 'none' || container.style.visibility === 'hidden';
        container.style.display = hidden ? 'block' : 'none';
        if (!hidden) {
          // user hid it manually, persist
          setStorage(STORAGE_KEYS.BUTTON_HIDDEN, true);
        } else {
          setStorage(STORAGE_KEYS.BUTTON_HIDDEN, false);
        }
      }
    });

    return container;
  }

  async function getStorage(key) {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get([key], (res) => {
          resolve(res[key]);
        });
      } catch (err) {
        console.error('Storage get error', err);
        resolve(undefined);
      }
    });
  }

  async function setStorage(key, value) {
    return new Promise((resolve) => {
      try {
        const obj = {};
        obj[key] = value;
        chrome.storage.local.set(obj, () => resolve());
      } catch (err) {
        console.error('Storage set error', err);
        resolve();
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
    // Only change background-related properties on a small set of YouTube structural elements.
    // We avoid touching colors, text, sizing, layout to meet "backgrounds only" requirement.
    return `
      /* YouTube Background Coloring - injected styles */
      html.yt-bg-coloring-active, html.yt-bg-coloring-active body, html.yt-bg-coloring-active ytd-app, html.yt-bg-coloring-active ytd-page-manager, html.yt-bg-coloring-active #content, html.yt-bg-coloring-active ytd-watch-flexy, html.yt-bg-coloring-active ytd-browse {
        background: ${bgValue} !important;
        background-image: none !important;
        background-color: transparent !important;
        /* keep transparency for overlays */
      }
      /* Make sure big containers that use backgrounds are also covered */
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
    const container = document.getElementById('yt-bg-coloring-root');
    const panel = document.getElementById('yt-bg-panel');
    const enabledCheckbox = document.getElementById('yt-bg-enabled');

    const isEnabled = enabled !== false; // default true
    if (enabledCheckbox) enabledCheckbox.checked = isEnabled;

    if (isEnabled) {
      document.documentElement.classList.add('yt-bg-coloring-active');
      if (themeId) applyThemeById(themeId);
      else applyThemeById(THEMES[0].id);
    } else {
      document.documentElement.classList.remove('yt-bg-coloring-active');
      if (injectedStyle) injectedStyle.textContent = '';
    }

    // button hidden state
    const hidden = await getStorage(STORAGE_KEYS.BUTTON_HIDDEN);
    if (hidden) {
      if (container) container.style.display = 'none';
    } else {
      if (container) container.style.display = 'block';
    }
  }

  // Re-apply theme after SPA navigation / dynamic content changes.
  function watchForNavigation() {
    const observer = new MutationObserver((mutations) => {
      // Apply CSS again in case YouTube replaced parts of the DOM
      if (document.documentElement.classList.contains('yt-bg-coloring-active')) {
        // ensure style exists
        ensureInjectedStyle();
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  // Initialize
  (async function init() {
    try {
      // Wait until document is at least interactive
      if (document.readyState === 'loading') await new Promise(r => document.addEventListener('DOMContentLoaded', r));

      const existing = document.getElementById('yt-bg-coloring-root');
      if (existing) return; // already injected

      appContainer = createUI();
      await applyCurrentSettings();
      watchForNavigation();

      // ensure a default theme saved
      const themeId = await getStorage(STORAGE_KEYS.THEME);
      if (!themeId) await setStorage(STORAGE_KEYS.THEME, THEMES[0].id);

    } catch (err) {
      console.error('yt-bg-coloring init error', err);
    }
  })();
})();
