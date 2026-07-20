import { useState } from 'react'

import { useI18nContext } from '@i18n/i18n-react'

import { SimpleGrid } from '@mantine/core'

import { CalcCard } from './calc-card'
import { CalcField } from './calc-field'
import { LB_TO_G, LB_TO_KG, LB_TO_OZ } from './calculations'

export function WeightCalc() {
  const { LL } = useI18nContext()
  const [lb, setLb] = useState<number | ''>(10)
  const val = lb === '' ? 0 : lb

  return (
    <CalcCard title={LL.conversions.weight.title()}>
      <SimpleGrid cols={2}>
        <CalcField
          label={LL.conversions.weight.poundsLabel()}
          value={lb}
          onChange={setLb}
          unit="lb"
          highlight
        />
        <CalcField
          label={LL.conversions.weight.ouncesLabel()}
          value={Number((val * LB_TO_OZ).toFixed(2))}
          unit="oz"
          decimalScale={2}
        />
        <CalcField
          label={LL.conversions.weight.kilogramsLabel()}
          value={Number((val * LB_TO_KG).toFixed(3))}
          unit="kg"
          decimalScale={3}
        />
        <CalcField
          label={LL.conversions.weight.gramsLabel()}
          value={Number((val * LB_TO_G).toFixed(1))}
          unit="g"
          decimalScale={1}
        />
      </SimpleGrid>
    </CalcCard>
  )
}
