-- Add sort_order column to accounts table
ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS sort_order INTEGER;

-- Set initial sort_order values based on existing order
WITH numbered_accounts AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as rn
  FROM public.accounts
)
UPDATE public.accounts
SET sort_order = numbered_accounts.rn
FROM numbered_accounts
WHERE accounts.id = numbered_accounts.id
AND accounts.sort_order IS NULL;