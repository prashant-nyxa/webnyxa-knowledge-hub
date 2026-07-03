'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Users,
  Briefcase,
  BookOpen,
  Calendar,
  Clock,
  BarChart,
  LogOut,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logoutUser } from '@/app/(protected)/session-actions'
import { useFormStatus } from 'react-dom'

const adminMainNav = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/developers', label: 'Developers', icon: Users },
  { href: '/projects', label: 'Projects', icon: Briefcase },
  { href: '/skills', label: 'Skills', icon: BookOpen },
]

const workflowNav = [
  { href: '/daily-plans', label: 'Daily Plans', icon: Calendar },
  { href: '/eod-updates', label: 'EOD Updates', icon: Clock },
]

const reportNav = [
  { href: '/reports/plan-vs-actual', label: 'Plan vs Actual', icon: BarChart },
]

type SidebarUser = {
  name: string
  email: string
  role: 'admin' | 'developer'
}

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavSection({ title, items }: { title: string; items: Array<{ href: string; label: string; icon: typeof Home }> }) {
  const pathname = usePathname()

  return (
    <div className="space-y-1">
      <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
        {title}
      </p>
      {items.map((item) => {
        const active = isActivePath(pathname, item.href)
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
              active
                ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shadow-sidebar-primary/25'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <Icon
              className={cn(
                'size-[18px] shrink-0 transition-colors',
                active ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground'
              )}
            />
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}

export function Sidebar({ user }: { user: SidebarUser }) {
  const mainNav = user.role === 'admin' ? adminMainNav : []
  const reports = user.role === 'admin' ? reportNav : []

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Sparkles className="size-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold leading-tight text-sidebar-accent-foreground">
            Knowledge Hub
          </h2>
          <p className="text-[11px] text-sidebar-foreground/50">Internal System</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
        {mainNav.length > 0 && <NavSection title="Main" items={mainNav} />}
        <NavSection title="Workflows" items={workflowNav} />
        {reports.length > 0 && <NavSection title="Reports" items={reports} />}
      </nav>

      <div className="mt-auto border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/60 px-3 py-2.5">
          <div className="flex size-8 items-center justify-center rounded-full bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-accent-foreground">{user.name}</p>
            <p className="truncate text-[11px] text-sidebar-foreground/50">
              {user.role === 'admin' ? 'Admin workspace' : 'Developer workspace'}
            </p>
          </div>
          <form action={logoutUser}>
            <LogoutButton email={user.email} />
          </form>
        </div>
      </div>
    </aside>
  )
}

function LogoutButton({ email }: { email: string }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      aria-label="Log out"
      title={`Signed in as ${email}`}
      className="rounded-md p-1.5 text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
    </button>
  )
}
