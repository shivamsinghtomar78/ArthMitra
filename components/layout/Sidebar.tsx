"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Flame,
  HeartPulse,
  Home,
  LogOut,
  PieChart,
  ReceiptText,
  UserCircle2,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Brand } from "@/components/shared/Brand"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/tools/fire", label: "FIRE Planner", icon: Flame },
  { href: "/tools/tax", label: "Tax Wizard", icon: ReceiptText },
  { href: "/tools/mf-xray", label: "MF X-Ray", icon: PieChart },
  { href: "/tools/health-score", label: "Health Score", icon: HeartPulse },
  { href: "/profile", label: "Profile", icon: UserCircle2 },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, signOut } = useAuth()

  async function handleSignOut() {
    await signOut()
    router.replace("/auth/login")
  }

  return (
    <aside className="border-b border-line bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-60 lg:border-r lg:border-b-0">
      <div className="flex h-full flex-col">
        <div className="border-b border-line px-6 py-6">
          <Brand />
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 py-4 lg:flex-1 lg:flex-col lg:overflow-visible">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-fit items-center gap-3 border px-4 py-3 text-sm font-medium transition-colors lg:min-w-0",
                  active
                    ? "border-brand bg-brandLight text-foreground"
                    : "border-transparent text-mutedText hover:border-line hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-line p-4">
          <div className="flex items-center gap-3 rounded-lg border border-line p-3">
            <Avatar>
              <AvatarImage src={user?.photoURL || undefined} alt={profile?.name || "User"} />
              <AvatarFallback>
                {(profile?.name || user?.displayName || "A").charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {profile?.name || user?.displayName || "Guest"}
              </p>
              <button
                type="button"
                onClick={handleSignOut}
                className="mt-1 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.14em] text-mutedText hover:text-foreground"
              >
                <LogOut className="size-3" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
