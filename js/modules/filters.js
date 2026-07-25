export const Filters = {
  preferences: null,
  currentFilters: {
    platform: 'all',
    contentType: 'all',
    timeRange: 'today',
    sort: 'newest',
    search: ''
  },

  init(prefs) {
    this.preferences = prefs;
    this.setupEventListeners();
    this.loadSavedFilters();
  },

  setupEventListeners() {
    document.getElementById('filter-platform')?.addEventListener('change', (e) => {
      this.currentFilters.platform = e.target.value;
      this.apply();
    });
    document.getElementById('filter-content-type')?.addEventListener('change', (e) => {
      this.currentFilters.contentType = e.target.value;
      this.apply();
    });
    document.getElementById('filter-time')?.addEventListener('change', (e) => {
      this.currentFilters.timeRange = e.target.value;
      this.apply();
    });
    document.getElementById('filter-sort')?.addEventListener('change', (e) => {
      this.currentFilters.sort = e.target.value;
      this.apply();
    });
    document.getElementById('search-input')?.addEventListener('input', (e) => {
      this.currentFilters.search = e.target.value;
      this.debounce(() => this.apply(), 300);
    });
    document.getElementById('save-filter-btn')?.addEventListener('click', () => {
      this.saveCurrentFilter();
    });
  },

  apply() {
    window.dispatchEvent(new CustomEvent('filtersChanged', { detail: this.currentFilters }));
  },

  debounce(fn, ms) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(fn, ms);
  },

  saveCurrentFilter() {
    const name = prompt('Name this filter preset:');
    if (!name) return;
    const saved = this.preferences?.filters_saved || [];
    saved.push({ name, ...this.currentFilters, created_at: new Date().toISOString() });
    if (this.preferences) this.preferences.filters_saved = saved;
    this.loadSavedFilters();
  },

  loadSavedFilters() {
    const container = document.getElementById('saved-filters');
    if (!container) return;
    const saved = this.preferences?.filters_saved || [];
    container.innerHTML = saved.map(f => `
      <button class="filter-pill" data-filter='${JSON.stringify(f)}'>${f.name}</button>
    `).join('');
    container.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = JSON.parse(btn.dataset.filter);
        Object.assign(this.currentFilters, filter);
        document.getElementById('filter-platform').value = filter.platform;
        document.getElementById('filter-content-type').value = filter.contentType;
        document.getElementById('filter-time').value = filter.timeRange;
        document.getElementById('filter-sort').value = filter.sort;
        this.apply();
      });
    });
  }
};
