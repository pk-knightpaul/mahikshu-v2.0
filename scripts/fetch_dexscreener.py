#!/usr/bin/env python3
"""Fetch DexScreener latest token profiles."""
import requests
import json
import os
from datetime import datetime, timezone

API_URL = "https://api.dexscreener.com/token-profiles/latest/v1"
OUTPUT_FILE = "data/dexscreener.json"

def fetch_dexscreener():
    try:
        response = requests.get(API_URL, timeout=30)
        response.raise_for_status()
        data = response.json()

        results = []
        now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

        for item in data:
            token_address = item.get("tokenAddress", "")
            chain_id = item.get("chainId", "")
            description = item.get("description", "")

            results.append({
                "id": f"dexscreener_{chain_id}_{token_address}",
                "title": f"🆕 New Pair: {token_address[:20]}... on {chain_id}",
                "platform": "dexscreener",
                "content_type": "new_pair",
                "url": f"https://dexscreener.com/{chain_id}/{token_address}",
                "published_at": now,
                "engagement": 0,
                "summary": description or f"New token pair discovered on {chain_id} via DexScreener.",
                "tags": ["new_pair", chain_id.lower(), "dexscreener"],
                "fetched_at": now
            })

        return results[:30]
    except Exception as e:
        print(f"Error fetching DexScreener: {e}")
        return []

def main():
    data = fetch_dexscreener()
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(data)} DexScreener items to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
