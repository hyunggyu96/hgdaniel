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
TARGET_SEARCH_COUNT = 50000 # Scan EVERYTHING to find all 28k
FETCH_GOAL = 30000           # Target everything remaining

# Rate limit at 8 requests per second
REQUEST_INTERVAL = 0.125  
MAX_RETRIES = 5
EFETCH_CHUNK_SIZE = 200 # NCBI maximum recommended

# Setup Entrez
Entrez.email = PUBMED_EMAIL
Entrez.api_key = PUBMED_API_KEY
Entrez.tool = "AestheticIntelligence_FullCollection"

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
                wait = 2.0 * (attempt + 1)
                print(f"  Rate limited (HTTP {e.code}). Waiting {wait}s...")
                time.sleep(wait)
            else:
                print(f"  HTTP Error {e.code}: {e}")
                return None
        except Exception as e:
            time.sleep(2.0)
            print(f"  Error: {e}. Retrying {attempt+1}/{retries}...")
    return None

def init_supabase() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_pubmed_ids(keyword: str, max_results: int) -> List[str]:
    print(f"Searching for '{keyword}' (scanning all available)...")
    all_ids = []
    chunk_size = 5000
    retstart = 0
    
    while True:
        result = safe_api_call(Entrez.esearch, db="pubmed", term=keyword, retmax=chunk_size, retstart=retstart, sort="date")
        if not result:
            break
        
        ids = result.get("IdList", [])
        if not ids:
            break
            
        all_ids.extend(ids)
        print(f"  Got {len(all_ids)} IDs...")
        
        if len(ids) < chunk_size or len(all_ids) >= max_results:
            break
            
        retstart += chunk_size
        
    return all_ids

def filter_new_pmids(supabase: Client, pmids: List[str]) -> List[str]:
    """Remove existing PMIDs to ensure ZERO DUPLICATES."""
    existing_ids = set()
    chunk_size = 1000
    for i in range(0, len(pmids), chunk_size):
        chunk = pmids[i:i+chunk_size]
        try:
            result = supabase.table("pubmed_papers").select("id").in_("id", chunk).execute()
            for row in (result.data or []):
                existing_ids.add(row['id'])
        except Exception as e:
            print(f"  Check Error: {e}")
    
    unique_new = [pid for pid in pmids if pid not in existing_ids]
    return unique_new

def top_up_papers(supabase: Client, keyword: str, pmids: List[str]):
    new_pmids = filter_new_pmids(supabase, pmids)
    total_found = len(new_pmids)
    print(f"Found {total_found} NEW papers for '{keyword}'. Starting collection...")
    
    saved_count = 0
    total_needed = FETCH_GOAL
    
    for i in range(0, len(new_pmids), EFETCH_CHUNK_SIZE):
        if saved_count >= total_needed:
            break
            
        chunk = new_pmids[i:i+EFETCH_CHUNK_SIZE]
        remaining = total_needed - saved_count
        if len(chunk) > remaining:
            chunk = chunk[:remaining]
            
        print(f"  -> Progress: {saved_count}/{total_found} (Chunk: {len(chunk)})")
        
        records = safe_api_call(Entrez.efetch, db="pubmed", id=",".join(chunk), retmode="xml")
        if not records or 'PubmedArticle' not in records:
            continue

        bulk_papers = []
        for article in records['PubmedArticle']:
            try:
                medline = article['MedlineCitation']
                pmid = str(medline['PMID'])
                title = medline['Article']['ArticleTitle']
                
                abstract_text = ""
                if 'Abstract' in medline['Article']:
                    abs_text = medline['Article']['Abstract'].get('AbstractText', [])
                    abstract_text = "\n".join([str(p) for p in abs_text])

                authors = []
                if 'AuthorList' in medline['Article']:
                    for au in medline['Article']['AuthorList']:
                        authors.append(f"{au.get('LastName', '')} {au.get('Initials', '')}".strip())

                journal = medline['Article']['Journal'].get('Title', '')
                
                pub_date_str = "1900-01-01"
                try:
                    for h in article['PubmedData'].get('History', []):
                        if h.attributes.get('PubStatus') == 'pubmed':
                            pub_date_str = f"{h['Year']}-{h['Month'].zfill(2)}-{h['Day'].zfill(2)}"
                            break
                except: pass

                bulk_papers.append({
                    "id": pmid,
                    "title": title,
                    "abstract": abstract_text,
                    "authors": authors,
                    "publication_date": pub_date_str,
                    "journal": journal,
                    "link": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
                    "keywords": [keyword]
                })
            except: continue

        if bulk_papers:
            try:
                # Use bulk upsert for high speed
                supabase.table("pubmed_papers").upsert(bulk_papers).execute()
                saved_count += len(bulk_papers)
            except Exception as e:
                print(f"  Save Error: {e}")

    print(f"COMPLETE. Total newly saved papers: {saved_count}")

def main():
    print(f"=== PubMed HIGH-SPEED COLLECTION (Rate: 8/s) ===")
    supabase = init_supabase()
    
    for kw in KEYWORDS:
        pmids = fetch_pubmed_ids(kw, TARGET_SEARCH_COUNT)
        if pmids:
            top_up_papers(supabase, kw, pmids)

if __name__ == "__main__":
    main()
