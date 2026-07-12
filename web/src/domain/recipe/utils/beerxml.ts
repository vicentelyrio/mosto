import type {
  Fermentable as BeerXmlFermentable,
  Hop as BeerXmlHop,
  Mash as BeerXmlMash,
  MashStep as BeerXmlMashStep,
  Recipe as BeerXmlRecipe,
  Style as BeerXmlStyle,
  Water as BeerXmlWater,
  Yeast as BeerXmlYeast,
} from 'beerxml-ts'
import {
  BeerXML,
  color as beerColor,
  bitterness,
  gravity,
  temperature,
  volume,
  weight,
} from 'beerxml-ts'

import type {
  Mash,
  MashStep,
  Recipe,
  RecipeGrain,
  RecipeHop,
  RecipeInput,
  RecipeYeast,
  StyleGuide,
  WaterProfile,
} from './entities'

/**
 * BeerXML <-> our Recipe. BeerXML is metric (kg, L, °C); we store imperial
 * (lb/oz, gal, °F), matching the design project's mockups. This is the one
 * place that conversion happens — everything else in the app never sees
 * BeerXML shapes directly.
 *
 * A few required BeerXML fields have no home in our schema yet (Yeast's
 * pitch amount, Recipe's brewer/type). Those get a documented placeholder on
 * export rather than blocking the feature on a schema redesign; they're
 * noted inline below.
 */

// ---- unit helpers ----------------------------------------------------

function toKg(amount: number, unit: string): number {
  switch (unit) {
    case 'oz':
      return weight.ozToKg(amount)
    case 'g':
      return weight.gramsToKg(amount)
    case 'kg':
      return amount
    default:
      return weight.lbsToKg(amount) // 'lb' and anything unrecognized
  }
}

function toLb(kg: number): number {
  return weight.kgToLbs(kg)
}

function capitalize<T extends string>(s: string): T {
  return (s.charAt(0).toUpperCase() + s.slice(1)) as T
}

/** "60-72°F" / "60–72°F" -> { min: 60, max: 72 } (best-effort; we store this
 *  as a display string, not separate fields, so round-tripping it is lossy
 *  if the original text wasn't two plain numbers). */
function parseTempRange(range: string): { min: number; max: number } {
  const nums = range.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? []
  const min = nums[0] ?? 60
  const max = nums[1] ?? min
  return { min, max }
}

function formatTempRange(minF: number, maxF: number): string {
  return `${Math.round(minF)}-${Math.round(maxF)}°F`
}

// ---- export: our Recipe -> BeerXML string ----------------------------

function hopToBeerXml(h: RecipeHop): BeerXmlHop {
  return {
    name: h.name,
    version: 1,
    alpha: h.alpha,
    amount: toKg(h.amount, h.unit),
    use: h.use,
    time: h.time,
  }
}

function fermentableToBeerXml(g: RecipeGrain): BeerXmlFermentable {
  return {
    name: g.name,
    version: 1,
    type: g.type,
    amount: toKg(g.amount, g.unit),
    yield: g.yield_pct,
    color: g.color_lovibond,
  }
}

function yeastToBeerXml(y: RecipeYeast): BeerXmlYeast {
  const { min, max } = parseTempRange(y.temp_range)
  return {
    name: y.name,
    version: 1,
    // BeerXML's Ale/Lager/Wheat/Wine/Champagne isn't a field we track per
    // yeast; Ale is the reasonable default for a homebrew-scale recipe book.
    type: 'Ale',
    form: capitalize(y.form),
    // BeerXML requires a pitch amount (L for liquid, kg for dry); we don't
    // track pitch quantity on the recipe (the design's yeast calculator
    // derives it live from batch size + OG instead), so this is a
    // placeholder matching a standard single smack-pack/vial or dry packet.
    amount: y.form === 'dry' ? 0.011 : 0.125,
    amountIsWeight: y.form === 'dry',
    attenuation: y.attenuation,
    minTemperature: temperature.fahrenheitToCelsius(min),
    maxTemperature: temperature.fahrenheitToCelsius(max),
  }
}

function styleGuideToBeerXml(sg: StyleGuide): BeerXmlStyle {
  return {
    name: sg.name,
    version: 1,
    category: sg.category,
    categoryNumber: sg.category_number,
    styleLetter: sg.style_letter,
    styleGuide: sg.style_guide,
    type: sg.type,
    ogMin: sg.og_min,
    ogMax: sg.og_max,
    fgMin: sg.fg_min,
    fgMax: sg.fg_max,
    ibuMin: sg.ibu_min,
    ibuMax: sg.ibu_max,
    colorMin: sg.color_min,
    colorMax: sg.color_max,
    carbMin: sg.carb_min ?? undefined,
    carbMax: sg.carb_max ?? undefined,
    abvMin: sg.abv_min ?? undefined,
    abvMax: sg.abv_max ?? undefined,
    notes: sg.notes || undefined,
    profile: sg.profile || undefined,
    ingredients: sg.ingredients || undefined,
    examples: sg.examples || undefined,
  }
}

/**
 * Fallback when the recipe has no full `style_guide` attached (e.g. a
 * hand-created recipe with just a style name + BJCP code): a minimal Style
 * with single-point "ranges" (min=max) so the style name still round-trips
 * through other BeerXML tools, without fabricating guideline data we don't
 * have.
 */
function placeholderStyle(recipe: Recipe): BeerXmlStyle {
  return {
    name: recipe.style,
    version: 1,
    category: '',
    categoryNumber: recipe.bjcp_code.replace(/[A-Za-z]+$/, ''),
    styleLetter: recipe.bjcp_code.replace(/^[0-9]+/, ''),
    styleGuide: '',
    type: 'Ale',
    ogMin: recipe.og,
    ogMax: recipe.og,
    fgMin: recipe.fg,
    fgMax: recipe.fg,
    ibuMin: recipe.ibu,
    ibuMax: recipe.ibu,
    colorMin: recipe.srm,
    colorMax: recipe.srm,
  }
}

function waterToBeerXml(w: WaterProfile): BeerXmlWater {
  return {
    name: 'Brewing Water',
    version: 1,
    amount: volume.gallonsToLiters(w.volume),
    calcium: w.ca,
    bicarbonate: w.hco3,
    sulfate: w.so4,
    chloride: w.cl,
    sodium: w.na,
    magnesium: w.mg,
    ph: w.ph,
  }
}

function mashStepToBeerXml(s: MashStep): BeerXmlMashStep {
  return {
    name: s.name,
    version: 1,
    type: s.type,
    stepTemp: temperature.fahrenheitToCelsius(s.step_temp),
    stepTime: s.step_time,
    // infuse_amount/decoction_amount have no companion `unit` field in our
    // schema (unlike grains/hops) — stored as gallons by convention, same as
    // batch_size and water.volume.
    infuseAmount:
      s.infuse_amount != null
        ? volume.gallonsToLiters(s.infuse_amount)
        : undefined,
    infuseTemp:
      s.infuse_temp != null
        ? temperature.fahrenheitToCelsius(s.infuse_temp)
        : undefined,
    decoctionAmount:
      s.decoction_amount != null
        ? volume.gallonsToLiters(s.decoction_amount)
        : undefined,
    notes: s.notes || undefined,
  }
}

function mashToBeerXml(m: Mash): BeerXmlMash {
  return {
    name: m.name,
    version: 1,
    grainTemp: temperature.fahrenheitToCelsius(m.grain_temp),
    mashSteps: m.steps.map(mashStepToBeerXml),
    notes: m.notes || undefined,
    tunTemp:
      m.tun_temp != null
        ? temperature.fahrenheitToCelsius(m.tun_temp)
        : undefined,
    spargeTemp:
      m.sparge_temp != null
        ? temperature.fahrenheitToCelsius(m.sparge_temp)
        : undefined,
    tunWeight: m.tun_weight ?? undefined,
    tunSpecificHeat: m.tun_specific_heat ?? undefined,
  }
}

export function recipeToBeerXml(recipe: Recipe): string {
  const beerRecipe: BeerXmlRecipe = {
    name: recipe.name,
    version: 1,
    // We don't track Extract/Partial Mash/All Grain distinctly — the design
    // is mash-centric, so All Grain is the reasonable default.
    type: 'All Grain',
    style: recipe.style_guide
      ? styleGuideToBeerXml(recipe.style_guide)
      : placeholderStyle(recipe),
    // Not tracked on the recipe; left blank rather than guessed.
    brewer: '',
    batchSize: volume.gallonsToLiters(recipe.batch_size),
    // We don't have a dedicated pre-boil/boil-kettle volume field; the water
    // profile's volume (mash + sparge water) is the closest available proxy.
    boilSize: volume.gallonsToLiters(recipe.water?.volume ?? recipe.batch_size),
    boilTime: recipe.boil_time,
    efficiency: recipe.efficiency,
    hops: recipe.hops.map(hopToBeerXml),
    fermentables: recipe.grains.map(fermentableToBeerXml),
    yeasts: recipe.yeasts.map(yeastToBeerXml),
    waters: recipe.water ? [waterToBeerXml(recipe.water)] : undefined,
    mash: recipe.mash ? mashToBeerXml(recipe.mash) : undefined,
    notes: recipe.notes || undefined,
  }

  return BeerXML.stringify(beerRecipe)
}

export function downloadBeerXml(recipe: Recipe): void {
  const xml = recipeToBeerXml(recipe)
  const blob = new Blob([xml], { type: 'application/xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${recipe.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.xml`
  a.click()
  URL.revokeObjectURL(url)
}

// ---- import: BeerXML string -> our RecipeInput -----------------------

function fermentableFromBeerXml(f: BeerXmlFermentable): RecipeGrain {
  const amountLb = toLb(f.amount)
  return {
    name: f.name,
    type: f.type,
    amount: Number(amountLb.toFixed(2)),
    unit: 'lb',
    // BeerXML doesn't carry "% of grist" — computed relative to the batch
    // after all fermentables are known, see below.
    pct: 0,
    yield_pct: f.yield,
    color_lovibond: f.color,
  }
}

function hopFromBeerXml(h: BeerXmlHop): RecipeHop {
  const amountOz = weight.kgToOz(h.amount)
  return {
    name: h.name,
    amount: Number(amountOz.toFixed(2)),
    unit: 'oz',
    time: h.time,
    use: h.use,
    alpha: h.alpha,
  }
}

function yeastFromBeerXml(y: BeerXmlYeast): RecipeYeast {
  const minF =
    y.minTemperature != null
      ? temperature.celsiusToFahrenheit(y.minTemperature)
      : 60
  const maxF =
    y.maxTemperature != null
      ? temperature.celsiusToFahrenheit(y.maxTemperature)
      : minF
  return {
    name: y.name,
    attenuation: y.attenuation ?? 75,
    temp_range: formatTempRange(minF, maxF),
    form: y.form.toLowerCase() as RecipeYeast['form'],
  }
}

function waterFromBeerXml(w: BeerXmlWater): WaterProfile {
  return {
    volume: Number(volume.litersToGallons(w.amount).toFixed(2)),
    ph: w.ph ?? 7,
    ca: w.calcium,
    mg: w.magnesium,
    na: w.sodium,
    so4: w.sulfate,
    cl: w.chloride,
    hco3: w.bicarbonate,
  }
}

function mashStepFromBeerXml(s: BeerXmlMashStep): MashStep {
  return {
    name: s.name,
    type: s.type,
    step_temp: Number(temperature.celsiusToFahrenheit(s.stepTemp).toFixed(1)),
    step_time: s.stepTime,
    infuse_amount:
      s.infuseAmount != null
        ? Number(volume.litersToGallons(s.infuseAmount).toFixed(2))
        : null,
    infuse_temp:
      s.infuseTemp != null
        ? Number(temperature.celsiusToFahrenheit(s.infuseTemp).toFixed(1))
        : null,
    decoction_amount:
      s.decoctionAmount != null
        ? Number(volume.litersToGallons(s.decoctionAmount).toFixed(2))
        : null,
    notes: s.notes ?? '',
  }
}

function mashFromBeerXml(m: BeerXmlMash): Mash {
  return {
    name: m.name,
    grain_temp: Number(temperature.celsiusToFahrenheit(m.grainTemp).toFixed(1)),
    notes: m.notes ?? '',
    tun_temp:
      m.tunTemp != null
        ? Number(temperature.celsiusToFahrenheit(m.tunTemp).toFixed(1))
        : null,
    sparge_temp:
      m.spargeTemp != null
        ? Number(temperature.celsiusToFahrenheit(m.spargeTemp).toFixed(1))
        : null,
    tun_weight: m.tunWeight ?? null,
    tun_specific_heat: m.tunSpecificHeat ?? null,
    steps: m.mashSteps.map(mashStepFromBeerXml),
  }
}

function styleGuideFromBeerXml(s: BeerXmlStyle): StyleGuide {
  return {
    name: s.name,
    category: s.category,
    // beerxml-ts's underlying XML parser auto-coerces numeric-looking tag
    // values (e.g. <CATEGORY_NUMBER>21</CATEGORY_NUMBER>) to JS numbers even
    // though these fields are typed as `string` — force back to string or
    // this fails Rust deserialization (category_number is a String column).
    category_number: String(s.categoryNumber),
    style_letter: String(s.styleLetter),
    style_guide: s.styleGuide,
    type: s.type,
    og_min: s.ogMin,
    og_max: s.ogMax,
    fg_min: s.fgMin,
    fg_max: s.fgMax,
    ibu_min: s.ibuMin,
    ibu_max: s.ibuMax,
    color_min: s.colorMin,
    color_max: s.colorMax,
    carb_min: s.carbMin ?? null,
    carb_max: s.carbMax ?? null,
    abv_min: s.abvMin ?? null,
    abv_max: s.abvMax ?? null,
    notes: s.notes ?? '',
    profile: s.profile ?? '',
    ingredients: s.ingredients ?? '',
    examples: s.examples ?? '',
  }
}

/**
 * Real BeerXML files don't carry target OG/FG/IBU/SRM/ABV on the Recipe —
 * those are meant to be calculated by the consuming software from the
 * ingredient list, not stored. We estimate them here with standard homebrew
 * formulas (using beerxml-ts's own gravity/color/bitterness helpers) so an
 * imported recipe shows real numbers instead of zeros. These are estimates —
 * edit them if you have measured values.
 */
function estimateStats(
  r: BeerXmlRecipe,
  grains: RecipeGrain[],
  hops: RecipeHop[],
  yeasts: RecipeYeast[],
) {
  const batchGal = volume.litersToGallons(r.batchSize)

  const gravityPoints = grains.reduce((sum, g) => {
    const lbs = g.unit === 'lb' ? g.amount : toLb(toKg(g.amount, g.unit))
    return sum + lbs * g.yield_pct * 0.46
  }, 0)
  const efficiency = r.efficiency ?? 75
  const ogPoints =
    batchGal > 0 ? (gravityPoints * (efficiency / 100)) / batchGal : 0
  const og = gravity.pointsToSg(ogPoints)

  const avgAttenuation = yeasts.length
    ? yeasts.reduce((sum, y) => sum + y.attenuation, 0) / yeasts.length
    : 75
  const fg = gravity.pointsToSg(ogPoints * (1 - avgAttenuation / 100))

  const abv = gravity.calculateAbv(og, fg)

  const batchLiters = r.batchSize
  const ibu = hops
    .filter((h) => h.use === 'Boil' || h.use === 'First Wort')
    .reduce((sum, h) => {
      const weightKg = toKg(h.amount, h.unit)
      const utilization = bitterness.tinsethUtilization(h.time, og)
      return (
        sum +
        bitterness.calculateIbu(h.alpha, weightKg, utilization, batchLiters)
      )
    }, 0)

  const mcuTotal = grains.reduce((sum, g) => {
    const lbs = g.unit === 'lb' ? g.amount : toLb(toKg(g.amount, g.unit))
    return sum + (g.color_lovibond * lbs) / batchGal
  }, 0)
  const srm = batchGal > 0 ? beerColor.calculateSrm(mcuTotal) : 0

  return { og, fg, abv, ibu, srm, efficiency }
}

export function beerXmlToRecipeInput(xml: string): RecipeInput {
  const r = BeerXML.parse(xml)

  const grains = r.fermentables.map(fermentableFromBeerXml)
  const totalLb = grains.reduce((sum, g) => sum + g.amount, 0)
  for (const g of grains) {
    g.pct = totalLb > 0 ? Number(((g.amount / totalLb) * 100).toFixed(1)) : 0
  }

  const hops = r.hops.map(hopFromBeerXml)
  const yeasts = r.yeasts.map(yeastFromBeerXml)
  const stats = estimateStats(r, grains, hops, yeasts)

  return {
    name: r.name,
    style: r.style?.name ?? '',
    bjcp_code: r.style ? `${r.style.categoryNumber}${r.style.styleLetter}` : '',
    batch_size: Number(volume.litersToGallons(r.batchSize).toFixed(2)),
    og: Number(stats.og.toFixed(3)),
    fg: Number(stats.fg.toFixed(3)),
    abv: Number(stats.abv.toFixed(1)),
    ibu: Number(stats.ibu.toFixed(0)),
    srm: Number(stats.srm.toFixed(1)),
    efficiency: stats.efficiency,
    boil_time: r.boilTime,
    notes: r.notes ?? '',
    last_brewed: null,
    tags: [],
    grains,
    hops,
    yeasts,
    water: r.waters?.[0] ? waterFromBeerXml(r.waters[0]) : null,
    mash: r.mash ? mashFromBeerXml(r.mash) : null,
    style_guide: r.style ? styleGuideFromBeerXml(r.style) : null,
  }
}
