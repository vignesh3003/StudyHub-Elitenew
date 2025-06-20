import { initializeApp } from "firebase/app"
import { getAuth, connectAuthEmulator, type Auth, type GoogleAuthProvider } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator, type Firestore } from "firebase/firestore"
import { getStorage, connectStorageEmulator, type FirebaseStorage } from "firebase/storage"
import { getFunctions, connectFunctionsEmulator } from "firebase/functions"

// ℹ️ https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// 🔍 Validate configuration --------------------------------------------------
const requiredKeys = {
  apiKey: "NEXT_PUBLIC_FIREBASE_API_KEY",
  authDomain: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  projectId: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  storageBucket: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  appId: "NEXT_PUBLIC_FIREBASE_APP_ID",
  measurementId: "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID",
}

const missing = Object.entries(requiredKeys).filter(
  ([cfgKey, envVar]) => !firebaseConfig[cfgKey as keyof typeof firebaseConfig],
)

let usingEmulators = false

if (missing.length) {
  const missingList = missing.map(([, env]) => env).join(", ")

  if (process.env.NODE_ENV === "development") {
    // In dev: use dummy config so you can still run the app with emulators
    console.warn(`⚠️  Missing Firebase env vars: ${missingList}. ` + "Falling back to emulator-only config.")
    // Provide obviously fake values for the SDK
    firebaseConfig.apiKey = "local-fake-api-key"
    firebaseConfig.authDomain = "localhost"
    firebaseConfig.projectId = "demo-project"
    firebaseConfig.storageBucket = "demo-project.appspot.com"
    usingEmulators = true
  } else {
    throw new Error(`❌ Firebase initialisation failed – missing env vars: ${missingList}`)
  }
}

// 🚀 Initialize Firebase
const app = initializeApp(firebaseConfig)

// 🔥 Auth
export const auth = getAuth(app)

// 💾 Firestore
export const db = getFirestore(app)

// 🗄️ Storage
export const storage = getStorage(app)

// ⚙️ Functions
export const functions = getFunctions(app)

// 🧪 Connect to Emulators - Only if we have missing config OR explicitly enabled
if (typeof window !== "undefined" && (usingEmulators || process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true")) {
  try {
    console.log("🔧 Connecting to Firebase emulators...")

    // Only connect if not already connected
    if (!auth.config.emulator) {
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
    }

    if (!db._delegate._databaseId.projectId.includes("localhost")) {
      connectFirestoreEmulator(db, "localhost", 8080)
    }

    connectStorageEmulator(storage, "localhost", 9199)
    connectFunctionsEmulator(functions, "localhost", 5001)

    console.log("✅ Connected to Firebase emulators")
  } catch (error) {
    console.warn("⚠️ Could not connect to Firebase emulators:", error)
    console.warn("💡 Make sure to run: firebase emulators:start")
  }
}

/**
 * Return the already-initialised Firebase Auth instance.
 */
export function getFirebaseAuth(): Auth {
  return auth
}

/**
 * Return the already-initialised Firestore instance.
 */
export function getFirebaseDb(): Firestore {
  return db
}

/**
 * Return the already-initialised Storage instance.
 */
export function getFirebaseStorage(): FirebaseStorage {
  return storage
}

/**
 * Lazily import and configure a GoogleAuthProvider.
 */
export async function getGoogleAuthProvider(): Promise<GoogleAuthProvider> {
  const { GoogleAuthProvider } = await import("firebase/auth")
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: "select_account" })
  return provider
}

/**
 * Lazily import the heavyweight auth functions on demand.
 */
export async function getAuthFunctions() {
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
}

export default app
