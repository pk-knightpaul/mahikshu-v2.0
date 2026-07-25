#!/usr/bin/env python3
"""Fetch DeFiLlama yields and TVL changes."""
import requests
import json
import os
from datetime import datetime, timezone

YIELDS_URL = "https://yields.llama.fi/pools"
PROTOCOLS_URL = "https://api.llama.fi/protocols"
OUTPUT_FILE = "data/defillama.json"

def fetch_defillama():
    try:
        results = []
        now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

        # Fetch high yield opportunities
        try:
            resp = requests.get(YIELDS_URL, timeout=30)
            if resp.status_code == 200:
                data = resp.json().get("data", [])
                for pool in data[:20]:
                    apy = pool.get("apy", 0)
                    if apy > 5:  # Only high yields
                        results.append({
                            "id": f"defillama_yield_{pool.get('pool', '')}",
                            "title": f"🌾 High Yield: {pool.get('symbol', 'Unknown')} — {apy:.1f}% APY",
                            "platform": "defillama",
                            "content_type": "high_yield",
                            "url": f"https://defillama.com/yields",
                            "published_at": now,
                            "engagement": int(apy * 10),
                            "summary": f"{pool.get('project', 'Unknown')} on {pool.get('chain', 'Unknown')} offers {apy:.1f}% APY for {pool.get('symbol', 'Unknown')}.",
                            "tags": ["yield", pool.get('chain', '').lower(), pool.get('project', '').lower(), "defillama"],
                            "fetched_at": now
                        })
        except Exception as e:
            print(f"Error fetching yields: {e}")

        # Fetch top protocols by TVL change
        try:
            resp = requests.get(PROTOCOLS_URL, timeout=30)
            if resp.status_code == 200:
                protocols = resp.json()
                protocols.sort(key=lambda x: abs(x.get("change_1d", 0)), reverse=True)
                for proto in protocols[:10]:
                    change = proto.get("change_1d", 0)
                    if abs(change) > 5:
                        direction = "📈" if change > 0 else "📉"
                        results.append({
                            "id": f"defillama_tvl_{proto.get('slug', '')}",
                            "title": f"{direction} {proto.get('name', 'Unknown')} TVL: {change:+.1f}% (24h)",
                            "platform": "defillama",
                            "content_type": "tvl_change",
                            "url": f"https://defillama.com/protocol/{proto.get('slug', '')}",
                            "published_at": now,
                            "engagement": abs(int(change)),
                            "summary": f"{proto.get('name', 'Unknown')} TVL changed by {change:+.1f}% in 24h. Current TVL: ${proto.get('tvl', 0)/1e9:.2f}B",
                            "tags": ["tvl", proto.get("category", "").lower(), "defillama"],
                            "fetched_at": now
                        })
        except Exception as e:
            print(f"Error fetching protocols: {e}")

        return results
    except Exception as e:
        print(f"Error fetching DeFiLlama: {e}")
        return []

def main():
    data = fetch_defillama()
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(data)} DeFiLlama items to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
