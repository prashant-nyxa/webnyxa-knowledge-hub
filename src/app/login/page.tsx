import Link from 'next/link'
import { redirect } from 'next/navigation'
import { KeyRound, ShieldCheck, Sparkles } from 'lucide-react'
import { getSession } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PendingSubmitButton } from '@/components/PendingSubmitButton'
import { loginAction } from './actions'

type LoginPageProps = {
  searchParams: Promise<{
    error?: string
    message?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession()
  if (session) {
    redirect(session.role === 'admin' ? '/' : '/daily-plans')
  }

  const params = await searchParams

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.14),transparent_28%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[1.05fr_460px] lg:gap-12 lg:px-8">
        <section className="hidden lg:block">
          <div className="max-w-xl space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-border/70 bg-card/80 px-4 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </span>
              WebNyxa Knowledge Hub
            </div>

            <div className="space-y-4">
              <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-foreground">
                Sign in to the same calm, focused workspace your team uses every day.
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground">
                Access daily plans, project updates, team visibility, and management insights from a single internal hub.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-card/85 p-5 shadow-sm backdrop-blur">
                <ShieldCheck className="size-5 text-primary" />
                <h2 className="mt-4 text-sm font-semibold text-foreground">Role-based access</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Admins manage the workspace while developers see only their own updates and tasks.
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-card/85 p-5 shadow-sm backdrop-blur">
                <KeyRound className="size-5 text-accent" />
                <h2 className="mt-4 text-sm font-semibold text-foreground">Secure account flow</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Use your assigned credentials and reset access anytime from the login screen.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Card className="mx-auto w-full max-w-md border-border/70 bg-card/95 py-0 shadow-xl shadow-primary/5 backdrop-blur">
          <CardHeader className="space-y-3 border-b border-border/60 px-6 py-6 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                <Sparkles className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary">WebNyxa Knowledge Hub</p>
                <CardTitle className="text-2xl">Admin & developer login</CardTitle>
              </div>
            </div>
            <CardDescription>
              Use your assigned email and password to access the workspace.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 py-6 sm:px-7">
            <form action={loginAction} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@webnyxa.com"
                  className="h-11 bg-background/70 px-3"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/reset-password" className="text-xs font-medium text-primary hover:underline">
                    Reset password
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Enter your password"
                  className="h-11 bg-background/70 px-3"
                />
              </div>

              {params.error && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/8 px-3.5 py-3 text-sm text-destructive">
                  {params.error}
                </div>
              )}
              {params.message && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-3 text-sm text-emerald-700">
                  {params.message}
                </div>
              )}

              <PendingSubmitButton
                label="Sign in"
                pendingLabel="Signing in..."
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              />
            </form>

            <div className="mt-6 rounded-xl border border-border/60 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              Login uses the same access roles and visual language as the rest of the dashboard.
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
