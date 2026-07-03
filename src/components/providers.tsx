'use client'

import { NavigationProgress } from '@/components/navigation-progress'
import { Toaster } from '@/components/ui/sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavigationProgress />
      {children}
      <Toaster position="top-right" richColors closeButton />
    </>
  )
}
