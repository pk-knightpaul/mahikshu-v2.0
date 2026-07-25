#!/usr/bin/env python3
"""
Fetch trending coins, top movers, and new listings from CoinGecko API.
"""
import requests
import json
import os
from datetime import datetime, timezone

TRENDING_URL = "https://api.coingecko.com/api/v3/search/trending"
COINS_URL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h,7d"
NEW_COINS_URL = "https://api.coingecko.com/api/v3/coins/list?include_platform=false"
OUTPUT_FILE = "data/coingecko.json"

def fetch_coingecko():
    results = []
    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    try:
        resp = requests.get(TRENDING_URL, timeout=30)
        resp.raise_for_status()
        trending = resp.json().get("coins", [])

        for item in trending:
            coin = item.get("item", {})
            coin_id = coin.get("id", "")
            name = coin.get("name", "")
            symbol = coin.get("symbol", "")
            market_cap_rank = coin.get("market_cap_rank", 0)

            results.append({
                "id": f"coingecko_trending_{coin_id}",
                "title": f"🔥 Trending: {name} ({symbol.upper()})",
                "platform": "coingecko",
                "content_type": "trending",
                "url": f"https://www.coingecko.com/en/coins/{coin_id}",
                "published_at": now,
                "engagement": market_cap_rank if market_cap_rank else 0,
                "summary": f"{name} is trending on CoinGecko. Market cap rank: #{market_cap_rank if market_cap_rank else 'N/A'}",
                "tags": ["trending", symbol.lower(), "coingecko"],
                "fetched_at": now
            })
    except Exception as e:
        print(f"Error fetching CoinGecko trending: {e}")

    try:
        resp = requests.get(COINS_URL, timeout=30)
        resp.raise_for_status()
        coins = resp.json()

        movers = sorted(coins, key=lambda x: abs(x.get("price_change_percentage_24h_in_currency", 0) or 0), reverse=True)[:15]

        for coin in movers:
            coin_id = coin.get("id", "")
            name = coin.get("name", "")
            symbol = coin.get("symbol", "")
            change = coin.get("price_change_percentage_24h_in_currency", 0) or 0
            change_7d = coin.get("price_change_percentage_7d_in_currency", 0) or 0

            direction = "📈" if change > 0 else "📉"

            results.append({
                "id": f"coingecko_mover_{coin_id}",
                "title": f"{direction} {name} ({symbol.upper()}): {change:+.2f}% in 24h",
                "platform": "coingecko",
                "content_type": "mover",
                "url": f"https://www.coingecko.com/en/coins/{coin_id}",
                "published_at": now,
                "engagement": abs(int(change)),
                "summary": f"{name} moved {change:+.2f}% (24h) and {change_7d:+.2f}% (7d). Price: ${coin.get('current_price', 'N/A')}",
                "tags": ["mover", symbol.lower(), "24h-change", "coingecko"],
                "fetched_at": now
            })
    except Exception as e:
        print(f"Error fetching CoinGecko markets: {e}")

    return results

def main():
    data = fetch_coingecko()
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(data)} CoinGecko items to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
