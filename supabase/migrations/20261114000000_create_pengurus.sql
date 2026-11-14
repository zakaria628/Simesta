create sequence if not exists public.pengurus_kode_seq;

create table if not exists public.pengurus (
  id uuid primary key default gen_random_uuid(),
  kode_pengurus text not null unique
    default ('PGS-' || lpad(nextval('public.pengurus_kode_seq')::text, 5, '0')),
  nama_lengkap text not null,
  nik text not null unique check (nik ~ '^[0-9]{16}$'),
  jenis_kelamin text not null check (jenis_kelamin in ('Laki-laki', 'Perempuan')),
  tempat_lahir text not null,
  tanggal_lahir date not null,
  alamat text not null,
  nomor_hp text not null,
  foto_path text,
  jabatan text not null,
  bagian text not null,
  tanggal_mulai date not null,
  status text not null default 'Aktif' check (status in ('Aktif', 'Nonaktif')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_pengurus_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger pengurus_set_updated_at
before update on public.pengurus
for each row
execute function public.set_pengurus_updated_at();

alter table public.pengurus enable row level security;

create policy "Authenticated users can read pengurus"
  on public.pengurus for select to authenticated using (true);
create policy "Authenticated users can add pengurus"
  on public.pengurus for insert to authenticated with check (true);
create policy "Authenticated users can update pengurus"
  on public.pengurus for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete pengurus"
  on public.pengurus for delete to authenticated using (true);

grant select, insert, update, delete on public.pengurus to authenticated;
grant usage, select on sequence public.pengurus_kode_seq to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pengurus-profile',
  'pengurus-profile',
  false,
  3145728,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Authenticated users can view pengurus profile photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'pengurus-profile');
create policy "Users can upload photos to their own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'pengurus-profile'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "Users can update photos in their own folder"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'pengurus-profile'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'pengurus-profile'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "Users can delete photos in their own folder"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'pengurus-profile'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
