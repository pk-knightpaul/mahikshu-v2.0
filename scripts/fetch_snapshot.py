#!/usr/bin/env python3
"""
Fetch active governance proposals from Snapshot API (GraphQL).
"""
import requests
import json
import os
from datetime import datetime, timezone

GRAPHQL_URL = "https://hub.snapshot.org/graphql"
OUTPUT_FILE = "data/snapshot.json"

QUERY = """
query {
  proposals(
    first: 20,
    skip: 0,
    where: { state_in: ["active"] },
    orderBy: "created",
    orderDirection: desc
  ) {
    id
    title
    body
    choices
    start
    end
    state
    author
    space { id name }
    scores_total
    scores
  }
}
"""

def fetch_snapshot():
    results = []
    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    try:
        resp = requests.post(
            GRAPHQL_URL,
            json={"query": QUERY},
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        resp.raise_for_status()
        data = resp.json()

        for proposal in data.get("data", {}).get("proposals", []):
            space_name = proposal.get("space", {}).get("name", "Unknown DAO")
            title = proposal.get("title", "")
            end_time = proposal.get("end", 0)
            scores_total = proposal.get("scores_total", 0)

            try:
                end_dt = datetime.fromtimestamp(end_time, tz=timezone.utc)
                end_iso = end_dt.isoformat().replace("+00:00", "Z")
                hours_left = int((end_dt - datetime.now(timezone.utc)).total_seconds() / 3600)
                urgency = "🔴" if hours_left < 24 else "🟡" if hours_left < 72 else "🟢"
            except:
                end_iso = now
                hours_left = 0
                urgency = "🟢"

            results.append({
                "id": f"snapshot_{proposal.get('id', '')}",
                "title": f"{urgency} Vote: {title} ({space_name})",
                "platform": "snapshot",
                "content_type": "governance",
                "url": f"https://snapshot.org/#/{proposal.get('space', {}).get('id', '')}/proposal/{proposal.get('id', '')}",
                "published_at": now,
                "engagement": int(scores_total),
                "summary": f"Active governance vote on {space_name}. {hours_left}h remaining. Total voting power: {scores_total:,.0f}",
                "tags": ["governance", "dao", "vote", space_name.lower().replace(" ", "_")],
                "fetched_at": now
            })
    except Exception as e:
        print(f"Error fetching Snapshot: {e}")

    return results

def main():
    data = fetch_snapshot()
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(data)} Snapshot items to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
