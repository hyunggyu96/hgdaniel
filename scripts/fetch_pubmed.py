import os
import time
from typing import List
from Bio import Entrez
from supabase import create_client, Client
from dotenv import load_dotenv
from urllib.error import HTTPError

# Load environment variables
load_dotenv('web/.env.local')
load_dotenv('backend/.env')

# Configuration
PUBMED_API_KEY = os.getenv("PUBMED_API_KEY", "")
PUBMED_EMAIL = os.getenv("PUBMED_EMAIL", "")
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Keywords
KEYWORDS = [
    'botulinum toxin',
    'HA filler',
    'dermal filler',
    'hyaluronic filler',
    'polynucleotide(PN)',
    'polydeoxyribonucleotide (pdrn)',
    'exosome',
    'PLLA',
    'PDLLA',
    'CaHA'
]

TARGET_COUNT = 5000

# NCBI E-utilities rate limit settings
# With API key: max 10 req/sec → we use 1 req/sec to be safe
# Without API key: max 3 req/sec
REQUEST_INTERVAL = 1.0  # seconds between each PubMed API call
MAX_RETRIES = 3
EFETCH_CHUNK_SIZE = 200  # NCBI recommends ≤200 for efetch XML

# Setup Entrez (NCBI requires email + tool identification)
Entrez.email = PUBMED_EMAIL
Entrez.api_key = PUBMED_API_KEY
Entrez.tool = "AestheticIntelligence"


def safe_api_call(func, retries=MAX_RETRIES, **kwargs):
    """Wrapper for PubMed API calls with retry + exponential backoff."""
    for attempt in range(retries):
        try:
            time.sleep(REQUEST_INTERVAL)
            handle = func(**kwargs)
            result = Entrez.read(handle)
            handle.close()
            return result
        except HTTPError as e:
            if e.code in (429, 503):
                wait = REQUEST_INTERVAL * (2 ** (attempt + 1))
                print(f"  Rate limited (HTTP {e.code}). Waiting {wait}s before retry {attempt+1}/{retries}...")
                time.sleep(wait)
            else:
                print(f"  HTTP Error {e.code}: {e}")
                return None
        except Exception as e:
            wait = REQUEST_INTERVAL * (2 ** (attempt + 1))
            print(f"  Error: {e}. Waiting {wait}s before retry {attempt+1}/{retries}...")
            time.sleep(wait)
    print(f"  Failed after {retries} retries. Skipping.")
    return None


def init_supabase() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Supabase URL or Key is missing. Check .env files.")
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def fetch_pubmed_ids(keyword: str, max_results: int) -> List[str]:
    print(f"Searching for '{keyword}' (max {max_results})...")
    result = safe_api_call(Entrez.esearch, db="pubmed", term=keyword, retmax=max_results, sort="date")
    if result:
        return result["IdList"]
    return []


def filter_new_pmids(supabase: Client, pmids: List[str]) -> List[str]:
    """Remove PMIDs that already exist in the database."""
    existing_ids = set()
    chunk_size = 500
    for i in range(0, len(pmids), chunk_size):
        chunk = pmids[i:i+chunk_size]
        try:
            result = supabase.table("pubmed_papers").select("id").in_("id", chunk).execute()
            for row in (result.data or []):
                existing_ids.add(row['id'])
        except Exception as e:
            print(f"  Warning: could not check existing IDs: {e}")
    return [pid for pid in pmids if pid not in existing_ids]


def fetch_details_and_save(supabase: Client, keyword: str, pmids: List[str]):
    if not pmids:
        return

    new_pmids = filter_new_pmids(supabase, pmids)
    skipped = len(pmids) - len(new_pmids)
    print(f"  {len(pmids)} total, {skipped} already in DB, {len(new_pmids)} new to fetch.")

    if not new_pmids:
        print(f"  No new papers for '{keyword}'. Skipping.")
        return

    total = len(new_pmids)
    saved_count = 0

    for i in range(0, total, EFETCH_CHUNK_SIZE):
        chunk = new_pmids[i:i+EFETCH_CHUNK_SIZE]
        chunk_num = (i // EFETCH_CHUNK_SIZE) + 1
        total_chunks = (total + EFETCH_CHUNK_SIZE - 1) // EFETCH_CHUNK_SIZE
        print(f"  Fetching chunk {chunk_num}/{total_chunks} ({len(chunk)} papers)...")

        records = safe_api_call(Entrez.efetch, db="pubmed", id=",".join(chunk), retmode="xml")
        if not records:
            continue

        articles = records.get('PubmedArticle', [])

        for article in articles:
            try:
                medline = article['MedlineCitation']
                pmid = str(medline['PMID'])

                title = medline['Article']['ArticleTitle']

                abstract_text = ""
                if 'Abstract' in medline['Article'] and 'AbstractText' in medline['Article']['Abstract']:
                    abs_list = medline['Article']['Abstract']['AbstractText']
                    parts = []
                    for item in abs_list:
                        if hasattr(item, 'attributes'):
                            label = item.attributes.get('Label', '')
                            text = str(item)
                            parts.append(f"{label}: {text}" if label else text)
                        else:
                            parts.append(str(item))
                    abstract_text = "\n".join(parts)

                authors_list = []
                if 'AuthorList' in medline['Article']:
                    for au in medline['Article']['AuthorList']:
                        last = au.get('LastName', '')
                        initials = au.get('Initials', '')
                        authors_list.append(f"{last} {initials}".strip())

                journal = medline['Article']['Journal'].get('Title', '')

                # Use PubMed registration date (History[pubmed]) for accuracy,
                # fallback to journal issue date
                pub_date_str = ""
                article_data = article['PubmedData']
                for h in article_data.get('History', []):
                    if h.attributes.get('PubStatus') == 'pubmed':
                        pub_date_str = f"{h['Year']}-{h['Month'].zfill(2)}-{h['Day'].zfill(2)}"
                        break
                if not pub_date_str:
                    pub_date = medline['Article']['Journal']['JournalIssue']['PubDate']
                    if 'Year' in pub_date:
                        pub_date_str = pub_date['Year']
                        if 'Month' in pub_date:
                            pub_date_str += f"-{pub_date['Month'].zfill(2)}"

                link = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"

                paper = {
                    "id": pmid,
                    "title": title,
                    "abstract": abstract_text,
                    "authors": authors_list,
                    "publication_date": pub_date_str,
                    "journal": journal,
                    "link": link,
                    "keywords": [keyword]
                }

                supabase.table("pubmed_papers").upsert(paper).execute()
                saved_count += 1
            except Exception as e:
                continue

        print(f"  Chunk {chunk_num} done. Saved {saved_count} so far.")

    print(f"  Keyword '{keyword}' complete: {saved_count} new papers saved.")


def main():
    print(f"=== PubMed Fetch ===")
    print(f"Keywords: {len(KEYWORDS)}, Target: {TARGET_COUNT} each")
    print(f"Rate limit: {REQUEST_INTERVAL}s between API calls, chunk size: {EFETCH_CHUNK_SIZE}")
    print(f"API Key: {'SET' if PUBMED_API_KEY else 'NOT SET'}")
    print(f"Email: {PUBMED_EMAIL or 'NOT SET'}\n")

    try:
        supabase = init_supabase()
    except Exception as e:
        print(f"Supabase Init Failed: {e}")
        return

    for kw in KEYWORDS:
        print(f"\n--- [{kw}] ---")
        pmids = fetch_pubmed_ids(kw, TARGET_COUNT)
        print(f"  Found {len(pmids)} IDs on PubMed.")
        if pmids:
            fetch_details_and_save(supabase, kw, pmids)
        time.sleep(REQUEST_INTERVAL)

    print("\n=== Job Complete ===")


if __name__ == "__main__":
    main()
