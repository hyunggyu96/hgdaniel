import json
import random
import re
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Optional, Tuple

import html as html_lib
import requests


DATA_PATH = Path("web/src/data/financial_data.json")
TARGET_YEARS = ("2022", "2023", "2024", "2025")

SUMMARY_TEXT = "\uC694\uC57D\uC7AC\uBB34\uC815\uBCF4"  # 요약재무정보
SECOND_TABLE_TEXT = "\uB098. \uC694\uC57D \uC7AC\uBB34\uC81C\uD45C"  # 나. 요약 재무제표
UNIT_LABEL = "\uB2E8\uC704"  # 단위

REV_LABELS = {
    "\uB9E4\uCD9C\uC561",  # 매출액
    "\uC218\uC775(\uB9E4\uCD9C\uC561)",  # 수익(매출액)
    "\uC601\uC5C5\uC218\uC775",  # 영업수익
}
OP_LABELS = {
    "\uC601\uC5C5\uC774\uC775",  # 영업이익
    "\uC601\uC5C5\uC774\uC775(\uC190\uC2E4)",  # 영업이익(손실)
    "\uC601\uC5C5\uC190\uC775",  # 영업손익
}

UNIT_MULTIPLIERS = {
    "\uC6D0": 1,  # 원
    "\uCC9C\uC6D0": 1_000,  # 천원
    "\uBC31\uB9CC\uC6D0": 1_000_000,  # 백만원
    "\uC5B5\uC6D0": 100_000_000,  # 억원
}


@dataclass
class Source:
    report_year: int
    kind: str
    link: str
    title: str
    source_key: str


class DartReportParser:
    def __init__(self) -> None:
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/122.0.0.0 Safari/537.36"
                )
            }
        )
        self.main_cache: Dict[str, str] = {}
        self.summary_cache: Dict[str, Optional[str]] = {}

    def _fetch_text(self, url: str, retries: int = 5) -> str:
        last_err: Optional[Exception] = None
        for attempt in range(1, retries + 1):
            try:
                res = self.session.get(url, timeout=25)
                res.encoding = "utf-8"
                if res.status_code == 200:
                    return res.text
                last_err = RuntimeError(f"status={res.status_code}")
            except Exception as exc:  # noqa: BLE001
                last_err = exc
            time.sleep((0.3 * attempt) + random.uniform(0.1, 0.4))
        raise RuntimeError(f"Failed to fetch {url}: {last_err}")

    @staticmethod
    def _parse_rcp_no(link: str) -> Optional[str]:
        match = re.search(r"rcpNo=(\d+)", link or "")
        return match.group(1) if match else None

    @staticmethod
    def _clean_text(value: str) -> str:
        value = html_lib.unescape(re.sub(r"<[^>]+>", "", value))
        value = value.replace("\xa0", " ").strip()
        return re.sub(r"\s+", "", value)

    @staticmethod
    def _parse_number(value: str) -> Optional[float]:
        value = value.strip()
        if value in ("", "-"):
            return None
        negative = value.startswith("(") and value.endswith(")")
        value = value.strip("()").replace(",", "")
        if not re.fullmatch(r"-?\d+(\.\d+)?", value):
            return None
        num = float(value)
        return -num if negative else num

    @staticmethod
    def _extract_summary_node(main_html: str) -> Optional[Dict[str, str]]:
        lines = main_html.splitlines()
        for i, line in enumerate(lines):
            if "['id']" not in line or '"18"' not in line:
                continue
            if not any(
                SUMMARY_TEXT in lines[k]
                for k in range(max(0, i - 20), min(len(lines), i + 20))
            ):
                continue

            fields: Dict[str, str] = {}
            for j in range(max(0, i - 12), min(i + 28, len(lines))):
                match = re.search(
                    r"\['(rcpNo|dcmNo|eleId|offset|length|dtd)'\]\s*=\s*\"([^\"]+)\"",
                    lines[j],
                )
                if match:
                    fields[match.group(1)] = match.group(2)
            required = {"rcpNo", "dcmNo", "eleId", "offset", "length", "dtd"}
            if required.issubset(fields):
                return fields
        return None

    def _get_main_html(self, rcp_no: str) -> str:
        if rcp_no in self.main_cache:
            return self.main_cache[rcp_no]
        url = f"http://dart.fss.or.kr/dsaf001/main.do?rcpNo={rcp_no}"
        html_text = self._fetch_text(url)
        self.main_cache[rcp_no] = html_text
        time.sleep(random.uniform(0.1, 0.3))
        return html_text

    def _get_summary_html(self, rcp_no: str) -> Optional[str]:
        if rcp_no in self.summary_cache:
            return self.summary_cache[rcp_no]

        main_html = self._get_main_html(rcp_no)
        node = self._extract_summary_node(main_html)
        if not node:
            self.summary_cache[rcp_no] = None
            return None

        url = (
            f"http://dart.fss.or.kr/report/viewer.do?rcpNo={node['rcpNo']}"
            f"&dcmNo={node['dcmNo']}"
            f"&eleId={node['eleId']}"
            f"&offset={node['offset']}"
            f"&length={node['length']}"
            f"&dtd={node['dtd']}"
        )
        summary_html = self._fetch_text(url)
        self.summary_cache[rcp_no] = summary_html
        time.sleep(random.uniform(0.1, 0.3))
        return summary_html

    def parse_report(
        self,
        link: str,
        report_year: int,
        existing_reference: Dict[str, Tuple[Optional[int], Optional[int]]],
    ) -> Optional[Dict[str, Tuple[int, int]]]:
        rcp_no = self._parse_rcp_no(link)
        if not rcp_no:
            return None
        summary_html = self._get_summary_html(rcp_no)
        if not summary_html:
            return None

        split_idx = summary_html.find(SECOND_TABLE_TEXT)
        first_block = summary_html if split_idx < 0 else summary_html[:split_idx]

        unit_multiplier: Optional[int] = None
        unit_match = re.search(
            r"\(\s*" + UNIT_LABEL + r"\s*:\s*([^\)]+)\)",
            first_block,
        )
        if unit_match:
            raw_unit = self._clean_text(unit_match.group(1))
            unit_multiplier = UNIT_MULTIPLIERS.get(raw_unit)

        rows = re.findall(r"<TR[^>]*>(.*?)</TR>", first_block, flags=re.I | re.S)
        revenue_cells: Optional[list[Optional[float]]] = None
        op_cells: Optional[list[Optional[float]]] = None
        for row in rows:
            cells = [
                self._clean_text(c)
                for c in re.findall(r"<T[DH][^>]*>(.*?)</T[DH]>", row, flags=re.I | re.S)
            ]
            if len(cells) < 4:
                continue
            label = cells[0]
            values = [self._parse_number(v) for v in cells[1:4]]
            if label in REV_LABELS and revenue_cells is None:
                revenue_cells = values
            if label in OP_LABELS and op_cells is None:
                op_cells = values
            if revenue_cells and op_cells:
                break

        if not revenue_cells or not op_cells:
            return None

        multipliers = [1, 1_000, 1_000_000, 100_000_000]
        if unit_multiplier is None:
            unit_multiplier = 1_000_000

        best_score = float("inf")
        best_multiplier = unit_multiplier
        for candidate in multipliers:
            score = 0.0
            used = False
            for idx in range(min(3, len(revenue_cells), len(op_cells))):
                year = str(report_year - idx)
                ref_rev, ref_op = existing_reference.get(year, (None, None))
                cur_rev = revenue_cells[idx]
                cur_op = op_cells[idx]
                if ref_rev is None and ref_op is None:
                    continue
                if cur_rev is None and cur_op is None:
                    continue
                used = True
                if ref_rev is not None and cur_rev is not None:
                    score += abs(cur_rev * candidate - ref_rev) / max(abs(ref_rev), 1)
                if ref_op is not None and cur_op is not None:
                    score += abs(cur_op * candidate - ref_op) / max(abs(ref_op), 1)
            if used and score < best_score:
                best_score = score
                best_multiplier = candidate

        if best_score < float("inf"):
            unit_multiplier = best_multiplier

        parsed: Dict[str, Tuple[int, int]] = {}
        for idx in range(min(3, len(revenue_cells), len(op_cells))):
            rev = revenue_cells[idx]
            opv = op_cells[idx]
            if rev is None or opv is None:
                continue
            year = str(report_year - idx)
            parsed[year] = (
                int(round(rev * unit_multiplier)),
                int(round(opv * unit_multiplier)),
            )
        return parsed


def to_int(value: object) -> Optional[int]:
    if value in (None, "", "-", "N/A"):
        return None
    try:
        return int(float(str(value).replace(",", "")))
    except Exception:  # noqa: BLE001
        return None


def has_missing(entry: Dict[str, object]) -> bool:
    return to_int(entry.get("revenue")) is None or to_int(entry.get("operating_profit")) is None


def main() -> None:
    with DATA_PATH.open("r", encoding="utf-8") as f:
        data = json.load(f)

    parser = DartReportParser()
    total_fills = 0
    updated_companies = 0

    for company, company_data in data.items():
        history = company_data.get("financial_history")
        if not isinstance(history, dict):
            continue

        needed = {
            year for year in TARGET_YEARS if has_missing(history.get(year, {}) or {})
        }
        if not needed:
            continue

        existing_ref: Dict[str, Tuple[Optional[int], Optional[int]]] = {}
        for year in TARGET_YEARS:
            row = history.get(year, {}) or {}
            existing_ref[year] = (to_int(row.get("revenue")), to_int(row.get("operating_profit")))

        sources: list[Source] = []
        for y in ("2024", "2023", "2022", "2025"):
            row = history.get(y, {}) or {}
            annual = row.get("annual_report")
            if isinstance(annual, dict) and annual.get("link"):
                sources.append(
                    Source(
                        report_year=int(y),
                        kind="annual",
                        link=annual["link"],
                        title=annual.get("title", ""),
                        source_key=f"annual_{y}",
                    )
                )

        ytd_added = False
        for quarter, key in (("Q3", "ytd_q3"), ("Q2", "ytd_q2"), ("Q1", "ytd_q1")):
            qobj = (history.get("2025", {}) or {}).get(quarter)
            if isinstance(qobj, dict) and qobj.get("link"):
                sources.append(
                    Source(
                        report_year=2025,
                        kind=key,
                        link=qobj["link"],
                        title=qobj.get("title", ""),
                        source_key=f"2025_{quarter}",
                    )
                )
                ytd_added = True
                break
        if not ytd_added and "2025" in needed:
            pass

        company_fill_count = 0
        for source in sources:
            try:
                parsed = parser.parse_report(source.link, source.report_year, existing_ref)
            except Exception:  # noqa: BLE001
                continue
            if not parsed:
                continue

            for year in list(needed):
                if year not in parsed:
                    continue
                if year == "2025" and not source.kind.startswith("ytd") and source.kind != "annual":
                    continue
                if year in ("2022", "2023", "2024") and source.kind.startswith("ytd"):
                    continue

                rev, opv = parsed[year]
                year_row = history.setdefault(year, {})
                year_row["revenue"] = str(rev)
                year_row["operating_profit"] = str(opv)
                if year_row.get("rd_cost") in (None, "", "N/A"):
                    year_row["rd_cost"] = "-"

                if source.kind.startswith("ytd"):
                    year_row["data_type"] = source.kind
                elif not year_row.get("data_type"):
                    year_row["data_type"] = "annual"

                year_row["source_report"] = {
                    "link": source.link,
                    "title": source.title,
                }

                existing_ref[year] = (rev, opv)
                needed.remove(year)
                company_fill_count += 1
                total_fills += 1

            if not needed:
                break

        if company_fill_count > 0:
            updated_companies += 1

    with DATA_PATH.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
        f.write("\n")

    print(f"Updated companies: {updated_companies}")
    print(f"Filled year slots: {total_fills}")


if __name__ == "__main__":
    main()
