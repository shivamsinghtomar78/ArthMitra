import Link from "next/link"
import { cn } from "@/lib/utils"

export function Brand({
  href = "/",
  className,
  invert = false,
}: {
  href?: string
  className?: string
  invert?: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-start gap-2 font-heading text-xl font-bold tracking-[-0.04em]",
        invert ? "text-white" : "text-foreground",
        className
      )}
    >
      <span>ArthMitra</span>
      <span
        className={cn(
          "relative -top-1 text-[10px] uppercase tracking-[0.24em]",
          invert ? "text-white/55" : "text-mutedText"
        )}
      >
        AI
      </span>
    </Link>
  )
}
