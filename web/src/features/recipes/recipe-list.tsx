import { useRef, useState } from 'react'

import { paths } from '@infrastructure'
import { Link } from '@tanstack/react-router'

import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core'

import { UploadSimpleIcon } from '@phosphor-icons/react'

import { ApiError, beerXmlToRecipeInput, useRecipes } from '@domain'

import classes from './recipe-list.module.css'
import { srmToHex } from './srm'

export function RecipeList() {
  const { recipes, query, create } = useRecipes()
  const fileInput = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)

  const pickFile = () => fileInput.current?.click()

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setImportError(null)
    try {
      const xml = await file.text()
      const input = beerXmlToRecipeInput(xml)
      create.mutate(input)
    } catch (err) {
      setImportError(
        err instanceof ApiError
          ? err.message
          : 'Could not read that BeerXML file',
      )
    }
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Recipes</Title>
        <Box>
          <input
            ref={fileInput}
            type="file"
            accept=".xml,application/xml,text/xml"
            className={classes.hiddenInput}
            onChange={onFileSelected}
          />
          <Button
            variant="light"
            leftSection={<UploadSimpleIcon size={16} weight="bold" />}
            onClick={pickFile}
            loading={create.isPending}
          >
            Import BeerXML
          </Button>
        </Box>
      </Group>

      {importError && (
        <Text c="red" size="sm">
          {importError}
        </Text>
      )}

      {query.isLoading ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={140} radius="lg" />
          ))}
        </SimpleGrid>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {recipes.map((r) => (
            <Link
              key={r.id}
              to={paths.recipeDetail}
              params={{ id: r.id }}
              className={classes.cardLink}
            >
              <Card withBorder className={classes.card}>
                <Group justify="space-between" mb="xs">
                  <Text fw={700}>{r.name}</Text>
                  <Box className={classes.swatch} bg={srmToHex(r.srm)} />
                </Group>
                <Text size="sm" c="dimmed" mb="sm">
                  {r.style} · {r.bjcp_code}
                </Text>
                <Group gap="xs">
                  <Badge variant="light">{r.abv}% ABV</Badge>
                  <Badge variant="light">{r.ibu} IBU</Badge>
                  <Badge variant="light">OG {r.og.toFixed(3)}</Badge>
                </Group>
              </Card>
            </Link>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  )
}
