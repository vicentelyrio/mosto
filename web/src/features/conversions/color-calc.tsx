import { useState } from 'react'

import { useI18nContext } from '@i18n/i18n-react'

import {
  Box,
  Group,
  SimpleGrid,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core'

import { CalcCard } from './calc-card'
import { CalcField } from './calc-field'
import { srmToEbc, srmToHex, srmToLovibond } from './calculations'
import classes from './color-calc.module.css'

const REFERENCE_SRMS = [1, 3, 5, 8, 10, 13, 17, 20, 25, 30, 40]

export function ColorCalc() {
  const { LL } = useI18nContext()
  const [srm, setSrm] = useState<number | ''>(8)
  const val = srm === '' ? 0 : srm
  const hex = srmToHex(val)

  return (
    <CalcCard title={LL.conversions.color.title()}>
      <Group gap="md" wrap="nowrap" align="center">
        <Box
          className={classes.swatch}
          bg={hex}
          style={{ boxShadow: `0 0 1rem ${hex}80` }}
        />
        <Stack gap={2}>
          <Text size="xs" c="dimmed">
            {LL.conversions.color.approxColor()}
          </Text>
          <Text size="sm" fw={600}>
            {hex.toUpperCase()}
          </Text>
        </Stack>
      </Group>

      <SimpleGrid cols={3}>
        <CalcField
          label={LL.conversions.color.srmLabel()}
          value={srm}
          onChange={setSrm}
          unit="SRM"
          highlight
        />
        <CalcField
          label={LL.conversions.color.ebcLabel()}
          value={Number(srmToEbc(val).toFixed(1))}
          unit="EBC"
          decimalScale={1}
        />
        <CalcField
          label={LL.conversions.color.lovibondLabel()}
          value={Number(srmToLovibond(val).toFixed(1))}
          unit="°L"
          decimalScale={1}
        />
      </SimpleGrid>

      <Stack gap="xs">
        <Text size="xs" c="dimmed">
          {LL.conversions.color.reference()}
        </Text>
        <Group gap={6}>
          {REFERENCE_SRMS.map((v) => (
            <UnstyledButton
              key={v}
              title={LL.conversions.color.srmTitle({ value: v })}
              className={classes.refSwatch}
              data-active={val === v || undefined}
              bg={srmToHex(v)}
              onClick={() => setSrm(v)}
            />
          ))}
        </Group>
      </Stack>
    </CalcCard>
  )
}
