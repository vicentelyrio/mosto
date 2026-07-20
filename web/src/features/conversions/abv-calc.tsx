import { useState } from 'react'

import { useI18nContext } from '@i18n/i18n-react'

import { Box, SimpleGrid, Text } from '@mantine/core'

import { CalcCard } from './calc-card'
import { CalcField } from './calc-field'
import { calcAbv, calcAbw, calcAttenuation } from './calculations'
import classes from './stat-tile.module.css'

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Box className={classes.tile}>
      <Text size="xs" c="dimmed" mb={4}>
        {label}
      </Text>
      <Text size="xl" fw={800} c="amber">
        {value}
      </Text>
    </Box>
  )
}

export function AbvCalc() {
  const { LL } = useI18nContext()
  const [og, setOg] = useState<number | ''>(1.065)
  const [fg, setFg] = useState<number | ''>(1.012)

  const ogVal = og === '' ? 1 : og
  const fgVal = fg === '' ? 1 : fg
  const abv = calcAbv(ogVal, fgVal)
  const abw = calcAbw(abv)
  const attenuation = calcAttenuation(ogVal, fgVal)

  return (
    <CalcCard title={LL.conversions.abv.title()}>
      <SimpleGrid cols={2}>
        <CalcField
          label={LL.conversions.abv.ogLabel()}
          value={og}
          onChange={setOg}
          unit="OG"
          decimalScale={3}
          highlight
        />
        <CalcField
          label={LL.conversions.abv.fgLabel()}
          value={fg}
          onChange={setFg}
          unit="FG"
          decimalScale={3}
          highlight
        />
      </SimpleGrid>
      <SimpleGrid cols={3}>
        <StatTile
          label={LL.conversions.abv.abv()}
          value={`${abv.toFixed(1)}%`}
        />
        <StatTile
          label={LL.conversions.abv.abw()}
          value={`${abw.toFixed(2)}%`}
        />
        <StatTile
          label={LL.conversions.abv.attenuation()}
          value={`${attenuation.toFixed(1)}%`}
        />
      </SimpleGrid>
    </CalcCard>
  )
}
