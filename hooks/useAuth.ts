"use client"

import { useAppStore } from "@/store/useAppStore"
import {
  sendResetLink,
  signInWithEmail,
  signInWithGoogle,
  signOutCurrentUser,
  signUpWithEmail,
} from "@/lib/auth"

export function useAuth() {
  const user = useAppStore((state) => state.user)
  const authLoading = useAppStore((state) => state.authLoading)
  const profile = useAppStore((state) => state.profile)

  return {
    user,
    authLoading,
    profile,
    isAuthenticated: Boolean(user),
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendResetLink,
    signOut: signOutCurrentUser,
  }
}
