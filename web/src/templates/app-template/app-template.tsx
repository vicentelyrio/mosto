import { useState } from 'react'

import { useI18nContext } from '@i18n/i18n-react'
import type { Locales } from '@i18n/i18n-types'
import { loadLocaleAsync } from '@i18n/i18n-util.async'
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
  CheckIcon,
  GlobeIcon,
  PackageIcon,
  SquaresFourIcon,
  WrenchIcon,
} from '@phosphor-icons/react'

import { isTauri, useAuth } from '@domain'

import { BrewingSidebarWidget } from '@features/brewday'

import classes from './app-template.module.css'
import { BrewLogo } from './brew-logo'

function initials(username: string) {
  return username.slice(0, 2).toUpperCase()
}

const LANGUAGES: { code: Locales; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'pt-BR', label: 'Português' },
  { code: 'es', label: 'Español' },
]

export function AppTemplate() {
  const { LL, locale, setLocale } = useI18nContext()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const { me, signOut } = useAuth()

  const NAV = [
    { to: paths.dashboard, label: LL.nav.dashboard(), icon: SquaresFourIcon },
    { to: paths.recipes, label: LL.nav.recipes(), icon: BookOpenTextIcon },
    { to: paths.inventory, label: LL.nav.inventory(), icon: PackageIcon },
    { to: paths.equipment, label: LL.nav.equipment(), icon: WrenchIcon },
    {
      to: paths.conversions,
      label: LL.nav.conversions(),
      icon: ArrowsLeftRightIcon,
    },
  ] as const

  const showAccount = !isTauri && me.data
  const justify = collapsed ? 'center' : 'flex-start'

  const handleSignOut = () =>
    signOut.mutate(undefined, {
      onSuccess: () => navigate({ to: paths.login }),
    })

  const changeLocale = async (next: Locales) => {
    await loadLocaleAsync(next)
    setLocale(next)
    localStorage.setItem('lang', next)
  }

  return (
    <AppShell
      navbar={{
        width: collapsed ? '3.75rem' : '13.75rem',
        breakpoint: 'sm',
        collapsed: { mobile: true },
      }}
    >
      <AppShell.Navbar className={classes.navbar}>
        <Group
          className={classes.brand}
          justify={justify}
          gap="xs"
          px={collapsed ? 0 : 'md'}
          py="lg"
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
          <Stack gap="xs">
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
                  <Group gap="xs" justify={justify} wrap="nowrap" w="100%">
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

        {!collapsed && <BrewingSidebarWidget />}

        <UnstyledButton
          className={classes.collapseToggle}
          onClick={() => setCollapsed((c) => !c)}
          aria-label={
            collapsed ? LL.nav.expandSidebar() : LL.nav.collapseSidebar()
          }
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
            <Menu position="top-start" width="12.5rem" withinPortal>
              <Menu.Target>
                <UnstyledButton
                  className={classes.profileBtn}
                  title={collapsed ? me.data?.username : undefined}
                >
                  <Group gap="xs" justify={justify} wrap="nowrap" w="100%">
                    <Avatar
                      size="sm"
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
                      </Stack>
                    )}
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{me.data?.username}</Menu.Label>
                <Menu.Sub position="right-start" shadow="md">
                  <Menu.Sub.Target>
                    <Menu.Sub.Item leftSection={<GlobeIcon size={16} />}>
                      {LL.nav.language()}
                    </Menu.Sub.Item>
                  </Menu.Sub.Target>
                  <Menu.Sub.Dropdown>
                    {LANGUAGES.map((lang) => (
                      <Menu.Item
                        key={lang.code}
                        onClick={() => changeLocale(lang.code)}
                        rightSection={
                          locale === lang.code ? (
                            <CheckIcon size={14} weight="bold" />
                          ) : undefined
                        }
                      >
                        {lang.label}
                      </Menu.Item>
                    ))}
                  </Menu.Sub.Dropdown>
                </Menu.Sub>
                <Menu.Divider />
                <Menu.Item color="red" onClick={handleSignOut}>
                  {LL.nav.signOut()}
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
