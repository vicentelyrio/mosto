CREATE TABLE equipment (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  capacity TEXT NOT NULL DEFAULT '',
  material TEXT NOT NULL DEFAULT '',
  condition TEXT NOT NULL DEFAULT 'good' CHECK (condition IN ('good', 'fair', 'poor')),
  notes TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL
);
