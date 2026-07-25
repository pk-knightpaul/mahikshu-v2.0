#!/usr/bin/env python3
"""
Fetch large crypto transactions from Whale Alert API.
Requires API key for full access (free tier: 100 requests/day).
"""
import requests
import json
import os
from datetime import datetime, timezone

API_KEY = os.environ.get("WHALE_ALERT_API_KEY", "")
API_URL = "https://api.whale-alert.io/v1/transactions"
OUTPUT_FILE = "data/whale_alert.json"

def fetch_whale_alert():
    results = []
    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    if not API_KEY:
        print("WHALE_ALERT_API_KEY not set. Skipping Whale Alert fetch.")
        return []

    try:
        params = {
            "api_key": API_KEY,
            "min_value": 500000,
            "limit": 20,
            "currency": "btc,eth,usdt,usdc"
        }
        resp = requests.get(API_URL, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()

        for tx in data.get("transactions", []):
            symbol = tx.get("symbol", "").upper()
            amount = tx.get("amount", 0)
            amount_usd = tx.get("amount_usd", 0)
            from_owner = tx.get("from_owner", "Unknown")
            to_owner = tx.get("to_owner", "Unknown")
            tx_type = tx.get("transaction_type", "transfer")

            direction = "🟢 Inflow" if tx_type == "transfer" and to_owner in ["Binance", "Coinbase", "Kraken"] else "🔴 Outflow" if from_owner in ["Binance", "Coinbase", "Kraken"] else "🔄 Transfer"

            results.append({
                "id": f"whale_{tx.get('id', '')}",
                "title": f"{direction}: {amount:,.2f} {symbol} (${amount_usd:,.0f})",
                "platform": "whale_alert",
                "content_type": "whale_movement",
                "url": f"https://whale-alert.io/transaction/{tx.get('blockchain', '')}/{tx.get('hash', '')}",
                "published_at": datetime.fromtimestamp(tx.get("timestamp", 0), tz=timezone.utc).isoformat().replace("+00:00", "Z") if tx.get("timestamp") else now,
                "engagement": int(amount_usd / 1000) if amount_usd else 0,
                "summary": f"{from_owner} → {to_owner} | {amount:,.2f} {symbol} (${amount_usd:,.0f})",
                "tags": ["whale", symbol.lower(), tx_type, from_owner.lower().replace(" ", "_"), to_owner.lower().replace(" ", "_")],
                "fetched_at": now
            })
    except Exception as e:
        print(f"Error fetching Whale Alert: {e}")

    return results

def main():
    data = fetch_whale_alert()
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(data)} Whale Alert items to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
