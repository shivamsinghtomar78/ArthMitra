"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { RecaptchaVerifier, type ConfirmationResult } from "firebase/auth"
import { Smartphone } from "lucide-react"
import { ErrorMessage } from "@/components/shared/ErrorMessage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { firebaseAuth, isFirebaseConfigured } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"

function normalizeIndianPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "")

  if (digits.length === 10) {
    return `+91${digits}`
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`
  }

  if (digits.length === 13 && value.trim().startsWith("+")) {
    return `+${digits}`
  }

  return null
}

function maskPhoneNumber(phoneNumber: string) {
  const digits = phoneNumber.replace(/\D/g, "")

  if (digits.length < 4) {
    return phoneNumber
  }

  return `+${digits.slice(0, 2)} ••••••${digits.slice(-4)}`
}

export function PhoneAuthSection({
  mode,
  onSuccess,
}: {
  mode: "login" | "signup"
  onSuccess: (uid: string) => Promise<void>
}) {
  const { sendPhoneVerificationCode, verifyPhoneCode } = useAuth()
  const instanceId = useId().replace(/:/g, "")
  const recaptchaId = `phone-auth-recaptcha-${mode}-${instanceId}`
  const verifierRef = useRef<RecaptchaVerifier | null>(null)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()
  const [infoMessage, setInfoMessage] = useState<string>()

  useEffect(() => {
    return () => {
      verifierRef.current?.clear()
      verifierRef.current = null
    }
  }, [])

  const ctaLabel = useMemo(
    () => (mode === "signup" ? "Create with phone" : "Continue with phone"),
    [mode]
  )

  function getVerifier() {
    if (!firebaseAuth) {
      throw new Error("Firebase Auth is not configured.")
    }

    if (verifierRef.current) {
      return verifierRef.current
    }

    verifierRef.current = new RecaptchaVerifier(firebaseAuth, recaptchaId, {
      size: "invisible",
    })

    return verifierRef.current
  }

  async function handleSendCode() {
    const normalizedPhoneNumber = normalizeIndianPhoneNumber(phoneNumber)

    if (!normalizedPhoneNumber) {
      setError("Enter a valid Indian mobile number.")
      return
    }

    setPending(true)
    setError(undefined)
    setInfoMessage(undefined)

    try {
      const verifier = getVerifier()
      const nextConfirmation = await sendPhoneVerificationCode(normalizedPhoneNumber, verifier)
      setConfirmationResult(nextConfirmation)
      setInfoMessage(`OTP sent to ${maskPhoneNumber(normalizedPhoneNumber)}.`)
    } catch (sendError) {
      verifierRef.current?.clear()
      verifierRef.current = null
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Unable to send OTP right now."
      )
    } finally {
      setPending(false)
    }
  }

  async function handleVerifyCode() {
    if (!confirmationResult) {
      setError("Send the OTP first.")
      return
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Enter the 6-digit OTP.")
      return
    }

    setPending(true)
    setError(undefined)

    try {
      const nextUser = await verifyPhoneCode(confirmationResult, otp.trim())
      await onSuccess(nextUser.uid)
    } catch (verifyError) {
      setError(
        verifyError instanceof Error
          ? verifyError.message
          : "Unable to verify OTP right now."
      )
    } finally {
      setPending(false)
    }
  }

  function handleReset() {
    setOtp("")
    setError(undefined)
    setInfoMessage(undefined)
    setConfirmationResult(null)
  }

  return (
    <div className="space-y-4 rounded-lg border border-line p-5">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-9 items-center justify-center rounded-lg border border-line text-foreground">
            <Smartphone className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mutedText">
              Phone OTP
            </p>
            <p className="text-base text-bodyText">
              Use your mobile number to {mode === "signup" ? "create an account" : "sign in"}.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Mobile Number</label>
        <div className="flex gap-3">
          <div className="flex h-12 items-center border border-input bg-surface px-4 text-sm font-semibold text-foreground">
            +91
          </div>
          <Input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="98765 43210"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            disabled={pending || !isFirebaseConfigured}
          />
        </div>
      </div>

      {confirmationResult ? (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">6-digit OTP</label>
          <Input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Enter OTP"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
            disabled={pending || !isFirebaseConfigured}
          />
        </div>
      ) : null}

      {infoMessage ? (
        <div className="rounded-lg border border-brand/20 bg-brandLight px-4 py-3 text-sm text-brand">
          {infoMessage}
        </div>
      ) : null}

      <ErrorMessage message={error} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant={confirmationResult ? "outline" : "default"}
          size="lg"
          className={confirmationResult ? "sm:w-auto" : "w-full"}
          onClick={handleSendCode}
          disabled={pending || !isFirebaseConfigured}
        >
          {pending && !confirmationResult ? "Sending..." : confirmationResult ? "Resend OTP" : ctaLabel}
        </Button>
        {confirmationResult ? (
          <>
            <Button
              type="button"
              size="lg"
              className="sm:flex-1"
              onClick={handleVerifyCode}
              disabled={pending || !isFirebaseConfigured}
            >
              {pending ? "Verifying..." : "Verify OTP"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="sm:w-auto"
              onClick={handleReset}
              disabled={pending}
            >
              Change number
            </Button>
          </>
        ) : null}
      </div>

      <div id={recaptchaId} />
    </div>
  )
}
