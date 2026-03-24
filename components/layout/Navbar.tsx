import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Brand } from "@/components/shared/Brand"

const links = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#about", label: "About" },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-transparent bg-white/90 backdrop-blur">
      <div className="section-shell flex h-20 items-center justify-between gap-6">
        <Brand />
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-mutedText hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="hidden text-sm font-medium text-mutedText hover:text-foreground sm:block"
          >
            Log in
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex min-w-[180px] items-center justify-center gap-2 border border-transparent bg-foreground px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-background transition-colors hover:bg-[#1f1f1f]"
          >
            Get Started Free
            <ArrowRight />
          </Link>
        </div>
      </div>
    </header>
  )
}
