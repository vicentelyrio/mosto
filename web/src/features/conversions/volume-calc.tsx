import { useState } from 'react'

import { useI18nContext } from '@i18n/i18n-react'

import { SimpleGrid } from '@mantine/core'

import { CalcCard } from './calc-card'
import { CalcField } from './calc-field'
import {
  GALLONS_TO_LITERS,
  GALLONS_TO_ML,
  GALLONS_TO_QUARTS,
} from './calculations'

export function VolumeCalc() {
  const { LL } = useI18nContext()
  const [gal, setGal] = useState<number | ''>(5)
  const val = gal === '' ? 0 : gal

  return (
    <CalcCard title={LL.conversions.volume.title()}>
      <SimpleGrid cols={2}>
        <CalcField
          label={LL.conversions.volume.gallonsLabel()}
          value={gal}
          onChange={setGal}
          unit="gal"
          highlight
        />
        <CalcField
          label={LL.conversions.volume.litresLabel()}
          value={Number((val * GALLONS_TO_LITERS).toFixed(2))}
          unit="L"
          decimalScale={2}
        />
        <CalcField
          label={LL.conversions.volume.quartsLabel()}
          value={Number((val * GALLONS_TO_QUARTS).toFixed(2))}
          unit="qt"
          decimalScale={2}
        />
        <CalcField
          label={LL.conversions.volume.millilitresLabel()}
          value={Math.round(val * GALLONS_TO_ML)}
          unit="mL"
          decimalScale={0}
        />
      </SimpleGrid>
    </CalcCard>
  )
}
