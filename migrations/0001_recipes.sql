CREATE TABLE recipes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  style TEXT NOT NULL,
  bjcp_code TEXT NOT NULL DEFAULT '',
  batch_size REAL NOT NULL,
  og REAL NOT NULL,
  fg REAL NOT NULL,
  abv REAL NOT NULL,
  ibu REAL NOT NULL,
  srm REAL NOT NULL,
  efficiency REAL NOT NULL,
  boil_time REAL NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  last_brewed TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE recipe_tags (
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  tag TEXT NOT NULL
);
CREATE INDEX idx_recipe_tags_recipe ON recipe_tags(recipe_id);

-- `type`, `yield_pct`, `color_lovibond` mirror BeerXML's Fermentable fields
-- (type/yield/color are required there) so a recipe can round-trip through
-- BeerXML without losing data. `type` has no CHECK constraint: real-world
-- BeerXML files (from various other tools) don't reliably conform to the
-- exact Grain/Sugar/Extract/Dry Extract/Adjunct set — rejecting an import
-- over a minor label mismatch is worse than just storing it as-is.
CREATE TABLE recipe_grains (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Grain',
  amount REAL NOT NULL,
  unit TEXT NOT NULL,
  pct REAL NOT NULL,
  yield_pct REAL NOT NULL DEFAULT 75,
  color_lovibond REAL NOT NULL DEFAULT 2,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_recipe_grains_recipe ON recipe_grains(recipe_id);

-- `use` intentionally has no CHECK constraint: the full BeerXML set is
-- Boil/Dry Hop/Mash/First Wort/Aroma. A flameout/whirlpool addition is
-- represented as `Boil` with `time = 0`, per BeerXML convention — there is no
-- separate "Flameout" literal.
CREATE TABLE recipe_hops (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount REAL NOT NULL,
  unit TEXT NOT NULL,
  time REAL NOT NULL,
  use TEXT NOT NULL,
  alpha REAL NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_recipe_hops_recipe ON recipe_hops(recipe_id);

-- `form` has no CHECK constraint: BeerXML's set is Liquid/Dry/Slant/Culture.
CREATE TABLE recipe_yeasts (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  attenuation REAL NOT NULL,
  temp_range TEXT NOT NULL,
  form TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_recipe_yeasts_recipe ON recipe_yeasts(recipe_id);

CREATE TABLE recipe_water_profile (
  recipe_id TEXT PRIMARY KEY REFERENCES recipes(id) ON DELETE CASCADE,
  volume REAL NOT NULL,
  ph REAL NOT NULL,
  ca REAL NOT NULL,
  mg REAL NOT NULL,
  na REAL NOT NULL,
  so4 REAL NOT NULL,
  cl REAL NOT NULL,
  hco3 REAL NOT NULL
);

-- Mirrors BeerXML's Mash: a named profile (1:1 with the recipe) owning an
-- ordered list of steps. Replaces the old flat recipes.mash_temp/mash_time.
CREATE TABLE recipe_mash (
  recipe_id TEXT PRIMARY KEY REFERENCES recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  grain_temp REAL NOT NULL DEFAULT 68,
  notes TEXT NOT NULL DEFAULT '',
  tun_temp REAL,
  sparge_temp REAL,
  tun_weight REAL,
  tun_specific_heat REAL
);

-- `type` has no CHECK constraint, same reasoning as recipe_grains.type: this
-- is populated from arbitrary imported BeerXML files, not exclusively our
-- own app logic.
CREATE TABLE recipe_mash_steps (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  step_temp REAL NOT NULL,
  step_time REAL NOT NULL,
  infuse_amount REAL,
  infuse_temp REAL,
  decoction_amount REAL,
  notes TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_recipe_mash_steps_recipe ON recipe_mash_steps(recipe_id);

-- Mirrors BeerXML's full Style record (guideline ranges, category, etc).
-- Optional and separate from recipes.style/bjcp_code, which stay the
-- lightweight always-present name + code used for list badges and recipes
-- with no attached guideline data. Populated automatically on BeerXML import;
-- preferred over the lightweight fields on export when present.
CREATE TABLE recipe_style_guide (
  recipe_id TEXT PRIMARY KEY REFERENCES recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  category_number TEXT NOT NULL DEFAULT '',
  style_letter TEXT NOT NULL DEFAULT '',
  style_guide TEXT NOT NULL DEFAULT '',
  -- No CHECK constraint, same reasoning as recipe_grains.type: real BeerXML
  -- exports don't reliably conform to the exact Lager/Ale/Mead/Wheat/Mixed/
  -- Cider set (this is exactly what broke on a real import).
  type TEXT NOT NULL,
  og_min REAL NOT NULL,
  og_max REAL NOT NULL,
  fg_min REAL NOT NULL,
  fg_max REAL NOT NULL,
  ibu_min REAL NOT NULL,
  ibu_max REAL NOT NULL,
  color_min REAL NOT NULL,
  color_max REAL NOT NULL,
  carb_min REAL,
  carb_max REAL,
  abv_min REAL,
  abv_max REAL,
  notes TEXT NOT NULL DEFAULT '',
  profile TEXT NOT NULL DEFAULT '',
  ingredients TEXT NOT NULL DEFAULT '',
  examples TEXT NOT NULL DEFAULT ''
);
