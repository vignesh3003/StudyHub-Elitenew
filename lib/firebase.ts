// Import Firebase modules
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"

// Hardcoded Firebase configuration (since env vars aren't working in production)
const firebaseConfig = {
  apiKey: "AIzaSyDOez9-i-8kx2YPn4wXNTrdHyzrxXJ3JW4",
  authDomain: "studyhub-elite.firebaseapp.com",
  projectId: "studyhub-elite",
  storageBucket: "studyhub-elite.firebasestorage.app",
  messagingSenderId: "993180920821",
  appId: "1:993180920821:web:2c56bd040a47e6a5a6cebc",
  measurementId: "G-C857S3PTJ7",
}

// Initialize Firebase app
let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let initializationError: string | null = null

try {
  console.log("🚀 Initializing Firebase with hardcoded config...")
  console.log("Project ID:", firebaseConfig.projectId)
  console.log("Auth Domain:", firebaseConfig.authDomain)

  // Initialize app
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
  console.log("✅ Firebase app initialized")

  // Initialize services
  auth = getAuth(app)
  console.log("✅ Firebase Auth initialized")

  db = getFirestore(app)
  console.log("✅ Firestore initialized")

  console.log("🎉 Firebase initialization completed successfully")
} catch (error: any) {
  console.error("💥 Firebase initialization failed:", error)
  initializationError = error.message
}

// Export the initialized instances
export default app
export { auth, db, initializationError }

/**
 * Get Firebase Auth instance
 */
export function getFirebaseAuth(): Auth {
  if (initializationError) {
    throw new Error(`Firebase not initialized: ${initializationError}`)
  }
  if (!auth) {
    throw new Error("Firebase Auth not initialized")
  }
  return auth
}

/**
 * Get Firestore instance
 */
export function getFirebaseDb(): Firestore {
  if (initializationError) {
    throw new Error(`Firebase not initialized: ${initializationError}`)
  }
  if (!db) {
    throw new Error("Firestore not initialized")
  }
  return db
}

/**
 * Get Google Auth Provider
 */
export async function getGoogleAuthProvider() {
  if (initializationError) {
    throw new Error(`Firebase not initialized: ${initializationError}`)
  }

  try {
    const { GoogleAuthProvider } = await import("firebase/auth")
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({
      prompt: "select_account",
    })
    return provider
  } catch (error) {
    console.error("❌ Failed to get Google Auth Provider:", error)
    throw new Error("Google Auth Provider initialization failed")
  }
}

/**
 * Get Firebase Auth functions
 */
export async function getAuthFunctions() {
  if (initializationError) {
    throw new Error(`Firebase not initialized: ${initializationError}`)
  }

  try {
    const authModule = await import("firebase/auth")
    return {
      signInWithEmailAndPassword: authModule.signInWithEmailAndPassword,
      createUserWithEmailAndPassword: authModule.createUserWithEmailAndPassword,
      signInWithPopup: authModule.signInWithPopup,
      signOut: authModule.signOut,
      onAuthStateChanged: authModule.onAuthStateChanged,
      RecaptchaVerifier: authModule.RecaptchaVerifier,
      signInWithPhoneNumber: authModule.signInWithPhoneNumber,
    }
  } catch (error) {
    console.error("❌ Failed to get auth functions:", error)
    throw new Error("Auth functions initialization failed")
  }
}

/**
 * Initialize Firebase services
 */
export async function initializeFirebase(): Promise<boolean> {
  if (initializationError) {
    console.error("❌ Firebase initialization failed previously:", initializationError)
    return false
  }

  try {
    console.log("🔍 Checking Firebase services...")

    // Test auth
    if (!auth) {
      throw new Error("Auth not initialized")
    }
    console.log("✅ Firebase Auth ready")

    // Test firestore
    if (!db) {
      throw new Error("Firestore not initialized")
    }
    console.log("✅ Firestore ready")

    console.log("🎉 All Firebase services ready")
    return true
  } catch (error) {
    console.error("💥 Firebase initialization check failed:", error)
    return false
  }
}

/**
 * Check if Firebase is ready to use
 */
export function isFirebaseReady(): boolean {
  return !!(app && auth && db && !initializationError)
}

/**
 * Wait for Firebase to be ready with timeout
 */
export async function waitForFirebase(timeout = 10000): Promise<boolean> {
  console.log("⏳ Checking if Firebase is ready...")

  if (initializationError) {
    console.error("❌ Firebase initialization failed:", initializationError)
    return false
  }

  try {
    const success = await initializeFirebase()
    if (success) {
      console.log("✅ Firebase is ready!")
      return true
    }
  } catch (error) {
    console.error("❌ Firebase check failed:", error)
  }

  return false
}

/**
 * Force reinitialize Firebase services
 */
export async function reinitializeFirebase(): Promise<boolean> {
  console.log("🔄 Checking Firebase services...")
  return await initializeFirebase()
}

// Export isDemo as false since we're not using demo mode
export const isDemo = false

// Export initialization status for debugging
export function getFirebaseStatus() {
  return {
    isInitialized: !!app,
    hasAuth: !!auth,
    hasDb: !!db,
    error: initializationError,
    isReady: isFirebaseReady(),
  }
}
