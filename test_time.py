
import datetime
import json

article = {
    'title': '2026년 시작부터 스킨케어 시장은 성분 경쟁 [최기자의 화장품 털기]',
    'created_at': '2026-01-03T15:04:50.964367+00:00',
    'published_at': '2026-01-03T14:34:00+00:00',
    'keyword': '엑소좀'
}

def test_conversion(article):
    pub_date = article.get('published_at', '')
    if pub_date:
        dt = datetime.datetime.fromisoformat(pub_date.replace('Z', '+00:00'))
        pub_date_kst = (dt + datetime.timedelta(hours=9)).strftime("%Y-%m-%d %H:%M:%S")
    else:
        pub_date_kst = ""

    created_at = article.get('created_at', '')
    if created_at:
        try:
            c_dt = datetime.datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            created_at_kst = (c_dt + datetime.timedelta(hours=9)).strftime("%Y-%m-%d %H:%M:%S")
        except Exception as e:
            created_at_kst = f"ERR: {e}"
    else:
        created_at_kst = "EMPTY"

    print(f"Analysis Time (A): {created_at_kst}")
    print(f"Publish Time  (G): {pub_date_kst}")

test_conversion(article)
