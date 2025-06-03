"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function DemoMode() {
  const [isConfigured, setIsConfigured] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkConfiguration = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Check if all required environment variables are present
      const requiredVars = [
        "NEXT_PUBLIC_FIREBASE_API_KEY",
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
        "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
        "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
        "NEXT_PUBLIC_FIREBASE_APP_ID",
      ]

      const missingVars = requiredVars.filter((varName) => !process.env[varName] || process.env[varName] === "")

      if (missingVars.length > 0) {
        setError(`Missing environment variables: ${missingVars.join(", ")}`)
        setIsConfigured(false)
      } else {
        setIsConfigured(true)
      }
    } catch (err) {
      setError(`Error checking configuration: ${err instanceof Error ? err.message : String(err)}`)
      setIsConfigured(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>StudyHub Elite Configuration</CardTitle>
        <CardDescription>Check if your Firebase environment variables are properly configured</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Configuration Error</h3>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {isConfigured && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Configuration Valid</h3>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                  All required environment variables are present.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="apiKey">Firebase API Key</Label>
            <Input
              id="apiKey"
              type="text"
              value={process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ""}
              disabled
              className="font-mono"
            />
          </div>

          <div>
            <Label htmlFor="projectId">Firebase Project ID</Label>
            <Input
              id="projectId"
              type="text"
              value={process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ""}
              disabled
              className="font-mono"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={checkConfiguration} disabled={isLoading} className="w-full">
          {isLoading ? "Checking..." : "Check Configuration"}
        </Button>
      </CardFooter>
    </Card>
  )
}
