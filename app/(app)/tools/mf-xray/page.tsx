"use client"

import { useState } from "react"
import { ErrorMessage } from "@/components/shared/ErrorMessage"
import { MFResults } from "@/components/tools/mf/MFResults"
import { MFUpload } from "@/components/tools/mf/MFUpload"
import { extractTextFromPdf } from "@/lib/pdf-client"
import { useAppStore } from "@/store/useAppStore"
import { useFirestore } from "@/hooks/useFirestore"
import type { ApiToolResponse, ManualFundEntry, MFXrayResult } from "@/types"

const emptyFund = (): ManualFundEntry => ({
  name: "",
  category: "Large Cap",
  amountInvested: 0,
  currentValue: 0,
})

export default function MFXrayPage() {
  const user = useAppStore((state) => state.user)
  const storedResult = useAppStore((state) => state.results.mfXray)
  const { saveToolResult } = useFirestore()
  const [funds, setFunds] = useState<ManualFundEntry[]>([emptyFund()])
  const [uploadedFileName, setUploadedFileName] = useState<string>()
  const [statementText, setStatementText] = useState<string>()
  const [uploadStatus, setUploadStatus] = useState<string>()
  const [parsingPdf, setParsingPdf] = useState(false)
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)

  function updateFund(index: number, field: keyof ManualFundEntry, value: string | number) {
    setFunds((current) =>
      current.map((fund, fundIndex) =>
        fundIndex === index
          ? {
              ...fund,
              [field]: value,
            }
          : fund
      )
    )
  }

  async function handleFileSelect(file?: File) {
    setError(undefined)
    setUploadStatus(undefined)
    setStatementText(undefined)
    setUploadedFileName(file?.name)

    if (!file) {
      return
    }

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF CAMS statement.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Please upload a PDF under 5MB.")
      return
    }

    setParsingPdf(true)

    try {
      const extractedText = await extractTextFromPdf(file)

      if (!extractedText.trim()) {
        throw new Error("We couldn’t read text from this PDF. Try another CAMS export or use manual entry.")
      }

      setStatementText(extractedText)
      setUploadStatus("Statement parsed and ready for analysis.")
    } catch (fileError) {
      setError(
        fileError instanceof Error
          ? fileError.message
          : "We couldn’t read this PDF. You can still use manual entry below."
      )
    } finally {
      setParsingPdf(false)
    }
  }

  async function handleSubmit() {
    if (!user) {
      setError("Sign in to analyse your portfolio.")
      return
    }

    const validFunds = funds.filter((fund) => fund.name.trim() && fund.currentValue > 0)

    if (!validFunds.length && !statementText) {
      setError("Add a valid fund entry or upload a readable CAMS statement to continue.")
      return
    }

    setLoading(true)
    setError(undefined)

    try {
      const response = await fetch("/api/ai/mf-xray", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          userInputs: {
            funds: validFunds,
            statementName: uploadedFileName,
            statementText,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Unable to analyse your portfolio right now.")
      }

      const payload = (await response.json()) as ApiToolResponse<MFXrayResult>
      await saveToolResult(user.uid, "mfXray", payload.result)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to analyse your portfolio right now."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr]">
      <section className="rounded-lg border border-line bg-white p-6">
        <MFUpload
          funds={funds}
          onChange={updateFund}
          onAdd={() => setFunds((current) => [...current, emptyFund()])}
          onSubmit={handleSubmit}
          loading={loading}
          parsingPdf={parsingPdf}
          uploadedFileName={uploadedFileName}
          onFileSelect={handleFileSelect}
          uploadStatus={uploadStatus}
        />
        <div className="mt-5">
          <ErrorMessage message={error} />
        </div>
      </section>
      <section>
        <MFResults result={storedResult} />
      </section>
    </div>
  )
}
