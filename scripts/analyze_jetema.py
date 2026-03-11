import json, sys
sys.stdout.reconfigure(encoding='utf-8')

def norm(s):
    """Normalize permit number by removing all spaces."""
    return s.replace(' ', '').replace('\u3000', '') if s else ''

# Load all 조직수복용생체재료 from 품목정보 API (619 records)
all_tissue = []
for page in [1, 2]:
    with open(f'C:/Users/jonat/tmp_tissue{page}.json', 'r', encoding='utf-8') as f:
        d = json.load(f)
    for entry in d.get('body', {}).get('items', []):
        if isinstance(entry, dict) and 'item' in entry:
            all_tissue.append(entry['item'])
        else:
            all_tissue.append(entry)

# Build permit number -> product info mapping
brand_map = {}
for it in all_tissue:
    key = norm(it.get('MEDDEV_ITEM_NO', '') or '')
    brand_map[key] = {
        'brand': it.get('PRDT_NM_INFO') or '',
        'model': it.get('TYPE_INFO') or '',
        'mnsc': it.get('MNSC_NM') or '',
        'clnt': it.get('MNFT_CLNT_NM') or '',
    }

# Load Jetema permits from 품목허가 API (75 records)
with open('C:/Users/jonat/tmp_jetema.json', 'r', encoding='utf-8') as f:
    permits = json.load(f)

active = []
cancelled = 0
for i in permits['body']['items']:
    it = i['item']
    if it.get('RTRCN_DSCTN_DIVS_CD', '') == '2':
        cancelled += 1
    else:
        active.append(it)

print('=' * 80)
print(f'제테마 (주) - 전체 {len(permits["body"]["items"])}건, 활성 {len(active)}건, 취소 {cancelled}건')
print('=' * 80)

categories = {}
for it in active:
    prod = it.get('PRDUCT', '')
    no_raw = it.get('PRDUCT_PRMISN_NO', '')
    no_key = norm(no_raw)
    dt = it.get('PRMISN_DT', '')
    info = brand_map.get(no_key, {})

    if prod not in categories:
        categories[prod] = []
    categories[prod].append({
        'no': no_raw, 'dt': dt,
        'brand': info.get('brand', ''),
        'model': info.get('model', ''),
        'clnt': info.get('clnt', ''),
    })

for cat, items in sorted(categories.items()):
    print(f'\n--- {cat} ({len(items)}건) ---')
    for it in sorted(items, key=lambda x: x['dt']):
        dt_fmt = f"{it['dt'][:4]}-{it['dt'][4:6]}-{it['dt'][6:]}" if len(it['dt']) == 8 else it['dt']
        brand = it['brand'] if it['brand'] else '-'
        if '외' in it['model']:
            model_count = it['model'].split('외')[1].strip().replace('건', '')
        else:
            model_count = '1' if it['model'] else '?'
        print(f"  {it['no']:20s} | {dt_fmt} | 모델:{model_count:>4s}건 | 브랜드: {brand[:150]}")
        if it['clnt']:
            print(f"  {'':20s}   OEM 위탁자: {it['clnt']}")
