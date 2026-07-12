import { useState } from 'react'

import { SimpleGrid } from '@mantine/core'

import { CalcCard } from './calc-card'
import { CalcField } from './calc-field'
import { LB_TO_G, LB_TO_KG, LB_TO_OZ } from './calculations'

export function WeightCalc() {
  const [lb, setLb] = useState<number | ''>(10)
  const val = lb === '' ? 0 : lb

  return (
    <CalcCard title="Weight">
      <SimpleGrid cols={2}>
        <CalcField
          label="Pounds"
          value={lb}
          onChange={setLb}
          unit="lb"
          highlight
        />
        <CalcField
          label="Ounces"
          value={Number((val * LB_TO_OZ).toFixed(2))}
          unit="oz"
          decimalScale={2}
        />
        <CalcField
          label="Kilograms"
          value={Number((val * LB_TO_KG).toFixed(3))}
          unit="kg"
          decimalScale={3}
        />
        <CalcField
          label="Grams"
          value={Number((val * LB_TO_G).toFixed(1))}
          unit="g"
          decimalScale={1}
        />
      </SimpleGrid>
    </CalcCard>
  )
}
