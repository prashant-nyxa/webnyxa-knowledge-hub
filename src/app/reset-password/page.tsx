import Link from 'next/link'
import { KeyRound, Sparkles } from 'lucide-react'
import { PendingSubmitButton } from '@/components/PendingSubmitButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { completeResetAction, requestResetAction } from './actions'

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string
    error?: string
    message?: string
  }>
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams
  const hasToken = Boolean(params.token)

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.14),transparent_28%)]" />
      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md border-border/70 bg-card/95 py-0 shadow-xl shadow-primary/5 backdrop-blur">
          <CardHeader className="space-y-3 border-b border-border/60 px-6 py-6 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                {hasToken ? <KeyRound className="size-5" /> : <Sparkles className="size-5" />}
              </div>
              <div>
                <p className="text-sm font-medium text-primary">Webnyxa Knowledge Hub</p>
                <CardTitle className="text-2xl">
                  {hasToken ? 'Set a new password' : 'Reset password'}
                </CardTitle>
              </div>
            </div>
            <CardDescription>
              {hasToken
                ? 'Choose a new password for your account.'
                : 'Enter your email and we’ll send you a password reset link.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 py-6 sm:px-7">
            {params.error && (
              <div className="mb-5 rounded-xl border border-destructive/20 bg-destructive/8 px-3.5 py-3 text-sm text-destructive">
                {params.error}
              </div>
            )}
            {params.message && (
              <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-3 text-sm text-emerald-700">
                {params.message}
              </div>
            )}

            {hasToken ? (
              <form action={completeResetAction} className="space-y-5">
                <input type="hidden" name="token" value={params.token} />
                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    className="h-11 bg-background/70 px-3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    className="h-11 bg-background/70 px-3"
                  />
                </div>
                <PendingSubmitButton
                  label="Update password"
                  pendingLabel="Updating..."
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </form>
            ) : (
              <form action={requestResetAction} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="h-11 bg-background/70 px-3"
                  />
                </div>
                <PendingSubmitButton
                  label="Send reset link"
                  pendingLabel="Sending..."
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </form>
            )}

            <div className="mt-5 text-center text-sm">
              <Link href="/login" className="text-primary hover:underline">
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
