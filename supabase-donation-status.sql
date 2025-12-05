-- Add status column to donations table
-- This enables a workflow where donations start as "Pending" and must be marked "Received" to appear publicly

ALTER TABLE donations 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';

-- Set existing donations to "Received" so they appear in history
UPDATE donations 
SET status = 'Received' 
WHERE status IS NULL;

-- Add check constraint for valid statuses
ALTER TABLE donations
DROP CONSTRAINT IF EXISTS donations_status_check;

ALTER TABLE donations
ADD CONSTRAINT donations_status_check 
CHECK (status IN ('Pending', 'Received'));

-- Create index for faster status queries
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
