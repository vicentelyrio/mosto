import { useMemo, useState } from 'react'

import { paths } from '@infrastructure'
import { useNavigate } from '@tanstack/react-router'

import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Center,
  Container,
  Group,
  Loader,
  Menu,
  Stack,
  Tabs,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core'
import { modals } from '@mantine/modals'

import {
  ArrowLeftIcon,
  DotsThreeVerticalIcon,
  TrashIcon,
  XCircleIcon,
} from '@phosphor-icons/react'

import {
  useBrewSessions,
  useRecipe,
  useSessionStatus,
  useStepCompletions,
} from '@domain'

import { srmToHex } from '@features/recipes'

import { BatchTimeline } from './batch-timeline'
import classes from './brewing-page.module.css'
import { CompletionCard } from './completion-card'
import { GravityLog } from './gravity-log'
import { HopSchedule } from './hop-schedule'
import { NowCard } from './now-card'
import { generateSteps } from './steps'
import { StepsList } from './steps-list'
import { useTimer } from './use-timer'
import { YeastCalcPanel } from './yeast-calc-panel'

export function BrewingPage({ recipeId }: { recipeId: string }) {
  const navigate = useNavigate()
  const { data: recipe, isLoading, isError } = useRecipe(recipeId)
  const {
    sessions,
    query: sessionsQuery,
    create: createSession,
    remove: removeSession,
  } = useBrewSessions()
  const timer = useTimer()
  const [timerStepId, setTimerStepId] = useState<number | null>(null)
  const [tab, setTab] = useState<string | null>('steps')

  const session = sessions
    .filter((s) => s.recipe_id === recipeId && s.status !== 'archived')
    .at(-1)

  const { update: updateStatus } = useSessionStatus(session)
  const { completedSteps, toggle } = useStepCompletions(session?.id)

  const steps = useMemo(() => (recipe ? generateSteps(recipe) : []), [recipe])
  const donePct =
    steps.length === 0
      ? 0
      : Math.round((completedSteps.length / steps.length) * 100)

  const current = useMemo(
    () => steps.find((s) => !completedSteps.includes(s.id)) ?? null,
    [steps, completedSteps],
  )
  const next = useMemo(() => {
    if (!current) return null
    const idx = steps.findIndex((s) => s.id === current.id)
    return (
      steps.slice(idx + 1).find((s) => !completedSteps.includes(s.id)) ?? null
    )
  }, [steps, completedSteps, current])

  const started = current !== null && timerStepId === current.id
  const currentElapsedMinutes =
    current && started
      ? Math.min(current.duration, Math.max(0, timer.elapsedSeconds / 60))
      : 0

  const handleStart = () => {
    if (!current) return
    timer.startWithMinutes(current.duration)
    timer.setRunning(true)
    setTimerStepId(current.id)
  }

  const handleConfirm = () => {
    if (!current) return
    toggle.mutate({ stepId: current.id, completed: true })
    if (next && next.duration > 0) {
      timer.startWithMinutes(next.duration)
      timer.setRunning(true)
      setTimerStepId(next.id)
    } else {
      timer.reset()
      setTimerStepId(null)
    }
  }

  const handleManualToggle = (stepId: number) => {
    const done = completedSteps.includes(stepId)
    toggle.mutate({ stepId, completed: !done })
    timer.reset()
    setTimerStepId(null)
  }

  const backToRecipe = () =>
    navigate({ to: paths.recipeDetail, params: { id: recipeId } })

  const confirmCancel = () => {
    if (!recipe) return
    modals.openConfirmModal({
      title: 'Cancel batch',
      children: (
        <Text size="sm">
          Cancel brewing <strong>{recipe.name}</strong>? This archives the
          session — logged steps and gravity readings are kept, but it moves out
          of your active brews.
        </Text>
      ),
      labels: { confirm: 'Cancel Batch', cancel: 'Keep Brewing' },
      confirmProps: { color: 'red' },
      onConfirm: () => updateStatus.mutate('archived'),
    })
  }

  const confirmDelete = () => {
    if (!recipe || !session) return
    modals.openConfirmModal({
      title: 'Delete batch',
      children: (
        <Text size="sm">
          Permanently delete this brew session for{' '}
          <strong>{recipe.name}</strong>? All logged steps and gravity readings
          will be lost. This can't be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => removeSession.mutate(session.id),
    })
  }

  if (isLoading || sessionsQuery.isLoading) {
    return (
      <Container size="lg" px={{ base: 'md', sm: 'xl' }} py="xl">
        <Center h={300}>
          <Loader />
        </Center>
      </Container>
    )
  }

  if (isError || !recipe) {
    return (
      <Container size="lg" px={{ base: 'md', sm: 'xl' }} py="xl">
        <Alert color="red" title="Recipe not found">
          This recipe no longer exists, or the link is invalid.
        </Alert>
      </Container>
    )
  }

  return (
    <Container size="lg" px={{ base: 'md', sm: 'xl' }} py="xl">
      <UnstyledButton
        onClick={backToRecipe}
        className={classes.backLink}
        mb="md"
      >
        <ArrowLeftIcon size={14} weight="bold" />
        <Text size="sm">Back to {recipe.name}</Text>
      </UnstyledButton>

      <Group align="flex-start" wrap="wrap" mb="lg" gap="lg">
        <Group align="flex-start" gap="md" wrap="nowrap" flex={1}>
          <Box className={classes.swatch} bg={srmToHex(recipe.srm)} />
          <Stack gap={4}>
            <Group gap="xs" wrap="nowrap">
              <Title order={1}>{recipe.name}</Title>
              {session && (
                <Badge color="amber" variant="light" size="lg" tt="uppercase">
                  {session.status}
                </Badge>
              )}
            </Group>
            <Text c="dimmed">
              {recipe.style} · BJCP {recipe.bjcp_code} · {recipe.batch_size} gal
            </Text>
          </Stack>
        </Group>

        {session && (
          <Group align="flex-start" gap="sm" wrap="nowrap">
            <Box ta="right">
              <Text fw={800} size="xl" c="amber">
                {donePct}%
              </Text>
              <Text size="xs" c="dimmed">
                {completedSteps.length}/{steps.length} steps done
              </Text>
            </Box>
            <Menu position="bottom-end" withinPortal>
              <Menu.Target>
                <ActionIcon
                  variant="default"
                  color="gray"
                  aria-label="Batch actions"
                >
                  <DotsThreeVerticalIcon size={18} weight="bold" />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  color="red"
                  leftSection={<XCircleIcon size={16} />}
                  onClick={confirmCancel}
                >
                  Cancel Batch
                </Menu.Item>
                <Menu.Item
                  color="red"
                  leftSection={<TrashIcon size={16} />}
                  onClick={confirmDelete}
                >
                  Delete Batch
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        )}
      </Group>

      {!session ? (
        <Stack align="flex-start" gap="md">
          <Text c="dimmed">
            No brew session yet for <strong>{recipe.name}</strong>.
          </Text>
          <Button
            loading={createSession.isPending}
            onClick={() =>
              createSession.mutate({
                recipe_id: recipe.id,
                status: 'brewing',
                started_at: Math.floor(Date.now() / 1000),
              })
            }
          >
            Start Brewing
          </Button>
        </Stack>
      ) : (
        <Tabs
          value={tab}
          onChange={setTab}
          variant="pills"
          classNames={{ tab: classes.tab }}
        >
          <Tabs.List mb="lg">
            <Tabs.Tab value="steps">Batch</Tabs.Tab>
            <Tabs.Tab value="gravity">Gravity Log</Tabs.Tab>
            <Tabs.Tab value="yeast">Yeast Calc</Tabs.Tab>
            <Tabs.Tab value="hops">Hop Schedule</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="steps">
            <BatchTimeline
              steps={steps}
              completedIds={completedSteps}
              current={current}
              currentElapsedMinutes={currentElapsedMinutes}
            />

            {current ? (
              <NowCard
                step={current}
                next={next}
                started={started}
                running={timer.running}
                displaySeconds={timer.displaySeconds}
                isOvertime={timer.isOvertime}
                targetSeconds={timer.targetSeconds}
                elapsedSeconds={timer.elapsedSeconds}
                onStart={handleStart}
                onPauseResume={timer.toggle}
                onPlus5={() => timer.addMinutes(5)}
                onConfirm={handleConfirm}
              />
            ) : (
              <CompletionCard
                recipeName={recipe.name}
                stepCount={steps.length}
                status={session.status}
                onLogGravity={() => setTab('gravity')}
                onMarkFermenting={() => updateStatus.mutate('fermenting')}
              />
            )}

            <StepsList
              steps={steps}
              completedIds={completedSteps}
              currentStepId={current?.id ?? null}
              liveStarted={started}
              liveDisplaySeconds={timer.displaySeconds}
              liveIsOvertime={timer.isOvertime}
              onToggle={handleManualToggle}
            />
          </Tabs.Panel>

          <Tabs.Panel value="gravity">
            <GravityLog sessionId={session.id} recipe={recipe} />
          </Tabs.Panel>

          <Tabs.Panel value="yeast">
            <YeastCalcPanel recipe={recipe} />
          </Tabs.Panel>

          <Tabs.Panel value="hops">
            <HopSchedule recipe={recipe} />
          </Tabs.Panel>
        </Tabs>
      )}
    </Container>
  )
}
