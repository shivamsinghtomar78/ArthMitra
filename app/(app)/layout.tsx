"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { useAppStore } from "@/store/useAppStore"

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAppStore((state) => state.user)
  const authLoading = useAppStore((state) => state.authLoading)
  const dataLoading = useAppStore((state) => state.dataLoading)
  const profile = useAppStore((state) => state.profile)

  useEffect(() => {
    if (authLoading || dataLoading) {
      return
    }

    if (!user) {
      router.replace("/auth/login")
      return
    }

    if (!profile?.onboardingComplete && pathname !== "/onboarding") {
      router.replace("/onboarding")
    }
  }, [authLoading, dataLoading, pathname, profile?.onboardingComplete, router, user])

  if (authLoading || dataLoading || !user || !profile?.onboardingComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <LoadingSpinner label="Preparing your workspace" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <main className="lg:pl-60">
        <div className="min-h-screen px-6 py-6">{children}</div>
      </main>
    </div>
  )
}
