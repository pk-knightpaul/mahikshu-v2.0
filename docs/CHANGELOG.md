# 📜 Changelog
# Mahikshu — Crypto Opportunity Dashboard
# All notable changes to this project will be documented in this file.

---

## [2.0.0] - 2026-07-25

### 🚀 Added (Phase 1: Free Tier SaaS)

#### Authentication
- GitHub OAuth 2.0 login integration
- Guest mode for non-authenticated users
- Session-based authentication (no persistent cookies)
- Secure logout with session cleanup

#### Personalization
- User-specific dashboard preferences (saved to JSON)
- Custom watchlist with star/unstar functionality
- Saved filter presets with custom names
- Personal notes on any opportunity
- Layout toggle (grid/list view)
- Theme preference persistence per user
- Items per page selector

#### Data Sources (Expanded from 4 to 20+)
- **Exchanges:** Binance, Coinbase, Kraken, OKX, Bybit
- **Market Data:** CoinGecko, CoinMarketCap, CryptoCompare
- **DeFi:** DexScreener, GeckoTerminal, DeFiLlama
- **News:** CryptoPanic, CoinTelegraph, CoinDesk, Decrypt
- **On-Chain:** Whale Alert, Etherscan, BscScan
- **Sentiment:** Alternative.me Fear & Greed Index
- **Governance:** Snapshot API
- **Events:** CoinMarketCal
- **Derivatives:** Coinglass funding rates

#### Reports & Exports
- CSV export of filtered opportunities
- Markdown report generation with analysis
- Report metadata (filters, timestamp, version)
- Client-side file generation (no server needed)
- Downloadable version-stamped reports

#### LLM Integration (BYOK)
- Support for 6 providers: OpenAI, Anthropic, Google, Groq, Hugging Face, OpenRouter
- Dynamic model selection per provider
- Pre-built prompt templates:
  - Blog post ideas
  - Twitter/X thread drafts
  - SEO title suggestions
  - Competitor analysis
  - Risk assessment
- Custom prompt input
- Streaming response option
- API key stored ONLY in sessionStorage

#### Version Control
- Semantic versioning (2.0.0)
- Version badge in header/footer
- In-app changelog viewer
- Data snapshot timestamps

#### UI/UX Improvements
- Redesigned filter bar with saved presets
- Collapsible sidebar for mobile
- Skeleton loading states
- Toast notifications for actions
- Keyboard shortcuts (?, /, ESC)
- Infinite scroll option
- Advanced search with operators

### 🔧 Changed

- Migrated from single `app.js` to modular ES6 architecture
- Separated concerns: auth, dashboard, filters, cards, reports, llm
- Improved CSS architecture with component-based files
- Enhanced error handling with retry logic
- Optimized data fetching with caching layer

### 🐛 Fixed

- Binance API endpoint updated (catalogId 48 → 49)
- Response parsing for new Binance schema
- Timezone handling in date formatting
- Mobile layout overflow issues

---

## [1.0.0] - 2026-07-25

### 🎉 Initial Release

- Static dashboard with 4 data sources
- Basic filtering (platform, time, sort)
- Dark/light mode toggle
- Responsive card grid
- GitHub Actions cron pipeline
- Zero-cost hosting on GitHub Pages

---

## Version Format

We use [Semantic Versioning](https://semver.org/):

- **MAJOR:** Breaking changes, architecture shifts
- **MINOR:** New features, data sources, integrations
- **PATCH:** Bug fixes, API endpoint updates, performance improvements

---

**Current Version:** 2.0.0
**Next Planned:** 2.1.0 (Team Workspaces, Slack Integration)
