#!/usr/bin/env python3
"""Fetch Snapshot governance proposals."""
import requests
import json
import os
from datetime import datetime, timezone

SNAPSHOT_API = "https://hub.snapshot.org/graphql"
OUTPUT_FILE = "data/snapshot.json"

QUERY = """
query {
  proposals(
    first: 20
    skip: 0
    where: {state: "active"}
    orderBy: "created"
    orderDirection: desc
  ) {
    id
    title
    body
    choices
    start
    end
    snapshot
    state
    author
    space {
      id
      name
    }
  }
}
"""

def fetch_snapshot():
    try:
        response = requests.post(
            SNAPSHOT_API,
            json={"query": QUERY},
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        response.raise_for_status()
        data = response.json()

        results = []
        now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

        for prop in data.get("data", {}).get("proposals", []):
            space_name = prop.get("space", {}).get("name", "Unknown")
            space_id = prop.get("space", {}).get("id", "")
            title = prop.get("title", "")
            state = prop.get("state", "")

            results.append({
                "id": f"snapshot_{prop.get('id', '')}",
                "title": f"🏛️ [{space_name}] {title}",
                "platform": "snapshot",
                "content_type": "governance",
                "url": f"https://snapshot.org/#/{space_id}/proposal/{prop.get('id', '')}",
                "published_at": datetime.fromtimestamp(prop.get("start", 0), tz=timezone.utc).isoformat().replace("+00:00", "Z") if prop.get("start") else now,
                "engagement": len(prop.get("choices", [])),
                "summary": (prop.get("body", "")[:150] + "...") if len(prop.get("body", "")) > 150 else prop.get("body", "Vote now on this governance proposal."),
                "tags": ["governance", space_id.lower(), "snapshot", state],
                "fetched_at": now
            })

        return results
    except Exception as e:
        print(f"Error fetching Snapshot: {e}")
        return []

def main():
    data = fetch_snapshot()
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(data)} Snapshot items to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
