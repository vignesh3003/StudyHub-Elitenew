import { getFirestore } from "firebase/firestore"
import app from "./firebase"

// Initialize Firestore
export const db = getFirestore(app)
