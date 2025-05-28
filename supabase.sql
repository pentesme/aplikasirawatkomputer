-- ========================================
-- EXTENSION
-- ========================================
create extension if not exists pgcrypto;

-- ========================================
-- TABLE: appointments
-- ========================================
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  email text not null check (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  ),
  perangkat text not null check (
    perangkat in ('Laptop','PC')
  ),
  permintaan text not null check (
    permintaan in (
      'Install Ulang Windows (Crack/Original)',
      'Aktivasi Windows/Office (Crack/Original)',
      'Perawatan Murni (Pembersihan Fisik & Windows)',
      'Perawatan Dengan Install'
    )
  ),
  tambahan jsonb,
  aplikasi_custom text[] check (cardinality(aplikasi_custom) <= 10),
  tanggal date not null,
  jam text not null check (
    jam in ('09.00–11.00','11.00–13.00','13.30–15.30','16.00–18.00','19.00–21.00')
  ),
  status text default 'pending' check (
    status in ('pending','confirmed','done')
  ),
  lokasi_user jsonb not null check (
    lokasi_user ? 'lat' and lokasi_user ? 'lng'
  ),
  created_at timestamptz default timezone('Asia/Makassar', now()),
  review text,
  constraint unique_appointment_per_slot unique (tanggal, jam)
);

-- ========================================
-- TABLE: holidays (disederhanakan)
-- ========================================
create table if not exists holidays (
  id uuid primary key default gen_random_uuid(),
  value text not null check (
    value ~ '^\d{4}-\d{2}-\d{2}$' or
    lower(value) in ('senin','selasa','rabu','kamis','jumat','sabtu','minggu')
  ),
  jam text check (
    jam is null or jam in ('09.00–11.00','11.00–13.00','13.30–15.30','16.00–18.00','19.00–21.00')
  ),
  repeat boolean not null default false,
  reason text,
  created_at timestamptz default timezone('Asia/Makassar', now())
);

-- ========================================
-- INDEXES
-- ========================================
create index if not exists idx_appointments_tanggal_jam on appointments (tanggal, jam);
create index if not exists idx_appointments_created_at on appointments (created_at);
create index if not exists idx_holidays_value_repeat on holidays (value, repeat);

-- ========================================
-- RLS & POLICIES
-- ========================================
alter table appointments enable row level security;
alter table holidays enable row level security;

drop policy if exists "Public can insert" on appointments;
drop policy if exists "Public can read" on appointments;
drop policy if exists "Admin only manage appointments" on appointments;
drop policy if exists "Public can read holidays" on holidays;
drop policy if exists "Admin manage holidays" on holidays;

create policy "Public can insert" on appointments for insert with check (true);
create policy "Public can read" on appointments for select using (true);
create policy "Admin only manage appointments" on appointments for all
  using (is_admin()) with check (is_admin());

create policy "Public can read holidays" on holidays for select using (true);
create policy "Admin manage holidays" on holidays for all
  using (is_admin()) with check (is_admin());

-- ========================================
-- FUNCTION: cek_radius_lokasi
-- ========================================
create or replace function cek_radius_lokasi()
returns trigger as $$
declare
  pusat_lat float := -3.339314;
  pusat_lng float := 114.618955;
  jarak_km float;
begin
  select
    6371 * acos(
      cos(radians(pusat_lat)) *
      cos(radians((NEW.lokasi_user->>'lat')::float)) *
      cos(radians((NEW.lokasi_user->>'lng')::float) - radians(pusat_lng)) +
      sin(radians(pusat_lat)) *
      sin(radians((NEW.lokasi_user->>'lat')::float))
    )
  into jarak_km;

  if jarak_km > 36 then
    raise exception 'Lokasi di luar jangkauan layanan (%.2f km)', jarak_km;
  end if;

  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trigger_cek_radius on appointments;
create trigger trigger_cek_radius
  before insert on appointments
  for each row execute procedure cek_radius_lokasi();

-- ========================================
-- FUNCTION: cek_holiday (disederhanakan)
-- ========================================
create or replace function cek_holiday()
returns trigger as $$
declare
  var_date text := to_char(NEW.tanggal, 'YYYY-MM-DD');
  var_dow  int := extract(dow from NEW.tanggal at time zone 'Asia/Makassar')::int;
  var_wday text := case var_dow
    when 1 then 'senin'
    when 2 then 'selasa'
    when 3 then 'rabu'
    when 4 then 'kamis'
    when 5 then 'jumat'
    when 6 then 'sabtu'
    when 0 then 'minggu'
  end;
  cnt integer;
begin
  select count(*) into cnt from holidays
  where (
    -- libur tanggal spesifik (repeat = false)
    value = var_date and repeat = false
    and (jam is null or jam = NEW.jam)
  )
  or (
    -- libur mingguan berulang
    value = var_wday and repeat = true
    and (jam is null or jam = NEW.jam)
  );

  if cnt > 0 then
    raise exception 'Tanggal dan slot ini sedang libur: % %', NEW.tanggal, NEW.jam;
  end if;

  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trigger_cek_holiday on appointments;
create trigger trigger_cek_holiday
  before insert or update on appointments
  for each row execute procedure cek_holiday();

-- ========================================
-- FUNCTION: update_status_otomatis
-- ========================================
create or replace function update_status_otomatis()
returns void as $$
declare
  now_time time := (current_time at time zone 'Asia/Makassar');
  now_date date := (current_date at time zone 'Asia/Makassar');
begin
  update appointments set status = 'done'
  where status = 'confirmed'
    and (
      tanggal < now_date
      or (tanggal = now_date and (
        (jam = '09.00–11.00' and now_time > time '11:00') or
        (jam = '11.00–13.00' and now_time > time '13:00') or
        (jam = '13.30–15.30' and now_time > time '15:30') or
        (jam = '16.00–18.00' and now_time > time '18:00') or
        (jam = '19.00–21.00' and now_time > time '21:00')
      ))
    );
end;
$$ language plpgsql;

-- ========================================
-- FUNCTION: get_current_time
-- ========================================
create or replace function get_current_time()
returns timestamptz as $$
begin
  return now() at time zone 'Asia/Makassar';
end;
$$ language plpgsql;
