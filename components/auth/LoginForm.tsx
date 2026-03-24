"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PhoneAuthSection } from "@/components/auth/PhoneAuthSection"
import { ErrorMessage } from "@/components/shared/ErrorMessage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { isFirebaseConfigured } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { useFirestore } from "@/hooks/useFirestore"
import { useAppStore } from "@/store/useAppStore"

const loginSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Enter your password."),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const { user, authLoading, profile, signInWithEmail, signInWithGoogle, sendResetLink } = useAuth()
  const { refreshUserData } = useFirestore()
  const dataLoading = useAppStore((state) => state.dataLoading)
  const [submitError, setSubmitError] = useState<string>()
  const [infoMessage, setInfoMessage] = useState<string>()
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    if (authLoading || dataLoading) {
      return
    }

    if (user) {
      router.replace(profile?.onboardingComplete ? "/dashboard" : "/onboarding")
    }
  }, [authLoading, dataLoading, profile?.onboardingComplete, router, user])

  async function routeAfterAuth(uid: string) {
    try {
      const data = await refreshUserData(uid)
      router.replace(data?.profile?.onboardingComplete ? "/dashboard" : "/onboarding")
    } catch (error) {
      console.error("Unable to load Firestore profile after login.", error)
      setInfoMessage("Signed in. We couldn't load your saved profile yet, so we're sending you to onboarding.")
      router.replace("/onboarding")
    }
  }

  async function handleGoogleLogin() {
    setSubmitError(undefined)
    setPending(true)

    try {
      const nextUser = await signInWithGoogle()
      await routeAfterAuth(nextUser.uid)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to continue with Google.")
    } finally {
      setPending(false)
    }
  }

  async function handlePasswordReset() {
    const email = getValues("email")

    if (!email) {
      setSubmitError("Enter your email first, then request a reset link.")
      return
    }

    try {
      await sendResetLink(email)
      setInfoMessage("Password reset link sent.")
      setSubmitError(undefined)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to send reset link.")
    }
  }

  async function onSubmit(values: LoginValues) {
    setSubmitError(undefined)
    setInfoMessage(undefined)
    setPending(true)

    try {
      const nextUser = await signInWithEmail(values.email, values.password)
      await routeAfterAuth(nextUser.uid)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to log you in.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="w-full max-w-xl space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-black tracking-[-0.05em]">Welcome back</h1>
        <p className="text-base text-mutedText">Sign in to continue building your plan.</p>
      </div>

      {!isFirebaseConfigured ? (
        <ErrorMessage message="Add your Firebase environment variables in .env.local to enable sign in." />
      ) : null}

      <div className="space-y-5">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full justify-center"
          onClick={handleGoogleLogin}
          disabled={pending || !isFirebaseConfigured}
        >
          <span className="inline-flex size-6 items-center justify-center border border-line text-xs font-bold">
            G
          </span>
          Continue with Google
        </Button>

        <PhoneAuthSection mode="login" onSuccess={routeAfterAuth} />

        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-mutedText">
          <span className="stat-line" />
          or
          <span className="stat-line" />
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Email</label>
            <Input {...register("email")} type="email" placeholder="rahul@example.com" />
            <p className="text-sm text-danger">{errors.email?.message}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground">Password</label>
              <button
                type="button"
                className="text-xs font-medium uppercase tracking-[0.12em] text-mutedText hover:text-foreground"
                onClick={handlePasswordReset}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="pr-12"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-mutedText"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <p className="text-sm text-danger">{errors.password?.message}</p>
          </div>

          {infoMessage ? (
            <div className="rounded-lg border border-brand/20 bg-brandLight px-4 py-3 text-sm text-brand">
              {infoMessage}
            </div>
          ) : null}

          <ErrorMessage message={submitError} />

          <Button type="submit" size="lg" className="w-full" disabled={pending || !isFirebaseConfigured}>
            {pending ? "Logging in..." : "Log in →"}
          </Button>
        </form>
      </div>

      <div className="space-y-3 text-sm">
        <p className="text-bodyText">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-semibold text-foreground underline underline-offset-4">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  )
}
