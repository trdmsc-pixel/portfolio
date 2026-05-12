ALTER TABLE public.site_settings
ADD COLUMN site_logo text,
ADD COLUMN logo_padding integer default 0,
ADD COLUMN logo_margin integer default 0;
