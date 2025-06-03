"use client"

import type { User } from "firebase/auth"

// Create a demo user object for demo mode
export const createDemoUser = (): User => {
  return {
    uid: "demo-user-123",
    email: "demo@studyhub.com",
    displayName: "Demo User",
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
    providerData: [],
    refreshToken: "",
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => "demo-token",
    getIdTokenResult: async () => ({
      token: "demo-token",
      authTime: new Date().toISOString(),
      issuedAtTime: new Date().toISOString(),
      expirationTime: new Date(Date.now() + 3600000).toISOString(),
      signInProvider: "demo",
      signInSecondFactor: null,
      claims: {},
    }),
    reload: async () => {},
    toJSON: () => ({}),
    phoneNumber: null,
    photoURL: null,
    providerId: "demo",
  } as User
}
