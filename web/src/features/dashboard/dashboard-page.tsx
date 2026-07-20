import { useI18nContext } from '@i18n/i18n-react'
import dayjs from 'dayjs'

import { Alert, SimpleGrid, Skeleton, Stack } from '@mantine/core'

import { useBrewSessions, useInventory, useRecipes } from '@domain'

import { isLowOrOut } from '@features/inventory'
import { PageTemplate } from '@templates/page-template'

import { ActiveBrewCard } from './active-brew-card'
import classes from './dashboard-page.module.css'
import { LowStockCard } from './low-stock-card'
import { QuickActionsCard } from './quick-actions-card'
import { RecentRecipesCard } from './recent-recipes-card'
import { StatCard } from './stat-card'
import { brewDayNumber } from './utils'

/** In-progress states — excludes `planning` (not yet started) and the two
 *  finished states (`packaged`, `archived`), which count toward the
 *  lifetime batch total but aren't "active". */
const ACTIVE_STATUSES = ['brewing', 'fermenting', 'conditioning']

export function DashboardPage() {
  const { LL } = useI18nContext()
  const { recipes, query: recipesQuery } = useRecipes()
  const { items, query: inventoryQuery } = useInventory()
  const { sessions, query: sessionsQuery } = useBrewSessions()

  const isLoading =
    recipesQuery.isLoading ||
    inventoryQuery.isLoading ||
    sessionsQuery.isLoading
  const isError =
    recipesQuery.isError || inventoryQuery.isError || sessionsQuery.isError

  const lowStockItems = items.filter(isLowOrOut)

  const activeBrews = sessions
    .filter((s) => ACTIVE_STATUSES.includes(s.status))
    .sort((a, b) => (b.started_at ?? 0) - (a.started_at ?? 0))
    .flatMap((session) => {
      const recipe = recipes.find((r) => r.id === session.recipe_id)
      return recipe ? [{ session, recipe }] : []
    })

  // Quick Actions only has room for one shortcut — the most recently
  // started brew is the most likely one to want to jump back into.
  const primaryBrew = activeBrews.at(0)
  const primaryDay = primaryBrew
    ? brewDayNumber(primaryBrew.session.started_at)
    : null

  const activeBrewStat =
    activeBrews.length === 0
      ? LL.dashboard.stats.activeBrewNone()
      : activeBrews.length === 1 && primaryDay
        ? LL.dashboard.stats.activeBrewDay({ day: primaryDay })
        : LL.dashboard.stats.activeBrewing({ count: activeBrews.length })
  const activeBrewSub =
    activeBrews.length === 1
      ? primaryBrew?.recipe.name
      : activeBrews.length > 1
        ? activeBrews
            .slice(0, 2)
            .map((b) => b.recipe.name)
            .concat(
              activeBrews.length > 2
                ? [
                    LL.dashboard.stats.moreRecipes({
                      count: activeBrews.length - 2,
                    }),
                  ]
                : [],
            )
            .join(', ')
        : undefined

  const completedBatches = sessions.filter(
    (s) => s.status === 'packaged' || s.status === 'archived',
  ).length

  return (
    <PageTemplate
      title={LL.nav.dashboard()}
      subtitle={dayjs().format('dddd, MMMM D, YYYY')}
    >
      {isError ? (
        <Alert color="red" title={LL.dashboard.loadError.title()}>
          {LL.dashboard.loadError.message()}
        </Alert>
      ) : isLoading ? (
        <Stack gap="md">
          <SimpleGrid cols={{ base: 2, sm: 4 }}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} height="6rem" radius="lg" />
            ))}
          </SimpleGrid>
          <Skeleton height="14rem" radius="lg" />
        </Stack>
      ) : (
        <>
          <div className={classes.stats}>
            <StatCard
              label={LL.dashboard.stats.recipes()}
              value={recipes.length}
              sub={LL.dashboard.stats.allGrain()}
            />
            <StatCard
              label={LL.dashboard.stats.totalBatches()}
              value={sessions.length}
              sub={
                sessions.length > 0
                  ? LL.dashboard.stats.completedCount({
                      count: completedBatches,
                    })
                  : undefined
              }
            />
            <StatCard
              label={LL.dashboard.stats.inventoryItems()}
              value={items.length}
              sub={
                lowStockItems.length > 0
                  ? LL.dashboard.stats.lowStockCount({
                      count: lowStockItems.length,
                    })
                  : LL.dashboard.stats.wellStocked()
              }
            />
            <StatCard
              label={
                activeBrews.length === 1
                  ? LL.dashboard.stats.activeBrew()
                  : LL.dashboard.stats.activeBrews()
              }
              value={activeBrewStat}
              sub={activeBrewSub}
              accent={activeBrews.length > 0}
            />
          </div>

          <div className={classes.layout}>
            <Stack gap="lg">
              {activeBrews.map(({ session, recipe }) => (
                <ActiveBrewCard
                  key={session.id}
                  session={session}
                  recipe={recipe}
                />
              ))}
              <RecentRecipesCard recipes={recipes} />
            </Stack>

            <Stack gap="md">
              <LowStockCard items={lowStockItems} />
              <QuickActionsCard activeRecipeId={primaryBrew?.recipe.id} />
            </Stack>
          </div>
        </>
      )}
    </PageTemplate>
  )
}
