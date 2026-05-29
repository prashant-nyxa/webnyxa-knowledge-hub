import { Sidebar } from '@/components/Sidebar'
import { requireUser } from '@/lib/auth'

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await requireUser()

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        user={{
          name: session.name ?? session.email,
          email: session.email,
          role: session.role,
        }}
      />
      <main className="ml-64 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1600px] p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
