import { Auth } from './modules/auth.js';
import { Dashboard } from './modules/dashboard.js';
import { Filters } from './modules/filters.js';
import { Reports } from './modules/reports.js';
import { LLM } from './modules/llm.js';
import { Storage } from './services/storage.js';
import { Toast } from './utils/toast.js';

const VERSION = '2.0.0';

class App {
  constructor() {
    this.version = VERSION;
    this.user = null;
    this.preferences = null;
  }

  async init() {
    console.log(`🚀 Mahikshu v${this.version} initializing...`);
    this.loadTheme();
    
    // Guest mode — no OAuth required
    this.user = null;
    this.preferences = this.loadLocalPreferences();
    this.updateUIForGuest();
    
    Dashboard.init(this.preferences);
    Filters.init(this.preferences);
    Reports.init();
    LLM.init();
    this.setupGlobalEvents();
    document.querySelectorAll('.version-badge').forEach(el => el.textContent = `v${this.version}`);
  }

  loadTheme() {
    const saved = Storage.get('mahikshu_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved === 'dark' || (!saved && prefersDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }

  // NEW METHOD — Add this here
  loadLocalPreferences() {
    return Storage.get('mahikshu_prefs', {
      preferences: {
        default_platforms: ['all'],
        default_time_range: 'today',
        default_sort: 'newest',
        theme: document.documentElement.getAttribute('data-theme') || 'light',
        layout: 'grid',
        items_per_page: 20
      },
      watchlist: [],
      filters_saved: [],
      notes: {},
      llm_config: { provider: 'openai', model: 'gpt-4o-mini' }
    });
  }

  // NEW METHOD — Add this here
  updateUIForGuest() {
    const authBtn = document.getElementById('auth-btn');
    const userMenu = document.getElementById('user-menu');
    if (authBtn) {
      authBtn.textContent = 'Guest Mode';
      authBtn.disabled = true;
      authBtn.style.opacity = '0.6';
    }
    if (userMenu) userMenu.style.display = 'none';
  }

  setupGlobalEvents() {
    document.addEventListener('keydown', (e) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        Toast.show('Shortcuts: / = search, ? = help, ESC = close', 'info');
      }
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
      }
    });

    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const newTheme = isDark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      Storage.set('mahikshu_theme', newTheme);
      Toast.show('Theme updated', 'success');
    });

    document.getElementById('auth-btn')?.addEventListener('click', () => Auth.login());
    document.getElementById('logout-btn')?.addEventListener('click', () => Auth.logout());

    document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });

    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');
      });
    });

    document.getElementById('llm-nav')?.addEventListener('click', () => {
      document.getElementById('llm-modal').classList.add('active');
    });
  }
}

const app = new App();
document.addEventListener('DOMContentLoaded', () => app.init());
