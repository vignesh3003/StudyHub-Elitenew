import { getAuth, GoogleAuthProvider } from "firebase/auth"
import app from "./firebase"

// Initialize Firebase Auth
export const auth = getAuth(app)

// Configure Google provider
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: "select_account",
})
