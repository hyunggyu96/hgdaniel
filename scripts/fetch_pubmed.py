import os
import time
import asyncio
from typing import List, Dict, Any
from datetime import datetime
from Bio import Entrez
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv('web/.env.local')
# Also try loading from backend/.env if needed, or root .env
load_dotenv('backend/.env')

# Configuration
PUBMED_API_KEY = os.getenv("PUBMED_API_KEY", "")
PUBMED_EMAIL = os.getenv("PUBMED_EMAIL", "")
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # Use Service Role for writing

# Keywords
KEYWORDS = [
    'botulinum toxin', 
    'Ha filler', 
    'polynucleotide(PN)', 
    'polydeoxyribonucleotide (pdrn)', 
    'exosome', 
    'PLLA', 
    'PDLLA', 
    'CaHA'
]

TARGET_COUNT = 5000

# Setup Entrez
Entrez.email = PUBMED_EMAIL
Entrez.api_key = PUBMED_API_KEY

def init_supabase() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Supabase URL or Key is missing. Check .env files.")
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_pubmed_ids(keyword: str, max_results: int = 100) -> List[str]:
    print(f"Searching for '{keyword}'...")
    try:
        handle = Entrez.esearch(db="pubmed", term=keyword, retmax=max_results, sort="date")
        record = Entrez.read(handle)
        handle.close()
        return record["IdList"]
    except Exception as e:
        print(f"Error searching '{keyword}': {e}")
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
            print(f"Warning: could not check existing IDs: {e}")
    new_pmids = [pid for pid in pmids if pid not in existing_ids]
    return new_pmids

def fetch_details_and_save(supabase: Client, keyword: str, pmids: List[str]):
    if not pmids:
        return

    # Skip already collected papers
    new_pmids = filter_new_pmids(supabase, pmids)
    skipped = len(pmids) - len(new_pmids)
    print(f"Found {len(pmids)} total, {skipped} already in DB, {len(new_pmids)} new papers to fetch.")

    if not new_pmids:
        print(f"No new papers for '{keyword}'. Skipping.")
        return

    chunk_size = 100
    total = len(new_pmids)

    print(f"Fetching details for {total} new papers for '{keyword}'...")

    for i in range(0, total, chunk_size):
        chunk = new_pmids[i:i+chunk_size]
        try:
            handle = Entrez.efetch(db="pubmed", id=",".join(chunk), retmode="xml")
            records = Entrez.read(handle)
            handle.close()

            papers_to_upsert = []
            
            # Entrez returns a list of PubmedArticle or PubmedBookArticle
            articles = records.get('PubmedArticle', [])
            
            for article in articles:
                medline = article['MedlineCitation']
                article_data = article['PubmedData']
                
                pmid = str(medline['PMID'])
                
                # Title
                title = medline['Article']['ArticleTitle']
                
                # Abstract
                abstract_text = ""
                if 'Abstract' in medline['Article'] and 'AbstractText' in medline['Article']['Abstract']:
                    abs_list = medline['Article']['Abstract']['AbstractText']
                    # abstract can be a list of strings or objects
                    parts = []
                    for item in abs_list:
                        if hasattr(item, 'title'): # Attributes like 'Label'
                            label = item.attributes.get('Label', '')
                            text = str(item)
                            if label:
                                parts.append(f"{label}: {text}")
                            else:
                                parts.append(text)
                        else:
                            parts.append(str(item))
                    abstract_text = "\n".join(parts)

                # Authors
                authors_list = []
                if 'AuthorList' in medline['Article']:
                    for au in medline['Article']['AuthorList']:
                        last = au.get('LastName', '')
                        initials = au.get('Initials', '')
                        authors_list.append(f"{last} {initials}".strip())

                # Journal
                journal = medline['Article']['Journal'].get('Title', '')
                
                # PubDate
                pub_date_str = ""
                pub_date = medline['Article']['Journal']['JournalIssue']['PubDate']
                if 'Year' in pub_date:
                    pub_date_str = pub_date['Year']
                    if 'Month' in pub_date:
                        pub_date_str += f"-{pub_date['Month']}"
                
                # Link (DOI or PubMed URL)
                link = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
                ids = article_data.get('ArticleIdList', [])
                for aid in ids:
                    if aid.attributes.get('IdType') == 'doi':
                        # Prefer direct DOI link if needed, but PMID is standard
                        pass

                paper = {
                    "id": pmid,
                    "title": title,
                    "abstract": abstract_text,
                    "authors": authors_list,
                    "publication_date": pub_date_str,
                    "journal": journal,
                    "link": link,
                    # We append the current keyword. 
                    # Note: A paper might be found by multiple keywords. 
                    # We handled this by fetching current keywords first? 
                    # For simplicity, we just upsert. Ideally we merge keywords.
                    "keywords": [keyword] 
                }
                papers_to_upsert.append(paper)

            # Insert new papers to Supabase
            if papers_to_upsert:
                for p in papers_to_upsert:
                    try:
                        supabase.table("pubmed_papers").upsert(p).execute()
                    except Exception as e:
                        print(f"Error upserting {p['id']}: {e}")
            
            # Respect rate limits
            time.sleep(0.4) 

        except Exception as e:
            print(f"Error fetching details for chunk {i}: {e}")
            time.sleep(1)

def main():
    print(f"Starting PubMed Fetch for {len(KEYWORDS)} keywords. Target: {TARGET_COUNT} each.")
    
    try:
        supabase = init_supabase()
    except Exception as e:
        print(f"Supabase Init Failed: {e}")
        return

    for kw in KEYWORDS:
        print(f"\nProcessing keyword: {kw}")
        pmids = fetch_pubmed_ids(kw, TARGET_COUNT)
        print(f"Found {len(pmids)} IDs.")
        if pmids:
            fetch_details_and_save(supabase, kw, pmids)
        
    print("\nJob Complete.")

if __name__ == "__main__":
    main()
