import { useRef, useState } from 'react'

import { paths } from '@infrastructure'
import { useNavigate } from '@tanstack/react-router'

import {
  Button,
  Group,
  Menu,
  Select,
  Skeleton,
  Text,
  TextInput,
} from '@mantine/core'

import { CaretDownIcon, UploadSimpleIcon } from '@phosphor-icons/react'

import { ApiError, beerXmlToRecipeInput, useRecipes } from '@domain'

import { CardGrid } from '@templates/card-grid'
import { PageTemplate } from '@templates/page-template'

import { RecipeCard } from './recipe-card'
import classes from './recipe-list.module.css'

const SORTS = {
  name: (a: { name: string }, b: { name: string }) =>
    a.name.localeCompare(b.name),
  recent: (
    a: { last_brewed: string | null },
    b: { last_brewed: string | null },
  ) => (b.last_brewed ?? '').localeCompare(a.last_brewed ?? ''),
  abv: (a: { abv: number }, b: { abv: number }) => b.abv - a.abv,
  ibu: (a: { ibu: number }, b: { ibu: number }) => b.ibu - a.ibu,
} as const

type SortKey = keyof typeof SORTS

export function RecipeList() {
  const navigate = useNavigate()
  const { recipes, query, create } = useRecipes()
  const fileInput = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('name')

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

  const filtered = recipes
    .filter((r) => {
      const q = search.toLowerCase()
      return (
        r.name.toLowerCase().includes(q) ||
        r.style.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
    .sort(SORTS[sort])

  return (
    <PageTemplate
      title="Recipes"
      subtitle={`${recipes.length} all-grain recipes`}
      actions={
        <Menu position="bottom-end">
          <Menu.Target>
            <Button rightSection={<CaretDownIcon size={14} weight="bold" />}>
              + New Recipe
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={() => navigate({ to: paths.newRecipe })}>
              New Recipe
            </Menu.Item>
            <Menu.Item
              leftSection={<UploadSimpleIcon size={16} />}
              onClick={pickFile}
            >
              Import BeerXML
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      }
    >
      <input
        ref={fileInput}
        type="file"
        accept=".xml,application/xml,text/xml"
        className={classes.hiddenInput}
        onChange={onFileSelected}
      />

      <Group mb="lg" wrap="wrap">
        <TextInput
          className={classes.search}
          placeholder="Search recipes…"
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
        <Select
          value={sort}
          onChange={(value) => setSort((value as SortKey) ?? 'name')}
          allowDeselect={false}
          data={[
            { value: 'name', label: 'Sort: Name' },
            { value: 'recent', label: 'Sort: Recent' },
            { value: 'abv', label: 'Sort: ABV' },
            { value: 'ibu', label: 'Sort: IBU' },
          ]}
        />
      </Group>

      {importError && (
        <Text c="red" size="sm" mb="md">
          {importError}
        </Text>
      )}

      {query.isLoading ? (
        <CardGrid>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height="11.25rem" radius="lg" />
          ))}
        </CardGrid>
      ) : (
        <CardGrid>
          {filtered.map((r) => (
            <RecipeCard
              key={r.id}
              recipe={r}
              onClick={() =>
                navigate({ to: paths.recipeDetail, params: { id: r.id } })
              }
            />
          ))}
        </CardGrid>
      )}
    </PageTemplate>
  )
}
