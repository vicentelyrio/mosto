import { useState } from 'react'

import { paths } from '@infrastructure'
import {
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router'

import {
  AppShell,
  Avatar,
  Box,
  Divider,
  Group,
  Menu,
  ScrollArea,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core'

import {
  ArrowsLeftRightIcon,
  BookOpenTextIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CookingPotIcon,
  PackageIcon,
  SquaresFourIcon,
  WrenchIcon,
} from '@phosphor-icons/react'

import { isTauri, useAuth } from '@domain'

import classes from './app-template.module.css'
import { BrewLogo } from './brew-logo'

const NAV = [
  { to: paths.dashboard, label: 'Dashboard', icon: SquaresFourIcon },
  { to: paths.recipes, label: 'Recipes', icon: BookOpenTextIcon },
  { to: paths.brewday, label: 'Brew Day', icon: CookingPotIcon },
  { to: paths.inventory, label: 'Inventory', icon: PackageIcon },
  { to: paths.equipment, label: 'Equipment', icon: WrenchIcon },
  { to: paths.conversions, label: 'Conversions', icon: ArrowsLeftRightIcon },
] as const

function initials(username: string) {
  return username.slice(0, 2).toUpperCase()
}

export function AppTemplate() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const { me, signOut } = useAuth()

  const showAccount = !isTauri && me.data
  const justify = collapsed ? 'center' : 'flex-start'

  const handleSignOut = () =>
    signOut.mutate(undefined, {
      onSuccess: () => navigate({ to: paths.login }),
    })

  return (
    <AppShell
      navbar={{
        width: collapsed ? 60 : 220,
        breakpoint: 'sm',
        collapsed: { mobile: true },
      }}
      padding="lg"
    >
      <AppShell.Navbar className={classes.navbar}>
        <Group
          className={classes.brand}
          justify={justify}
          gap={10}
          px={collapsed ? 0 : 16}
          py={20}
          wrap="nowrap"
        >
          <BrewLogo size={32} />
          {!collapsed && (
            <Text component="span" className={classes.wordmark}>
              Mosto
            </Text>
          )}
        </Group>

        <Divider color="dark.5" />

        <ScrollArea className={classes.navScroll}>
          <Stack gap={2}>
            {NAV.map((item) => {
              const active = pathname === item.to
              return (
                <UnstyledButton
                  key={item.to}
                  component={Link}
                  to={item.to}
                  title={collapsed ? item.label : undefined}
                  className={classes.navlink}
                  data-active={active || undefined}
                >
                  <Group gap={10} justify={justify} wrap="nowrap" w="100%">
                    <item.icon size={18} weight="bold" />
                    {!collapsed && (
                      <Text
                        component="span"
                        className={classes.navlabel}
                        truncate
                      >
                        {item.label}
                      </Text>
                    )}
                    {active && !collapsed && (
                      <Box component="span" className={classes.navdot} />
                    )}
                  </Group>
                </UnstyledButton>
              )
            })}
          </Stack>
        </ScrollArea>

        <UnstyledButton
          className={classes.collapseToggle}
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <CaretRightIcon size={14} weight="bold" />
          ) : (
            <CaretLeftIcon size={14} weight="bold" />
          )}
        </UnstyledButton>

        {showAccount && (
          <>
            <Divider color="dark.5" />
            <Menu position="top-start" width={200} withinPortal>
              <Menu.Target>
                <UnstyledButton
                  className={classes.profileBtn}
                  title={collapsed ? me.data?.username : undefined}
                >
                  <Group gap={10} justify={justify} wrap="nowrap" w="100%">
                    <Avatar
                      size={32}
                      radius="xl"
                      color="amber"
                      variant="light"
                      className={classes.avatar}
                    >
                      {initials(me.data?.username ?? '')}
                    </Avatar>
                    {!collapsed && (
                      <Stack gap={0} className={classes.profileText}>
                        <Text
                          component="span"
                          className={classes.profileName}
                          truncate
                        >
                          {me.data?.username}
                        </Text>
                        <Text component="span" className={classes.profileRole}>
                          Owner
                        </Text>
                      </Stack>
                    )}
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{me.data?.username}</Menu.Label>
                <Menu.Item color="red" onClick={handleSignOut}>
                  Sign out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </>
        )}
      </AppShell.Navbar>

      <AppShell.Main className={classes.main}>
        <Box className={classes.mainInner}>
          <Outlet />
        </Box>
      </AppShell.Main>

      <Box component="nav" className={classes.bottomNav}>
        {NAV.map((item) => {
          const active = pathname === item.to
          return (
            <UnstyledButton
              key={item.to}
              component={Link}
              to={item.to}
              className={classes.bottomNavItem}
              data-active={active || undefined}
            >
              <item.icon size={18} weight="bold" />
              <Text component="span">{item.label}</Text>
            </UnstyledButton>
          )
        })}
      </Box>
    </AppShell>
  )
}
