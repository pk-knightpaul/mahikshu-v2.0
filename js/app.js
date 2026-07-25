// ============================================
// MAHIKSHU 2.0 — Single File App (GitHub Pages Compatible)
// ============================================

const VERSION = '2.0.0';

// --- Storage Helpers ---
const Storage = {
  get(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) { console.warn(e); }
  },
  session: {
    get(key, fallback) {
      try { const raw = sessionStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
    },
    set(key, value) {
      try { sessionStorage.setItem(key, JSON.stringify(value)); } catch(e) { console.warn(e); }
    }
  }
};

// --- Toast ---
const Toast = {
  container: null,
  init() {
    if (this.container) return;
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  },
  show(message, type, duration) {
    type = type || 'info'; duration = duration || 4000;
    this.init();
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML = '<span>' + (type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️') + '</span><span>' + message + '</span>';
    this.container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; setTimeout(() => toast.remove(), 300); }, duration);
  }
};

// --- App State ---
let allData = [];
let filteredData = [];
let currentPage = 1;
let perPage = 20;
let preferences = null;
let currentView = 'all';

// --- Platform & Type Labels ---
const platformLabels = {
  binance: 'Binance', coingecko: 'CoinGecko', dexscreener: 'DexScreener',
  news: 'News', defillama: 'DeFiLlama', alternative_me: 'Fear & Greed', snapshot: 'Snapshot'
};
const typeLabels = {
  listing: 'Listing', delisting: 'Delisting', launchpool: 'Launchpool',
  airdrop: 'Airdrop', trending: 'Trending', mover: 'Mover',
  new_pair: 'New Pair', news: 'News', listing_news: 'Listing News',
  security: 'Security', regulation: 'Regulation', announcement: 'Announcement',
  tvl_change: 'TVL Change', high_yield: 'High Yield',
  sentiment: 'Sentiment', governance: 'Governance'
};

// --- LLM Config ---
const PROVIDERS = {
  openai: { name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'] },
  anthropic: { name: 'Anthropic', models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'] },
  google: { name: 'Google', models: ['gemini-1.5-pro', 'gemini-1.5-flash'] },
  groq: { name: 'Groq', models: ['llama-3.1-70b-versatile', 'mixtral-8x7b-32768', 'gemma-7b-it'] },
  huggingface: { name: 'Hugging Face', models: ['mistralai/Mistral-7B-Instruct-v0.2', 'meta-llama/Llama-2-70b-chat-hf'] },
  openrouter: { name: 'OpenRouter', models: ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'meta-llama/llama-3.1-70b-instruct'] }
};
const PROMPT_TEMPLATES = {
  blog: 'Write a 500-word blog post about this crypto opportunity. Include key facts, potential impact, and a balanced perspective.',
  thread: 'Create a Twitter/X thread (5-7 tweets) about this opportunity. Make it engaging and informative.',
  seo: 'Suggest 5 SEO-optimized titles and meta descriptions for content about this opportunity.',
  analysis: 'Provide a brief risk/reward analysis of this opportunity for retail investors.',
  news: 'Write a professional news summary (150 words) suitable for a crypto publication.'
};

// ============================================
// INIT
// ============================================
function init() {
  console.log('🚀 Mahikshu v' + VERSION + ' initializing...');
  loadTheme();
  preferences = Storage.get('mahikshu_prefs', {
    preferences: { default_platforms: ['all'], default_time_range: 'today', default_sort: 'newest', theme: 'light', layout: 'grid', items_per_page: 20 },
    watchlist: [], filters_saved: [], notes: {}, llm_config: { provider: 'openai', model: 'gpt-4o-mini' }
  });
  perPage = preferences.preferences.items_per_page || 20;
  updateUI();
  setupEventListeners();
  setupLLM();
  fetchData();
  document.querySelectorAll('.version-badge').forEach(el => el.textContent = 'v' + VERSION);
}

function loadTheme() {
  const saved = Storage.get('mahikshu_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = saved === 'dark' || (!saved && prefersDark);
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = isDark ? '☀️' : '🌙';
}

function updateUI() {
  const authBtn = document.getElementById('auth-btn');
  if (authBtn) { authBtn.textContent = 'Guest Mode'; authBtn.disabled = true; authBtn.style.opacity = '0.6'; }
  const userMenu = document.getElementById('user-menu');
  if (userMenu) userMenu.style.display = 'none';
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
  // Theme toggle
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    Storage.set('mahikshu_theme', newTheme);
    updateThemeIcon(!isDark);
    Toast.show('Theme updated', 'success');
  });

  // Sidebar toggle (mobile)
  document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Layout toggle
  document.getElementById('layout-toggle')?.addEventListener('click', () => {
    const grid = document.getElementById('cards-grid');
    const isList = grid.classList.toggle('list');
    preferences.preferences.layout = isList ? 'list' : 'grid';
    Storage.set('mahikshu_prefs', preferences);
  });

  // Load more
  document.getElementById('load-more')?.addEventListener('click', () => {
    currentPage++;
    render();
  });

  // Filters
  document.getElementById('filter-platform')?.addEventListener('change', applyFilters);
  document.getElementById('filter-content-type')?.addEventListener('change', applyFilters);
  document.getElementById('filter-time')?.addEventListener('change', applyFilters);
  document.getElementById('filter-sort')?.addEventListener('change', applyFilters);

  let searchTimer;
  document.getElementById('search-input')?.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(applyFilters, 300);
  });

  document.getElementById('save-filter-btn')?.addEventListener('click', saveCurrentFilter);

  // Card actions (delegated)
  document.getElementById('cards-grid')?.addEventListener('click', (e) => {
    const starBtn = e.target.closest('.star-btn');
    if (starBtn) { e.preventDefault(); e.stopPropagation(); toggleStar(starBtn.dataset.id, starBtn); }
    const llmBtn = e.target.closest('.llm-btn');
    if (llmBtn) { e.preventDefault(); e.stopPropagation(); openLLM(llmBtn.dataset.id); }
  });

  // Exports
  document.getElementById('export-csv-btn')?.addEventListener('click', exportCSV);
  document.getElementById('export-md-btn')?.addEventListener('click', exportMarkdown);

  // LLM
  document.getElementById('llm-generate-btn')?.addEventListener('click', generateLLM);
  document.getElementById('llm-save-btn')?.addEventListener('click', saveLLMConfig);

  // LLM templates
  document.querySelectorAll('.llm-template-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const template = btn.dataset.template;
      const customPrompt = document.getElementById('llm-custom-prompt');
      if (customPrompt && template) customPrompt.value = PROMPT_TEMPLATES[template] || '';
    });
  });

  // Keyboard shortcuts
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
}

// ============================================
// SIDEBAR NAVIGATION
// ============================================
function filterByPlatform(platform) {
  currentView = 'platform';
  document.getElementById('filter-platform').value = platform;
  document.getElementById('page-title').textContent = (platformLabels[platform] || platform) + ' Opportunities';

  // Update active sidebar item
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  const activeItem = document.querySelector('.nav-item[data-platform="' + platform + '"]');
  if (activeItem) activeItem.classList.add('active');

  applyFilters();
}

function filterByView(view) {
  currentView = view;
  document.getElementById('page-title').textContent = 
    view === 'all' ? 'All Opportunities' : 
    view === 'watchlist' ? 'My Watchlist' : 'Trending Now';

  // Update active sidebar item
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  const activeItem = document.querySelector('.nav-item[data-view="' + view + '"]');
  if (activeItem) activeItem.classList.add('active');

  if (view === 'watchlist') {
    // Show only watchlisted items
    const wl = preferences.watchlist || [];
    filteredData = allData.filter(item => wl.includes(item.id));
    currentPage = 1;
    render();
    updateStatus();
  } else if (view === 'trending') {
    document.getElementById('filter-sort').value = 'engagement';
    document.getElementById('filter-time').value = 'today';
    applyFilters();
  } else {
    // Reset to all
    document.getElementById('filter-platform').value = 'all';
    document.getElementById('filter-content-type').value = 'all';
    document.getElementById('filter-time').value = 'today';
    document.getElementById('filter-sort').value = 'newest';
    document.getElementById('search-input').value = '';
    applyFilters();
  }
}

function openLLMModal() {
  document.getElementById('llm-modal').classList.add('active');
}

// ============================================
// DATA FETCHING
// ============================================
async function fetchData() {
  const sources = ['binance.json', 'coingecko.json', 'dexscreener.json', 'news.json', 'defillama.json', 'fear_greed.json', 'snapshot.json'];
  try {
    const responses = await Promise.all(
      sources.map(s => fetch('data/' + s + '?t=' + Date.now()).then(r => {
        if (!r.ok) { console.warn('Failed to load ' + s + ': ' + r.status); return []; }
        return r.json();
      }).catch(err => { console.warn('Error loading ' + s + ':', err); return []; }))
    );

    allData = responses.flat().filter(item => item && item.id);
    console.log('Loaded ' + allData.length + ' opportunities from ' + sources.length + ' sources');

    // Log per-source counts for debugging
    sources.forEach((s, i) => {
      const count = Array.isArray(responses[i]) ? responses[i].length : 0;
      if (count > 0) console.log('  ✓ ' + s + ': ' + count + ' items');
      else console.log('  ✗ ' + s + ': 0 items (empty or failed)');
    });

    window.dashboardData = allData;
    applyFilters();
  } catch (e) {
    console.error('Failed to fetch data:', e);
    showError('Failed to load data. Please try again later.');
  }
}

// ============================================
// FILTERS
// ============================================
function applyFilters() {
  let data = [...allData];
  const platform = document.getElementById('filter-platform')?.value || 'all';
  const contentType = document.getElementById('filter-content-type')?.value || 'all';
  const timeRange = document.getElementById('filter-time')?.value || 'all';
  const sort = document.getElementById('filter-sort')?.value || 'newest';
  const search = document.getElementById('search-input')?.value || '';

  if (platform !== 'all') data = data.filter(item => item.platform === platform);
  if (contentType !== 'all') data = data.filter(item => item.content_type === contentType);
  if (timeRange !== 'all') {
    const now = Date.now();
    const ranges = { now: 5*60*1000, today: 24*60*60*1000, week: 7*24*60*60*1000, month: 30*24*60*60*1000 };
    const cutoff = now - (ranges[timeRange] || Infinity);
    data = data.filter(item => {
      try { return new Date(item.published_at).getTime() >= cutoff; } catch { return false; }
    });
  }
  if (search) {
    const q = search.toLowerCase();
    data = data.filter(item => 
      (item.title && item.title.toLowerCase().includes(q)) || 
      (item.summary && item.summary.toLowerCase().includes(q)) || 
      (item.tags && item.tags.some(t => t.toLowerCase().includes(q)))
    );
  }

  if (sort === 'newest') {
    data.sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0));
  } else if (sort === 'engagement') {
    data.sort((a, b) => (b.engagement || 0) - (a.engagement || 0));
  }

  filteredData = data;
  currentPage = 1;
  render();
  updateStatus();
}

function saveCurrentFilter() {
  const name = prompt('Name this filter preset:');
  if (!name) return;
  const saved = preferences.filters_saved || [];
  saved.push({
    name: name,
    platform: document.getElementById('filter-platform').value,
    contentType: document.getElementById('filter-content-type').value,
    timeRange: document.getElementById('filter-time').value,
    sort: document.getElementById('filter-sort').value,
    created_at: new Date().toISOString()
  });
  preferences.filters_saved = saved;
  Storage.set('mahikshu_prefs', preferences);
  loadSavedFilters();
  Toast.show('Filter "' + name + '" saved!', 'success');
}

function loadSavedFilters() {
  const container = document.getElementById('saved-filters');
  if (!container) return;
  const saved = preferences.filters_saved || [];
  container.innerHTML = saved.map(f => '<button class="filter-pill" data-name="' + escapeHtml(f.name) + '">' + escapeHtml(f.name) + '</button>').join('');
  container.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = saved.find(f => f.name === btn.dataset.name);
      if (!filter) return;
      document.getElementById('filter-platform').value = filter.platform;
      document.getElementById('filter-content-type').value = filter.contentType;
      document.getElementById('filter-time').value = filter.timeRange;
      document.getElementById('filter-sort').value = filter.sort;
      applyFilters();
    });
  });
}

// ============================================
// RENDERING
// ============================================
function render() {
  const grid = document.getElementById('cards-grid');
  const empty = document.getElementById('empty-state');
  const loading = document.getElementById('loading');
  const end = currentPage * perPage;
  const pageData = filteredData.slice(0, end);

  if (loading) loading.style.display = 'none';

  if (pageData.length === 0) {
    if (grid) grid.style.display = 'none';
    if (empty) {
      empty.style.display = 'flex';
      empty.querySelector('.empty-title').textContent = 'No opportunities found';
      empty.querySelector('.empty-desc').textContent = currentView === 'watchlist' 
        ? 'Star some opportunities to see them here.' 
        : 'Try adjusting your filters or wait for data to load.';
    }
    return;
  }

  if (grid) grid.style.display = 'grid';
  if (empty) empty.style.display = 'none';

  if (currentPage === 1) {
    grid.innerHTML = pageData.map(item => renderCard(item)).join('');
  } else {
    const existing = grid.children.length;
    const newItems = pageData.slice(existing);
    grid.insertAdjacentHTML('beforeend', newItems.map(item => renderCard(item)).join(''));
  }

  const loadMore = document.getElementById('load-more');
  if (loadMore) loadMore.style.display = end >= filteredData.length ? 'none' : 'block';
}

function renderCard(item) {
  const isStarred = preferences.watchlist && preferences.watchlist.includes(item.id);
  const tagsHtml = (item.tags || []).slice(0, 4).map(t => '<span class="tag">#' + escapeHtml(t) + '</span>').join('');

  return '<article class="card" data-platform="' + item.platform + '" data-id="' + item.id + '">' +
    '<div class="card-header">' +
      '<div class="card-badges">' +
        '<span class="badge badge-platform">' + escapeHtml(platformLabels[item.platform] || item.platform) + '</span>' +
        '<span class="badge badge-type">' + escapeHtml(typeLabels[item.content_type] || item.content_type) + '</span>' +
      '</div>' +
      '<div class="card-actions">' +
        '<button class="btn-icon star-btn ' + (isStarred ? 'starred' : '') + '" data-id="' + item.id + '" title="' + (isStarred ? 'Remove from watchlist' : 'Add to watchlist') + '">' +
          (isStarred ? '★' : '☆') +
        '</button>' +
      '</div>' +
    '</div>' +
    '<h3 class="card-title">' + escapeHtml(item.title) + '</h3>' +
    '<div class="card-meta">' +
      '<span>🕐 ' + formatTimeAgo(item.published_at) + '</span>' +
      (item.engagement ? '<span>• 👁 ' + item.engagement.toLocaleString() + '</span>' : '') +
    '</div>' +
    '<p class="card-summary">' + escapeHtml(item.summary || '') + '</p>' +
    '<div class="card-footer">' +
      '<div class="card-tags">' + tagsHtml + '</div>' +
      '<div class="card-actions">' +
        '<a href="' + item.url + '" target="_blank" rel="noopener" class="btn btn-sm btn-ghost">View Source →</a>' +
        '<button class="btn btn-sm btn-ghost llm-btn" data-id="' + item.id + '" title="Generate content ideas">🤖 AI</button>' +
      '</div>' +
    '</div>' +
  '</article>';
}

function toggleStar(id, btn) {
  const wl = preferences.watchlist || [];
  const idx = wl.indexOf(id);
  if (idx > -1) {
    wl.splice(idx, 1);
    btn.classList.remove('starred');
    btn.textContent = '☆';
    btn.title = 'Add to watchlist';
    Toast.show('Removed from watchlist', 'info');
  } else {
    wl.push(id);
    btn.classList.add('starred');
    btn.textContent = '★';
    btn.title = 'Remove from watchlist';
    Toast.show('Added to watchlist', 'success');
  }
  preferences.watchlist = wl;
  Storage.set('mahikshu_prefs', preferences);

  // Refresh if in watchlist view
  if (currentView === 'watchlist') {
    filterByView('watchlist');
  }
}

function updateStatus() {
  const countEl = document.getElementById('count-display');
  const updatedEl = document.getElementById('last-updated');
  if (countEl) countEl.textContent = filteredData.length + ' opportunities found';
  if (updatedEl) {
    fetch('data/meta.json?t=' + Date.now()).then(r => r.ok ? r.json() : null).then(meta => {
      if (meta && meta.last_updated) {
        updatedEl.textContent = 'Last updated: ' + formatTimeAgo(meta.last_updated);
      } else {
        updatedEl.textContent = 'Last updated: Unknown';
      }
    }).catch(() => {
      updatedEl.textContent = 'Last updated: Unknown';
    });
  }
}

function showError(msg) {
  const loading = document.getElementById('loading');
  const empty = document.getElementById('empty-state');
  if (loading) loading.style.display = 'none';
  if (empty) {
    empty.style.display = 'flex';
    empty.querySelector('.empty-title').textContent = 'Error';
    empty.querySelector('.empty-desc').textContent = msg;
  }
}

// ============================================
// EXPORTS
// ============================================
function exportCSV() {
  const data = window.dashboardData || [];
  if (!data.length) { alert('No data to export'); return; }
  const headers = ['ID', 'Title', 'Platform', 'Type', 'Published', 'URL', 'Tags', 'Summary'];
  const rows = data.map(item => [
    item.id,
    '"' + (item.title || '').replace(/"/g, '""') + '"',
    item.platform,
    item.content_type,
    item.published_at,
    item.url,
    '"' + (item.tags || []).join(', ') + '"',
    '"' + (item.summary || '').replace(/"/g, '""') + '"'
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadFile(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'mahikshu-report-' + new Date().toISOString().split('T')[0] + '.csv');
  Toast.show('CSV report downloaded', 'success');
}

function exportMarkdown() {
  const data = window.dashboardData || [];
  if (!data.length) { alert('No data to export'); return; }
  let md = '# Mahikshu Crypto Opportunities Report\n\n';
  md += '**Generated:** ' + new Date().toLocaleString() + '\n';
  md += '**Version:** ' + VERSION + '\n';
  md += '**Total Opportunities:** ' + data.length + '\n\n---\n\n';
  data.forEach(item => {
    md += '## ' + item.title + '\n\n';
    md += '- **Platform:** ' + (platformLabels[item.platform] || item.platform) + '\n';
    md += '- **Type:** ' + (typeLabels[item.content_type] || item.content_type) + '\n';
    md += '- **Published:** ' + new Date(item.published_at).toLocaleString() + '\n';
    md += '- **URL:** [View Source](' + item.url + ')\n';
    md += '- **Tags:** ' + (item.tags || []).join(', ') + '\n\n';
    md += '> ' + (item.summary || 'No summary available.') + '\n\n---\n\n';
  });
  downloadFile(new Blob([md], { type: 'text/markdown;charset=utf-8;' }), 'mahikshu-report-' + new Date().toISOString().split('T')[0] + '.md');
  Toast.show('Markdown report downloaded', 'success');
}

function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================
// LLM
// ============================================
function setupLLM() {
  const providerSelect = document.getElementById('llm-provider');
  const modelSelect = document.getElementById('llm-model');
  if (!providerSelect) return;

  providerSelect.innerHTML = Object.entries(PROVIDERS).map(([key, p]) => '<option value="' + key + '">' + p.name + '</option>').join('');
  providerSelect.addEventListener('change', () => {
    const provider = PROVIDERS[providerSelect.value];
    modelSelect.innerHTML = provider.models.map(m => '<option value="' + m + '">' + m + '</option>').join('');
  });
  providerSelect.dispatchEvent(new Event('change'));

  const config = Storage.session.get('mahikshu_llm_config');
  if (config) {
    providerSelect.value = config.provider;
    providerSelect.dispatchEvent(new Event('change'));
    setTimeout(() => {
      modelSelect.value = config.model;
      document.getElementById('llm-api-key').value = config.key || '';
    }, 0);
  }
}

function saveLLMConfig() {
  const config = {
    provider: document.getElementById('llm-provider').value,
    model: document.getElementById('llm-model').value,
    key: document.getElementById('llm-api-key').value.trim()
  };
  Storage.session.set('mahikshu_llm_config', config);
  document.getElementById('llm-modal').classList.remove('active');
  Toast.show('AI config saved to session', 'success');
}

function openLLM(id) {
  window.selectedOpportunity = allData.find(d => d.id === id);
  document.getElementById('llm-modal').classList.add('active');
}

async function generateLLM() {
  const config = Storage.session.get('mahikshu_llm_config');
  if (!config || !config.key) { alert('Please configure your API key first'); return; }
  const prompt = document.getElementById('llm-custom-prompt')?.value;
  const opportunity = window.selectedOpportunity;
  if (!prompt || !opportunity) return;

  const fullPrompt = 'Context: ' + opportunity.title + '\n' + opportunity.summary + '\n\n' + prompt;
  const output = document.getElementById('llm-output');
  output.textContent = 'Generating...';

  try {
    let response, data;
    if (config.provider === 'openai' || config.provider === 'groq') {
      const endpoint = config.provider === 'groq' ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + config.key },
        body: JSON.stringify({ model: config.model, messages: [{ role: 'user', content: fullPrompt }], max_tokens: 1000, temperature: 0.7 })
      });
      data = await response.json();
      if (data.error) throw new Error(data.error.message);
      output.textContent = data.choices[0].message.content;
    } else if (config.provider === 'openrouter') {
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + config.key, 'HTTP-Referer': window.location.href },
        body: JSON.stringify({ model: config.model, messages: [{ role: 'user', content: fullPrompt }], max_tokens: 1000, temperature: 0.7 })
      });
      data = await response.json();
      if (data.error) throw new Error(data.error.message);
      output.textContent = data.choices[0].message.content;
    } else if (config.provider === 'anthropic') {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': config.key, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: config.model, max_tokens: 1000, messages: [{ role: 'user', content: fullPrompt }] })
      });
      data = await response.json();
      if (data.error) throw new Error(data.error.message);
      output.textContent = data.content[0].text;
    } else if (config.provider === 'google') {
      response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + config.model + ':generateContent?key=' + config.key, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] })
      });
      data = await response.json();
      if (data.error) throw new Error(data.error.message);
      output.textContent = data.candidates[0].content.parts[0].text;
    } else if (config.provider === 'huggingface') {
      response = await fetch('https://api-inference.huggingface.co/models/' + encodeURIComponent(config.model), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + config.key },
        body: JSON.stringify({ inputs: fullPrompt, parameters: { max_new_tokens: 1000, temperature: 0.7 } })
      });
      data = await response.json();
      if (data.error) throw new Error(data.error.message);
      output.textContent = Array.isArray(data) ? data[0].generated_text : data.generated_text;
    }
    Toast.show('Content generated!', 'success');
  } catch (e) {
    output.textContent = 'Error: ' + e.message;
    Toast.show('Generation failed: ' + e.message, 'error');
  }
}

// ============================================
// UTILITIES
// ============================================
function formatTimeAgo(isoString) {
  if (!isoString) return 'Unknown';
  try {
    const date = new Date(isoString);
    const diff = Date.now() - date.getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return 'Just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return min + 'm ago';
    const hr = Math.floor(min / 60);
    if (hr < 24) return hr + 'h ago';
    const day = Math.floor(hr / 24);
    if (day < 7) return day + 'd ago';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Unknown';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ============================================
// BOOT
// ============================================
document.addEventListener('DOMContentLoaded', init);
