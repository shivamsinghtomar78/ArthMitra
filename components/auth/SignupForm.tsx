"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
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

const signupSchema = z.object({
  name: z.string().min(2, "Enter your full name."),
  email: z.string().email("Enter a valid email."),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .regex(/[A-Z]/, "Include one uppercase letter.")
    .regex(/[0-9]/, "Include one number."),
})

type SignupValues = z.infer<typeof signupSchema>

export function SignupForm() {
  const router = useRouter()
  const { user, authLoading, profile, signInWithGoogle, signUpWithEmail } = useAuth()
  const { refreshUserData } = useFirestore()
  const dataLoading = useAppStore((state) => state.dataLoading)
  const [submitError, setSubmitError] = useState<string>()
  const [infoMessage, setInfoMessage] = useState<string>()
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
  })

  const password = watch("password", "")
  const strength = useMemo(() => {
    const checks = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password)]
    return checks.filter(Boolean).length
  }, [password])

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
      console.error("Unable to load Firestore profile after signup.", error)
      setInfoMessage("Account created. We couldn't load your saved profile yet, so we're sending you to onboarding.")
      router.replace("/onboarding")
    }
  }

  async function handleGoogleSignup() {
    setSubmitError(undefined)
    setInfoMessage(undefined)
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

  async function onSubmit(values: SignupValues) {
    setSubmitError(undefined)
    setInfoMessage(undefined)
    setPending(true)

    try {
      const nextUser = await signUpWithEmail(values.name, values.email, values.password)
      await routeAfterAuth(nextUser.uid)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to create your account.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="w-full max-w-xl space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-black tracking-[-0.05em]">Create your account</h1>
        <p className="text-base text-mutedText">Free forever. No credit card.</p>
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
          onClick={handleGoogleSignup}
          disabled={pending || !isFirebaseConfigured}
        >
          <span className="inline-flex size-6 items-center justify-center border border-line text-xs font-bold">
            G
          </span>
          Continue with Google
        </Button>

        <PhoneAuthSection mode="signup" onSuccess={routeAfterAuth} />

        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-mutedText">
          <span className="stat-line" />
          or
          <span className="stat-line" />
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Full Name</label>
            <Input {...register("name")} placeholder="Rahul Sharma" />
            <p className="text-sm text-danger">{errors.name?.message}</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Email</label>
            <Input {...register("email")} type="email" placeholder="rahul@example.com" />
            <p className="text-sm text-danger">{errors.email?.message}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground">Password</label>
            </div>
            <div className="relative">
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
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
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className={`h-1.5 ${
                      strength > index
                        ? strength === 1
                          ? "bg-danger"
                          : strength === 2
                            ? "bg-warning"
                            : "bg-brand"
                        : "bg-line"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-danger">{errors.password?.message}</p>
            </div>
          </div>

          <ErrorMessage message={submitError} />
          {infoMessage ? (
            <div className="rounded-lg border border-brand/20 bg-brandLight px-4 py-3 text-sm text-brand">
              {infoMessage}
            </div>
          ) : null}

          <Button type="submit" size="lg" className="w-full" disabled={pending || !isFirebaseConfigured}>
            {pending ? "Creating..." : "Create Account →"}
          </Button>
        </form>
      </div>

      <div className="space-y-3 text-sm">
        <p className="text-bodyText">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-foreground underline underline-offset-4">
            Log in
          </Link>
        </p>
        <p className="text-mutedText">
          By signing up, you agree to our Terms &amp; Privacy Policy.
        </p>
      </div>
    </div>
  )
}
