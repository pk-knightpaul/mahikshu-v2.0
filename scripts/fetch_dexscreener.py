#!/usr/bin/env python3
"""
Fetch trending pairs and token profiles from DexScreener API.
"""
import requests
import json
import os
from datetime import datetime, timezone

TOKEN_PROFILES_URL = "https://api.dexscreener.com/token-profiles/latest/v1"
TOP_PAIRS_URL = "https://api.dexscreener.com/latest/dex/search?q=solana"
OUTPUT_FILE = "data/dexscreener.json"

def fetch_dexscreener():
    results = []
    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    try:
        resp = requests.get(TOKEN_PROFILES_URL, timeout=30)
        resp.raise_for_status()
        profiles = resp.json()

        for profile in profiles[:30]:
            token_address = profile.get("tokenAddress", "")
            chain_id = profile.get("chainId", "")
            description = profile.get("description", "")
            url = profile.get("url", "")

            token_name = description[:50] if description else f"Token on {chain_id}"

            results.append({
                "id": f"dexscreener_{chain_id}_{token_address[:16]}",
                "title": f"🆕 New: {token_name} on {chain_id.upper()}",
                "platform": "dexscreener",
                "content_type": "new_pair",
                "url": url or f"https://dexscreener.com/{chain_id}/{token_address}",
                "published_at": now,
                "engagement": 0,
                "summary": f"New token profile on DexScreener for {chain_id.upper()}. {description[:120] if description else ''}",
                "tags": ["new-pair", chain_id.lower(), "dexscreener"],
                "fetched_at": now
            })
    except Exception as e:
        print(f"Error fetching DexScreener profiles: {e}")

    return results

def main():
    data = fetch_dexscreener()
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(data)} DexScreener items to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
