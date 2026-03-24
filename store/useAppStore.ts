"use client"

import { create } from "zustand"
import type { User } from "firebase/auth"
import type {
  ToolResultKey,
  UserFinancials,
  UserProfile,
  UserResults,
} from "@/types"

type ToolState = {
  loading: boolean
  error?: string
}

interface AppState {
  user: User | null
  authLoading: boolean
  dataLoading: boolean
  profile: UserProfile | null
  financials: UserFinancials | null
  results: UserResults
  toolState: Partial<Record<ToolResultKey, ToolState>>
  setUser: (user: User | null) => void
  setAuthLoading: (loading: boolean) => void
  setDataLoading: (loading: boolean) => void
  setProfile: (profile: UserProfile | null) => void
  setFinancials: (financials: UserFinancials | null) => void
  setResults: (results: UserResults) => void
  mergeResult: <K extends ToolResultKey>(key: K, value: NonNullable<UserResults[K]>) => void
  setToolState: (key: ToolResultKey, state: ToolState) => void
  resetAppState: () => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  authLoading: true,
  dataLoading: false,
  profile: null,
  financials: null,
  results: {},
  toolState: {},
  setUser: (user) => set({ user }),
  setAuthLoading: (authLoading) => set({ authLoading }),
  setDataLoading: (dataLoading) => set({ dataLoading }),
  setProfile: (profile) => set({ profile }),
  setFinancials: (financials) => set({ financials }),
  setResults: (results) => set({ results }),
  mergeResult: (key, value) =>
    set((state) => ({
      results: {
        ...state.results,
        [key]: value,
      },
    })),
  setToolState: (key, state) =>
    set((current) => ({
      toolState: {
        ...current.toolState,
        [key]: state,
      },
    })),
  resetAppState: () =>
    set({
      user: null,
      authLoading: false,
      dataLoading: false,
      profile: null,
      financials: null,
      results: {},
      toolState: {},
    }),
}))
