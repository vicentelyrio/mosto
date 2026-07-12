// Ported from the design project's brew-data.jsx `srmToHex`.
const STOPS: Array<[number, string]> = [
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
  for (let i = STOPS.length - 1; i >= 0; i--) {
    const [threshold, hex] = STOPS[i]
    if (srm >= threshold) return hex
  }
  return STOPS[0][1]
}
