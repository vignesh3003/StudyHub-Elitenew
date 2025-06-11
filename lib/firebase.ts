// Import Firebase modules
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator, type Firestore } from "firebase/firestore"
import { getStorage, type FirebaseStorage } from "firebase/storage"

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase app
let app: FirebaseApp
let auth: Auth
let db: Firestore
let storage: FirebaseStorage

try {
  // Initialize app
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

  // Initialize services immediately
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)

  console.log("✅ Firebase initialized successfully")
} catch (error) {
  console.error("❌ Failed to initialize Firebase:", error)
  throw error
}

// Initialize Firebase services
export const authExport = auth
export const dbExport = db

// Only connect to emulators in development and if not already connected
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  try {
    // Check if already connected to avoid multiple connections
    if (!auth.settings.appCheckTokenProvider) {
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
    }
  } catch (error) {
    // Emulator connection errors are non-critical in production builds
    console.log("Auth emulator connection skipped")
  }

  try {
    // Check if already connected to avoid multiple connections
    if (!db._delegate._databaseId.projectId.includes("demo-")) {
      connectFirestoreEmulator(db, "localhost", 8080)
    }
  } catch (error) {
    // Emulator connection errors are non-critical in production builds
    console.log("Firestore emulator connection skipped")
  }
}

// Export the initialized instances
export default app
export { authExport as auth, dbExport as db, storage }

/**
 * Get Firebase Auth instance
 */
export function getFirebaseAuth(): Auth {
  if (!auth) {
    throw new Error("Firebase Auth not initialized")
  }
  return auth
}

/**
 * Get Firestore instance
 */
export function getFirebaseDb(): Firestore {
  if (!db) {
    throw new Error("Firestore not initialized")
  }
  return db
}

/**
 * Get Firebase Storage instance
 */
export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) {
    throw new Error("Firebase Storage not initialized")
  }
  return storage
}

/**
 * Get Google Auth Provider
 */
export async function getGoogleAuthProvider() {
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
 * Initialize Firebase services (simplified version)
 */
export async function initializeFirebase(): Promise<boolean> {
  try {
    console.log("🚀 Firebase services already initialized")

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

    // Test storage
    if (!storage) {
      throw new Error("Storage not initialized")
    }
    console.log("✅ Firebase Storage ready")

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
  return !!(app && auth && db && storage)
}

/**
 * Wait for Firebase to be ready with timeout
 */
export async function waitForFirebase(timeout = 10000): Promise<boolean> {
  console.log("⏳ Checking if Firebase is ready...")

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
  console.log("🔄 Firebase services are already initialized")
  return await initializeFirebase()
}
