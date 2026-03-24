import { LoaderCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function LoadingSpinner({
  className,
  label,
}: {
  className?: string
  label?: string
}) {
  return (
    <div className={cn("flex items-center gap-2 text-sm text-mutedText", className)}>
      <LoaderCircle className="size-4 animate-spin text-brand" />
      {label ? <span>{label}</span> : null}
    </div>
  )
}
