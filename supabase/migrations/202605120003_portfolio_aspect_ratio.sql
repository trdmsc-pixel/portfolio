-- Add aspect_ratio column to portfolio table
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)

ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS aspect_ratio text DEFAULT '16/9';
