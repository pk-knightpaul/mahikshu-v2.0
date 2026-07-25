#!/usr/bin/env python3
"""
Fetch DeFi yields and TVL data from DeFiLlama API.
"""
import requests
import json
import os
from datetime import datetime, timezone

PROTOCOLS_URL = "https://api.llama.fi/protocols"
YIELDS_URL = "https://yields.llama.fi/pools"
OUTPUT_FILE = "data/defillama.json"

def fetch_defillama():
    results = []
    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    try:
        resp = requests.get(PROTOCOLS_URL, timeout=30)
        resp.raise_for_status()
        protocols = resp.json()

        top_protocols = sorted(protocols, key=lambda x: x.get("tvl", 0), reverse=True)[:20]

        for protocol in top_protocols:
            name = protocol.get("name", "")
            tvl = protocol.get("tvl", 0)
            change_1d = protocol.get("change_1d", 0)
            change_7d = protocol.get("change_7d", 0)
            chain = protocol.get("chain", "")

            direction = "📈" if change_1d and change_1d > 0 else "📉" if change_1d and change_1d < 0 else "➡️"

            results.append({
                "id": f"defillama_protocol_{name.lower().replace(' ', '_')}",
                "title": f"{direction} {name}: TVL ${tvl/1e9:.2f}B ({change_1d:+.2f}% 24h)",
                "platform": "defillama",
                "content_type": "tvl_change",
                "url": protocol.get("url", f"https://defillama.com/protocol/{name.lower().replace(' ', '-')}"),
                "published_at": now,
                "engagement": int(tvl / 1e6) if tvl else 0,
                "summary": f"{name} on {chain}. TVL: ${tvl:,.0f}. 24h: {change_1d:+.2f}%, 7d: {change_7d:+.2f}%",
                "tags": ["defi", "tvl", chain.lower(), name.lower().replace(" ", "_")],
                "fetched_at": now
            })
    except Exception as e:
        print(f"Error fetching DeFiLlama protocols: {e}")

    try:
        resp = requests.get(YIELDS_URL, timeout=30)
        resp.raise_for_status()
        pools = resp.json().get("data", [])[:15]

        for pool in pools:
            symbol = pool.get("symbol", "")
            project = pool.get("project", "")
            chain = pool.get("chain", "")
            apy = pool.get("apy", 0)
            tvl_usd = pool.get("tvlUsd", 0)

            if apy > 50:
                results.append({
                    "id": f"defillama_yield_{pool.get('pool', '')}",
                    "title": f"🌾 High Yield: {apy:.1f}% APY on {symbol} ({project})",
                    "platform": "defillama",
                    "content_type": "high_yield",
                    "url": f"https://yields.defillama.com/pool/{pool.get('pool', '')}",
                    "published_at": now,
                    "engagement": int(apy),
                    "summary": f"{project} on {chain} offers {apy:.1f}% APY for {symbol}. TVL: ${tvl_usd:,.0f}",
                    "tags": ["yield", "apy", chain.lower(), project.lower().replace(" ", "_"), symbol.lower()],
                    "fetched_at": now
                })
    except Exception as e:
        print(f"Error fetching DeFiLlama yields: {e}")

    return results

def main():
    data = fetch_defillama()
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(data)} DeFiLlama items to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
