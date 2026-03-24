import { AlertCircle } from "lucide-react"

export function ErrorMessage({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return (
    <div className="flex items-start gap-2 rounded-lg border border-danger/15 bg-danger/5 px-4 py-3 text-sm text-danger">
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <p>{message}</p>
    </div>
  )
}
