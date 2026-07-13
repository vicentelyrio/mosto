// Ported from the design project's `YeastCalc` in brew-brewday.jsx.

export type YeastForm = 'liquid' | 'dry'

/** Billion cells per package, by pitchable form. */
export function cellsPerPackage(form: YeastForm): number {
  return form === 'liquid' ? 100 : 200
}

/** Billion cells needed for the batch (rough pitch-rate estimate: 0.75M
 *  cells/mL/°P for ales, 1.5x that above 1.075 OG for high-gravity beers). */
export function cellsNeeded(volumeGal: number, og: number): number {
  const rate = og > 1.075 ? 1.5 : 1.0
  return Math.round((volumeGal * rate * 750000 * (og - 1) * 1000) / 1000000)
}

export function packagesNeeded(
  volumeGal: number,
  og: number,
  form: YeastForm,
): number {
  return Math.ceil(cellsNeeded(volumeGal, og) / cellsPerPackage(form))
}
