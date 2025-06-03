"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function DebugPage() {
  const envVars = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
    "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID",
    "NEXT_PUBLIC_AI_API_URL",
    "GEMINI_API_KEY",
  ]

  const checkEnvVar = (varName: string) => {
    const value = process.env[varName]
    return {
      name: varName,
      exists: !!value,
      value: value ? (varName.includes("API_KEY") ? value.substring(0, 10) + "..." : value) : "Not found",
      isPublic: varName.startsWith("NEXT_PUBLIC_"),
    }
  }

  const envStatus = envVars.map(checkEnvVar)
  const missingVars = envStatus.filter((env) => !env.exists)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <AlertCircle className="h-6 w-6" />
              Environment Variables Debug
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4">
                {envStatus.map((env) => (
                  <div key={env.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {env.exists ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">{env.name}</p>
                        <p className="text-sm text-gray-500">{env.isPublic ? "Client-side" : "Server-side only"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm ${env.exists ? "text-green-600" : "text-red-600"}`}>
                        {env.exists ? "Found" : "Missing"}
                      </p>
                      {env.exists && <p className="text-xs text-gray-500 max-w-xs truncate">{env.value}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {missingVars.length > 0 && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">Missing Environment Variables:</h3>
                  <ul className="list-disc list-inside text-red-700 space-y-1">
                    {missingVars.map((env) => (
                      <li key={env.name}>{env.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Debug Info:</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>NODE_ENV: {process.env.NODE_ENV}</p>
                  <p>Build Time: {new Date().toISOString()}</p>
                  <p>Total Environment Variables: {Object.keys(process.env).length}</p>
                  <p>
                    Firebase Variables Found:{" "}
                    {envStatus.filter((env) => env.name.includes("FIREBASE") && env.exists).length}/7
                  </p>
                </div>
              </div>

              <Button onClick={() => window.location.reload()} className="w-full">
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
