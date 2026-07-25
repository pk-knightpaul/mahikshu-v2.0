export const Reports = {
  init() {
    this.setupEventListeners();
  },

  setupEventListeners() {
    document.getElementById('export-csv-btn')?.addEventListener('click', () => this.exportCSV());
    document.getElementById('export-md-btn')?.addEventListener('click', () => this.exportMarkdown());
  },

  getFilteredData() {
    return window.dashboardData || [];
  },

  exportCSV() {
    const data = this.getFilteredData();
    if (!data.length) { alert('No data to export'); return; }
    const headers = ['ID', 'Title', 'Platform', 'Type', 'Published', 'URL', 'Tags', 'Summary'];
    const rows = data.map(item => [
      item.id,
      `"${(item.title || '').replace(/"/g, '""')}"`,
      item.platform,
      item.content_type,
      item.published_at,
      item.url,
      `"${(item.tags || []).join(', ')}"`,
      `"${(item.summary || '').replace(/"/g, '""')}"`
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('
');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    this.downloadFile(blob, `mahikshu-report-${new Date().toISOString().split('T')[0]}.csv`);
  },

  exportMarkdown() {
    const data = this.getFilteredData();
    if (!data.length) { alert('No data to export'); return; }
    const platformLabels = {
      binance: 'Binance', coingecko: 'CoinGecko', dexscreener: 'DexScreener',
      news: 'News', cryptopanic: 'CryptoPanic', whale_alert: 'Whale Alert',
      defillama: 'DeFiLlama', alternative_me: 'Fear & Greed', snapshot: 'Snapshot'
    };
    let md = `# Mahikshu Crypto Opportunities Report

`;
    md += `**Generated:** ${new Date().toLocaleString()}
`;
    md += `**Version:** 2.0.0
`;
    md += `**Total Opportunities:** ${data.length}

`;
    md += `---

`;
    data.forEach(item => {
      md += `## ${item.title}

`;
      md += `- **Platform:** ${platformLabels[item.platform] || item.platform}
`;
      md += `- **Type:** ${item.content_type}
`;
      md += `- **Published:** ${new Date(item.published_at).toLocaleString()}
`;
      md += `- **URL:** [View Source](${item.url})
`;
      md += `- **Tags:** ${(item.tags || []).join(', ')}

`;
      md += `> ${item.summary || 'No summary available.'}

`;
      md += `---

`;
    });
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    this.downloadFile(blob, `mahikshu-report-${new Date().toISOString().split('T')[0]}.md`);
  },

  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
