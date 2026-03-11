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
PUBMED_EMAIL = "hg.daniel.kang@gmail.com" 
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Target keyword
KEYWORD = 'Botulinum Toxin'
TARGET_COUNT = 35000  # To cover all 28,272

# Rate limit settings
# User requested ~8 req/sec. 
REQUEST_INTERVAL = 0.13  # ~7.7 req/sec
MAX_RETRIES = 3
EFETCH_CHUNK_SIZE = 200

# Setup Entrez
Entrez.email = PUBMED_EMAIL if PUBMED_EMAIL else "support@coauths.com"
Entrez.api_key = PUBMED_API_KEY
Entrez.tool = "AestheticIntelligence"

def safe_api_call(func, retries=MAX_RETRIES, **kwargs):
    """Wrapper for PubMed API calls with retry + exponential backoff."""
    for attempt in range(retries):
        try:
            time.sleep(REQUEST_INTERVAL)
            handle = func(**kwargs)
            # This wrapper assumes XML return usually, but logic below handles exceptions
            # For non-parsing calls, we might need manual handling, but standard Entrez calls return a handle
            # that Entrez.read can parse.
            
            # If the caller wants raw handle, they shouldn't use this wrapper if it parses.
            # But we use this wrapper for esearch and efetch(xml).
            
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
    print(f"Searching for '{keyword}' by year to bypass limits...")
    
    all_ids = []
    current_year = int(time.strftime("%Y")) + 1 # Include next year just in case
    start_year = 1970
    
    total_found = 0
    
    for year in range(current_year, start_year - 1, -1):
        if len(all_ids) >= max_results:
            break
            
        print(f"  Fetching for year {year}...")
        
        # Determine strict date range to avoid overlap? 
        # mindate/maxdate in esearch uses YYYY/MM/DD or YYYY.
        # datetype='pdat' (publication date)
        
        try:
            # We can ask for retmax=9999 per year. If >9999, we warn (unlikely for this topic).
            search_handle = safe_api_call(Entrez.esearch, db="pubmed", term=keyword, 
                                        mindate=str(year), maxdate=str(year), datetype="pdat",
                                        retmax=9900)
            
            if not search_handle:
                continue
                
            result = search_handle
            count = int(result["Count"])
            ids = result["IdList"]
            
            if count > 9900:
                print(f"    Warning: Year {year} has {count} records, but fetched only {len(ids)}. Some might be missing.")
                # If this happens, we could split by month, but for Botox it's unlikely to exceed 10k/year.
            
            if ids:
                all_ids.extend(ids)
                total_found += len(ids)
                print(f"    Found {len(ids)} records for {year}. Total so far: {total_found}")
            else:
                 pass # No records for this year
                 
            # Optimization: If we find 0 records for 5 consecutive years in the past, maybe stop?
            # But Botox research started decades ago.
            
        except Exception as e:
            print(f"    Error fetching year {year}: {e}")
            
    # Deduplicate? 
    # esearch might return overlaps if date logic is fuzzy?
    # IDs are unique strings.
    unique_ids = list(set(all_ids))
    print(f"  Total unique IDs found: {len(unique_ids)}")
    return unique_ids

def filter_new_pmids(supabase: Client, pmids: List[str]) -> List[str]:
    """Remove PMIDs that already exist in the database."""
    existing_ids = set()
    chunk_size = 1000 
    total = len(pmids)
    print(f"Checking {total} IDs against database...")
    
    for i in range(0, total, chunk_size):
        chunk = pmids[i:i+chunk_size]
        try:
            # We only need the ID
            result = supabase.table("pubmed_papers").select("id").in_("id", chunk).execute()
            for row in (result.data or []):
                existing_ids.add(row['id'])
        except Exception as e:
            print(f"  Warning: could not check existing IDs in chunk {i}: {e}")
            
    return [pid for pid in pmids if pid not in existing_ids]

def fetch_details_and_save(supabase: Client, keyword: str, pmids: List[str]):
    if not pmids:
        return

    print(f"Filtering {len(pmids)} IDs...")
    new_pmids = filter_new_pmids(supabase, pmids)
    skipped = len(pmids) - len(new_pmids)
    print(f"  {len(pmids)} total found, {skipped} already in DB, {len(new_pmids)} new to fetch.")

    if not new_pmids:
        print(f"  No new papers to fetch.")
        return

    total = len(new_pmids)
    saved_count = 0

    for i in range(0, total, EFETCH_CHUNK_SIZE):
        chunk = new_pmids[i:i+EFETCH_CHUNK_SIZE]
        chunk_num = (i // EFETCH_CHUNK_SIZE) + 1
        total_chunks = (total + EFETCH_CHUNK_SIZE - 1) // EFETCH_CHUNK_SIZE
        print(f"  Fetching chunk {chunk_num}/{total_chunks} ({len(chunk)} papers)...")

        # Fetch details using safe_api_call which handles XML parsing
        records = safe_api_call(Entrez.efetch, db="pubmed", id=",".join(chunk), retmode="xml")
        if not records:
            continue

        try:
            articles = records.get('PubmedArticle', [])
        except AttributeError:
             articles = []

        batch_data = []
        for article in articles:
            try:
                medline = article['MedlineCitation']
                pmid = str(medline['PMID'])
                
                # Title
                title = medline['Article'].get('ArticleTitle', '')

                # Abstract
                abstract_text = ""
                if 'Abstract' in medline['Article'] and 'AbstractText' in medline['Article']['Abstract']:
                    abs_list = medline['Article']['Abstract']['AbstractText']
                    parts = []
                    if isinstance(abs_list, list):
                        for item in abs_list:
                            if hasattr(item, 'attributes') and 'Label' in item.attributes:
                                label = item.attributes['Label']
                                text = str(item)
                                parts.append(f"{label}: {text}")
                            else:
                                parts.append(str(item))
                        abstract_text = "\n".join(parts)
                    else:
                        abstract_text = str(abs_list)

                # Authors
                authors_list = []
                if 'AuthorList' in medline['Article']:
                    for au in medline['Article']['AuthorList']:
                        last = au.get('LastName', '')
                        initials = au.get('Initials', '')
                        if last or initials:
                            authors_list.append(f"{last} {initials}".strip())

                # Journal
                journal = ""
                if 'Journal' in medline['Article']:
                     journal = medline['Article']['Journal'].get('Title', '')

                # Publication Date
                pub_date_str = ""
                article_data = article.get('PubmedData', {})
                if 'History' in article_data:
                    for h in article_data['History']:
                        if h.attributes.get('PubStatus') == 'pubmed':
                            try:
                                pub_date_str = f"{h['Year']}-{h['Month'].zfill(2)}-{h['Day'].zfill(2)}"
                            except:
                                pass
                            break
                
                if not pub_date_str and 'Journal' in medline['Article']:
                    try:
                        pub_date = medline['Article']['Journal'].get('JournalIssue', {}).get('PubDate', {})
                        if 'Year' in pub_date:
                            pub_date_str = pub_date['Year']
                            if 'Month' in pub_date:
                                m = pub_date['Month']
                                pub_date_str += f"-{m}"
                    except:
                        pass

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
                batch_data.append(paper)

            except Exception as e:
                print(f"Error parsing article {pmid if 'pmid' in locals() else 'unknown'}: {e}")
                continue
        
        # Upsert batch
        if batch_data:
            try:
                supabase.table("pubmed_papers").upsert(batch_data).execute()
                saved_count += len(batch_data)
                print(f"    Saved {len(batch_data)} records.")
            except Exception as e:
                print(f"    Error saving batch to Supabase: {e}")

    print(f"  BACKFILL COMPLETE. Total added: {saved_count}")

def main():
    print(f"=== PubMed Backfill: {KEYWORD} ===")
    print(f"Target: {TARGET_COUNT}")
    
    try:
        supabase = init_supabase()
    except Exception as e:
        print(f"Supabase Init Failed: {e}")
        return

    pmids = fetch_pubmed_ids(KEYWORD, TARGET_COUNT)
    if pmids:
        fetch_details_and_save(supabase, KEYWORD, pmids)
    else:
        print("No IDs found.")

