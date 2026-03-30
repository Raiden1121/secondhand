"""
scraper.py - Scrape the Taiwan EPA Carbon Footprint Coefficient Database.

Website: https://cfp.moenv.gov.tw/WebPage/WebSites/CoefficientDB.aspx
Uses ASP.NET PostBack for navigation; Playwright handles browser interactions.

Optimized approach:
  1. Navigate once, expand all, collect all links from DOM
  2. For each link: fire __doPostBack directly (stays on same page / session)
     then scrape the resulting table, then fire __doPostBack again for the
     "back" action to return to list view — WITHOUT re-navigating/re-expanding.

Usage:
    python3 scraper.py
"""

import re
import time
import sys
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
from bs4 import BeautifulSoup
import db

URL = "https://cfp.moenv.gov.tw/WebPage/WebSites/CoefficientDB.aspx"

# ─────────────────────────── helpers ───────────────────────────────────────

def parse_value(raw: str):
    """
    Given a string like '5.313E-01 kgCO₂e', return (raw_string, numeric_float).
    """
    raw = raw.strip()
    m = re.match(r"([+-]?\d+\.?\d*[Ee][+-]?\d+|[+-]?\d*\.?\d+)", raw)
    value_numeric = float(m.group(1)) if m else None
    return raw, value_numeric


def extract_links_from_dom(html: str) -> list[dict]:
    """
    Parse the fully-expanded page and return all coefficient category links.
    Returns: [{cc_id, name, title, element_id, level1, level2, postback_target}]
    """
    soup = BeautifulSoup(html, "html.parser")
    links = []
    seen_cc_ids = set()

    all_card_bodies = soup.find_all("div", class_="card-body")

    for card_body in all_card_bodies:
        a_tags = card_body.find_all("a", attrs={"cc_id": True})
        if not a_tags:
            continue

        level2 = ""
        level1 = ""

        card = card_body.find_parent("div", class_="card")
        if card:
            header = card.find("div", class_="card-header")
            if header:
                level2 = header.get_text(strip=True)

            list_item = card.find_parent("div", class_="list-group-item")
            if list_item:
                btn = list_item.find(["button", "h5", "h6", "span"])
                if btn:
                    level1 = btn.get_text(strip=True)

        for a in a_tags:
            cc_id = int(a.get("cc_id", -1))
            if cc_id in seen_cc_ids:
                continue
            seen_cc_ids.add(cc_id)

            name = a.get_text(strip=True)
            title = a.get("title", name)
            elem_id = a.get("id", "")
            href = a.get("href", "")
            m = re.search(r"__doPostBack\('([^']+)'", href)
            postback_target = m.group(1) if m else ""

            links.append({
                "cc_id": cc_id,
                "name": name,
                "title": title,
                "element_id": elem_id,
                "level1": level1,
                "level2": level2,
                "postback_target": postback_target,
            })

    return links


def parse_table(html: str) -> list[dict]:
    """
    Parse the GridView table shown after clicking a coefficient category link.
    Column order: 碳係數名稱 | 生產區域名稱 | 數值 | 功能單位 | 公告年份
    """
    soup = BeautifulSoup(html, "html.parser")
    rows = []

    table = soup.find("table", class_=lambda c: c and "table" in c)
    if not table:
        return rows

    tbody = table.find("tbody") or table

    for tr in tbody.find_all("tr"):
        cells = tr.find_all(["td", "th"])
        if not cells or len(cells) < 4:
            continue

        name = cells[0].get_text(strip=True)
        production_area = cells[1].get_text(strip=True) if len(cells) > 1 else ""
        value_raw = cells[2].get_text(strip=True) if len(cells) > 2 else ""
        unit = cells[3].get_text(strip=True) if len(cells) > 3 else ""
        year_str = cells[4].get_text(strip=True) if len(cells) > 4 else ""

        # Skip header rows
        if name in ("碳係數名稱", "") or production_area == "生產區域名稱":
            continue

        value, value_numeric = parse_value(value_raw)

        year = None
        if year_str.isdigit():
            year = int(year_str)

        rows.append({
            "name": name,
            "production_area": production_area,
            "value": value,
            "value_numeric": value_numeric,
            "unit": unit,
            "announcement_year": year,
        })

    return rows


def is_on_list_view(page) -> bool:
    """Return True if we are currently on the category list (not a data table view)."""
    return page.query_selector("#collapse1open") is not None


def go_to_list_view(page):
    """Navigate back to the list view if currently on a data table view."""
    if is_on_list_view(page):
        return
    # Try clicking the "回上一頁" button
    try:
        back = page.query_selector("input[value='回上一頁'], a:text('回上一頁'), button:text('回上一頁')")
        if back:
            back.click()
            page.wait_for_selector("#collapse1open", timeout=10_000)
            return
    except Exception:
        pass
    # Fallback: full re-navigate
    page.goto(URL, wait_until="networkidle")


def ensure_expanded(page):
    """Make sure all card-body links are expanded. Click the expand button if needed."""
    if not page.query_selector(".card-body a[cc_id]"):
        page.click("#collapse1open")
        page.wait_for_selector(".card-body a[cc_id]", timeout=15_000)
        time.sleep(0.5)


# ──────────────────────────── main scraper ──────────────────────────────────

def scrape():
    db.init_db()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            )
        )
        page = context.new_page()
        page.set_default_timeout(30_000)

        print(f"[*] Navigating to {URL}")
        page.goto(URL, wait_until="networkidle")

        # ── Step 1: Click "全部展開" ──────────────────────────────────────────
        print("[*] Clicking 全部展開 (expand all)...")
        page.click("#collapse1open")
        page.wait_for_selector(".card-body a[cc_id]", timeout=15_000)
        time.sleep(0.8)

        # ── Step 2: Collect all links ─────────────────────────────────────────
        print("[*] Parsing expanded tree for links...")
        html = page.content()
        links = extract_links_from_dom(html)
        print(f"[*] Found {len(links)} category links")

        if not links:
            print("[!] No links found — aborting.")
            browser.close()
            return

        # Save all categories to DB up front
        for lnk in links:
            db.upsert_category(
                cc_id=lnk["cc_id"],
                name=lnk["name"],
                level1=lnk["level1"],
                level2=lnk["level2"],
            )
        print(f"[*] Saved {len(links)} categories to DB")

        # ── Step 3: Iterate each link ─────────────────────────────────────────
        total = len(links)
        success = 0
        skipped = 0
        failed = 0

        for i, lnk in enumerate(links, start=1):
            cc_id = lnk["cc_id"]
            name = lnk["name"]
            elem_id = lnk["element_id"]
            postback_target = lnk["postback_target"]

            # Resume: skip already-scraped categories
            if db.category_already_scraped(cc_id):
                print(f"  [{i}/{total}] SKIP (already scraped): {name} (cc_id={cc_id})")
                skipped += 1
                continue

            print(f"  [{i}/{total}] {name} (cc_id={cc_id})", end="", flush=True)

            try:
                # Fire PostBack directly — stays in same ASP.NET session
                if postback_target:
                    page.evaluate(f"__doPostBack('{postback_target}', '')")
                elif elem_id:
                    page.evaluate(f"document.getElementById('{elem_id}').click()")
                else:
                    print(" [SKIP - no reference]")
                    skipped += 1
                    continue

                # Wait for the data table (or any response)
                try:
                    page.wait_for_selector("table.table", timeout=3_000)
                except PlaywrightTimeout:
                    print(" [no table - 0 rows]")
                    db.insert_coefficients(cc_id, [])
                    success += 1
                    # Return to list view
                    go_to_list_view(page)
                    ensure_expanded(page)
                    continue

                time.sleep(0.2)

                # Parse table
                html = page.content()
                rows = parse_table(html)
                db.insert_coefficients(cc_id, rows)
                print(f" → {len(rows)} rows")
                success += 1

                # ── Return to list view (fast: click 回上一頁) ─────────────────
                try:
                    # The back button is typically an input or anchor
                    back = page.query_selector(
                        "input[value='回上一頁'], "
                        "a:text('回上一頁'), "
                        "button:text('回上一頁')"
                    )
                    if back:
                        back.click()
                        page.wait_for_selector("#collapse1open", timeout=10_000)
                        # Re-expand if necessary
                        ensure_expanded(page)
                    else:
                        # Fallback: navigate back in history
                        page.go_back(wait_until="networkidle")
                        ensure_expanded(page)
                except Exception as e:
                    print(f"    [warn] back failed: {e}; re-navigating...")
                    page.goto(URL, wait_until="networkidle")
                    page.click("#collapse1open")
                    page.wait_for_selector(".card-body a[cc_id]", timeout=15_000)
                    time.sleep(0.5)

            except Exception as e:
                print(f" [ERROR: {e}]")
                failed += 1
                # Recovery
                try:
                    page.goto(URL, wait_until="networkidle")
                    page.click("#collapse1open")
                    page.wait_for_selector(".card-body a[cc_id]", timeout=15_000)
                    time.sleep(0.5)
                except Exception:
                    pass

        browser.close()

    print("\n" + "─" * 50)
    print(f"[Done] Success: {success}  Skipped: {skipped}  Failed: {failed}")
    print(f"[Done] Database: {db.DB_PATH}")

    # Summary query
    import sqlite3
    conn = sqlite3.connect(db.DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM categories")
    cats = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM coefficients")
    coefs = cur.fetchone()[0]
    conn.close()
    print(f"[Done] DB totals → categories: {cats}, coefficients: {coefs}")


if __name__ == "__main__":
    scrape()
