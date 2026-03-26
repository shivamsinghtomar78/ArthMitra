"use client"

import { doc, getDoc, setDoc } from "firebase/firestore"
import { firestoreDb, isFirebaseConfigured } from "@/lib/firebase"
import { useAppStore } from "@/store/useAppStore"
import type {
  ToolResultKey,
  UserDocument,
  UserFinancials,
  UserProfile,
  UserResults,
} from "@/types"

const FIRESTORE_TIMEOUT_MS = 10_000

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        new Error(
          `${label} timed out after ${ms / 1000}s. Check your Firestore security rules — they may be blocking writes for authenticated users.`
        )
      )
    }, ms)

    promise
      .then((value) => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch((error) => {
        clearTimeout(timer)
        reject(error)
      })
  })
}

async function requireDocumentRef(uid: string) {
  if (!isFirebaseConfigured || !firestoreDb) {
    throw new Error("Firestore is not configured.")
  }

  return doc(firestoreDb, "users", uid)
}

export function useFirestore() {
  const setDataLoading = useAppStore((state) => state.setDataLoading)
  const setProfile = useAppStore((state) => state.setProfile)
  const setFinancials = useAppStore((state) => state.setFinancials)
  const setResults = useAppStore((state) => state.setResults)
  const mergeResult = useAppStore((state) => state.mergeResult)

  async function refreshUserData(uid: string) {
    setDataLoading(true)

    try {
      const ref = await requireDocumentRef(uid)
      const snapshot = await withTimeout(
        getDoc(ref),
        FIRESTORE_TIMEOUT_MS,
        "Loading user data"
      )
      const data = (snapshot.data() || {}) as UserDocument

      setProfile(data.profile ?? null)
      setFinancials(data.financials ?? null)
      setResults(data.results ?? {})

      return data
    } catch (error) {
      setProfile(null)
      setFinancials(null)
      setResults({})
      throw error
    } finally {
      setDataLoading(false)
    }
  }

  async function saveOnboarding(
    uid: string,
    payload: {
      profile: Omit<UserProfile, "createdAt" | "onboardingComplete">
      financials: UserFinancials
    }
  ) {
    const ref = await requireDocumentRef(uid)
    const now = new Date().toISOString()
    const profile = {
      ...payload.profile,
      createdAt: useAppStore.getState().profile?.createdAt ?? now,
      onboardingComplete: true,
    }

    await withTimeout(
      setDoc(
        ref,
        {
          profile,
          financials: payload.financials,
        },
        { merge: true }
      ),
      FIRESTORE_TIMEOUT_MS,
      "Saving onboarding data"
    )

    setProfile(profile)
    setFinancials(payload.financials)
  }

  async function saveToolResult<K extends ToolResultKey>(
    uid: string,
    key: K,
    value: NonNullable<UserResults[K]>
  ) {
    const ref = await requireDocumentRef(uid)
    const stampedValue = {
      ...value,
      updatedAt: new Date().toISOString(),
    } as NonNullable<UserResults[K]>

    await withTimeout(
      setDoc(
        ref,
        {
          results: {
            [key]: stampedValue,
          },
        },
        { merge: true }
      ),
      FIRESTORE_TIMEOUT_MS,
      "Saving tool result"
    )

    mergeResult(key, stampedValue)
    return stampedValue
  }

  return {
    refreshUserData,
    saveOnboarding,
    saveToolResult,
  }
}
