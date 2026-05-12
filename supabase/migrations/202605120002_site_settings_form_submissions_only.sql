create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'submission_status') then
    create type submission_status as enum ('new', 'viewed', 'in_progress', 'closed');
  end if;
end $$;

create or replace function public.is_bhakty_admin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'studio@bhakty.life';
$$;

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_title text not null default 'bhakty.studio',
  meta_description text,
  og_image_url text,
  favicon_url text,
  analytics_id text,
  pixel_id text,
  agency_email text,
  phone text,
  instagram_handle text,
  whatsapp_number text,
  maintenance_mode boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  company text,
  grade_selected text,
  content_type text,
  duration text,
  budget text,
  project_brief text,
  source text,
  status submission_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
alter table public.form_submissions enable row level security;

drop policy if exists "public read site settings" on public.site_settings;
drop policy if exists "admin manage site settings" on public.site_settings;
drop policy if exists "public create form submissions" on public.form_submissions;
drop policy if exists "admin read form submissions" on public.form_submissions;
drop policy if exists "admin update form submissions" on public.form_submissions;
drop policy if exists "admin delete form submissions" on public.form_submissions;

create policy "public read site settings"
on public.site_settings
for select
to anon, authenticated
using (true);

create policy "admin manage site settings"
on public.site_settings
for all
to authenticated
using (public.is_bhakty_admin())
with check (public.is_bhakty_admin());

create policy "public create form submissions"
on public.form_submissions
for insert
to anon, authenticated
with check (true);

create policy "admin read form submissions"
on public.form_submissions
for select
to authenticated
using (public.is_bhakty_admin());

create policy "admin update form submissions"
on public.form_submissions
for update
to authenticated
using (public.is_bhakty_admin())
with check (public.is_bhakty_admin());

create policy "admin delete form submissions"
on public.form_submissions
for delete
to authenticated
using (public.is_bhakty_admin());

insert into public.site_settings (
  site_title,
  meta_description,
  agency_email,
  phone,
  instagram_handle,
  whatsapp_number
)
select
  'bhakty.studio',
  'AI filmmaking studio for brands, artists, and storytellers.',
  'hello@bhakty.studio',
  '+91 99581 94155',
  '@notshaam',
  '+91 99581 94155'
where not exists (select 1 from public.site_settings);
