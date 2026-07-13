import type { Recipe } from '@domain'

export interface BrewStep {
  id: number
  phase: string
  label: string
  duration: number
  detail: string
}

/** First number in a temp range string like "60-72°F" or "60–72°F". */
function rangeStart(range: string): string {
  return range.split(/[-–]/)[0]?.trim() || range
}

/** Ported from the design project's `BREW_STEPS(recipe)` in brew-brewday.jsx,
 *  adapted to this app's `Recipe` shape (multi-step mash, multi-yeast,
 *  `RecipeHop.use` instead of a separate "Flameout" value — a flameout/
 *  whirlpool addition is just a Boil hop with `time: 0`, so it naturally
 *  sorts last among the boil additions below). */
export function generateSteps(recipe: Recipe): BrewStep[] {
  const totalGrain = recipe.grains.reduce((sum, g) => sum + g.amount, 0)
  const mashStep = recipe.mash?.steps[0]
  const water = recipe.water
  const yeast = recipe.yeasts[0]

  const steps: Omit<BrewStep, 'id'>[] = [
    {
      phase: 'Prep',
      label: 'Review Recipe & Gather Equipment',
      duration: 0,
      detail: `Batch: ${recipe.batch_size} gal · Efficiency: ${recipe.efficiency}%`,
    },
    {
      phase: 'Prep',
      label: 'Mill Grain',
      duration: 15,
      detail:
        totalGrain > 0
          ? `Total grain: ${totalGrain.toFixed(1)} lb — set gap to 0.040"`
          : 'No grain bill recorded',
    },
    {
      phase: 'Mash',
      label: 'Heat Strike Water',
      duration: 20,
      detail:
        water && mashStep
          ? `Heat ${(water.volume * 0.55).toFixed(1)} gal to ${mashStep.step_temp + 12}°F`
          : 'No water profile / mash schedule recorded',
    },
    {
      phase: 'Mash',
      label: 'Mash In',
      duration: 5,
      detail: mashStep
        ? `Target mash temp: ${mashStep.step_temp}°F — stir well`
        : 'No mash schedule recorded',
    },
    {
      phase: 'Mash',
      label: 'Mash Rest',
      duration: mashStep?.step_time ?? 60,
      detail: mashStep
        ? `Hold at ${mashStep.step_temp}°F — check temp every 15 min`
        : 'No mash schedule recorded',
    },
    {
      phase: 'Lauter',
      label: 'Vorlauf',
      duration: 10,
      detail: 'Recirculate until runoff runs clear (~2 qt)',
    },
    {
      phase: 'Lauter',
      label: 'Sparge & Collect Wort',
      duration: 30,
      detail: water
        ? `Collect ${water.volume.toFixed(1)} gal pre-boil wort`
        : 'No water profile recorded',
    },
    {
      phase: 'Boil',
      label: 'Bring to Boil',
      duration: 15,
      detail: 'Watch for hot break and boil-over',
    },
    ...recipe.hops
      .filter((h) => h.use === 'Boil')
      .sort((a, b) => b.time - a.time)
      .map((h) => ({
        phase: 'Boil',
        label:
          h.time === 0 ? `Flameout — ${h.name}` : `Hop Addition — ${h.name}`,
        duration: 0,
        detail: `${h.amount} ${h.unit} ${h.name} · @${h.time} min · ${h.alpha}% AA`,
      })),
    {
      phase: 'Chill',
      label: 'Chill Wort to Pitch Temp',
      duration: 20,
      detail: yeast
        ? `Target: ${rangeStart(yeast.temp_range)}°F — sanitize fermentor while chilling`
        : 'No yeast recorded',
    },
    {
      phase: 'Ferment',
      label: 'Transfer to Fermentor',
      duration: 10,
      detail: `Measure OG (target: ${recipe.og}) and take refractometer reading`,
    },
    {
      phase: 'Ferment',
      label: 'Pitch Yeast',
      duration: 5,
      detail: yeast
        ? `${yeast.name} — ferment at ${yeast.temp_range}`
        : 'No yeast recorded',
    },
    {
      phase: 'Ferment',
      label: 'Seal & Attach Airlock',
      duration: 5,
      detail: 'Fill airlock with sanitizer, label fermentor with date',
    },
  ]

  return steps.map((s, i) => ({ ...s, id: i + 1 }))
}
