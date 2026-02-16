import calendar
import os
import time
from typing import Dict, List, Optional, Tuple
from urllib.error import HTTPError

from Bio import Entrez
from dotenv import load_dotenv
from supabase import Client, create_client

# Load environment variables
load_dotenv("web/.env.local")
load_dotenv("backend/.env")

# Configuration
PUBMED_API_KEY = os.getenv("PUBMED_API_KEY", "")
PUBMED_EMAIL = os.getenv("PUBMED_EMAIL", "")
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

TARGET_QUERY = "polycaprolactone"
TARGET_LABEL = "Polycaprolactone(PCL)"

# PubMed limit:
# - with API key: <= 10 req/sec
# - without API key: <= 3 req/sec
REQUEST_INTERVAL = 0.125 if PUBMED_API_KEY else 0.34
MAX_RETRIES = 5

# User requirement: split search results by 9,900
ESEARCH_BATCH_SIZE = 9900
EFETCH_CHUNK_SIZE = 200

Entrez.email = PUBMED_EMAIL
Entrez.api_key = PUBMED_API_KEY
Entrez.tool = "AestheticIntelligence_PCLCollector"


def safe_api_call(func, retries: int = MAX_RETRIES, **kwargs):
    """Call Entrez API with throttling and retry/backoff."""
    for attempt in range(retries):
        handle = None
        try:
            time.sleep(REQUEST_INTERVAL)
            handle = func(**kwargs)
            result = Entrez.read(handle)
            return result
        except HTTPError as e:
            if e.code in (429, 500, 502, 503, 504):
                wait = REQUEST_INTERVAL * (2 ** (attempt + 1))
                print(
                    f"  HTTP {e.code} for {func.__name__}. "
                    f"Waiting {wait:.2f}s ({attempt + 1}/{retries})"
                )
                time.sleep(wait)
            else:
                print(f"  HTTP error on {func.__name__}: {e}")
                return None
        except Exception as e:
            wait = REQUEST_INTERVAL * (2 ** (attempt + 1))
            print(
                f"  Error on {func.__name__}: {e}. "
                f"Waiting {wait:.2f}s ({attempt + 1}/{retries})"
            )
            time.sleep(wait)
        finally:
            if handle is not None:
                try:
                    handle.close()
                except Exception:
                    pass
    print(f"  Failed {func.__name__} after {retries} retries.")
    return None


def init_supabase() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Supabase URL or key is missing.")
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def count_ids(term: str, mindate: Optional[str] = None, maxdate: Optional[str] = None) -> int:
    kwargs: Dict[str, str] = {
        "db": "pubmed",
        "term": term,
        "retmax": "0",
    }
    if mindate and maxdate:
        kwargs["mindate"] = mindate
        kwargs["maxdate"] = maxdate
        kwargs["datetype"] = "pdat"
    result = safe_api_call(Entrez.esearch, **kwargs)
    if not result:
        return 0
    try:
        return int(result.get("Count", 0))
    except Exception:
        return 0


def fetch_ids_for_window(
    term: str, label: str, mindate: Optional[str] = None, maxdate: Optional[str] = None
) -> List[str]:
    kwargs: Dict[str, str] = {
        "db": "pubmed",
        "term": term,
        "retmax": str(ESEARCH_BATCH_SIZE),
        "sort": "date",
    }
    if mindate and maxdate:
        kwargs["mindate"] = mindate
        kwargs["maxdate"] = maxdate
        kwargs["datetype"] = "pdat"

    result = safe_api_call(Entrez.esearch, **kwargs)
    if not result:
        return []

    ids = result.get("IdList", [])
    count = int(result.get("Count", 0))
    if count > ESEARCH_BATCH_SIZE:
        print(
            f"  Warning: {label} has {count} results; fetched only first {len(ids)}. "
            "Consider further splitting."
        )
    else:
        print(f"  {label}: fetched {len(ids)} IDs.")
    return ids


def fetch_all_pubmed_ids(term: str) -> List[str]:
    total_count = count_ids(term)
    print(f"Total count on PubMed for '{term}': {total_count}")
    if total_count == 0:
        return []

    all_ids: List[str] = []
    current_year = time.gmtime().tm_year + 1
    start_year = 1900

    for year in range(current_year, start_year - 1, -1):
        year_start = f"{year}/01/01"
        year_end = f"{year}/12/31"
        year_count = count_ids(term, year_start, year_end)

        if year_count == 0:
            continue

        print(f"Year {year}: {year_count} records.")
        if year_count <= ESEARCH_BATCH_SIZE:
            all_ids.extend(
                fetch_ids_for_window(term, f"Year {year}", year_start, year_end)
            )
            continue

        for month in range(12, 0, -1):
            days_in_month = calendar.monthrange(year, month)[1]
            month_start = f"{year}/{month:02d}/01"
            month_end = f"{year}/{month:02d}/{days_in_month:02d}"
            month_count = count_ids(term, month_start, month_end)

            if month_count == 0:
                continue

            if month_count <= ESEARCH_BATCH_SIZE:
                all_ids.extend(
                    fetch_ids_for_window(
                        term,
                        f"{year}-{month:02d}",
                        month_start,
                        month_end,
                    )
                )
                continue

            print(
                f"  Month {year}-{month:02d} has {month_count} records. "
                "Splitting by day."
            )
            for day in range(days_in_month, 0, -1):
                day_str = f"{year}/{month:02d}/{day:02d}"
                day_count = count_ids(term, day_str, day_str)
                if day_count == 0:
                    continue
                all_ids.extend(
                    fetch_ids_for_window(
                        term,
                        f"{year}-{month:02d}-{day:02d}",
                        day_str,
                        day_str,
                    )
                )

    seen = set()
    unique_ids: List[str] = []
    duplicate_count = 0
    for pid in all_ids:
        if pid in seen:
            duplicate_count += 1
            continue
        seen.add(pid)
        unique_ids.append(pid)

    print(
        f"Collected {len(all_ids)} IDs, removed {duplicate_count} duplicates, "
        f"{len(unique_ids)} unique IDs remain."
    )
    return unique_ids


def merge_keywords(existing: List[str], new_keyword: str) -> List[str]:
    merged = []
    seen = set()
    for kw in (existing or []) + [new_keyword]:
        if kw not in seen:
            merged.append(kw)
            seen.add(kw)
    return merged


def process_existing_papers(supabase: Client, pmids: List[str]) -> List[str]:
    existing_ids = set()
    updates: List[Tuple[str, List[str]]] = []
    chunk_size = 1000

    print(f"Checking {len(pmids)} PMIDs against Supabase...")
    for i in range(0, len(pmids), chunk_size):
        chunk = pmids[i : i + chunk_size]
        try:
            res = (
                supabase.table("pubmed_papers")
                .select("id, keywords")
                .in_("id", chunk)
                .execute()
            )
            rows = res.data or []
            for row in rows:
                pid = row["id"]
                kws = row.get("keywords") or []
                existing_ids.add(pid)
                if TARGET_LABEL not in kws:
                    updates.append((pid, merge_keywords(kws, TARGET_LABEL)))
        except Exception as e:
            print(f"  Failed to check chunk {i // chunk_size + 1}: {e}")

    if updates:
        print(f"Updating keyword for {len(updates)} existing papers...")
        for pid, new_kws in updates:
            try:
                (
                    supabase.table("pubmed_papers")
                    .update({"keywords": new_kws})
                    .eq("id", pid)
                    .execute()
                )
            except Exception as e:
                print(f"  Failed to update keywords for PMID {pid}: {e}")

    new_pmids = [pid for pid in pmids if pid not in existing_ids]
    print(
        f"Supabase check done: total={len(pmids)}, existing={len(existing_ids)}, "
        f"new={len(new_pmids)}"
    )
    return new_pmids


def normalize_month(value: str) -> str:
    if not value:
        return ""
    if str(value).isdigit():
        return str(value).zfill(2)
    month_map = {
        "jan": "01",
        "feb": "02",
        "mar": "03",
        "apr": "04",
        "may": "05",
        "jun": "06",
        "jul": "07",
        "aug": "08",
        "sep": "09",
        "oct": "10",
        "nov": "11",
        "dec": "12",
    }
    key = str(value).strip().lower()[:3]
    return month_map.get(key, "")


def extract_pub_date(article: Dict) -> str:
    try:
        for h in article.get("PubmedData", {}).get("History", []):
            if h.attributes.get("PubStatus") == "pubmed":
                year = str(h.get("Year", ""))
                month = normalize_month(str(h.get("Month", "")))
                day = str(h.get("Day", "")).zfill(2) if h.get("Day") else ""
                if year and month and day:
                    return f"{year}-{month}-{day}"
                if year and month:
                    return f"{year}-{month}"
                if year:
                    return year
    except Exception:
        pass

    try:
        pub_date = (
            article["MedlineCitation"]["Article"]["Journal"]["JournalIssue"]["PubDate"]
        )
        year = str(pub_date.get("Year", ""))
        month = normalize_month(str(pub_date.get("Month", "")))
        day = str(pub_date.get("Day", "")).zfill(2) if pub_date.get("Day") else ""
        if year and month and day:
            return f"{year}-{month}-{day}"
        if year and month:
            return f"{year}-{month}"
        return year
    except Exception:
        return ""


def parse_article(article: Dict) -> Optional[Dict]:
    try:
        medline = article["MedlineCitation"]
        pmid = str(medline["PMID"])
        article_info = medline["Article"]
        title = str(article_info.get("ArticleTitle", ""))

        abstract_text = ""
        if "Abstract" in article_info and "AbstractText" in article_info["Abstract"]:
            parts = []
            for item in article_info["Abstract"]["AbstractText"]:
                if hasattr(item, "attributes"):
                    label = item.attributes.get("Label", "")
                    text = str(item)
                    parts.append(f"{label}: {text}" if label else text)
                else:
                    parts.append(str(item))
            abstract_text = "\n".join(parts)

        authors = []
        for au in article_info.get("AuthorList", []):
            last = au.get("LastName", "")
            initials = au.get("Initials", "")
            full_name = f"{last} {initials}".strip()
            if full_name:
                authors.append(full_name)

        journal = article_info.get("Journal", {}).get("Title", "")
        pub_date = extract_pub_date(article)
        link = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"

        return {
            "id": pmid,
            "title": title,
            "abstract": abstract_text,
            "authors": authors,
            "publication_date": pub_date,
            "journal": journal,
            "link": link,
            "keywords": [TARGET_LABEL],
        }
    except Exception:
        return None


def fetch_details_and_save(supabase: Client, pmids: List[str]):
    if not pmids:
        print("No new papers to fetch.")
        return

    total = len(pmids)
    saved_count = 0
    print(f"Fetching details for {total} new PMIDs...")

    for i in range(0, total, EFETCH_CHUNK_SIZE):
        chunk = pmids[i : i + EFETCH_CHUNK_SIZE]
        chunk_num = i // EFETCH_CHUNK_SIZE + 1
        total_chunks = (total + EFETCH_CHUNK_SIZE - 1) // EFETCH_CHUNK_SIZE
        print(f"  Fetching efetch chunk {chunk_num}/{total_chunks} ({len(chunk)} IDs)")

        records = safe_api_call(
            Entrez.efetch,
            db="pubmed",
            id=",".join(chunk),
            retmode="xml",
        )
        if not records:
            continue

        articles = records.get("PubmedArticle", [])
        papers = []
        for article in articles:
            paper = parse_article(article)
            if paper:
                papers.append(paper)

        if not papers:
            continue

        try:
            supabase.table("pubmed_papers").upsert(papers).execute()
            saved_count += len(papers)
            print(f"  Saved {len(papers)} papers (total saved: {saved_count})")
        except Exception as e:
            print(f"  Failed to save chunk {chunk_num}: {e}")

    print(f"Done. Saved {saved_count} new papers.")


def main():
    print("=== PubMed Collector: Polycaprolactone ===")
    print(f"Query: {TARGET_QUERY}")
    print(f"Label: {TARGET_LABEL}")
    print(
        f"Rate limit: {REQUEST_INTERVAL:.3f}s/request "
        f"({1 / REQUEST_INTERVAL:.2f} req/sec)"
    )
    print(f"Esearch split size: {ESEARCH_BATCH_SIZE}")
    print(f"API key set: {'YES' if PUBMED_API_KEY else 'NO'}")
    print(f"Email set: {'YES' if PUBMED_EMAIL else 'NO'}")

    if not PUBMED_EMAIL:
        print("PUBMED_EMAIL is missing. Stop.")
        return

    try:
        supabase = init_supabase()
    except Exception as e:
        print(f"Supabase init failed: {e}")
        return

    pmids = fetch_all_pubmed_ids(TARGET_QUERY)
    if not pmids:
        print("No PubMed IDs found.")
        return

    new_pmids = process_existing_papers(supabase, pmids)
    fetch_details_and_save(supabase, new_pmids)
    print("=== Job Complete ===")


if __name__ == "__main__":
    main()
