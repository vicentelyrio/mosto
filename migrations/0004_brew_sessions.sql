CREATE TABLE brew_sessions (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'planning'
    CHECK (status IN ('planning', 'brewing', 'fermenting', 'conditioning', 'packaged', 'archived')),
  started_at INTEGER
);
CREATE INDEX idx_brew_sessions_recipe ON brew_sessions(recipe_id);

CREATE TABLE brew_step_completions (
  session_id TEXT NOT NULL REFERENCES brew_sessions(id) ON DELETE CASCADE,
  step_id INTEGER NOT NULL,
  completed_at INTEGER NOT NULL,
  PRIMARY KEY (session_id, step_id)
);

CREATE TABLE gravity_readings (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES brew_sessions(id) ON DELETE CASCADE,
  reading_date TEXT NOT NULL,
  sg REAL NOT NULL,
  temp REAL,
  note TEXT NOT NULL DEFAULT ''
);
CREATE INDEX idx_gravity_readings_session ON gravity_readings(session_id);

CREATE TABLE schedule_events (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES brew_sessions(id) ON DELETE CASCADE,
  event_date TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT ''
);
CREATE INDEX idx_schedule_events_session ON schedule_events(session_id);
