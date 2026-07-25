# 🔧 Technical Requirements Document (TRD)
# Mahikshu 2.0 — Crypto Opportunity Dashboard
# Version: 2.0.0
# Date: 2026-07-25

---

## 1. SYSTEM ARCHITECTURE

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  index.html │  │  CSS/JS     │  │  GitHub OAuth       │ │
│  │  (Static)   │  │  (ES6)      │  │  (Client-side)      │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└────────────────────┬────────────────────────────────────────┘
                     │ Fetch JSON
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER (GitHub)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  /data/*.json│  │  /data/users│  │  GitHub Pages       │ │
│  │  (Public)   │  │  (Private)  │  │  (Static Host)      │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└────────────────────┬────────────────────────────────────────┘
                     │ Cron Trigger
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   AUTOMATION LAYER                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  GitHub Actions (update-data.yml)                       ││
│  │  ├─ Python fetchers (20+ APIs)                           ││
│  │  ├─ Data normalization (unified schema)                  ││
│  │  ├─ JSON commit to repo                                  ││
│  │  └─ Auto-deploy to Pages                                 ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Authentication Flow (GitHub OAuth)

```
User clicks "Sign in with GitHub"
         │
         ▼
Redirect to github.com/login/oauth/authorize
         │
         ▼
GitHub redirects back with ?code=XXX
         │
         ▼
Exchange code for access_token (client-side via proxy or redirect)
         │
         ▼
Store token in sessionStorage
         │
         ▼
Fetch user profile from GitHub API
         │
         ▼
Create/load user preferences JSON
```

**Note:** Pure client-side OAuth requires a proxy or uses implicit flow. For zero backend, we use GitHub Apps with device flow or a lightweight Cloudflare Worker (still free tier).

---

## 2. TECH STACK

### 2.1 Frontend

| Component | Technology | Version |
|-----------|-----------|---------|
| Markup | HTML5 | Living Standard |
| Styling | CSS3 | Custom Properties |
| Logic | Vanilla JavaScript | ES2022 |
| Modules | ES6 Modules | Native |
| Charts | Chart.js (CDN) | 4.x |
| Icons | SVG Sprites | Custom |
| Fonts | System font stack | - |

### 2.2 Data Pipeline

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Python | 3.12+ |
| HTTP | requests | 2.31+ |
| RSS | feedparser | 6.0+ |
| JSON | stdlib json | - |
| Cron | GitHub Actions | Ubuntu Latest |

### 2.3 Storage

| Data | Location | Format |
|------|----------|--------|
| Public data | `/data/*.json` | JSON Array |
| User prefs | `/data/users/{id}.json` | JSON Object |
| Meta | `/data/meta.json` | JSON Object |
| Reports | `/reports/` (generated client-side) | CSV/MD |

---

## 3. API INTEGRATION SPECIFICATIONS

### 3.1 Data Sources Matrix

| Source | Endpoint | Method | Auth | Rate Limit | Response |
|--------|----------|--------|------|------------|----------|
| Binance | `/bapi/composite/v1/public/cms/article/list/query` | GET | None | 1200/min | JSON |
| CoinGecko | `/api/v3/search/trending` | GET | None | 10-30/min | JSON |
| CoinGecko | `/api/v3/coins/markets` | GET | None | 10-30/min | JSON |
| DexScreener | `/token-profiles/latest/v1` | GET | None | Unlimited | JSON |
| CryptoPanic | `/api/v1/posts/` | GET | API Key | 100/day | JSON |
| Whale Alert | `/v1/transactions` | GET | API Key | 100/day | JSON |
| DeFiLlama | `/protocols` | GET | None | Unlimited | JSON |
| Etherscan | `/api?module=gastracker` | GET | API Key | 5/sec | JSON |
| Alternative.me | `/api/fng/` | GET | None | Unlimited | JSON |
| Snapshot | `/graphql` | POST | None | Unlimited | GraphQL |
| CoinMarketCal | `/v1/events` | GET | API Key | 30/day | JSON |
| RSS Feeds | Direct URL | GET | None | Unlimited | XML/RSS |

### 3.2 LLM Provider APIs (BYOK)

| Provider | Endpoint | Auth Header | Models |
|----------|----------|-------------|--------|
| **OpenAI** | `api.openai.com/v1/chat/completions` | `Authorization: Bearer {key}` | gpt-4o, gpt-4o-mini, gpt-3.5-turbo |
| **Anthropic** | `api.anthropic.com/v1/messages` | `x-api-key: {key}` | claude-3-5-sonnet, claude-3-haiku |
| **Google** | `generativelanguage.googleapis.com` | `x-goog-api-key: {key}` | gemini-1.5-pro, gemini-1.5-flash |
| **Groq** | `api.groq.com/openai/v1/chat/completions` | `Authorization: Bearer {key}` | llama-3.1-70b, mixtral-8x7b, gemma-7b |
| **Hugging Face** | `api-inference.huggingface.co/models/{model}` | `Authorization: Bearer {key}` | mistralai/Mistral-7B, meta-llama/Llama-2-70b |
| **OpenRouter** | `openrouter.ai/api/v1/chat/completions` | `Authorization: Bearer {key}` | All models aggregated |

---

## 4. DATA SCHEMAS

### 4.1 Unified Opportunity Schema

```json
{
  "id": "binance_12056a79b7f545a3aa03fa5031f77b16",
  "title": "Binance Will Extend the Monitoring Tag...",
  "platform": "binance",
  "content_type": "monitoring",
  "url": "https://www.binance.com/en/support/announcement/12056a79...",
  "published_at": "2026-07-24T10:00:00Z",
  "engagement": 0,
  "summary": "Binance announcement: Binance Will Extend...",
  "tags": ["binance", "monitoring", "acx", "lsk", "stx"],
  "source_raw": { ... },
  "fetched_at": "2026-07-25T14:00:00Z"
}
```

### 4.2 User Preferences Schema

```json
{
  "user_id": "github_12345678",
  "github_username": "pk-knightpaul",
  "created_at": "2026-07-25T14:00:00Z",
  "last_login": "2026-07-25T18:30:00Z",
  "preferences": {
    "default_platforms": ["binance", "coingecko", "news"],
    "default_time_range": "today",
    "default_sort": "newest",
    "theme": "dark",
    "layout": "grid",
    "items_per_page": 20
  },
  "watchlist": ["binance_abc123", "coingecko_xyz789"],
  "filters_saved": [
    {
      "name": "Listings Only",
      "platform": "binance",
      "content_types": ["listing"],
      "time_range": "week"
    }
  ],
  "notes": {
    "binance_abc123": "Write about this before Friday"
  },
  "llm_config": {
    "provider": "openai",
    "model": "gpt-4o-mini",
    "last_used": "2026-07-25T18:00:00Z"
  }
}
```

### 4.3 Meta Schema

```json
{
  "version": "2.0.0",
  "last_updated": "2026-07-25T18:00:00Z",
  "platforms_status": {
    "binance": "ok",
    "coingecko": "ok",
    "dexscreener": "ok",
    "news": "ok",
    "cryptopanic": "ok",
    "whale_alert": "rate_limited"
  },
  "total_opportunities": 1427,
  "active_users_today": 23
}
```

---

## 5. COMPONENT ARCHITECTURE

### 5.1 Module Structure

```
js/
├── app.js                 # Entry point, initialization
├── modules/
│   ├── auth.js            # GitHub OAuth flow
│   ├── dashboard.js       # Main dashboard controller
│   ├── filters.js         # Filter bar logic
│   ├── cards.js           # Card rendering
│   ├── watchlist.js       # Watchlist management
│   ├── reports.js         # CSV/MD export generation
│   ├── llm.js             # BYOK LLM integration
│   ├── personalization.js # User prefs & customization
│   └── version.js         # Version display & changelog
├── services/
│   ├── api.js             # Data fetching service
│   ├── storage.js         # localStorage/sessionStorage
│   ├── github.js          # GitHub API interactions
│   └── export.js          # File generation (CSV/MD)
└── utils/
    ├── date.js            # Date formatting, time ago
    ├── dom.js             # DOM helpers
    └── validators.js      # Input validation
```

### 5.2 CSS Architecture

```
css/
├── styles.css             # Main stylesheet
├── variables.css          # CSS custom properties (themes)
├── layout.css             # Grid, flexbox layouts
├── components.css         # Reusable components
├── cards.css              # Opportunity cards
├── modals.css             # Modal dialogs
├── forms.css              # Inputs, selects, buttons
├── reports.css            # Report preview styling
└── themes/
    ├── light.css
    └── dark.css
```

---

## 6. SECURITY REQUIREMENTS

| Requirement | Implementation |
|-------------|---------------|
| OAuth token storage | sessionStorage only (cleared on tab close) |
| API key storage | sessionStorage only (BYOK model) |
| CORS handling | Proxy via Cloudflare Worker if needed |
| XSS prevention | All DOM inserts use textContent, never innerHTML |
| CSRF prevention | Stateless, no cookies |
| Data validation | Schema validation on all JSON parses |

---

## 7. PERFORMANCE BUDGET

| Metric | Target | Maximum |
|--------|--------|---------|
| First Contentful Paint | < 1s | 1.5s |
| Largest Contentful Paint | < 2s | 3s |
| Time to Interactive | < 2.5s | 4s |
| JSON payload (initial) | < 500KB | 1MB |
| JavaScript bundle | < 100KB | 150KB |
| CSS bundle | < 50KB | 75KB |

---

## 8. ERROR HANDLING STRATEGY

| Error Type | Handling |
|------------|----------|
| API timeout | Return cached data, show stale warning |
| API rate limit | Exponential backoff, skip in next run |
| JSON parse error | Return empty array, log to meta |
| OAuth failure | Redirect to login, clear session |
| Network offline | Show cached data with offline banner |
| LLM API error | Show error in modal, suggest retry |

---

## 9. TESTING STRATEGY

| Type | Tool | Coverage |
|------|------|----------|
| Unit tests | Vitest (browser) | Core utilities |
| Integration | Playwright | Auth flow, data fetching |
| Visual | Percy (free tier) | UI regressions |
| Performance | Lighthouse CI | Budget enforcement |

---

## 10. DEPLOYMENT PIPELINE

```
Developer pushes to feature branch
         │
         ▼
GitHub Actions runs tests
         │
         ▼
Merge to main branch
         │
         ▼
GitHub Actions:
  ├─ Run Python fetchers
  ├─ Update data JSONs
  ├─ Commit changes
  └─ Deploy to GitHub Pages
         │
         ▼
Cloudflare Pages (mirror) auto-deploys
```

---

**Document Owner:** Engineering Team
**Review Cycle:** Per sprint
**Last Updated:** 2026-07-25
