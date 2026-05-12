-- Enable Realtime for form_submissions table
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)

ALTER PUBLICATION supabase_realtime ADD TABLE form_submissions;
