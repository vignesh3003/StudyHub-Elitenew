// Import Firebase modules
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"

// Firebase configuration
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
let app: FirebaseApp
let auth: Auth
let db: Firestore

try {
  // Initialize app
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

  // Initialize services immediately
  auth = getAuth(app)
  db = getFirestore(app)

  console.log("✅ Firebase initialized successfully")
} catch (error) {
  console.error("❌ Failed to initialize Firebase:", error)
  throw error
}

// Export the initialized instances
export default app
export { auth, db }

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
  return !!(app && auth && db)
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
