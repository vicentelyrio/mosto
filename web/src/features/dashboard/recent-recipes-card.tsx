import { useI18nContext } from '@i18n/i18n-react'
import { paths } from '@infrastructure'
import { useNavigate } from '@tanstack/react-router'

import { Box, Group, Stack, Text, UnstyledButton } from '@mantine/core'

import { CaretRightIcon } from '@phosphor-icons/react'

import type { Recipe } from '@domain'

import { srmToHex } from '@features/recipes'

import classes from './recent-recipes-card.module.css'

export function RecentRecipesCard({ recipes }: { recipes: Recipe[] }) {
  const { LL } = useI18nContext()
  const navigate = useNavigate()

  const recent = [...recipes]
    .sort((a, b) => b.created_at - a.created_at)
    .slice(0, 4)

  return (
    <Box className={classes.card}>
      <Group justify="space-between" className={classes.header}>
        <Text fw={700} size="sm">
          {LL.dashboard.recentRecipes.title()}
        </Text>
        <UnstyledButton
          onClick={() => navigate({ to: paths.recipes })}
          c="amber"
          fw={600}
          fz="xs"
        >
          {LL.dashboard.recentRecipes.viewAll()}
        </UnstyledButton>
      </Group>

      {recent.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl" size="sm">
          {LL.dashboard.recentRecipes.empty()}
        </Text>
      ) : (
        recent.map((recipe) => (
          <UnstyledButton
            key={recipe.id}
            className={classes.row}
            onClick={() =>
              navigate({ to: paths.recipeDetail, params: { id: recipe.id } })
            }
          >
            <Group wrap="nowrap" gap="md">
              <Box className={classes.swatch} bg={srmToHex(recipe.srm)} />
              <Stack gap={0} flex={1} style={{ minWidth: 0 }}>
                <Text fw={600} size="sm" truncate>
                  {recipe.name}
                </Text>
                <Text size="xs" c="dimmed" truncate>
                  {recipe.style}
                </Text>
              </Stack>
              <Group gap="lg" wrap="nowrap">
                <Stack gap={0} ta="right">
                  <Text size="xs" c="dimmed">
                    {LL.dashboard.recentRecipes.abv()}
                  </Text>
                  <Text size="sm" fw={600}>
                    {recipe.abv}%
                  </Text>
                </Stack>
                <Stack gap={0} ta="right">
                  <Text size="xs" c="dimmed">
                    {LL.dashboard.recentRecipes.ibu()}
                  </Text>
                  <Text size="sm" fw={600}>
                    {recipe.ibu}
                  </Text>
                </Stack>
              </Group>
              <CaretRightIcon size={14} color="var(--mantine-color-dimmed)" />
            </Group>
          </UnstyledButton>
        ))
      )}
    </Box>
  )
}
