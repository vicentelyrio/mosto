import { useState } from 'react'

import { SimpleGrid } from '@mantine/core'

import { CalcCard } from './calc-card'
import { CalcField } from './calc-field'
import {
  GALLONS_TO_LITERS,
  GALLONS_TO_ML,
  GALLONS_TO_QUARTS,
} from './calculations'

export function VolumeCalc() {
  const [gal, setGal] = useState<number | ''>(5)
  const val = gal === '' ? 0 : gal

  return (
    <CalcCard title="Volume">
      <SimpleGrid cols={2}>
        <CalcField
          label="Gallons"
          value={gal}
          onChange={setGal}
          unit="gal"
          highlight
        />
        <CalcField
          label="Litres"
          value={Number((val * GALLONS_TO_LITERS).toFixed(2))}
          unit="L"
          decimalScale={2}
        />
        <CalcField
          label="Quarts"
          value={Number((val * GALLONS_TO_QUARTS).toFixed(2))}
          unit="qt"
          decimalScale={2}
        />
        <CalcField
          label="Millilitres"
          value={Math.round(val * GALLONS_TO_ML)}
          unit="mL"
          decimalScale={0}
        />
      </SimpleGrid>
    </CalcCard>
  )
}
