ALTER TABLE schedules
ADD COLUMN delay_minutes INT DEFAULT 0,
ADD COLUMN is_cancelled BOOLEAN DEFAULT FALSE,
ADD COLUMN track_assignments JSON;
