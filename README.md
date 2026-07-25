# Mahikshu 2.0

**Your crypto content intelligence dashboard — zero cost, maximum insight.**

## What's New in v2.0

- **7 Data Sources**: Binance, CoinGecko, DexScreener, News, DeFiLlama, Fear & Greed, Snapshot
- **Guest Mode**: No login required. All data saves to your browser.
- **Watchlist**: Star opportunities to track them
- **Saved Filters**: Create reusable filter presets
- **Export Reports**: CSV and Markdown downloads
- **AI Content Generator**: BYOK (Bring Your Own Key) with 6 LLM providers
- **Dark/Light Mode**: Toggle with one click
- **Responsive Sidebar**: Navigate by platform or view

## Deploy in 5 Minutes

1. Extract this zip and upload all files to a new GitHub repo
2. Enable GitHub Pages (Settings → Pages → Deploy from main branch)
3. Enable Actions permissions (Settings → Actions → General → Read and write)
4. Run the workflow once (Actions → Update Crypto Data → Run workflow)
5. Visit your site at `https://yourusername.github.io/mahikshu-v2`

## Data Sources

| Source | What It Tracks | Updates |
|--------|---------------|---------|
| Binance | Listings, delistings, monitoring tags | Hourly |
| CoinGecko | Trending coins | Hourly |
| DexScreener | New token pairs | Hourly |
| News | CoinTelegraph, CoinDesk, Decrypt | Hourly |
| DeFiLlama | High yields, TVL changes | Hourly |
| Fear & Greed | Market sentiment index | Hourly |
| Snapshot | DAO governance proposals | Hourly |

## AI Integration

Click **AI Setup** in the sidebar to configure:
- OpenAI (GPT-4o, GPT-4o-mini, GPT-3.5)
- Anthropic (Claude 3.5 Sonnet, Claude 3 Haiku)
- Google (Gemini Pro, Gemini Flash)
- Groq (Llama 3.1, Mixtral, Gemma)
- Hugging Face (Mistral, Llama 2)
- OpenRouter (aggregated access)

API keys are stored **only in sessionStorage** — never on our servers.

## Version
**v2.0.0** — See [CHANGELOG](docs/CHANGELOG.md)

## License
MIT — use it, fork it, build on it.
