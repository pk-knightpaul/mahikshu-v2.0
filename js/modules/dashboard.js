import { Storage } from '../services/storage.js';

export const Dashboard = {
  preferences: null,
  allData: [],
  filteredData: [],
  currentPage: 1,
  perPage: 20,

  init(prefs) {
    this.preferences = prefs;
    this.perPage = prefs?.preferences?.items_per_page || 20;
    this.setupEventListeners();
    this.fetchData();
    window.addEventListener('filtersChanged', (e) => {
      this.applyFilters(e.detail);
    });
  },

  setupEventListeners() {
    document.getElementById('layout-toggle')?.addEventListener('click', () => {
      const grid = document.getElementById('cards-grid');
      const isList = grid.classList.toggle('list');
      if (this.preferences) {
        this.preferences.preferences.layout = isList ? 'list' : 'grid';
      }
    });

    document.getElementById('load-more')?.addEventListener('click', () => {
      this.currentPage++;
      this.render();
    });

    document.getElementById('cards-grid')?.addEventListener('click', (e) => {
      const btn = e.target.closest('.star-btn');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        this.toggleStar(btn.dataset.id, btn);
      }
      const llmBtn = e.target.closest('.llm-btn');
      if (llmBtn) {
        e.preventDefault();
        e.stopPropagation();
        window.selectedOpportunity = this.allData.find(d => d.id === llmBtn.dataset.id);
        document.getElementById('llm-modal').classList.add('active');
      }
    });
  },

  toggleStar(id, btn) {
    if (!this.preferences) {
      alert('Please sign in to use watchlist');
      return;
    }
    const wl = this.preferences.watchlist || [];
    const idx = wl.indexOf(id);
    if (idx > -1) {
      wl.splice(idx, 1);
      btn.classList.remove('starred');
      btn.textContent = '☆';
      btn.title = 'Add to watchlist';
    } else {
      wl.push(id);
      btn.classList.add('starred');
      btn.textContent = '★';
      btn.title = 'Remove from watchlist';
    }
    this.preferences.watchlist = wl;
    Storage.set('mahikshu_prefs', this.preferences);
  },

  async fetchData() {
    const sources = [
      'binance.json', 'coingecko.json', 'dexscreener.json', 'news.json',
      'defillama.json', 'fear_greed.json', 'snapshot.json'
    ];
    try {
      const responses = await Promise.all(
        sources.map(s => fetch(`data/${s}?t=${Date.now()}`).then(r => r.ok ? r.json() : []).catch(() => []))
      );
      this.allData = responses.flat().filter(item => item && item.id);
      window.dashboardData = this.allData;
      this.applyFilters();
    } catch (e) {
      console.error('Failed to fetch data:', e);
    }
  },

  applyFilters(filters = {}) {
    let data = [...this.allData];
    if (filters.platform && filters.platform !== 'all') {
      data = data.filter(item => item.platform === filters.platform);
    }
    if (filters.contentType && filters.contentType !== 'all') {
      data = data.filter(item => item.content_type === filters.contentType);
    }
    if (filters.timeRange && filters.timeRange !== 'all') {
      const now = Date.now();
      const ranges = { now: 5*60*1000, today: 24*60*60*1000, week: 7*24*60*60*1000, month: 30*24*60*60*1000 };
      const cutoff = now - (ranges[filters.timeRange] || Infinity);
      data = data.filter(item => new Date(item.published_at).getTime() >= cutoff);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(item =>
        item.title?.toLowerCase().includes(q) ||
        item.summary?.toLowerCase().includes(q) ||
        item.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    const sort = filters.sort || 'newest';
    if (sort === 'newest') {
      data.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
    } else if (sort === 'engagement') {
      data.sort((a, b) => (b.engagement || 0) - (a.engagement || 0));
    }
    this.filteredData = data;
    this.currentPage = 1;
    this.render();
    this.updateStatus();
  },

  render() {
    const grid = document.getElementById('cards-grid');
    const empty = document.getElementById('empty-state');
    const loading = document.getElementById('loading');
    const end = this.currentPage * this.perPage;
    const pageData = this.filteredData.slice(0, end);

    loading.style.display = 'none';
    if (pageData.length === 0) {
      grid.style.display = 'none';
      empty.style.display = 'flex';
      return;
    }
    grid.style.display = 'grid';
    empty.style.display = 'none';

    if (this.currentPage === 1) {
      grid.innerHTML = pageData.map(item => this.renderCard(item)).join('');
    } else {
      const existing = grid.children.length;
      const newItems = pageData.slice(existing);
      grid.insertAdjacentHTML('beforeend', newItems.map(item => this.renderCard(item)).join(''));
    }

    const loadMore = document.getElementById('load-more');
    if (loadMore) {
      loadMore.style.display = end >= this.filteredData.length ? 'none' : 'block';
    }
  },

  renderCard(item) {
    const platformLabels = {
      binance: 'Binance', coingecko: 'CoinGecko', dexscreener: 'DexScreener',
      news: 'News', cryptopanic: 'CryptoPanic', whale_alert: 'Whale Alert',
      defillama: 'DeFiLlama', alternative_me: 'Fear & Greed', snapshot: 'Snapshot'
    };
    const typeLabels = {
      listing: 'Listing', delisting: 'Delisting', launchpool: 'Launchpool',
      airdrop: 'Airdrop', trending: 'Trending', mover: 'Mover',
      new_pair: 'New Pair', news: 'News', listing_news: 'Listing News',
      security: 'Security', regulation: 'Regulation', announcement: 'Announcement',
      whale_movement: 'Whale Alert', tvl_change: 'TVL Change', high_yield: 'High Yield',
      sentiment: 'Sentiment', governance: 'Governance', futures: 'Futures',
      monitoring: 'Monitoring', postponed: 'Postponed', margin: 'Margin'
    };
    const isStarred = this.preferences?.watchlist?.includes(item.id);
    return `
      <article class="card" data-platform="${item.platform}" data-id="${item.id}">
        <div class="card-header">
          <div class="card-badges">
            <span class="badge badge-platform">${platformLabels[item.platform] || item.platform}</span>
            <span class="badge badge-type">${typeLabels[item.content_type] || item.content_type}</span>
          </div>
          <div class="card-actions">
            <button class="btn-icon star-btn ${isStarred ? 'starred' : ''}" data-id="${item.id}" title="${isStarred ? 'Remove from watchlist' : 'Add to watchlist'}">
              ${isStarred ? '★' : '☆'}
            </button>
          </div>
        </div>
        <h3 class="card-title">${this.escapeHtml(item.title)}</h3>
        <div class="card-meta">
          <span>🕐 ${this.formatTimeAgo(item.published_at)}</span>
          ${item.engagement ? `<span>• 👁 ${item.engagement.toLocaleString()}</span>` : ''}
        </div>
        <p class="card-summary">${this.escapeHtml(item.summary || '')}</p>
        <div class="card-footer">
          <div class="card-tags">
            ${(item.tags || []).slice(0, 4).map(t => `<span class="tag">#${t}</span>`).join('')}
          </div>
          <div class="card-actions">
            <a href="${item.url}" target="_blank" rel="noopener" class="btn btn-sm btn-ghost">View Source →</a>
            <button class="btn btn-sm btn-ghost llm-btn" data-id="${item.id}" title="Generate content ideas">🤖 AI</button>
          </div>
        </div>
      </article>
    `;
  },

  updateStatus() {
    const countEl = document.getElementById('count-display');
    const updatedEl = document.getElementById('last-updated');
    if (countEl) countEl.textContent = `${this.filteredData.length} opportunities found`;
    if (updatedEl) {
      fetch('data/meta.json').then(r => r.ok ? r.json() : null).then(meta => {
        if (meta?.last_updated) {
          updatedEl.textContent = `Last updated: ${this.formatTimeAgo(meta.last_updated)}`;
        }
      });
    }
  },

  formatTimeAgo(isoString) {
    if (!isoString) return 'Unknown';
    const date = new Date(isoString);
    const diff = Date.now() - date.getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return 'Just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    if (day < 7) return `${day}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
