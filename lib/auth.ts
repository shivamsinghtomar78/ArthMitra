"use client"

import {
  type ConfirmationResult,
  type RecaptchaVerifier,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth"
import { ensureFirebasePersistence, firebaseAuth, googleProvider } from "@/lib/firebase"

export async function signUpWithEmail(name: string, email: string, password: string) {
  if (!firebaseAuth) {
    throw new Error("Firebase Auth is not configured.")
  }

  await ensureFirebasePersistence()
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
  await updateProfile(credential.user, {
    displayName: name,
  })

  return credential.user
}

export async function signInWithGoogle() {
  if (!firebaseAuth || !googleProvider) {
    throw new Error("Firebase Auth is not configured.")
  }

  await ensureFirebasePersistence()
  const credential = await signInWithPopup(firebaseAuth, googleProvider)
  return credential.user
}

export async function signInWithEmail(email: string, password: string) {
  if (!firebaseAuth) {
    throw new Error("Firebase Auth is not configured.")
  }

  await ensureFirebasePersistence()
  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password)
  return credential.user
}

export async function sendPhoneVerificationCode(
  phoneNumber: string,
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  if (!firebaseAuth) {
    throw new Error("Firebase Auth is not configured.")
  }

  await ensureFirebasePersistence()
  return signInWithPhoneNumber(firebaseAuth, phoneNumber, verifier)
}

export async function verifyPhoneCode(
  confirmationResult: ConfirmationResult,
  verificationCode: string
) {
  const credential = await confirmationResult.confirm(verificationCode)
  return credential.user
}

export async function sendResetLink(email: string) {
  if (!firebaseAuth) {
    throw new Error("Firebase Auth is not configured.")
  }

  await sendPasswordResetEmail(firebaseAuth, email)
}

export async function signOutCurrentUser() {
  if (!firebaseAuth) {
    return
  }

  await signOut(firebaseAuth)
}
