import json
import re
import time
from pathlib import Path
from typing import Dict, Optional

import requests
from bs4 import BeautifulSoup


DATA_PATH = Path("web/src/data/financial_data.json")
TARGET_YEARS = ("2022", "2023", "2024", "2025")


def parse_number_to_won(value_text: str) -> Optional[str]:
    text = value_text.strip().replace(",", "")
    if not text or text in {"-", "N/A", "적자지속", "흑자전환"}:
        return None
    try:
        # Naver finance annual table uses units of 100 million KRW (억원).
        value_eok = float(text)
    except ValueError:
        return None
    value_won = int(round(value_eok * 100_000_000))
    return str(value_won)


def is_missing(row: Dict[str, object]) -> bool:
    revenue = str(row.get("revenue", "") or "")
    op = str(row.get("operating_profit", "") or "")
    return revenue in {"", "-", "N/A"} or op in {"", "-", "N/A"}


def extract_annual_map(html_text: str) -> Dict[str, Dict[str, object]]:
    soup = BeautifulSoup(html_text, "html.parser")
    table = soup.select_one("div.section.cop_analysis table.tb_type1_ifrs")
    if table is None:
        return {}

    header_rows = table.select("thead tr")
    if len(header_rows) < 2:
        return {}

    year_headers = header_rows[1].find_all("th")
    if len(year_headers) < 4:
        return {}

    annual_cols = []
    for idx, th in enumerate(year_headers[:4]):
        raw = th.get_text(" ", strip=True).replace(" ", "")
        match = re.search(r"(20\d{2})\.\d{2}", raw)
        if not match:
            continue
        annual_cols.append(
            {
                "col_idx": idx,
                "year": match.group(1),
                "estimated": "(E)" in raw or "E" in raw,
            }
        )

    rows = table.select("tbody tr")
    revenue_cells = None
    op_cells = None
    for tr in rows:
        th = tr.find("th")
        if th is None:
            continue
        label = th.get_text("", strip=True)
        tds = tr.find_all("td")
        if label == "매출액":
            revenue_cells = tds
        elif label == "영업이익":
            op_cells = tds
        if revenue_cells is not None and op_cells is not None:
            break

    if revenue_cells is None or op_cells is None:
        return {}

    result: Dict[str, Dict[str, object]] = {}
    for col in annual_cols:
        idx = col["col_idx"]
        if idx >= len(revenue_cells) or idx >= len(op_cells):
            continue
        revenue = parse_number_to_won(revenue_cells[idx].get_text(" ", strip=True))
        op_profit = parse_number_to_won(op_cells[idx].get_text(" ", strip=True))
        if revenue is None or op_profit is None:
            continue
        result[col["year"]] = {
            "revenue": revenue,
            "operating_profit": op_profit,
            "estimated": bool(col["estimated"]),
        }
    return result


def main() -> None:
    with DATA_PATH.open("r", encoding="utf-8") as f:
        data = json.load(f)

    session = requests.Session()
    session.headers.update(
        {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            )
        }
    )

    updated_companies = 0
    updated_slots = 0

    for company_name, company_data in data.items():
        financial_history = company_data.get("financial_history")
        if not isinstance(financial_history, dict):
            continue

        stock_code = str(company_data.get("stock_code", "") or "")
        if not re.fullmatch(r"\d{6}", stock_code):
            continue
        if stock_code == "000000":
            continue

        needed_years = [
            y for y in TARGET_YEARS if is_missing(financial_history.get(y, {}) or {})
        ]
        if not needed_years:
            continue

        url = f"https://finance.naver.com/item/main.naver?code={stock_code}"
        try:
            response = session.get(url, timeout=20)
        except Exception:
            continue
        if response.status_code != 200:
            continue

        annual_map = extract_annual_map(response.text)
        if not annual_map:
            continue

        company_changed = False
        for year in needed_years:
            if year not in annual_map:
                continue
            source = annual_map[year]
            row = financial_history.setdefault(year, {})
            row["revenue"] = source["revenue"]
            row["operating_profit"] = source["operating_profit"]
            if row.get("rd_cost") in {None, "", "N/A"}:
                row["rd_cost"] = "-"
            row["data_type"] = "estimated_naver" if source["estimated"] else "annual_naver"
            row["source_report"] = {
                "title": "네이버증권 기업실적분석",
                "link": url,
            }
            updated_slots += 1
            company_changed = True

        if company_changed:
            updated_companies += 1

        time.sleep(0.15)

    with DATA_PATH.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
        f.write("\n")

    print(f"updated_companies={updated_companies}")
    print(f"updated_slots={updated_slots}")


if __name__ == "__main__":
    main()
