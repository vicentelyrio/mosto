import { paths } from '@infrastructure'
import { Link } from '@tanstack/react-router'

import {
  Badge,
  Box,
  Button,
  Group,
  Loader,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'

import { DownloadSimpleIcon } from '@phosphor-icons/react'

import { downloadBeerXml, useRecipe } from '@domain'

export function RecipeDetail({ id }: { id: string }) {
  const { data: recipe, isLoading } = useRecipe(id)

  if (isLoading || !recipe) {
    return <Loader />
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <Box>
          <Link to={paths.recipes}>&larr; Recipes</Link>
          <Title order={2} mt="xs">
            {recipe.name}
          </Title>
          <Text c="dimmed">
            {recipe.style} · {recipe.bjcp_code} · {recipe.batch_size} gal
          </Text>
        </Box>
        <Button
          variant="light"
          leftSection={<DownloadSimpleIcon size={16} weight="bold" />}
          onClick={() => downloadBeerXml(recipe)}
        >
          Export BeerXML
        </Button>
      </Group>

      <Group gap="xs">
        <Badge variant="light">OG {recipe.og.toFixed(3)}</Badge>
        <Badge variant="light">FG {recipe.fg.toFixed(3)}</Badge>
        <Badge variant="light">{recipe.abv}% ABV</Badge>
        <Badge variant="light">{recipe.ibu} IBU</Badge>
        <Badge variant="light">{recipe.srm} SRM</Badge>
        <Badge variant="light">{recipe.efficiency}% efficiency</Badge>
      </Group>

      {recipe.notes && <Text size="sm">{recipe.notes}</Text>}

      {recipe.style_guide && (
        <Box>
          <Title order={4} mb="xs">
            Style guidelines — {recipe.style_guide.category}
            {recipe.style_guide.category_number}
            {recipe.style_guide.style_letter}
          </Title>
          <Group gap="md">
            <Text size="sm">
              OG {recipe.style_guide.og_min.toFixed(3)}–
              {recipe.style_guide.og_max.toFixed(3)}
            </Text>
            <Text size="sm">
              FG {recipe.style_guide.fg_min.toFixed(3)}–
              {recipe.style_guide.fg_max.toFixed(3)}
            </Text>
            <Text size="sm">
              IBU {recipe.style_guide.ibu_min}–{recipe.style_guide.ibu_max}
            </Text>
            <Text size="sm">
              SRM {recipe.style_guide.color_min}–{recipe.style_guide.color_max}
            </Text>
            {recipe.style_guide.abv_min != null &&
              recipe.style_guide.abv_max != null && (
                <Text size="sm">
                  ABV {recipe.style_guide.abv_min}–{recipe.style_guide.abv_max}%
                </Text>
              )}
          </Group>
          {recipe.style_guide.notes && (
            <Text size="sm" c="dimmed" mt="xs">
              {recipe.style_guide.notes}
            </Text>
          )}
        </Box>
      )}

      <Box>
        <Title order={4} mb="xs">
          Grain bill
        </Title>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Grain</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>%</Table.Th>
              <Table.Th>Yield</Table.Th>
              <Table.Th>Color</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {recipe.grains.map((g) => (
              <Table.Tr key={g.name}>
                <Table.Td>{g.name}</Table.Td>
                <Table.Td>{g.type}</Table.Td>
                <Table.Td>
                  {g.amount} {g.unit}
                </Table.Td>
                <Table.Td>{g.pct}%</Table.Td>
                <Table.Td>{g.yield_pct}%</Table.Td>
                <Table.Td>{g.color_lovibond}°L</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>

      <Box>
        <Title order={4} mb="xs">
          Hop schedule
        </Title>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Hop</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>Time</Table.Th>
              <Table.Th>Use</Table.Th>
              <Table.Th>AA%</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {recipe.hops.map((h, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: hop names repeat across additions (e.g. two Cascade boil additions)
              <Table.Tr key={i}>
                <Table.Td>{h.name}</Table.Td>
                <Table.Td>
                  {h.amount} {h.unit}
                </Table.Td>
                <Table.Td>{h.time}m</Table.Td>
                <Table.Td>{h.use}</Table.Td>
                <Table.Td>{h.alpha}%</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>

      <Box>
        <Title order={4} mb="xs">
          Yeast
        </Title>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Strain</Table.Th>
              <Table.Th>Attenuation</Table.Th>
              <Table.Th>Temp range</Table.Th>
              <Table.Th>Form</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {recipe.yeasts.map((y) => (
              <Table.Tr key={y.name}>
                <Table.Td>{y.name}</Table.Td>
                <Table.Td>{y.attenuation}%</Table.Td>
                <Table.Td>{y.temp_range}</Table.Td>
                <Table.Td>{y.form}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>

      {recipe.mash && (
        <Box>
          <Title order={4} mb="xs">
            Mash — {recipe.mash.name}
          </Title>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Step</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Temp</Table.Th>
                <Table.Th>Time</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {recipe.mash.steps.map((s) => (
                <Table.Tr key={s.name}>
                  <Table.Td>{s.name}</Table.Td>
                  <Table.Td>{s.type}</Table.Td>
                  <Table.Td>{s.step_temp}°F</Table.Td>
                  <Table.Td>{s.step_time}min</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
      )}

      {recipe.water && (
        <Box>
          <Title order={4} mb="xs">
            Water profile
          </Title>
          <Group gap="md">
            <Text size="sm">Vol {recipe.water.volume} gal</Text>
            <Text size="sm">pH {recipe.water.ph}</Text>
            <Text size="sm">Ca {recipe.water.ca}</Text>
            <Text size="sm">Mg {recipe.water.mg}</Text>
            <Text size="sm">Na {recipe.water.na}</Text>
            <Text size="sm">SO4 {recipe.water.so4}</Text>
            <Text size="sm">Cl {recipe.water.cl}</Text>
            <Text size="sm">HCO3 {recipe.water.hco3}</Text>
          </Group>
        </Box>
      )}
    </Stack>
  )
}
