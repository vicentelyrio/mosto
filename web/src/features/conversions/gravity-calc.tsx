import { useState } from 'react'

import { useI18nContext } from '@i18n/i18n-react'

import { SimpleGrid, Text } from '@mantine/core'

import { CalcCard } from './calc-card'
import { CalcField } from './calc-field'
import { sgToBrix, sgToPlato } from './calculations'

export function GravityCalc() {
  const { LL } = useI18nContext()
  const [sg, setSg] = useState<number | ''>(1.05)
  const val = sg === '' ? 1 : sg

  return (
    <CalcCard title={LL.conversions.gravity.title()}>
      <SimpleGrid cols={3}>
        <CalcField
          label={LL.conversions.gravity.sgLabel()}
          value={sg}
          onChange={setSg}
          unit="SG"
          decimalScale={3}
          highlight
        />
        <CalcField
          label={LL.conversions.gravity.platoLabel()}
          value={Number(sgToPlato(val).toFixed(1))}
          unit="°P"
          decimalScale={1}
        />
        <CalcField
          label={LL.conversions.gravity.brixLabel()}
          value={Number(sgToBrix(val).toFixed(1))}
          unit="°Bx"
          decimalScale={1}
        />
      </SimpleGrid>
      <Text size="xs" c="dimmed" lh={1.7}>
        <strong>{LL.conversions.gravity.reference()}</strong>{' '}
        {LL.conversions.gravity.referenceBody()}
      </Text>
    </CalcCard>
  )
}
