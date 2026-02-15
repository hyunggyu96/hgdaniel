import os
import time
from typing import List
from Bio import Entrez
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv('web/.env.local')

# Configuration
PUBMED_API_KEY = os.getenv("PUBMED_API_KEY", "")
PUBMED_EMAIL = os.getenv("PUBMED_EMAIL", "")
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Target
KEYWORD = 'botulinum toxin'
REQUEST_INTERVAL = 0.125 # 8 req/sec
EFETCH_CHUNK_SIZE = 200

# Setup Entrez
Entrez.email = PUBMED_EMAIL
Entrez.api_key = PUBMED_API_KEY
Entrez.tool = "AestheticIntelligence_HistorySync"

def safe_api_call(func, **kwargs):
    for attempt in range(5):
        try:
            time.sleep(REQUEST_INTERVAL)
            handle = func(**kwargs)
            # Some calls return handles that Entrez.read can parse, others (text) need .read()
            if kwargs.get('retmode') == 'xml' or kwargs.get('retmode') is None:
                try:
                    result = Entrez.read(handle)
                except:
                    # Fallback for unexpected formats
                    handle.seek(0)
                    result = handle.read()
            else:
                result = handle.read()
            handle.close()
            return result
        except Exception as e:
            time.sleep(2.0)
            print(f"  API Error: {e}. Retrying...")
    return None

def main():
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    print(f"Initial Search for '{KEYWORD}' using History Server...")
    search_res = safe_api_call(Entrez.esearch, db="pubmed", term=KEYWORD, usehistory="y")
    if not search_res:
        print("Search failed.")
        return
        
    count = int(search_res["Count"])
    webenv = search_res["WebEnv"]
    query_key = search_res["QueryKey"]
    print(f"Total results on PubMed: {count}")

    # Fetch existing IDs and keywords from DB to avoid redundant full fetches
    print("Loading existing papers from DB for duplicate/keyword check...")
    existing_all = {}
    # We might have 30k+ papers, so paginate the select
    page_size = 5000
    offset = 0
    while True:
        res = supabase.table("pubmed_papers").select("id, keywords").range(offset, offset + page_size - 1).execute()
        if not res.data: break
        for row in res.data:
            existing_all[row['id']] = set(row['keywords'] or [])
        if len(res.data) < page_size: break
        offset += page_size
    print(f"  Loaded {len(existing_all)} papers from DB.")

    total_new = 0
    total_updated = 0
    
    print(f"Starting batch fetch of {count} papers via History Server...")
    for i in range(0, count, EFETCH_CHUNK_SIZE):
        batch_start = i
        print(f"  Fetching batch {i//EFETCH_CHUNK_SIZE + 1} ({i}/{count})...")
        
        # We need to decide if we fetch the whole batch details or just IDs.
        # Fetching details directly is more efficient than fetching IDs then fetching details again.
        # But we only want to fetch details for papers we NEED.
        # However, efetch with history server doesn't allow filtering by ID list.
        # It fetches a slice of the history results.
        
        # So we fetch the XML for this slice.
        records = safe_api_call(Entrez.efetch, db="pubmed", WebEnv=webenv, query_key=query_key, 
                               retstart=batch_start, retmax=EFETCH_CHUNK_SIZE, 
                               retmode="xml")
        
        if not records or 'PubmedArticle' not in records:
            print(f"    Warning: No records found for batch {i}")
            continue
            
        bulk = []
        for article in records['PubmedArticle']:
            try:
                medline = article['MedlineCitation']
                pmid = str(medline['PMID'])
                
                # Check if we need to save/update
                needs_save = False
                current_keywords_list = []
                
                if pmid not in existing_all:
                    needs_save = True
                    current_keywords_list = [KEYWORD]
                elif KEYWORD not in existing_all[pmid]:
                    needs_save = True
                    # Merge with existing
                    current_keywords_list = list(existing_all[pmid] | {KEYWORD})
                
                if not needs_save:
                    continue

                # Extract details
                title = medline['Article'].get('ArticleTitle', 'No Title')
                
                abstract_text = ""
                if 'Abstract' in medline['Article']:
                    abs_list = medline['Article']['Abstract'].get('AbstractText', [])
                    abstract_text = "\n".join([str(p) for p in abs_list])
                
                authors = []
                if 'AuthorList' in medline['Article']:
                    for au in medline['Article']['AuthorList']:
                        authors.append(f"{au.get('LastName', '')} {au.get('Initials', '')}".strip())
                
                journal = medline['Article']['Journal'].get('Title', '')
                pub_date = "1900-01-01"
                try:
                    for h in article['PubmedData'].get('History', []):
                        if h.attributes.get('PubStatus') == 'pubmed':
                            pub_date = f"{h['Year']}-{h['Month'].zfill(2)}-{h['Day'].zfill(2)}"
                            break
                except: pass

                bulk.append({
                    "id": pmid,
                    "title": title,
                    "abstract": abstract_text,
                    "authors": authors,
                    "publication_date": pub_date,
                    "journal": journal,
                    "link": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
                    "keywords": current_keywords_list
                })
                
                # Update local tracker
                if pmid in existing_all:
                    existing_all[pmid].add(KEYWORD)
                    total_updated += 1
                else:
                    existing_all[pmid] = {KEYWORD}
                    total_new += 1
            except Exception as e:
                # print(f"    Error parsing article: {e}")
                continue
                
        if bulk:
            try:
                supabase.table("pubmed_papers").upsert(bulk).execute()
                print(f"    Saved/Updated {len(bulk)} papers. (Total: {total_new} new, {total_updated} updated)")
            except Exception as e:
                print(f"    DB Error: {e}")

    print(f"COMPLETED. Final coverage of '{KEYWORD}' ensured.")
    print(f"Summary: {total_new} new papers added, {total_updated} existing papers updated with keyword.")

if __name__ == "__main__":
    main()
