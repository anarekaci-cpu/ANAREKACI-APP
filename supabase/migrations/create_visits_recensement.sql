-- Create table for tracking census visit records
CREATE TABLE IF NOT EXISTS visits_recensement (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  point_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_visits_recensement_user_id ON visits_recensement(user_id);
CREATE INDEX IF NOT EXISTS idx_visits_recensement_point_id ON visits_recensement(point_id);
CREATE INDEX IF NOT EXISTS idx_visits_recensement_user_point ON visits_recensement(user_id, point_id);

-- Enable RLS
ALTER TABLE visits_recensement ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own visits"
  ON visits_recensement FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own visits"
  ON visits_recensement FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own visits"
  ON visits_recensement FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own visits"
  ON visits_recensement FOR UPDATE
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_visits_recensement_updated_at
  BEFORE UPDATE ON visits_recensement
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
