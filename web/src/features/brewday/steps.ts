import type { TranslationFunctions } from '@i18n/i18n-types'

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
export function generateSteps(
  LL: TranslationFunctions,
  recipe: Recipe,
): BrewStep[] {
  const totalGrain = recipe.grains.reduce((sum, g) => sum + g.amount, 0)
  const mashStep = recipe.mash?.steps[0]
  const water = recipe.water
  const yeast = recipe.yeasts[0]
  const p = LL.brewday.steps.phases

  const steps: Omit<BrewStep, 'id'>[] = [
    {
      phase: p.prep(),
      label: LL.brewday.steps.review.label(),
      duration: 0,
      detail: LL.brewday.steps.review.detail({
        size: recipe.batch_size,
        eff: recipe.efficiency,
      }),
    },
    {
      phase: p.prep(),
      label: LL.brewday.steps.millGrain.label(),
      duration: 15,
      detail:
        totalGrain > 0
          ? LL.brewday.steps.millGrain.detailWithGrain({
              total: totalGrain.toFixed(1),
            })
          : LL.brewday.steps.millGrain.detailNoGrain(),
    },
    {
      phase: p.mash(),
      label: LL.brewday.steps.heatStrike.label(),
      duration: 20,
      detail:
        water && mashStep
          ? LL.brewday.steps.heatStrike.detail({
              vol: (water.volume * 0.55).toFixed(1),
              temp: mashStep.step_temp + 12,
            })
          : LL.brewday.steps.heatStrike.noData(),
    },
    {
      phase: p.mash(),
      label: LL.brewday.steps.mashIn.label(),
      duration: 5,
      detail: mashStep
        ? LL.brewday.steps.mashIn.detail({ temp: mashStep.step_temp })
        : LL.brewday.steps.mashIn.noSchedule(),
    },
    {
      phase: p.mash(),
      label: LL.brewday.steps.mashRest.label(),
      duration: mashStep?.step_time ?? 60,
      detail: mashStep
        ? LL.brewday.steps.mashRest.detail({ temp: mashStep.step_temp })
        : LL.brewday.steps.mashIn.noSchedule(),
    },
    {
      phase: p.lauter(),
      label: LL.brewday.steps.vorlauf.label(),
      duration: 10,
      detail: LL.brewday.steps.vorlauf.detail(),
    },
    {
      phase: p.lauter(),
      label: LL.brewday.steps.sparge.label(),
      duration: 30,
      detail: water
        ? LL.brewday.steps.sparge.detail({ vol: water.volume.toFixed(1) })
        : LL.brewday.steps.sparge.noProfile(),
    },
    {
      phase: p.boil(),
      label: LL.brewday.steps.bringToBoil.label(),
      duration: 15,
      detail: LL.brewday.steps.bringToBoil.detail(),
    },
    ...recipe.hops
      .filter((h) => h.use === 'Boil')
      .sort((a, b) => b.time - a.time)
      .map((h) => ({
        phase: p.boil(),
        label:
          h.time === 0
            ? LL.brewday.steps.flameout({ name: h.name })
            : LL.brewday.steps.hopAddition({ name: h.name }),
        duration: 0,
        detail: LL.brewday.steps.hopDetail({
          amount: h.amount,
          unit: h.unit,
          name: h.name,
          time: h.time,
          alpha: h.alpha,
        }),
      })),
    {
      phase: p.chill(),
      label: LL.brewday.steps.chillWort.label(),
      duration: 20,
      detail: yeast
        ? LL.brewday.steps.chillWort.detail({
            temp: rangeStart(yeast.temp_range),
          })
        : LL.brewday.steps.noYeastRecorded(),
    },
    {
      phase: p.ferment(),
      label: LL.brewday.steps.transfer.label(),
      duration: 10,
      detail: LL.brewday.steps.transfer.detail({ og: recipe.og }),
    },
    {
      phase: p.ferment(),
      label: LL.brewday.steps.pitchYeast.label(),
      duration: 5,
      detail: yeast
        ? LL.brewday.steps.pitchYeast.detail({
            name: yeast.name,
            range: yeast.temp_range,
          })
        : LL.brewday.steps.noYeastRecorded(),
    },
    {
      phase: p.ferment(),
      label: LL.brewday.steps.seal.label(),
      duration: 5,
      detail: LL.brewday.steps.seal.detail(),
    },
  ]

  return steps.map((s, i) => ({ ...s, id: i + 1 }))
}
