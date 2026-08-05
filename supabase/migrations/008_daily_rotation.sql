-- Mark entries as hand-written pool vs. auto-generated daily copies
ALTER TABLE entries ADD COLUMN IF NOT EXISTS is_generated BOOLEAN NOT NULL DEFAULT FALSE;

-- Enforce one entry per category per day (makes the rotation edge function idempotent)
ALTER TABLE entries ADD CONSTRAINT entries_category_date_unique UNIQUE (category_id, published_date);
