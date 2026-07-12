import { useState } from 'react'

import { SimpleGrid, Text } from '@mantine/core'

import { CalcCard } from './calc-card'
import { CalcField } from './calc-field'
import { sgToBrix, sgToPlato } from './calculations'

export function GravityCalc() {
  const [sg, setSg] = useState<number | ''>(1.05)
  const val = sg === '' ? 1 : sg

  return (
    <CalcCard title="Gravity Conversions">
      <SimpleGrid cols={3}>
        <CalcField
          label="Specific Gravity"
          value={sg}
          onChange={setSg}
          unit="SG"
          decimalScale={3}
          highlight
        />
        <CalcField
          label="Degrees Plato"
          value={Number(sgToPlato(val).toFixed(1))}
          unit="°P"
          decimalScale={1}
        />
        <CalcField
          label="Brix"
          value={Number(sgToBrix(val).toFixed(1))}
          unit="°Bx"
          decimalScale={1}
        />
      </SimpleGrid>
      <Text size="xs" c="dimmed" lh={1.7}>
        <strong>Reference:</strong> OG 1.000 = 0°P · 1.040 = 10°P · 1.060 =
        14.7°P · 1.080 = 19.3°P · 1.100 = 23.8°P
      </Text>
    </CalcCard>
  )
}
