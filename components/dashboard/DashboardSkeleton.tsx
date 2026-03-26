import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="rounded-lg border border-line bg-white p-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-4 h-10 w-80" />
        <Skeleton className="mt-3 h-5 w-96" />
      </div>

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="min-h-[140px]">
            <CardContent className="flex h-full flex-col justify-between p-6">
              <div className="space-y-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
              <Skeleton className="mt-4 h-4 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions + activity */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-6 w-28" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-32 rounded-lg" />
              <Skeleton className="h-32 rounded-lg" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
