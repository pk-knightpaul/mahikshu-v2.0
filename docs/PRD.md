# 📋 Product Requirements Document (PRD)
# Mahikshu 2.0 — Crypto Opportunity Dashboard
# Version: 2.0.0
# Date: 2026-07-25
# Status: Phase 1 — Free Tier SaaS

---

## 1. EXECUTIVE SUMMARY

**Product Name:** Mahikshu 2.0 (Sanskrit: "Swift observer of the earth")
**Tagline:** "Your crypto content intelligence, zero cost."
**Version:** 2.0.0
**Phase:** Phase 1 — Free Tier SaaS Features

Mahikshu 2.0 transforms the static dashboard into a personalized SaaS experience while maintaining zero backend hosting costs. Users authenticate via GitHub OAuth, personalize their dashboard, download reports, and leverage BYOK LLM integration for content generation.

---

## 2. OBJECTIVES & SUCCESS METRICS

| Objective | Metric | Target |
|-----------|--------|--------|
| User acquisition | GitHub OAuth signups | 500 in Month 1 |
| Engagement | Daily active users | 30% of signups |
| Content generation | LLM prompts used | 100/day |
| Data freshness | Successful cron runs | 99% uptime |

---

## 3. USER PERSONAS

### Primary: Crypto Content Writer
- Needs: Trending topics, listing announcements, news aggregation
- Pain point: Information scattered across 20+ sources
- Value prop: One dashboard, filtered to their interests

### Secondary: SEO Specialist
- Needs: Keyword opportunities, trending searches, competitor content
- Pain point: Missing early trends
- Value prop: First-mover advantage on emerging tokens

### Tertiary: Crypto Influencer
- Needs: Breaking news, sentiment analysis, content ideas
- Pain point: Creating daily content is exhausting
- Value prop: AI-generated thread ideas in seconds

---

## 4. FEATURE REQUIREMENTS

### 4.1 Authentication (GitHub OAuth)
- **FR-AUTH-01:** Users authenticate via GitHub OAuth 2.0
- **FR-AUTH-02:** No password storage — GitHub handles credentials
- **FR-AUTH-03:** Session persists via JWT in sessionStorage
- **FR-AUTH-04:** Logout clears all session data
- **FR-AUTH-05:** Guest mode available (limited features)

### 4.2 Personalization
- **FR-PERS-01:** Users save favorite filter combinations
- **FR-PERS-02:** Custom watchlist with starred opportunities
- **FR-PERS-03:** Preferred platforms selection (default filter)
- **FR-PERS-04:** Custom tags/notes on any opportunity
- **FR-PERS-05:** Dashboard layout preference (grid/list view)
- **FR-PERS-06:** Notification preferences (email digest opt-in)

### 4.3 Data Sources (20+ Free APIs)
- **FR-DATA-01:** Exchange listings (Binance, Coinbase, Kraken, OKX, Bybit)
- **FR-DATA-02:** Market trends (CoinGecko, CoinMarketCap, CryptoCompare)
- **FR-DATA-03:** DeFi opportunities (DexScreener, GeckoTerminal, DeFiLlama)
- **FR-DATA-04:** News aggregation (CryptoPanic, RSS feeds)
- **FR-DATA-05:** Whale alerts (Whale Alert API)
- **FR-DATA-06:** On-chain data (Etherscan, BscScan)
- **FR-DATA-07:** Sentiment (Alternative.me Fear & Greed)
- **FR-DATA-08:** Governance (Snapshot API)
- **FR-DATA-09:** Events (CoinMarketCal)
- **FR-DATA-10:** Derivatives (Coinglass funding rates)

### 4.4 Reports & Exports
- **FR-REPT-01:** Download filtered data as CSV
- **FR-REPT-02:** Download opportunity analysis as Markdown
- **FR-REPT-03:** Report includes metadata (generated time, filters applied)
- **FR-REPT-04:** Reports are versioned with Mahikshu version number

### 4.5 LLM Integration (BYOK)
- **FR-LLM-01:** Dropdown with all major providers + Hugging Face + OpenRouter
- **FR-LLM-02:** API key stored ONLY in sessionStorage
- **FR-LLM-03:** Model selection per provider
- **FR-LLM-04:** Pre-built prompt templates for content generation
- **FR-LLM-05:** Custom prompt input available
- **FR-LLM-06:** Response streamed or batched

### 4.6 Version Control
- **FR-VER-01:** Semantic versioning (MAJOR.MINOR.PATCH)
- **FR-VER-02:** Version displayed in footer/header
- **FR-VER-03:** Changelog accessible from UI
- **FR-VER-04:** Data snapshots timestamped

---

## 5. NON-FUNCTIONAL REQUIREMENTS

| Requirement | Specification |
|-------------|--------------|
| Hosting cost | $0 (GitHub Pages + Actions free tier) |
| Load time | < 2 seconds for initial render |
| Data freshness | < 1 hour (cron schedule) |
| Browser support | Chrome, Firefox, Safari, Edge (last 2 versions) |
| Accessibility | WCAG 2.1 AA compliance |
| Privacy | No tracking, no cookies except session |

---

## 6. TECHNICAL CONSTRAINTS

- No backend server
- No database (JSON files in repo)
- No npm/build step
- Vanilla JS only (ES6 modules)
- Python 3.12+ for data pipeline
- GitHub Actions for automation

---

## 7. RISK ANALYSIS

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| API rate limits | High | Medium | Caching, exponential backoff |
| GitHub Actions minutes exceeded | Medium | High | Optimize scripts, reduce frequency |
| OAuth token expiration | Medium | Low | Auto-refresh flow |
| Data source shutdown | Low | High | Multiple redundant sources |

---

## 8. GLOSSARY

- **BYOK:** Bring Your Own Key (user-provided API key)
- **CSV:** Comma-Separated Values (report format)
- **MD:** Markdown (report format)
- **OAuth:** Open Authorization (authentication protocol)
- **PRD:** Product Requirements Document
- **SaaS:** Software as a Service
- **TRD:** Technical Requirements Document

---

**Document Owner:** Product Team
**Review Cycle:** Monthly
**Approval:** Required before development begins
