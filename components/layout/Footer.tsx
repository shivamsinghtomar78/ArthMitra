import Link from "next/link"
import { Brand } from "@/components/shared/Brand"

const footerLinks = [
  { href: "/auth/signup", label: "Create account" },
  { href: "/auth/login", label: "Log in" },
  { href: "#features", label: "Features" },
]

export function Footer() {
  return (
    <footer id="about" className="border-t border-line bg-white py-10">
      <div className="section-shell space-y-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div className="space-y-2">
            <Brand />
            <p className="max-w-md text-sm leading-7 text-mutedText">
              Your wealth. Your future. Understood.
            </p>
          </div>
          <div className="flex flex-wrap gap-5 text-sm text-mutedText">
            {footerLinks.map((link) => (
              <Link key={link.label} href={link.href} className="hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <p className="border-t border-line pt-6 text-center text-xs font-medium uppercase tracking-[0.18em] text-mutedText">
          Built for India. Powered by AI.
        </p>
      </div>
    </footer>
  )
}
