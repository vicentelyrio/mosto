import { paths } from '@infrastructure'
import { useQueries } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import {
  Box,
  Group,
  Progress,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core'

import { fetchCompletedSteps, useBrewSessions, useRecipes } from '@domain'

import classes from './brewing-sidebar-widget.module.css'
import { generateSteps } from './steps'

/** Sidebar summary of in-progress brews — similar in shape to a "storage
 *  used" widget, but one row per active (non-archived) brew session instead
 *  of a single capacity bar, since there can be more than one going at once. */
export function BrewingSidebarWidget() {
  const navigate = useNavigate()
  const { sessions } = useBrewSessions()
  const { recipes } = useRecipes()

  const active = sessions.filter((s) => s.status !== 'archived')

  const stepQueries = useQueries({
    queries: active.map((s) => ({
      queryKey: ['brewday', 'sessions', s.id, 'steps'],
      queryFn: () => fetchCompletedSteps(s.id),
    })),
  })

  const rows = active
    .map((session, i) => {
      const recipe = recipes.find((r) => r.id === session.recipe_id)
      if (!recipe) return null
      const totalSteps = generateSteps(recipe).length
      const completed = stepQueries[i]?.data?.length ?? 0
      const pct =
        totalSteps === 0 ? 0 : Math.round((completed / totalSteps) * 100)
      return { session, recipe, completed, totalSteps, pct }
    })
    .filter((r) => r !== null)

  if (rows.length === 0) return null

  return (
    <Box className={classes.card}>
      <Group justify="space-between" mb="sm">
        <Text size="sm" fw={600}>
          Brewing
        </Text>
        <Text size="sm" c="dimmed">
          {rows.length}
        </Text>
      </Group>
      <Stack gap="sm">
        {rows.map(({ session, recipe, completed, totalSteps, pct }) => (
          <UnstyledButton
            key={session.id}
            onClick={() =>
              navigate({ to: paths.recipeBrewing, params: { id: recipe.id } })
            }
            className={classes.row}
          >
            <Group justify="space-between" mb={4} wrap="nowrap">
              <Text size="xs" truncate>
                {recipe.name}
              </Text>
              <Text size="xs" c="dimmed">
                {pct}%
              </Text>
            </Group>
            <Progress value={pct} size="xs" color="amber" mb={4} />
            <Text size="xs" c="dimmed">
              {completed} of {totalSteps} steps done
            </Text>
          </UnstyledButton>
        ))}
      </Stack>
    </Box>
  )
}
