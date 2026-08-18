'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  SquaresFour,
  Users,
  CalendarCheck,
  CreditCard,
  Money,
  GraduationCap,
  UserCircle,
  SignOut,
  List,
  X,
  Student,
} from '@phosphor-icons/react'
import { motion } from 'motion/react'

// Define menu items for each role
const MENU_ITEMS = {
  kepala_sekolah: [
    { name: 'Dashboard', href: '/kepala_sekolah', icon: SquaresFour },
    { name: 'Data Siswa', href: '/kepala_sekolah/siswa', icon: Users },
    { name: 'Absensi', href: '/kepala_sekolah/absensi', icon: CalendarCheck },
    { name: 'SPP', href: '/kepala_sekolah/spp', icon: CreditCard },
    { name: 'Keuangan', href: '/kepala_sekolah/keuangan', icon: Money },
    { name: 'Guru & Tendik', href: '/kepala_sekolah/guru', icon: GraduationCap },
  ],
  operator: [
    { name: 'Dashboard', href: '/operator', icon: SquaresFour },
    { name: 'Data Siswa', href: '/operator/siswa', icon: Users },
    { name: 'Guru & Tendik', href: '/operator/guru', icon: GraduationCap },
  ],
  bendahara: [
    { name: 'Dashboard', href: '/bendahara', icon: SquaresFour },
    { name: 'SPP', href: '/bendahara/spp', icon: CreditCard },
    { name: 'Keuangan', href: '/bendahara/keuangan', icon: Money },
  ],
  guru: [
    { name: 'Dashboard', href: '/guru', icon: SquaresFour },
    { name: 'Data Siswa', href: '/guru/siswa', icon: Users },
    { name: 'Absensi', href: '/guru/absensi', icon: CalendarCheck },
  ],
}

export interface SidebarProps {
  role: 'kepala_sekolah' | 'operator' | 'bendahara' | 'guru'
  userEmail: string
  userName?: string
}

export function Sidebar({ role, userEmail, userName }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)

  const items = MENU_ITEMS[role] || []

  // Function to determine if a route is active
  const isActive = (path: string) => {
    if (path === `/${role}`) {
      return pathname === path
    }
    return pathname.startsWith(path)
  }

  // Format role string to display nicely
  const displayRole = role
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  const SidebarContent = (
    <div className="flex h-full flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo Area */}
      <div className="flex h-[72px] shrink-0 items-center px-6 gap-3">
        <div className="bg-primary/10 p-2 rounded-2xl flex items-center justify-center">
          <Student weight="duotone" className="h-6 w-6 text-primary" />
        </div>
        <span className="text-lg font-bold text-sidebar-foreground font-heading tracking-tight">
          PAUD INSANI
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        {items.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium transition-colors ${
                active
                  ? 'text-primary'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute inset-0 bg-primary/10 rounded-2xl"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
              <Icon
                weight={active ? 'duotone' : 'regular'}
                className={`relative z-10 h-5 w-5 shrink-0 transition-colors ${active ? 'text-primary' : ''}`}
                aria-hidden="true"
              />
              <span className="relative z-10">{item.name}</span>
            </Link>
          )
        })}

        <div className="mt-8 pt-8 border-t border-sidebar-border space-y-1">
          <Link
            href={`/${role}/profile`}
            className={`relative flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium transition-colors ${
              isActive(`/${role}/profile`)
                ? 'text-primary'
                : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
          >
            {isActive(`/${role}/profile`) && (
              <motion.div
                layoutId="active-nav"
                className="absolute inset-0 bg-primary/10 rounded-2xl"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
              />
            )}
            <UserCircle
              weight={isActive(`/${role}/profile`) ? 'duotone' : 'regular'}
              className={`relative z-10 h-5 w-5 shrink-0 ${
                isActive(`/${role}/profile`) ? 'text-primary' : ''
              }`}
            />
            <span className="relative z-10">Profil</span>
          </Link>
          <form action="/auth/logout" method="post">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <SignOut weight="regular" className="h-5 w-5 shrink-0" />
              Keluar
            </button>
          </form>
        </div>
      </nav>

      {/* User Info Footer */}
      <div className="shrink-0 p-4 mb-4 mx-4 border border-sidebar-border rounded-3xl bg-sidebar-accent/30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="font-bold text-primary">
              {userName ? userName.charAt(0).toUpperCase() : userEmail.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">
              {userName || userEmail}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/60">{displayRole}</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-sidebar-border bg-sidebar/80 backdrop-blur-md px-4 sm:gap-x-6 sm:px-6 lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
          onClick={() => setIsOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <List className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end items-center">
          <div className="font-semibold text-sidebar-foreground text-sm tracking-tight">PAUD INSANI</div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="relative z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-sidebar-foreground/20 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1 animate-in slide-in-from-left duration-300">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button
                  type="button"
                  className="-m-2.5 p-2.5 text-white hover:scale-110 transition-transform"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <X weight="bold" className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              {SidebarContent}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        {SidebarContent}
      </div>
    </>
  )
}
