'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Briefcase, BookOpen, Calendar, Clock, BarChart } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/developers', label: 'Developers', icon: Users },
  { href: '/projects', label: 'Projects', icon: Briefcase },
  { href: '/skills', label: 'Skills', icon: BookOpen },
]

const workflowItems = [
  { href: '/daily-plans', label: 'Daily Plans', icon: Calendar },
  { href: '/eod-updates', label: 'EOD Updates', icon: Clock },
]

const reportItems = [
  { href: '/reports/plan-vs-actual', label: 'Plan vs Actual', icon: BarChart },
]

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function SidebarLink({ href, label, icon: Icon }: { href: string; label: string; icon: typeof Home }) {
  const pathname = usePathname()
  const active = isActivePath(pathname, href)

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        active ? 'bg-black text-white hover:bg-black' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  )
}

export function Sidebar() {
  return (
    <div className="flex h-screen w-64 flex-col border-r bg-gray-50 fixed">
      <div className="p-6">
        <h2 className="text-lg font-bold tracking-tight text-gray-900">Knowledge System</h2>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navItems.map((item) => <SidebarLink key={item.href} {...item} />)}
        <div className="pt-4 pb-2">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Workflows</p>
        </div>
        {workflowItems.map((item) => <SidebarLink key={item.href} {...item} />)}
        <div className="pt-4 pb-2">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Reports</p>
        </div>
        {reportItems.map((item) => <SidebarLink key={item.href} {...item} />)}
      </nav>
    </div>
  )
}
