
import os
import time
from typing import List, Set
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

TARGET_QUERY = "radiofrequency AND (Skin OR Face OR Aesthetic)"
TARGET_LABEL = "Radiofrequency (RF)"

# Use a large limit to get ALL papers
TARGET_COUNT = 100000

# API Regulation: 10 req/sec with API key. We use 8 req/sec max to be safe.
# 1 / 8 = 0.125 seconds
REQUEST_INTERVAL = 0.125
MAX_RETRIES = 3
EFETCH_CHUNK_SIZE = 200

# Setup Entrez
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

def fetch_pubmed_ids(query: str, max_results: int) -> List[str]:
    print(f"Searching for '{query}' (max {max_results})...")
    # esearch is just 1 request returning IDs
    result = safe_api_call(Entrez.esearch, db="pubmed", term=query, retmax=max_results, sort="date")
    if result:
        return result["IdList"]
    return []

def process_existing_papers(supabase: Client, pmids: List[str]):
    """
    Check if papers exist.
    If they exist, ensure TARGET_LABEL is in their keywords.
    Return list of NEW pmids (not in DB).
    """
    existing_ids = set()
    ids_to_update = []
    
    # Check in chunks of 1000
    chunk_size = 1000
    print(f"Checking {len(pmids)} IDs against database...")
    
    for i in range(0, len(pmids), chunk_size):
        chunk = pmids[i:i+chunk_size]
        try:
            result = supabase.table("pubmed_papers").select("id, keywords").in_("id", chunk).execute()
            rows = result.data or []
            
            for row in rows:
                pid = row['id']
                keywords = row.get('keywords') or []
                existing_ids.add(pid)
                
                # If TARGET_LABEL is not in keywords, we need to update
                if TARGET_LABEL not in keywords:
                    ids_to_update.append((pid, keywords))
                    
        except Exception as e:
            print(f"  Warning: could not check existing IDs chunk {i}: {e}")

    # Update existing records that are missing the keyword
    if ids_to_update:
        print(f"  Updating {len(ids_to_update)} existing papers with new keyword '{TARGET_LABEL}'...")
        for pid, kws in ids_to_update:
            new_kws = list(set(kws + [TARGET_LABEL]))
            try:
                supabase.table("pubmed_papers").update({"keywords": new_kws}).eq("id", pid).execute()
            except Exception as e:
                print(f"    Failed to update {pid}: {e}")

    # Return only NEW IDs
    new_pmids = [pid for pid in pmids if pid not in existing_ids]
    return new_pmids

def fetch_details_and_save(supabase: Client, pmids: List[str]):
    if not pmids:
        print("  No new papers to fetch.")
        return

    print(f"  Fetching details for {len(pmids)} new papers...")
    
    saved_count = 0
    total = len(pmids)

    for i in range(0, total, EFETCH_CHUNK_SIZE):
        chunk = pmids[i:i+EFETCH_CHUNK_SIZE]
        chunk_num = (i // EFETCH_CHUNK_SIZE) + 1
        total_chunks = (total + EFETCH_CHUNK_SIZE - 1) // EFETCH_CHUNK_SIZE
        print(f"  Fetching chunk {chunk_num}/{total_chunks} ({len(chunk)} papers)...")

        # This efetch call is 1 request. We respect REQUEST_INTERVAL before it.
        records = safe_api_call(Entrez.efetch, db="pubmed", id=",".join(chunk), retmode="xml")
        if not records:
            continue

        articles = records.get('PubmedArticle', [])
        papers_to_insert = []

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
                    "keywords": [TARGET_LABEL]
                }
                papers_to_insert.append(paper)
            except Exception as e:
                # print(f"    Error parsing article: {e}")
                continue
        
        if papers_to_insert:
            try:
                supabase.table("pubmed_papers").upsert(papers_to_insert).execute()
                saved_count += len(papers_to_insert)
            except Exception as e:
                print(f"    Batch insert failed: {e}")

        print(f"  Chunk {chunk_num} done. Saved {saved_count} so far.")

    print(f"  Complete: {saved_count} new papers saved.")

def main():
    print(f"=== PubMed Fetch for '{TARGET_QUERY}' ===")
    print(f"Target: {TARGET_COUNT}, Classification: {TARGET_LABEL}")
    print(f"Rate Link: {REQUEST_INTERVAL}s/request (approx 8 req/sec)")
    
    try:
        supabase = init_supabase()
    except Exception as e:
        print(f"Supabase Init Failed: {e}")
        return

    # 1. Fetch all IDs
    pmids = fetch_pubmed_ids(TARGET_QUERY, TARGET_COUNT)
    print(f"  Found {len(pmids)} IDs for query.")
    
    if not pmids:
        print("No papers found.")
        return

    # 2. Check existing and identify new ones (handling updates for existing)
    new_pmids = process_existing_papers(supabase, pmids)
    
    # 3. Fetch details for new ones
    if new_pmids:
        fetch_details_and_save(supabase, new_pmids)
    else:
        print("All papers already exist and are up to date.")

    print("\n=== Job Complete ===")

if __name__ == "__main__":
    main()
