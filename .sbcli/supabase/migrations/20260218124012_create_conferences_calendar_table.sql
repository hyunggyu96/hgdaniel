-- Calendar source of truth for web/mobile conferences

create table if not exists conferences (
    id text primary key,
    series text not null,
    name_ko text not null,
    name_en text not null,
    start_date date not null,
    end_date date not null,
    city_ko text not null,
    city_en text not null,
    country_ko text not null,
    country_en text not null,
    venue text not null,
    confirmed boolean not null default true,
    url text not null,
    source text not null default 'manual',
    is_active boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint conferences_date_check check (end_date >= start_date),
    constraint conferences_name_date_city_unique unique (name_en, start_date, city_en)
);

create index if not exists conferences_start_date_idx on conferences (start_date);
create index if not exists conferences_series_idx on conferences (series);
create index if not exists conferences_country_en_idx on conferences (country_en);
create index if not exists conferences_active_start_date_idx on conferences (is_active, start_date);

create or replace function set_conferences_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

drop trigger if exists trg_conferences_updated_at on conferences;
create trigger trg_conferences_updated_at
before update on conferences
for each row
execute function set_conferences_updated_at();

alter table conferences enable row level security;

do $$
begin
    drop policy "Enable read access for all users" on conferences;
exception
    when undefined_object then null;
end $$;

create policy "Enable read access for all users" on conferences
for select using (true);

insert into conferences (
    id,
    series,
    name_ko,
    name_en,
    start_date,
    end_date,
    city_ko,
    city_en,
    country_ko,
    country_en,
    venue,
    confirmed,
    url,
    source,
    is_active
)
values
('imcas-world-2025', 'IMCAS', 'IMCAS World Congress 2025', 'IMCAS World Congress 2025', '2025-01-30', '2025-02-01', 'Paris', 'Paris', 'France', 'France', 'Palais des Congres de Paris', true, 'https://www.imcas.com/en/imcas-world-congress-2025', 'legacy_web_static', true),
('amwc-americas-2025', 'AMWC', 'AMWC Americas 2025', 'AMWC Americas 2025', '2025-02-15', '2025-02-17', 'Miami', 'Miami', 'USA', 'USA', 'TBD', true, 'https://www.amwcamericas.com/en/practical-info/cme-accreditation.html', 'legacy_web_static', true),
('aad-annual-2025', 'AAD', 'AAD Annual Meeting 2025', 'AAD Annual Meeting 2025', '2025-03-07', '2025-03-11', 'Orlando', 'Orlando', 'USA', 'USA', 'TBD', false, 'https://www.aad.org/member/meetings/archive', 'legacy_web_static', true),
('aesthetic-meet-2025', 'Aesthetic MEET', 'The Aesthetic MEET 2025', 'The Aesthetic MEET 2025', '2025-03-20', '2025-03-23', 'Austin', 'Austin', 'USA', 'USA', 'TBD', true, 'https://www.theaestheticmeet.org/info/', 'legacy_web_static', true),
('amwc-monaco-2025', 'AMWC', 'AMWC Monaco 2025', 'AMWC Monaco 2025', '2025-03-27', '2025-03-29', 'Monte Carlo', 'Monte Carlo', 'Monaco', 'Monaco', 'Grimaldi Forum', true, 'https://www.amwc-conference.com/content/dam/markets/aest/amwc-conference/2025/pdf/amwc2025-program-new.pdf', 'legacy_web_static', true),
('dubai-derma-2025', 'Dubai Derma', 'Dubai Derma 2025', 'Dubai Derma 2025', '2025-04-14', '2025-04-16', 'Dubai', 'Dubai', 'UAE', 'UAE', 'Dubai World Trade Centre', true, 'https://www.dubaiderma.com/', 'legacy_web_static', true),
('sime-congress-2025', 'SIME', 'SIME Congress 2025', 'SIME Congress 2025', '2025-05-16', '2025-05-18', 'Rome', 'Rome', 'Italy', 'Italy', 'TBD', true, 'https://www.simecongress.com/', 'legacy_web_static', true),
('fivecc-2025', '5CC', '5-Continent Congress 2025', '5-Continent Congress 2025', '2025-05-29', '2025-05-31', 'Lisbon', 'Lisbon', 'Portugal', 'Portugal', 'TBD', true, 'https://www.5-cc.com/', 'legacy_web_static', true),
('vegas-cosmetic-surgery-2025', 'VCS', 'Vegas Cosmetic Surgery 2025', 'Vegas Cosmetic Surgery 2025', '2025-05-29', '2025-05-31', 'Las Vegas', 'Las Vegas', 'USA', 'USA', 'TBD', true, 'https://www.vegascosmeticsurgery.com/en/scientific-program/accreditation.html', 'legacy_web_static', true),
('eadv-congress-2025', 'EADV', 'EADV Congress 2025', 'EADV Congress 2025', '2025-09-17', '2025-09-20', 'Paris', 'Paris', 'France', 'France', 'TBD', true, 'https://eadv.org/event/sessions-at-the-eadv-congress-2025/', 'legacy_web_static', true),
('ccr-london-2025', 'CCR London', 'CCR London 2025', 'CCR London 2025', '2025-09-25', '2025-09-26', 'London', 'London', 'United Kingdom', 'United Kingdom', 'ExCeL London', true, 'https://www.ccrlondon.com/', 'legacy_web_static', true),
('global-aesthetics-conference-2025', 'Global Aesthetics Conference', 'Global Aesthetics Conference 2025', 'Global Aesthetics Conference 2025', '2025-10-30', '2025-11-02', 'Miami Beach', 'Miami Beach', 'USA', 'USA', 'Loews Miami Beach Hotel', true, 'https://globalaestheticsconference.com/', 'legacy_web_static', true),
('asds-annual-meeting-2025', 'ASDS', 'ASDS Annual Meeting 2025', 'ASDS Annual Meeting 2025', '2025-11-13', '2025-11-16', 'Chicago', 'Chicago', 'USA', 'USA', 'TBD', true, 'https://www.asds.net/AnnualMeeting', 'legacy_web_static', true),
('toxins-2026', 'TOXINS', 'TOXINS 2026', 'TOXINS 2026', '2026-01-14', '2026-01-17', 'Madrid', 'Madrid', 'Spain', 'Spain', 'TBD', true, 'https://www.neurotoxins.org/', 'legacy_web_static', true),
('imcas-world-2026', 'IMCAS', 'IMCAS World Congress 2026', 'IMCAS World Congress 2026', '2026-01-29', '2026-01-31', 'Paris', 'Paris', 'France', 'France', 'Palais des Congres de Paris', true, 'https://www.imcas.com/en/imcas-world-congress-2026', 'legacy_web_static', true),
('south-beach-symposium-2026', 'South Beach Symposium', 'South Beach Symposium 2026', 'South Beach Symposium 2026', '2026-02-05', '2026-02-08', 'Miami Beach', 'Miami Beach', 'USA', 'USA', 'Loews Miami Beach Hotel', true, 'https://www.southbeachsymposium.org/', 'legacy_web_static', true),
('amwc-americas-2026', 'AMWC', 'AMWC Americas 2026', 'AMWC Americas 2026', '2026-02-14', '2026-02-16', 'Miami', 'Miami', 'USA', 'USA', 'JW Marriott Miami Turnberry Resort', true, 'https://www.amwcamericas.com/en/aesthetic-medicine-conference-miami-2026/aesthetic-medicine-conference-miami-2026.html', 'legacy_web_static', true),
('ace-london-2026', 'ACE', 'ACE London 2026', 'ACE London 2026', '2026-03-13', '2026-03-14', 'London', 'London', 'United Kingdom', 'United Kingdom', 'Business Design Centre', true, 'https://www.aestheticsconference.com/ace-london-2026/', 'legacy_web_static', true),
('imcas-americas-2026', 'IMCAS', 'IMCAS Americas 2026', 'IMCAS Americas 2026', '2026-03-13', '2026-03-15', 'Sao Paulo', 'Sao Paulo', 'Brazil', 'Brazil', 'The World Trade Center Sao Paulo', true, 'https://www.imcas.com/en/imcas-americas-2026', 'legacy_web_static', true),
('kimes-2026', 'KIMES', 'KIMES 2026', 'KIMES 2026', '2026-03-19', '2026-03-22', 'Seoul', 'Seoul', 'South Korea', 'South Korea', 'COEX', true, 'https://kimes.kr/en', 'legacy_web_static', true),
('amwc-monaco-2026', 'AMWC', 'AMWC Monaco 2026', 'AMWC Monaco 2026', '2026-03-26', '2026-03-28', 'Monte Carlo', 'Monte Carlo', 'Monaco', 'Monaco', 'Grimaldi Forum', true, 'https://www.amwc-conference.com/en/home.html', 'legacy_web_static', true),
('aad-annual-2026', 'AAD', 'AAD Annual Meeting 2026', 'AAD Annual Meeting 2026', '2026-03-27', '2026-03-31', 'Denver', 'Denver', 'USA', 'USA', 'TBD', true, 'https://www.aad.org/member/meetings-education/am26', 'legacy_web_static', true),
('dubai-derma-2026', 'Dubai Derma', 'Dubai Derma 2026', 'Dubai Derma 2026', '2026-03-31', '2026-04-02', 'Dubai', 'Dubai', 'UAE', 'UAE', 'Dubai World Trade Centre', true, 'https://www.dubaiderma.com/', 'legacy_web_static', true),
('aps-korea-2026', 'APS Korea', 'APS Korea 2026', 'APS Korea 2026', '2026-04-04', '2026-04-05', 'Seoul', 'Seoul', 'South Korea', 'South Korea', 'COEX (TBD)', false, 'https://www.apskorea.or.kr', 'legacy_web_static', true),
('idax-2026', 'IDAX', 'IDAX 2026', 'IDAX 2026', '2026-04-09', '2026-04-11', 'Hanoi', 'Hanoi', 'Vietnam', 'Vietnam', 'NECC', true, 'https://www.idaxexpo.com', 'legacy_web_static', true),
('ceswam-2026', 'SWAM', 'CeSWAM 2026', 'CeSWAM 2026', '2026-04-17', '2026-04-19', 'Semarang', 'Semarang', 'Indonesia', 'Indonesia', 'Padma Hotel', true, 'https://swam.id', 'legacy_web_static', true),
('amwc-asia-2026', 'AMWC', 'AMWC Asia 2026', 'AMWC Asia 2026', '2026-05-01', '2026-05-03', 'Taipei', 'Taipei', 'Taiwan', 'Taiwan', 'Taipei Intl Convention Center', true, 'https://www.amwc-asia.com', 'legacy_web_static', true),
('bcam-conference-2026', 'BCAM', 'BCAM Conference 2026', 'BCAM Conference 2026', '2026-05-02', '2026-05-02', 'London', 'London', 'United Kingdom', 'United Kingdom', 'Royal College of Physicians', true, 'https://bcam.ac.uk/events-calendar/', 'legacy_web_static', true),
('scale-nashville-2026', 'SCALE', 'SCALE Nashville 2026', 'SCALE Nashville 2026', '2026-05-13', '2026-05-17', 'Nashville', 'Nashville', 'USA', 'USA', 'Music City Center', true, 'https://www.scalemusiccity.com/', 'legacy_web_static', true),
('cbe-2026', 'CBE', 'CBE 2026 (China Beauty Expo)', 'CBE 2026 (China Beauty Expo)', '2026-05-12', '2026-05-14', 'Shanghai', 'Shanghai', 'China', 'China', 'SNIEC', true, 'https://www.chinabeautyexpo.com', 'legacy_web_static', true),
('vegas-cosmetic-surgery-2026', 'VCS', 'Vegas Cosmetic Surgery 2026', 'Vegas Cosmetic Surgery 2026', '2026-05-28', '2026-05-30', 'Las Vegas', 'Las Vegas', 'USA', 'USA', 'Fontainebleau Las Vegas', true, 'https://www.vegascosmeticsurgery.com/', 'legacy_web_static', true),
('weswam-2026', 'SWAM', 'WeSWAM 2026', 'WeSWAM 2026', '2026-06-12', '2026-06-14', 'Bandung', 'Bandung', 'Indonesia', 'Indonesia', 'El Hotel', true, 'https://swam.id', 'legacy_web_static', true),
('korea-derma-2026', 'Korea Derma', 'Korea Derma 2026', 'Korea Derma 2026', '2026-06-15', '2026-06-17', 'Seoul', 'Seoul', 'South Korea', 'South Korea', 'The-K Hotel (TBD)', false, 'https://www.koderma.co.kr', 'legacy_web_static', true),
('amwc-brazil-2026', 'AMWC', 'AMWC Brazil 2026', 'AMWC Brazil 2026', '2026-06-17', '2026-06-19', 'Sao Paulo', 'Sao Paulo', 'Brazil', 'Brazil', 'Frei Caneca Convention Center', true, 'https://www.amwcbrazil.com.br', 'legacy_web_static', true),
('amwc-korea-2026', 'AMWC', 'AMWC Korea 2026', 'AMWC Korea 2026', '2026-06-19', '2026-06-20', 'Seoul', 'Seoul', 'South Korea', 'South Korea', 'InterContinental Grand Seoul Parnas', true, 'https://www.amwc-korea.com', 'legacy_web_static', true),
('imcas-asia-2026', 'IMCAS', 'IMCAS Asia 2026', 'IMCAS Asia 2026', '2026-06-19', '2026-06-21', 'Bangkok', 'Bangkok', 'Thailand', 'Thailand', 'The Athenee Hotel', true, 'https://www.imcas.com/en/imcas-asia-2026', 'legacy_web_static', true),
('hksdv-2026', 'HKSDV', 'HKSDV Annual Meeting 2026', 'HKSDV Annual Meeting 2026', '2026-07-04', '2026-07-05', 'Hong Kong', 'Hong Kong', 'Hong Kong', 'Hong Kong', 'Sheraton Hong Kong Hotel', true, 'https://www.hksdv.org', 'legacy_web_static', true),
('iswam-bali-2026', 'SWAM', '8th i-SWAM Bali 2026', '8th i-SWAM Bali 2026', '2026-07-10', '2026-07-12', 'Bali', 'Bali', 'Indonesia', 'Indonesia', 'The Trans Resort Bali', true, 'https://www.internationalswam.com', 'legacy_web_static', true),
('vietbeauty-2026', 'Vietbeauty', 'Vietbeauty 2026', 'Vietbeauty 2026', '2026-07-23', '2026-07-26', 'Ho Chi Minh City', 'Ho Chi Minh City', 'Vietnam', 'Vietnam', 'SECC', true, 'https://www.vietbeautyshow.com', 'legacy_web_static', true),
('imcas-china-2026', 'IMCAS', 'IMCAS China 2026', 'IMCAS China 2026', '2026-08-27', '2026-08-29', 'Shanghai', 'Shanghai', 'China', 'China', 'W Hotel - The Bund', true, 'https://www.imcas.com/en/imcas-china-2026', 'legacy_web_static', true),
('medical-fair-asia-2026', 'Medical Fair Asia', 'Medical Fair Asia 2026', 'Medical Fair Asia 2026', '2026-09-09', '2026-09-11', 'Singapore', 'Singapore', 'Singapore', 'Singapore', 'Marina Bay Sands', true, 'https://www.medicalfair-asia.com', 'legacy_web_static', true),
('easwam-2026', 'SWAM', 'EaSWAM 2026', 'EaSWAM 2026', '2026-09-25', '2026-09-27', 'Surabaya', 'Surabaya', 'Indonesia', 'Indonesia', 'Dyandra Convention Ctr', true, 'https://swam.id', 'legacy_web_static', true),
('eadv-congress-2026', 'EADV', 'EADV Congress 2026', 'EADV Congress 2026', '2026-09-30', '2026-10-03', 'Vienna', 'Vienna', 'Austria', 'Austria', 'TBD', true, 'https://eadvcongress2026.org/', 'legacy_web_static', true),
('ccr-london-2026', 'CCR London', 'CCR London 2026', 'CCR London 2026', '2026-10-01', '2026-10-02', 'London', 'London', 'United Kingdom', 'United Kingdom', 'ExCeL London', true, 'https://www.ccrlondon.com/', 'legacy_web_static', true),
('medical-japan-2026', 'Medical Japan', 'Medical Japan Tokyo 2026', 'Medical Japan Tokyo 2026', '2026-10-07', '2026-10-09', 'Tokyo', 'Tokyo', 'Japan', 'Japan', 'Makuhari Messe', true, 'https://www.medical-jpn.jp/tokyo/en-gb.html', 'legacy_web_static', true),
('amwc-china-2026', 'AMWC', 'AMWC China 2026', 'AMWC China 2026', '2026-10-16', '2026-10-18', 'Chengdu', 'Chengdu', 'China', 'China', 'Wuzhouqing Convention Center', true, 'https://www.amwcchina.com', 'legacy_web_static', true),
('amwc-dubai-2026', 'AMWC', 'AMWC Dubai 2026', 'AMWC Dubai 2026', '2026-10-21', '2026-10-23', 'Dubai', 'Dubai', 'UAE', 'UAE', 'TBD', true, 'https://www.amwc-dubai.com', 'legacy_web_static', true),
('dasil-2026', 'DASIL', 'DASIL 2026', 'DASIL 2026', '2026-10-28', '2026-10-31', 'Kochi', 'Kochi', 'India', 'India', 'TBD', true, 'https://www.dasil.org', 'legacy_web_static', true),
('amwc-latam-2026', 'AMWC', 'AMWC Latin America 2026', 'AMWC Latin America 2026', '2026-10-29', '2026-10-31', 'Medellin', 'Medellin', 'Colombia', 'Colombia', 'TBD', true, 'https://www.amwc-la.com', 'legacy_web_static', true),
('prs-korea-2026', 'PRS Korea', 'PRS Korea 2026', 'PRS Korea 2026', '2026-11-05', '2026-11-07', 'Seoul', 'Seoul', 'South Korea', 'South Korea', 'Grand InterContinental Seoul', true, 'https://www.prskorea.org', 'legacy_web_static', true),
('cosmoprof-asia-2026', 'Cosmoprof Asia', 'Cosmoprof Asia 2026', 'Cosmoprof Asia 2026', '2026-11-10', '2026-11-13', 'Hong Kong', 'Hong Kong', 'Hong Kong', 'Hong Kong', 'HKCEC & AsiaWorld', true, 'https://www.cosmoprof-asia.com', 'legacy_web_static', true),
('icad-bangkok-2026', 'ICAD Bangkok', 'ICAD Bangkok 2026', 'ICAD Bangkok 2026', '2026-11-20', '2026-11-22', 'Bangkok', 'Bangkok', 'Thailand', 'Thailand', 'Centara Grand (TBD)', false, 'https://www.icadbangkok.com', 'legacy_web_static', true),
('amwc-sea-2026', 'AMWC', 'AMWC Southeast Asia 2026', 'AMWC Southeast Asia 2026', '2026-11-26', '2026-11-28', 'Bangkok', 'Bangkok', 'Thailand', 'Thailand', 'The Athenee Hotel', true, 'https://www.amwc-southeastasia.com', 'legacy_web_static', true),
('iswam-world-2026', 'SWAM', '17th i-SWAM World Congress 2026', '17th i-SWAM World Congress 2026', '2026-12-04', '2026-12-06', 'Tangerang', 'Tangerang', 'Indonesia', 'Indonesia', 'ICE BSD City', true, 'https://www.internationalswam.com', 'legacy_web_static', true)
on conflict (id)
do update set
    series = excluded.series,
    name_ko = excluded.name_ko,
    name_en = excluded.name_en,
    start_date = excluded.start_date,
    end_date = excluded.end_date,
    city_ko = excluded.city_ko,
    city_en = excluded.city_en,
    country_ko = excluded.country_ko,
    country_en = excluded.country_en,
    venue = excluded.venue,
    confirmed = excluded.confirmed,
    url = excluded.url,
    source = excluded.source,
    is_active = excluded.is_active,
    updated_at = timezone('utc'::text, now());
