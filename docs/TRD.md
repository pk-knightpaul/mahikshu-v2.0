# Mahikshu 2.0 — Technical Requirements Document (TRD)

## Stack
- **Frontend**: Vanilla HTML/CSS/JS (single file)
- **Hosting**: GitHub Pages (free)
- **CI/CD**: GitHub Actions (free, 2,000 min/month)
- **Data Storage**: JSON files in repo
- **APIs**: Free tier only

## File Structure
```
mahikshu-v2/
├── index.html
├── css/
│   ├── variables.css
│   └── styles.css
├── js/
│   └── app.js
├── assets/
│   └── logo.svg
├── data/
│   ├── binance.json
│   ├── coingecko.json
│   ├── dexscreener.json
│   ├── news.json
│   ├── defillama.json
│   ├── fear_greed.json
│   ├── snapshot.json
│   └── meta.json
├── scripts/
│   ├── fetch_*.py
│   ├── update_meta.py
│   └── requirements.txt
└── .github/workflows/
    └── update-data.yml
```

## APIs Used
| Source | Endpoint | Free Limit |
|--------|----------|------------|
| Binance | bapi/composite/v1 | Unlimited |
| CoinGecko | api/v3/search/trending | 10-30/min |
| DexScreener | api.dexscreener.com | Unlimited |
| News | RSS feeds | Unlimited |
| DeFiLlama | api.llama.fi | Unlimited |
| Fear & Greed | api.alternative.me | Unlimited |
| Snapshot | hub.snapshot.org/graphql | Unlimited |
