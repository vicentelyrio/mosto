CREATE TABLE inventory_items (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('grain', 'hop', 'yeast', 'adjunct', 'water_chem', 'packaging')),
  name TEXT NOT NULL,
  amount REAL NOT NULL,
  unit TEXT NOT NULL,
  low_threshold REAL,
  expiry TEXT,
  brand TEXT,
  alpha REAL,
  form TEXT,
  attenuation TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
