import Link from 'next/link'
import { Home, Users, Briefcase, BookOpen, Calendar, Clock, BarChart } from 'lucide-react'

export function Sidebar() {
  return (
    <div className="flex h-screen w-64 flex-col border-r bg-gray-50 fixed">
      <div className="p-6">
        <h2 className="text-lg font-bold tracking-tight text-gray-900">Knowledge System</h2>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-4">
        <Link href="/" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
          <Home className="h-4 w-4" /> Dashboard
        </Link>
        <Link href="/developers" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
          <Users className="h-4 w-4" /> Developers
        </Link>
        <Link href="/projects" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
          <Briefcase className="h-4 w-4" /> Projects
        </Link>
        <Link href="/skills" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
          <BookOpen className="h-4 w-4" /> Skills
        </Link>
        <div className="pt-4 pb-2">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Workflows</p>
        </div>
        <Link href="/daily-plans" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
          <Calendar className="h-4 w-4" /> Daily Plans
        </Link>
        <Link href="/eod-updates" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
          <Clock className="h-4 w-4" /> EOD Updates
        </Link>
        <div className="pt-4 pb-2">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Reports</p>
        </div>
        <Link href="/reports/plan-vs-actual" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
          <BarChart className="h-4 w-4" /> Plan vs Actual
        </Link>
      </nav>
    </div>
  )
}
