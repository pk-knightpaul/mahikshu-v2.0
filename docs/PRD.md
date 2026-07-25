# Mahikshu 2.0 — Product Requirements Document (PRD)

## Overview
Mahikshu 2.0 is a zero-cost, static-hosted crypto opportunity dashboard with SaaS features including personalization, reports, and BYOK AI integration.

## Features
- **7 Data Sources**: Binance, CoinGecko, DexScreener, News, DeFiLlama, Fear & Greed, Snapshot
- **Guest Mode**: All preferences saved to localStorage (no login required)
- **Watchlist**: Star/unstar opportunities
- **Saved Filters**: Create and reuse filter presets
- **Reports**: Export to CSV and Markdown
- **BYOK AI**: 6 LLM providers (OpenAI, Anthropic, Google, Groq, Hugging Face, OpenRouter)
- **Dark/Light Mode**: Persistent theme toggle
- **Responsive Design**: Sidebar navigation with mobile support

## Architecture
- Static site hosted on GitHub Pages / Cloudflare Pages
- GitHub Actions cron job fetches data hourly
- All data stored as JSON files
- Client-side JavaScript (single file, no modules)
