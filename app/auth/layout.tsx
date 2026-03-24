import { TrendingUp } from "lucide-react"
import { Brand } from "@/components/shared/Brand"

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[0.85fr_1.15fr]">
      <aside className="hidden bg-[#0a0a0a] px-10 py-12 text-white lg:flex lg:flex-col">
        <Brand invert />
        <div className="my-auto max-w-lg space-y-8">
          <blockquote className="text-4xl font-black leading-tight tracking-[-0.05em]">
            The best time to start investing was yesterday. The second best time is right now.
          </blockquote>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-6 flex items-center justify-between text-sm uppercase tracking-[0.18em] text-white/50">
              <span>Wealth trajectory</span>
              <span>10 years</span>
            </div>
            <div className="relative h-40 overflow-hidden">
              <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
              <div className="absolute inset-y-0 left-0 w-px bg-white/10" />
              <svg viewBox="0 0 320 160" className="h-full w-full">
                <path
                  d="M0 130 C45 122 80 108 112 88 C140 72 162 68 194 56 C222 46 258 24 320 10"
                  fill="none"
                  stroke="#16A34A"
                  strokeWidth="4"
                />
                <circle cx="320" cy="10" r="6" fill="#16A34A" />
              </svg>
            </div>
          </div>
        </div>
        <p className="flex items-center gap-2 text-sm text-white/60">
          <TrendingUp className="size-4 text-brand" />
          Join 10,000+ Indians already planning their future
        </p>
      </aside>
      <main className="flex items-center justify-center bg-white px-6 py-12">{children}</main>
    </div>
  )
}
