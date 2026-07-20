import { useI18nContext } from '@i18n/i18n-react'
import { paths } from '@infrastructure'
import { useNavigate } from '@tanstack/react-router'

import { Box, Stack, Text, UnstyledButton } from '@mantine/core'

import classes from './quick-actions-card.module.css'

export function QuickActionsCard({
  activeRecipeId,
}: {
  activeRecipeId?: string
}) {
  const { LL } = useI18nContext()
  const navigate = useNavigate()

  const actions = [
    {
      label: LL.dashboard.quickActions.newRecipe(),
      go: () => navigate({ to: paths.newRecipe }),
    },
    activeRecipeId
      ? {
          label: LL.dashboard.quickActions.continueBrewing(),
          go: () =>
            navigate({
              to: paths.recipeBrewing,
              params: { id: activeRecipeId },
            }),
        }
      : {
          label: LL.dashboard.quickActions.startBrewDay(),
          go: () => navigate({ to: paths.recipes }),
        },
    {
      label: LL.nav.conversions(),
      go: () => navigate({ to: paths.conversions }),
    },
  ]

  return (
    <Box className={classes.card}>
      <Text className={classes.title} mb="sm">
        {LL.dashboard.quickActions.title()}
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
