"use client"

import { AlertTriangle, Settings } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { isDemo } from "@/lib/firebase"

export default function DemoBanner() {
  if (!isDemo) return null

  return (
    <Alert className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertTitle className="text-amber-800 dark:text-amber-200">Demo Mode Active</AlertTitle>
      <AlertDescription className="text-amber-700 dark:text-amber-300">
        <div className="space-y-2">
          <p>
            Firebase environment variables are not configured. The app is running in demo mode with limited
            functionality.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/40"
              onClick={() => window.open("https://vercel.com/docs/projects/environment-variables", "_blank")}
            >
              <Settings className="h-3 w-3 mr-1" />
              Setup Guide
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
