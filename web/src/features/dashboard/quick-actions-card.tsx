import { paths } from '@infrastructure'
import { useNavigate } from '@tanstack/react-router'

import { Box, Stack, Text, UnstyledButton } from '@mantine/core'

import classes from './quick-actions-card.module.css'

export function QuickActionsCard({
  activeRecipeId,
}: {
  activeRecipeId?: string
}) {
  const navigate = useNavigate()

  const actions = [
    { label: 'New Recipe', go: () => navigate({ to: paths.newRecipe }) },
    activeRecipeId
      ? {
          label: 'Continue Brewing',
          go: () =>
            navigate({
              to: paths.recipeBrewing,
              params: { id: activeRecipeId },
            }),
        }
      : {
          label: 'Start Brew Day',
          go: () => navigate({ to: paths.recipes }),
        },
    { label: 'Conversions', go: () => navigate({ to: paths.conversions }) },
  ]

  return (
    <Box className={classes.card}>
      <Text className={classes.title} mb="sm">
        Quick Actions
      </Text>
      <Stack gap="xs">
        {actions.map(({ label, go }) => (
          <UnstyledButton key={label} className={classes.action} onClick={go}>
            {label}
          </UnstyledButton>
        ))}
      </Stack>
    </Box>
  )
}
