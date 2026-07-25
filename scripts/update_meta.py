#!/usr/bin/env python3
"""
Update meta.json with version, last_updated timestamp, and platform status.
"""
import json
import os
from datetime import datetime, timezone

DATA_DIR = "data"
OUTPUT_FILE = "data/meta.json"
VERSION = "2.0.0"

def update_meta():
    platforms = [
        "binance", "coingecko", "dexscreener", "news",
        "cryptopanic", "whale_alert", "defillama",
        "fear_greed", "snapshot"
    ]
    status = {}
    total_opportunities = 0

    for platform in platforms:
        filepath = os.path.join(DATA_DIR, f"{platform}.json")
        if os.path.exists(filepath):
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    data = json.load(f)
                if isinstance(data, list):
                    status[platform] = "ok"
                    total_opportunities += len(data)
                else:
                    status[platform] = "error"
            except:
                status[platform] = "error"
        else:
            status[platform] = "missing"

    meta = {
        "version": VERSION,
        "last_updated": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "platforms_status": status,
        "total_opportunities": total_opportunities,
        "active_users_today": 0
    }

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)

    print(f"Updated meta.json: v{VERSION} | {meta['last_updated']} | {total_opportunities} opportunities")

if __name__ == "__main__":
    update_meta()
