/** BeerXML fermentable type. */
export type FermentableType =
  | 'Grain'
  | 'Sugar'
  | 'Extract'
  | 'Dry Extract'
  | 'Adjunct'

export interface RecipeGrain {
  name: string
  type: FermentableType
  amount: number
  unit: string
  pct: number
  /** Extract potential (0-100) — BeerXML's required `yield`. */
  yield_pct: number
  /** Color rating in °Lovibond — BeerXML's required `color`. */
  color_lovibond: number
}

/**
 * BeerXML hop use. A flameout/whirlpool addition is `Boil` with `time: 0` —
 * there is no separate "Flameout" value, matching real BeerXML files.
 */
export type HopUse = 'Boil' | 'Dry Hop' | 'Mash' | 'First Wort' | 'Aroma'

export interface RecipeHop {
  name: string
  amount: number
  unit: string
  time: number
  use: HopUse
  alpha: number
}

/** BeerXML yeast form. */
export type YeastForm = 'liquid' | 'dry' | 'slant' | 'culture'

export interface RecipeYeast {
  name: string
  attenuation: number
  temp_range: string
  form: YeastForm
}

export interface WaterProfile {
  volume: number
  ph: number
  ca: number
  mg: number
  na: number
  so4: number
  cl: number
  hco3: number
}

/** BeerXML mash step type. */
export type MashStepType = 'Infusion' | 'Temperature' | 'Decoction'

export interface MashStep {
  name: string
  type: MashStepType
  step_temp: number
  step_time: number
  infuse_amount: number | null
  infuse_temp: number | null
  decoction_amount: number | null
  notes: string
}

/** A named mash profile — 1:1 with the recipe, owning an ordered list of steps. */
export interface Mash {
  name: string
  grain_temp: number
  notes: string
  tun_temp: number | null
  sparge_temp: number | null
  tun_weight: number | null
  tun_specific_heat: number | null
  steps: MashStep[]
}

/** BeerXML style type. */
export type StyleGuideType =
  | 'Lager'
  | 'Ale'
  | 'Mead'
  | 'Wheat'
  | 'Mixed'
  | 'Cider'

/**
 * Full BeerXML Style record: guideline ranges + category info. Optional and
 * separate from Recipe.style/bjcp_code, which stay the lightweight name +
 * code every recipe has. Populated automatically on BeerXML import;
 * preferred over the lightweight fields on export when present.
 */
export interface StyleGuide {
  name: string
  category: string
  category_number: string
  style_letter: string
  style_guide: string
  type: StyleGuideType
  og_min: number
  og_max: number
  fg_min: number
  fg_max: number
  ibu_min: number
  ibu_max: number
  color_min: number
  color_max: number
  carb_min: number | null
  carb_max: number | null
  abv_min: number | null
  abv_max: number | null
  notes: string
  profile: string
  ingredients: string
  examples: string
}

export interface Recipe {
  id: string
  name: string
  style: string
  bjcp_code: string
  batch_size: number
  og: number
  fg: number
  abv: number
  ibu: number
  srm: number
  efficiency: number
  boil_time: number
  notes: string
  last_brewed: string | null
  created_at: number
  tags: string[]
  grains: RecipeGrain[]
  hops: RecipeHop[]
  yeasts: RecipeYeast[]
  water: WaterProfile | null
  mash: Mash | null
  style_guide: StyleGuide | null
}

/** Create/update payload — same shape as `Recipe` minus server-assigned fields. */
export type RecipeInput = Omit<Recipe, 'id' | 'created_at'>
