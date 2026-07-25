#!/usr/bin/env python3
"""Fetch CoinGecko trending coins and top movers."""
import requests
import json
import os
from datetime import datetime, timezone

TRENDING_URL = "https://api.coingecko.com/api/v3/search/trending"
OUTPUT_FILE = "data/coingecko.json"

def fetch_coingecko():
    try:
        response = requests.get(TRENDING_URL, timeout=30)
        response.raise_for_status()
        data = response.json()

        results = []
        now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

        for idx, coin in enumerate(data.get("coins", [])[:20]):
            item = coin.get("item", {})
            name = item.get("name", "")
            symbol = item.get("symbol", "")
            coin_id = item.get("id", "")
            market_cap_rank = item.get("market_cap_rank", 0)

            results.append({
                "id": f"coingecko_trending_{coin_id}",
                "title": f"🔥 Trending: {name} ({symbol.upper()})",
                "platform": "coingecko",
                "content_type": "trending",
                "url": f"https://www.coingecko.com/en/coins/{coin_id}",
                "published_at": now,
                "engagement": market_cap_rank or (20 - idx),
                "summary": f"{name} is currently trending on CoinGecko. Market cap rank: #{market_cap_rank}" if market_cap_rank else f"{name} is trending on CoinGecko.",
                "tags": ["trending", symbol.lower(), "coingecko"],
                "fetched_at": now
            })

        return results
    except Exception as e:
        print(f"Error fetching CoinGecko: {e}")
        return []

def main():
    data = fetch_coingecko()
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(data)} CoinGecko items to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
