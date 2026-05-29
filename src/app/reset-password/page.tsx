import Link from 'next/link'
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
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <p className="text-sm font-medium text-primary">WebNyxa Knowledge Hub</p>
          <h1 className="text-2xl font-semibold text-slate-900">
            {hasToken ? 'Set a new password' : 'Reset password'}
          </h1>
          <p className="text-sm text-slate-600">
            {hasToken
              ? 'Choose a new password for your account.'
              : 'Enter your email and we’ll send you a password reset link.'}
          </p>
        </div>

        {params.error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {params.error}
          </div>
        )}
        {params.message && (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {params.message}
          </div>
        )}

        {hasToken ? (
          <form action={completeResetAction} className="mt-8 space-y-4">
            <input type="hidden" name="token" value={params.token} />
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                New password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                className="mt-1 block h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                className="mt-1 block h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-slate-900"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-slate-900 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Update password
            </button>
          </form>
        ) : (
          <form action={requestResetAction} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-slate-900"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-slate-900 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Send reset link
            </button>
          </form>
        )}

        <div className="mt-4 text-center text-sm">
          <Link href="/login" className="text-primary hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </main>
  )
}
