-- Add locationType column to stations table
ALTER TABLE stations
ADD COLUMN locationType ENUM('Ville', 'Interurbain') NOT NULL DEFAULT 'Ville';
