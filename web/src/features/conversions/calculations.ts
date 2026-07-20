// Pure brewing math — ported from the design project's brew-data.jsx /
// brew-conversions.jsx. No persistence, so this stays client-only.

import type { TranslationFunctions } from '@i18n/i18n-types'

export function sgToPlato(sg: number): number {
  return -616.868 + 1111.14 * sg - 630.272 * sg ** 2 + 135.997 * sg ** 3
}

export function sgToBrix(sg: number): number {
  return ((182.4601 * sg - 775.6821) * sg + 1262.7794) * sg - 669.5622
}

export function fToC(f: number): number {
  return ((f - 32) * 5) / 9
}

export function cToF(c: number): number {
  return (c * 9) / 5 + 32
}

export function calcAbv(og: number, fg: number): number {
  return (og - fg) * 131.25
}

export function calcAbw(abv: number): number {
  return abv * 0.8
}

export function calcAttenuation(og: number, fg: number): number {
  return ((og - fg) / (og - 1)) * 100
}

export function srmToEbc(srm: number): number {
  return srm * 1.97
}

export function srmToLovibond(srm: number): number {
  return srm * 0.508 + 0.56
}

// Ported from the design project's brew-data.jsx `srmToHex`.
const SRM_STOPS: Array<[number, string]> = [
  [1, '#FFE699'],
  [2, '#FFD878'],
  [3, '#FFCA5A'],
  [4, '#FFBF42'],
  [5, '#FBB123'],
  [6, '#F8A600'],
  [7, '#F39C00'],
  [8, '#EA8F00'],
  [9, '#E58500'],
  [10, '#DE7C00'],
  [11, '#D77200'],
  [12, '#CF6900'],
  [14, '#C35900'],
  [16, '#B54C00'],
  [18, '#A63E00'],
  [22, '#8D2000'],
  [28, '#771001'],
  [40, '#4A0300'],
]

export function srmToHex(srm: number): string {
  for (let i = SRM_STOPS.length - 1; i >= 0; i--) {
    const [threshold, hex] = SRM_STOPS[i]
    if (srm >= threshold) return hex
  }
  return SRM_STOPS[0][1]
}

export const GALLONS_TO_LITERS = 3.78541
export const GALLONS_TO_QUARTS = 4
export const GALLONS_TO_ML = 3785.41

export const LB_TO_OZ = 16
export const LB_TO_KG = 0.453592
export const LB_TO_G = 453.592

export interface WaterIonProfile {
  ca: number
  mg: number
  na: number
  so4: number
  cl: number
}

export const WATER_ION_RANGES: Record<keyof WaterIonProfile, [number, number]> =
  {
    ca: [50, 150],
    mg: [0, 30],
    na: [0, 150],
    so4: [0, 300],
    cl: [0, 200],
  }

export function sulfateChlorideProfile(
  LL: TranslationFunctions,
  so4: number,
  cl: number,
): { label: string; color: string } {
  const ratio = so4 / (cl || 1)
  if (ratio > 3)
    return { label: LL.conversions.water.profile.hoppy(), color: 'green' }
  if (ratio > 1.5)
    return {
      label: LL.conversions.water.profile.balancedHoppy(),
      color: 'yellow',
    }
  if (ratio > 0.7)
    return { label: LL.conversions.water.profile.balanced(), color: 'gray' }
  return { label: LL.conversions.water.profile.malty(), color: 'amber' }
}
