import { Badge, Box, Group, SimpleGrid, Stack, Text } from '@mantine/core'

import type { Recipe } from '@domain'

import { RecipeActionsMenu } from './recipe-actions-menu'
import classes from './recipe-card.module.css'
import { RecipeContextMenu } from './recipe-context-menu'
import { srmToHex } from './srm'
import { useRecipeActions } from './use-recipe-actions'

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
  const { isBrewing } = useRecipeActions(recipe)

  return (
    <RecipeContextMenu recipe={recipe}>
      <Box className={classes.card} onClick={onClick}>
        <Box className={classes.band} bg={color} />
        <Stack gap="sm" p="md">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Stack gap={0}>
              <Group gap="xs" wrap="nowrap">
                <Text fw={700}>{recipe.name}</Text>
                {isBrewing && (
                  <Badge color="amber" variant="light" size="sm">
                    Brewing
                  </Badge>
                )}
              </Group>
              <Text size="xs" c="dimmed">
                {recipe.style} · BJCP {recipe.bjcp_code}
              </Text>
            </Stack>
            <RecipeActionsMenu recipe={recipe} />
          </Group>

          {recipe.tags.length > 0 && (
            <Group gap="xs">
              {recipe.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="light" size="sm">
                  {tag}
                </Badge>
              ))}
            </Group>
          )}

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
    </RecipeContextMenu>
  )
}
