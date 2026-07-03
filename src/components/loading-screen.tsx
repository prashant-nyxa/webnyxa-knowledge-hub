import { Loader2 } from 'lucide-react'

type LoadingScreenProps = {
  insetLeftClassName?: string
}

export function LoadingScreen({ insetLeftClassName = '' }: LoadingScreenProps) {
  return (
    <div className={`fixed inset-y-0 right-0 z-[90] flex items-center justify-center bg-white/30 backdrop-blur-[1px] ${insetLeftClassName}`}>
      <div className="rounded-full bg-white/70 p-4 shadow-lg">
        <Loader2 className="size-7 animate-spin text-primary" />
      </div>
    </div>
  )
}
