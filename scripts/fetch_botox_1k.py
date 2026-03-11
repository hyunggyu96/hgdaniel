import os
import time
from typing import List
from Bio import Entrez
from supabase import create_client, Client
from dotenv import load_dotenv
from urllib.error import HTTPError

# Load environment variables
load_dotenv('web/.env.local')

# Configuration
PUBMED_API_KEY = os.getenv("PUBMED_API_KEY", "")
PUBMED_EMAIL = os.getenv("PUBMED_EMAIL", "")
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Specific Task Configuration
KEYWORDS = ['botulinum toxin']
TARGET_SEARCH_COUNT = 30000 # Search wide to find missing ones
FETCH_GOAL = 2000           # We want to add 2,000 new papers

# NCBI E-utilities rate limit settings
# With API key: max 10 req/sec. We use 0.2s interval (5 req/sec) to be very safe.
REQUEST_INTERVAL = 0.2  
MAX_RETRIES = 3
EFETCH_CHUNK_SIZE = 100 # Smaller chunks for better control

# Setup Entrez
Entrez.email = PUBMED_EMAIL
Entrez.api_key = PUBMED_API_KEY
Entrez.tool = "AestheticIntelligence_TopUp"

def safe_api_call(func, retries=MAX_RETRIES, **kwargs):
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
                print(f"  Rate limited (HTTP {e.code}). Waiting {wait}s...")
                time.sleep(wait)
            else:
                print(f"  HTTP Error {e.code}: {e}")
                return None
        except Exception as e:
            time.sleep(REQUEST_INTERVAL * 2)
            print(f"  Error: {e}. Retrying {attempt+1}/{retries}...")
    return None

def init_supabase() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_pubmed_ids(keyword: str, max_results: int) -> List[str]:
    print(f"Searching for '{keyword}' (scanning up to {max_results})...")
    # sort by date to get newest first, or just enough to cover the gap
    result = safe_api_call(Entrez.esearch, db="pubmed", term=keyword, retmax=max_results, sort="relevance")
    if result:
        return result["IdList"]
    return []

def filter_new_pmids(supabase: Client, pmids: List[str]) -> List[str]:
    existing_ids = set()
    chunk_size = 500
    for i in range(0, len(pmids), chunk_size):
        chunk = pmids[i:i+chunk_size]
        try:
            result = supabase.table("pubmed_papers").select("id").in_("id", chunk).execute()
            for row in (result.data or []):
                existing_ids.add(row['id'])
        except Exception as e:
            print(f"  Check Error: {e}")
    return [pid for pid in pmids if pid not in existing_ids]

def top_up_papers(supabase: Client, keyword: str, pmids: List[str]):
    new_pmids = filter_new_pmids(supabase, pmids)
    print(f"Found {len(new_pmids)} new candidates for '{keyword}'.")
    
    saved_count = 0
    total_needed = FETCH_GOAL
    
    for i in range(0, len(new_pmids), EFETCH_CHUNK_SIZE):
        if saved_count >= total_needed:
            break
            
        chunk = new_pmids[i:i+EFETCH_CHUNK_SIZE]
        # Trim chunk if it exceeds remaining goal
        remaining = total_needed - saved_count
        if len(chunk) > remaining:
            chunk = chunk[:remaining]
            
        print(f"  Fetching {len(chunk)} papers... (Total saved: {saved_count}/{total_needed})")
        
        records = safe_api_call(Entrez.efetch, db="pubmed", id=",".join(chunk), retmode="xml")
        if not records or 'PubmedArticle' not in records:
            continue

        for article in records['PubmedArticle']:
            try:
                medline = article['MedlineCitation']
                pmid = str(medline['PMID'])
                title = medline['Article']['ArticleTitle']
                
                # Simple extraction (similar to fetch_pubmed.py)
                abstract_text = ""
                if 'Abstract' in medline['Article']:
                    abs_text = medline['Article']['Abstract'].get('AbstractText', [])
                    abstract_text = "\n".join([str(p) for p in abs_text])

                authors = []
                if 'AuthorList' in medline['Article']:
                    for au in medline['Article']['AuthorList']:
                        authors.append(f"{au.get('LastName', '')} {au.get('Initials', '')}".strip())

                journal = medline['Article']['Journal'].get('Title', '')
                
                # Date extraction
                pub_date_str = "1900-01-01"
                try:
                    for h in article['PubmedData'].get('History', []):
                        if h.attributes.get('PubStatus') == 'pubmed':
                            pub_date_str = f"{h['Year']}-{h['Month'].zfill(2)}-{h['Day'].zfill(2)}"
                            break
                except: pass

                paper = {
                    "id": pmid,
                    "title": title,
                    "abstract": abstract_text,
                    "authors": authors,
                    "publication_date": pub_date_str,
                    "journal": journal,
                    "link": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
                    "keywords": [keyword]
                }
                
                supabase.table("pubmed_papers").upsert(paper).execute()
                saved_count += 1
                if saved_count >= total_needed:
                    break
            except Exception as e:
                continue

    print(f"Finished. Incremental papers saved: {saved_count}")

def main():
    print(f"=== PubMed Top-Up (Goal: {FETCH_GOAL} for '{KEYWORDS[0]}') ===")
    supabase = init_supabase()
    
    for kw in KEYWORDS:
        pmids = fetch_pubmed_ids(kw, TARGET_SEARCH_COUNT)
        if pmids:
            top_up_papers(supabase, kw, pmids)

if __name__ == "__main__":
    main()
