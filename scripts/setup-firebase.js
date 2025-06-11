// Firebase Setup Script
// This script helps you set up Firebase Firestore security rules

console.log("🔥 Firebase Setup Guide for StudyHub Elite")
console.log("==========================================")
console.log("")

console.log("📋 Steps to fix Firebase permissions:")
console.log("")

console.log("1. Go to Firebase Console: https://console.firebase.google.com")
console.log("2. Select your project")
console.log("3. Go to Firestore Database")
console.log("4. Click on 'Rules' tab")
console.log("5. Replace the existing rules with the rules from firestore.rules file")
console.log("6. Click 'Publish' to deploy the new rules")
console.log("")

console.log("🔧 Environment Variables Check:")
console.log("Make sure these are set in your .env.local:")
console.log("")

const requiredEnvVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID",
]

requiredEnvVars.forEach((envVar) => {
  const value = process.env[envVar]
  if (value) {
    console.log(`✅ ${envVar}: ${value.substring(0, 10)}...`)
  } else {
    console.log(`❌ ${envVar}: NOT SET`)
  }
})

console.log("")
console.log("🚀 After setting up the rules, your app should work without permission errors!")
console.log("")
console.log("💡 If you still see errors, check:")
console.log("   - Firebase project is active")
console.log("   - Authentication is enabled")
console.log("   - Firestore is initialized")
console.log("   - Rules are published correctly")
