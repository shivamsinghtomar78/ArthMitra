"use client"

import { cn } from "@/lib/utils"

export function AuthMethodSwitcher({
  value,
  onChange,
}: {
  value: "email" | "phone"
  onChange: (value: "email" | "phone") => void
}) {
  const options = [
    { value: "email" as const, label: "Email" },
    { value: "phone" as const, label: "Phone OTP" },
  ]

  return (
    <div className="rounded-lg border border-line bg-surface p-1">
      <div className="grid grid-cols-2 gap-1">
        {options.map((option) => {
          const active = option.value === value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition-colors",
                active
                  ? "bg-white text-foreground shadow-sm"
                  : "text-mutedText hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
