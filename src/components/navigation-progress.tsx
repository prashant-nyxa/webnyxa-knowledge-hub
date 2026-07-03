'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

function isInternalNavigationTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return null

  const closestAnchor = target.closest('a[href]')
  if (!(closestAnchor instanceof HTMLAnchorElement)) return null

  const href = closestAnchor.getAttribute('href')
  if (!href || href.startsWith('#')) return null
  if (closestAnchor.getAttribute('target') === '_blank') return null
  if (closestAnchor.hasAttribute('download')) return null

  try {
    const url = new URL(closestAnchor.href, window.location.href)
    if (url.origin !== window.location.origin) return null
    if (`${url.pathname}${url.search}` === `${window.location.pathname}${window.location.search}`) return null
    return url
  } catch {
    return null
  }
}

export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [active, setActive] = useState(false)
  const timeoutRef = useRef<number | null>(null)
  const hasSidebar = pathname !== '/login' && pathname !== '/reset-password'

  useEffect(() => {
    if (!active) return

    const finishTimer = window.setTimeout(() => {
      setActive(false)
    }, 300)

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    return () => {
      window.clearTimeout(finishTimer)
    }
  }, [pathname, searchParams, active])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return
      if (event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const url = isInternalNavigationTarget(event.target)
      if (!url) return

      setActive(true)

      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => {
        setActive(false)
      }, 15000)
    }

    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('click', handleClick)
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <>
      <div
        className={`pointer-events-none fixed inset-y-0 right-0 z-[100] flex items-center justify-center bg-white/30 backdrop-blur-[1px] transition-opacity duration-200 ${
          hasSidebar ? 'left-64' : 'left-0'
        } ${
          active ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="rounded-full bg-white/70 p-4 shadow-lg">
          <Loader2 className="size-7 animate-spin text-primary" />
        </div>
      </div>
    </>
  )
}
