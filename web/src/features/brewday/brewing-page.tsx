import { useMemo } from 'react'

import { paths } from '@infrastructure'
import { useNavigate } from '@tanstack/react-router'

import {
  Alert,
  Badge,
  Box,
  Button,
  Center,
  Container,
  Group,
  Loader,
  Progress,
  Stack,
  Tabs,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core'

import { ArrowLeftIcon } from '@phosphor-icons/react'

import { useBrewSessions, useRecipe, useStepCompletions } from '@domain'

import { srmToHex } from '@features/recipes'

import classes from './brewing-page.module.css'
import { GravityLog } from './gravity-log'
import { HopSchedule } from './hop-schedule'
import { generateSteps } from './steps'
import { StepsList } from './steps-list'
import { Timer } from './timer'
import { useTimer } from './use-timer'
import { YeastCalcPanel } from './yeast-calc-panel'

export function BrewingPage({ recipeId }: { recipeId: string }) {
  const navigate = useNavigate()
  const { data: recipe, isLoading, isError } = useRecipe(recipeId)
  const {
    sessions,
    query: sessionsQuery,
    create: createSession,
  } = useBrewSessions()
  const timer = useTimer()

  const session = sessions
    .filter((s) => s.recipe_id === recipeId && s.status !== 'archived')
    .at(-1)

  const { completedSteps, toggle } = useStepCompletions(session?.id)

  const steps = useMemo(() => (recipe ? generateSteps(recipe) : []), [recipe])
  const donePct =
    steps.length === 0
      ? 0
      : Math.round((completedSteps.length / steps.length) * 100)

  const startTimerForStep = (minutes: number) => {
    timer.startWithMinutes(minutes)
    timer.setRunning(true)
  }

  const backToRecipe = () =>
    navigate({ to: paths.recipeDetail, params: { id: recipeId } })

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
                <Badge color="amber" variant="light" size="lg">
                  Brewing
                </Badge>
              )}
            </Group>
            <Text c="dimmed">
              {recipe.style} · BJCP {recipe.bjcp_code} · {recipe.batch_size} gal
            </Text>
          </Stack>
        </Group>

        {session && (
          <Box ta="right">
            <Text fw={800} size="xl" c="amber">
              {donePct}%
            </Text>
            <Text size="xs" c="dimmed">
              {completedSteps.length}/{steps.length} steps done
            </Text>
          </Box>
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
        <>
          <Progress value={donePct} color="amber" size="sm" mb="lg" />

          <Box className={classes.timerStrip} mb="lg" p="md">
            <Timer
              seconds={timer.seconds}
              running={timer.running}
              onToggle={timer.toggle}
              onReset={timer.reset}
              onPreset={timer.startWithMinutes}
            />
          </Box>

          <Tabs
            defaultValue="steps"
            variant="pills"
            classNames={{ tab: classes.tab }}
          >
            <Tabs.List mb="lg">
              <Tabs.Tab value="steps">Steps</Tabs.Tab>
              <Tabs.Tab value="gravity">Gravity Log</Tabs.Tab>
              <Tabs.Tab value="yeast">Yeast Calc</Tabs.Tab>
              <Tabs.Tab value="hops">Hop Schedule</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="steps">
              <StepsList
                steps={steps}
                completedIds={completedSteps}
                onToggle={(stepId) => {
                  const done = completedSteps.includes(stepId)
                  toggle.mutate({ stepId, completed: !done })
                }}
                onStartTimer={startTimerForStep}
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
        </>
      )}
    </Container>
  )
}
