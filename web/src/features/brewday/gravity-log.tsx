import { useState } from 'react'

import { useI18nContext } from '@i18n/i18n-react'

import {
  Alert,
  Box,
  Button,
  Group,
  NumberInput,
  Skeleton,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'

import type { Recipe } from '@domain'
import { useGravityLog } from '@domain'

import { sgToPlato } from '@features/conversions'

import classes from './gravity-log.module.css'

export function GravityLog({
  sessionId,
  recipe,
}: {
  sessionId: string
  recipe: Recipe
}) {
  const { LL } = useI18nContext()
  const { readings, query, add, remove } = useGravityLog(sessionId)
  const [sg, setSg] = useState<number | ''>('')
  const [temp, setTemp] = useState<number | ''>(68)
  const [note, setNote] = useState('')

  const logReading = () => {
    if (sg === '') return
    add.mutate(
      {
        date: new Date().toLocaleDateString(),
        sg,
        temp: temp === '' ? null : temp,
        note,
      },
      { onSuccess: () => setNote('') },
    )
    setSg('')
  }

  return (
    <Stack gap="md">
      <Text fw={700} size="md">
        {LL.brewday.gravity.title({ name: recipe.name })}
      </Text>

      <Group gap="sm">
        {[
          [LL.brewday.gravity.targetOg(), recipe.og.toFixed(3)],
          [LL.brewday.gravity.targetFg(), recipe.fg.toFixed(3)],
          [LL.brewday.gravity.estAbv(), `${recipe.abv}%`],
        ].map(([label, value]) => (
          <Box key={label} className={classes.chip}>
            <Text size="xs" c="dimmed">
              {label}
            </Text>
            <Text fw={700} c="amber">
              {value}
            </Text>
          </Box>
        ))}
      </Group>

      {query.isError ? (
        <Alert color="red" title={LL.brewday.gravity.loadError.title()}>
          {LL.brewday.gravity.loadError.message()}
        </Alert>
      ) : query.isLoading ? (
        <Stack gap="xs">
          {[0, 1].map((i) => (
            <Skeleton key={i} height={48} radius="sm" />
          ))}
        </Stack>
      ) : (
        <Stack gap="xs">
          {readings.map((entry) => (
            <Group key={entry.id} className={classes.entry} wrap="nowrap">
              <Box className={classes.dot} />
              <Box flex={1}>
                <Text size="sm" fw={600}>
                  {LL.brewday.gravity.entryLabel({
                    date: entry.date,
                    sg: entry.sg.toFixed(3),
                  })}
                </Text>
                {entry.note && (
                  <Text size="xs" c="dimmed">
                    {entry.note}
                  </Text>
                )}
              </Box>
              {entry.temp != null && (
                <Text size="xs" c="dimmed">
                  {entry.temp}°F
                </Text>
              )}
              <Text size="xs" c="amber" fw={600}>
                {sgToPlato(entry.sg).toFixed(1)}°P
              </Text>
              <Button
                size="compact-xs"
                variant="subtle"
                color="red"
                onClick={() => remove.mutate(entry.id)}
              >
                {LL.brewday.gravity.remove()}
              </Button>
            </Group>
          ))}
        </Stack>
      )}

      <Group gap="sm" wrap="wrap">
        <NumberInput
          className={classes.sgInput}
          placeholder={LL.brewday.gravity.sgPlaceholder()}
          value={sg}
          onChange={(v) => setSg(v === '' ? '' : Number(v))}
          decimalScale={3}
          hideControls
        />
        <NumberInput
          className={classes.tempInput}
          placeholder="°F"
          value={temp}
          onChange={(v) => setTemp(v === '' ? '' : Number(v))}
          hideControls
        />
        <TextInput
          className={classes.noteInput}
          placeholder={LL.brewday.gravity.notePlaceholder()}
          value={note}
          onChange={(e) => setNote(e.currentTarget.value)}
        />
        <Button onClick={logReading} loading={add.isPending}>
          {LL.brewday.gravity.log()}
        </Button>
      </Group>
    </Stack>
  )
}
