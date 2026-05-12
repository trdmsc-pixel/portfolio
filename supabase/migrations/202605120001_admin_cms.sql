create extension if not exists "pgcrypto";

create type submission_status as enum ('new', 'viewed', 'in_progress', 'closed');

create table public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null default 'Studio Owner',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
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
  updated_at timestamptz not null default now()
);

create table public.hero_content (
  id uuid primary key default gen_random_uuid(),
  primary_line text not null,
  secondary_line text not null,
  subtext text,
  cta1_label text,
  cta1_target text,
  cta2_label text,
  cta2_target text,
  background_video_url text,
  about_heading text,
  about_body text,
  portfolio_heading text,
  portfolio_subheading text,
  pricing_heading text,
  pricing_subheading text,
  contact_heading text,
  contact_subheading text,
  footer_tagline text,
  instagram_handle text,
  marquee_text text,
  updated_at timestamptz not null default now()
);

create table public.service_tiers (
  id text primary key,
  name text not null,
  tagline text,
  description text,
  accent_color text not null default '#00e5ff',
  badge text,
  cta_label text,
  starting_price text,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tier_features (
  id uuid primary key default gen_random_uuid(),
  tier_id text not null references public.service_tiers(id) on delete cascade,
  text text not null,
  enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pricing_rows (
  id uuid primary key default gen_random_uuid(),
  tier_id text not null references public.service_tiers(id) on delete cascade,
  service text not null,
  description text,
  price_inr integer,
  suffix text,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  tier text not null,
  thumbnail_url text,
  video_url text,
  description text,
  tags text[] not null default '{}',
  is_featured boolean not null default false,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.video_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  tier text,
  duration text,
  view_count text,
  thumbnail_url text,
  video_url text,
  tags text[] not null default '{}',
  is_featured boolean not null default false,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  cloudinary_public_id text,
  url text not null,
  width integer,
  height integer,
  file_size integer,
  mime_type text,
  tags text[] not null default '{}',
  assigned_section text,
  used_in text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.form_submissions (
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

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  detail text,
  created_at timestamptz not null default now()
);

alter table public.admin_profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.hero_content enable row level security;
alter table public.service_tiers enable row level security;
alter table public.tier_features enable row level security;
alter table public.pricing_rows enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.video_items enable row level security;
alter table public.media_assets enable row level security;
alter table public.form_submissions enable row level security;
alter table public.activity_logs enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where id = auth.uid()
  );
$$;

create policy "admins read admin profiles" on public.admin_profiles for select to authenticated using (public.is_admin());
create policy "admins update own profile" on public.admin_profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "admins manage site settings" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public read site settings" on public.site_settings for select to anon using (true);

create policy "admins manage hero content" on public.hero_content for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public read hero content" on public.hero_content for select to anon using (true);

create policy "admins manage tiers" on public.service_tiers for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public read visible tiers" on public.service_tiers for select to anon using (is_visible = true);

create policy "admins manage tier features" on public.tier_features for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public read enabled tier features" on public.tier_features for select to anon using (enabled = true);

create policy "admins manage pricing" on public.pricing_rows for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public read visible pricing" on public.pricing_rows for select to anon using (is_visible = true);

create policy "admins manage portfolio" on public.portfolio_items for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public read visible portfolio" on public.portfolio_items for select to anon using (is_visible = true);

create policy "admins manage videos" on public.video_items for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public read visible videos" on public.video_items for select to anon using (is_visible = true);

create policy "admins manage media" on public.media_assets for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public read media" on public.media_assets for select to anon using (true);

create policy "admins read submissions" on public.form_submissions for select to authenticated using (public.is_admin());
create policy "admins update submissions" on public.form_submissions for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins delete submissions" on public.form_submissions for delete to authenticated using (public.is_admin());
create policy "public create submissions" on public.form_submissions for insert to anon with check (true);

create policy "admins read logs" on public.activity_logs for select to authenticated using (public.is_admin());
create policy "admins create logs" on public.activity_logs for insert to authenticated with check (public.is_admin());

insert into public.site_settings (site_title, meta_description, agency_email, phone, instagram_handle, whatsapp_number)
values ('bhakty.studio', 'AI filmmaking studio for brands, artists, and storytellers.', 'hello@bhakty.studio', '+91 99581 94155', '@notshaam', '+91 99581 94155');

insert into public.hero_content (
  primary_line,
  secondary_line,
  subtext,
  cta1_label,
  cta1_target,
  cta2_label,
  cta2_target,
  footer_tagline,
  instagram_handle,
  marquee_text
) values (
  'WE DON''T JUST CREATE CONTENT.',
  'WE BUILD CINEMATIC WORLDS.',
  'Bhakty Studio creates AI-powered films, reels, ads, and visual universes for brands and storytellers.',
  'Start a Project',
  '#contact',
  'View Work',
  '#portfolio',
  'Create. Visualize. Inspire.',
  '@notshaam',
  'AI FILMMAKING / BRAND WORLDS / REELS / MUSIC VIDEOS / CINEMA GRADE'
);

insert into public.service_tiers (id, name, tagline, description, accent_color, badge, cta_label, starting_price, sort_order)
values
  ('content', 'Content Grade', 'Fast social-first production', 'AI-assisted production for quick brand and social content.', '#00e5ff', 'FASTEST', 'Book Content Grade', 'From ₹10,000', 1),
  ('studio', 'Studio Grade', 'Premium brand storytelling', 'Advanced post-production and 4K delivery for campaigns.', '#8f5cff', 'MOST POPULAR', 'Book Studio Grade', 'From ₹35,000', 2),
  ('cinema', 'Cinema Grade', 'Flagship cinematic worlds', 'Full creative direction for premium campaign and narrative work.', '#ffb800', 'PREMIUM', 'Book Cinema Grade', 'Custom Quote', 3);
