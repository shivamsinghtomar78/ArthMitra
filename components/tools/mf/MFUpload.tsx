"use client"

import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ManualFundEntry } from "@/types"

const categories = [
  "Large Cap",
  "Flexi Cap",
  "Mid Cap",
  "Small Cap",
  "Hybrid / Debt",
  "International",
  "Index",
]

export function MFUpload({
  funds,
  onChange,
  onAdd,
  onSubmit,
  loading,
  parsingPdf,
  uploadedFileName,
  onFileSelect,
  uploadStatus,
}: {
  funds: ManualFundEntry[]
  onChange: (index: number, field: keyof ManualFundEntry, value: string | number) => void
  onAdd: () => void
  onSubmit: () => void
  loading: boolean
  parsingPdf: boolean
  uploadedFileName?: string
  onFileSelect: (file?: File) => void
  uploadStatus?: string
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Tool</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">MF Portfolio X-Ray</h1>
        <p className="mt-3 text-base leading-8 text-bodyText">
          Inspect overlap, cost drag, and diversification across your mutual funds.
        </p>
      </div>

      <label className="block rounded-lg border border-dashed border-line bg-surface p-6 text-center">
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(event) => onFileSelect(event.target.files?.[0])}
        />
        <Upload className="mx-auto size-6 text-brand" />
        <p className="mt-4 text-lg font-bold text-foreground">
          {uploadedFileName ? uploadedFileName : "Drop your CAMS PDF here or click to browse"}
        </p>
        <p className="mt-2 text-sm leading-7 text-mutedText">
          Accepted: PDF only, max 5MB. We&apos;ll extract statement text before analysis.
        </p>
        {uploadStatus ? <p className="mt-2 text-sm font-medium text-brand">{uploadStatus}</p> : null}
      </label>

      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-mutedText">
        <span className="stat-line" />
        or
        <span className="stat-line" />
      </div>

      <div className="space-y-4">
        {funds.map((fund, index) => (
          <div key={index} className="grid gap-4 rounded-lg border border-line p-4 md:grid-cols-4">
            <Input
              value={fund.name}
              onChange={(event) => onChange(index, "name", event.target.value)}
              placeholder="Fund name"
            />
            <Select
              value={fund.category}
              onValueChange={(value) => onChange(index, "category", value ?? "Large Cap")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={fund.amountInvested || ""}
              onChange={(event) => onChange(index, "amountInvested", Number(event.target.value))}
              placeholder="Amount invested"
            />
            <Input
              type="number"
              value={fund.currentValue || ""}
              onChange={(event) => onChange(index, "currentValue", Number(event.target.value))}
              placeholder="Current value"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Button type="button" variant="outline" size="lg" onClick={onAdd} disabled={funds.length >= 10}>
          Add another fund
        </Button>
        <Button
          type="button"
          size="lg"
          className="sm:ml-auto"
          onClick={onSubmit}
          disabled={loading || parsingPdf}
        >
          {parsingPdf ? "Reading PDF..." : loading ? "Analysing..." : "Analyse My Portfolio →"}
        </Button>
      </div>
    </div>
  )
}
