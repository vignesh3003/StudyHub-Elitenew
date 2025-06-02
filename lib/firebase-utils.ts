import app from "./firebase"

/**
 * Checks if Firebase is initialized and ready to use
 */
export const isFirebaseReady = (): boolean => {
  try {
    return !!app && !!app.name
  } catch (error) {
    console.error("Firebase readiness check failed:", error)
    return false
  }
}

/**
 * Waits for Firebase to be ready
 * @param timeout Timeout in milliseconds
 */
export const waitForFirebase = async (timeout = 5000): Promise<boolean> => {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    if (isFirebaseReady()) {
      return true
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  return false
}
