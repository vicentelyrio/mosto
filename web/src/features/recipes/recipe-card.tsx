import { Badge, Box, Group, SimpleGrid, Stack, Text } from '@mantine/core'

import type { Recipe } from '@domain'

import classes from './recipe-card.module.css'
import { srmToHex } from './srm'

const STATS = (recipe: Recipe) =>
  [
    ['ABV', `${recipe.abv}%`],
    ['IBU', recipe.ibu],
    ['OG', recipe.og.toFixed(3)],
    ['SRM', recipe.srm],
  ] as const

export function RecipeCard({
  recipe,
  onClick,
}: {
  recipe: Recipe
  onClick: () => void
}) {
  const color = srmToHex(recipe.srm)

  return (
    <Box className={classes.card} onClick={onClick}>
      <Box className={classes.band} bg={color} />
      <Stack gap="sm" p="md">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Stack gap={0}>
            <Text fw={700}>{recipe.name}</Text>
            <Text size="xs" c="dimmed">
              {recipe.style} · BJCP {recipe.bjcp_code}
            </Text>
          </Stack>
          <Group gap="xs" wrap="nowrap">
            {recipe.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="light" size="sm">
                {tag}
              </Badge>
            ))}
          </Group>
        </Group>

        <SimpleGrid cols={4} spacing="xs">
          {STATS(recipe).map(([label, value]) => (
            <Box key={label} className={classes.stat}>
              <Text size="xs" c="dimmed">
                {label}
              </Text>
              <Text fw={700}>{value}</Text>
            </Box>
          ))}
        </SimpleGrid>

        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            {recipe.batch_size} gal
          </Text>
          {recipe.last_brewed && (
            <Text size="xs" c="dimmed">
              Last brewed {recipe.last_brewed}
            </Text>
          )}
        </Group>
      </Stack>
    </Box>
  )
}
