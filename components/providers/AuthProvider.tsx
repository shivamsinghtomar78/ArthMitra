"use client"

import { useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { firebaseAuth, isFirebaseConfigured } from "@/lib/firebase"
import { useFirestore } from "@/hooks/useFirestore"
import { useAppStore } from "@/store/useAppStore"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { refreshUserData } = useFirestore()
  const setUser = useAppStore((state) => state.setUser)
  const setAuthLoading = useAppStore((state) => state.setAuthLoading)
  const resetAppState = useAppStore((state) => state.resetAppState)

  useEffect(() => {
    if (!isFirebaseConfigured || !firebaseAuth) {
      setAuthLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        resetAppState()
        return
      }

      setUser(user)
      setAuthLoading(false)
      try {
        await refreshUserData(user.uid)
      } catch (error) {
        console.error("Unable to load Firestore profile after sign-in.", error)
      }
    })

    return () => unsubscribe()
  }, [refreshUserData, resetAppState, setAuthLoading, setUser])

  return children
}
