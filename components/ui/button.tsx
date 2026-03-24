"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap border border-transparent text-sm font-semibold uppercase tracking-[0.08em] transition-colors outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
  {
    variants: {
      variant: {
        default: "bg-foreground text-background hover:bg-[#1f1f1f]",
        outline: "border-line bg-background text-foreground hover:border-foreground",
        secondary: "bg-surface text-foreground hover:bg-accent",
        ghost: "bg-transparent text-mutedText hover:text-foreground",
        destructive: "bg-danger text-background hover:bg-[#b91c1c]",
        link: "border-transparent bg-transparent px-0 text-mutedText underline decoration-line underline-offset-4 hover:text-foreground",
      },
      size: {
        default: "h-12 px-6",
        xs: "h-8 px-3 text-[11px]",
        sm: "h-10 px-4 text-xs",
        lg: "h-14 px-8 text-sm",
        icon: "size-12",
        "icon-xs": "size-8",
        "icon-sm": "size-10",
        "icon-lg": "size-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn("rounded-none", buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
