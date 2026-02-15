"""One-time script to fix publication_date for all existing papers in DB.
Uses PubMed History[pubmed] date instead of Journal issue date."""
import os
import time
from Bio import Entrez
from supabase import create_client
from dotenv import load_dotenv
from urllib.error import HTTPError

load_dotenv('web/.env.local')
load_dotenv('backend/.env')

Entrez.email = os.getenv("PUBMED_EMAIL", "")
Entrez.api_key = os.getenv("PUBMED_API_KEY", "")
Entrez.tool = "AestheticIntelligence"

REQUEST_INTERVAL = 1.0
CHUNK_SIZE = 200

supabase = create_client(
    os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)


def get_all_pmids():
    """Fetch all paper IDs from DB."""
    all_ids = []
    offset = 0
    batch = 1000
    while True:
        result = supabase.table("pubmed_papers").select("id").range(offset, offset + batch - 1).execute()
        rows = result.data or []
        if not rows:
            break
        all_ids.extend([r['id'] for r in rows])
        offset += batch
    return all_ids


def fetch_and_fix_dates(pmids):
    total = len(pmids)
    fixed = 0

    for i in range(0, total, CHUNK_SIZE):
        chunk = pmids[i:i+CHUNK_SIZE]
        chunk_num = (i // CHUNK_SIZE) + 1
        total_chunks = (total + CHUNK_SIZE - 1) // CHUNK_SIZE
        print(f"Chunk {chunk_num}/{total_chunks} ({len(chunk)} papers)...")

        time.sleep(REQUEST_INTERVAL)
        try:
            handle = Entrez.efetch(db="pubmed", id=",".join(chunk), retmode="xml")
            records = Entrez.read(handle)
            handle.close()
        except HTTPError as e:
            if e.code in (429, 503):
                print(f"  Rate limited. Waiting 5s...")
                time.sleep(5)
                try:
                    handle = Entrez.efetch(db="pubmed", id=",".join(chunk), retmode="xml")
                    records = Entrez.read(handle)
                    handle.close()
                except Exception:
                    print(f"  Retry failed. Skipping chunk.")
                    continue
            else:
                print(f"  HTTP {e.code}. Skipping chunk.")
                continue
        except Exception as e:
            print(f"  Error: {e}. Skipping chunk.")
            continue

        articles = records.get('PubmedArticle', [])
        for article in articles:
            try:
                pmid = str(article['MedlineCitation']['PMID'])
                pubdata = article['PubmedData']

                pub_date_str = ""
                for h in pubdata.get('History', []):
                    if h.attributes.get('PubStatus') == 'pubmed':
                        pub_date_str = f"{h['Year']}-{h['Month'].zfill(2)}-{h['Day'].zfill(2)}"
                        break

                if pub_date_str:
                    supabase.table("pubmed_papers").update(
                        {"publication_date": pub_date_str}
                    ).eq("id", pmid).execute()
                    fixed += 1
            except Exception:
                continue

        print(f"  Fixed {fixed} so far.")

    return fixed


def main():
    print("=== Fix PubMed Dates ===")
    print("Fetching all paper IDs from DB...")
    pmids = get_all_pmids()
    print(f"Found {len(pmids)} papers. Updating dates...\n")

    fixed = fetch_and_fix_dates(pmids)
    print(f"\n=== Done. Fixed {fixed} papers. ===")


if __name__ == "__main__":
    main()
