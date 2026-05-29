export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { DevelopersTable } from '@/components/DevelopersTable'
import { listDeveloperUsers, requireAdmin } from '@/lib/auth'

export default async function DevelopersPage() {
  await requireAdmin()

  const [developers, users] = await Promise.all([
    prisma.developer.findMany({
      orderBy: { name: 'asc' },
    }),
    listDeveloperUsers(),
  ])
  const emailByDeveloperId = new Map(users.map((user) => [user.developerId, user.email]))

  return (
    <DevelopersTable
      developers={developers.map((developer) => ({
        ...developer,
        email: emailByDeveloperId.get(developer.id) ?? '',
      }))}
    />
  )
}
