"use client"

import { useCallback, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

function formatDisplay(value: number) {
  if (!value) return ""
  return value.toLocaleString("en-IN")
}

function parseRaw(text: string) {
  return Number(text.replace(/[^0-9]/g, "")) || 0
}

export function CurrencyInput({
  value,
  onChange,
  className,
  ...rest
}: {
  value: number
  onChange: (value: number) => void
} & Omit<React.ComponentProps<typeof Input>, "value" | "onChange">) {
  const [focused, setFocused] = useState(false)
  const [localText, setLocalText] = useState(String(value || ""))
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFocus = useCallback(() => {
    setFocused(true)
    setLocalText(value ? String(value) : "")
  }, [value])

  const handleBlur = useCallback(() => {
    setFocused(false)
    const parsed = parseRaw(localText)
    onChange(parsed)
  }, [localText, onChange])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9]/g, "")
      setLocalText(raw)
      onChange(Number(raw) || 0)
    },
    [onChange]
  )

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-mutedText">
        ₹
      </span>
      <Input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        className={cn("pl-7", className)}
        value={focused ? localText : formatDisplay(value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        {...rest}
      />
    </div>
  )
}
