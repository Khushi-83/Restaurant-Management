-- Check current feedback table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'feedback' 
ORDER BY ordinal_position;

-- Add date column to feedback table
ALTER TABLE feedback 
ADD COLUMN date DATE;

-- Add a comment to describe the column
COMMENT ON COLUMN feedback.date IS 'The date when the customer visited the restaurant';

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'feedback' 
ORDER BY ordinal_position;

-- Optional: Update existing records to have today's date
-- Uncomment the line below if you want to set a default date for existing records
-- UPDATE feedback SET date = CURRENT_DATE WHERE date IS NULL; 