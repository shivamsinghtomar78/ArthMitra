import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app"
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getAuth,
  setPersistence,
  type Auth,
} from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

const requiredFirebaseConfig = {
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
}

export const missingFirebaseConfigKeys = Object.entries(requiredFirebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key)

export const isFirebaseConfigured = Object.values(requiredFirebaseConfig).every(Boolean)

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let persistenceConfigured = false

if (isFirebaseConfigured) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
}

export const firebaseApp = app
export const firebaseAuth = auth
export const firestoreDb = db
export const googleProvider = isFirebaseConfigured ? new GoogleAuthProvider() : null

if (googleProvider) {
  googleProvider.setCustomParameters({
    prompt: "select_account",
  })
}

export function assertFirebaseConfigured() {
  if (!isFirebaseConfigured || !firebaseAuth || !firestoreDb) {
    throw new Error(
      "Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* keys to .env.local."
    )
  }

  return {
    auth: firebaseAuth,
    db: firestoreDb,
  }
}

export async function ensureFirebasePersistence() {
  if (!firebaseAuth || persistenceConfigured || typeof window === "undefined") {
    return
  }

  await setPersistence(firebaseAuth, browserLocalPersistence)
  persistenceConfigured = true
}
