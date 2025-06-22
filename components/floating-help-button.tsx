"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import { HelpSupport } from "./help-support"

interface FloatingHelpButtonProps {
  user: any
}

export function FloatingHelpButton({ user }: FloatingHelpButtonProps) {
  const [showHelp, setShowHelp] = useState(false)

  return (
    <>
      {/* Floating Help Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setShowHelp(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-200 group"
          size="sm"
        >
          <div className="relative">
            <HelpCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
          </div>
          <span className="sr-only">Get Help</span>
        </Button>

        {/* Tooltip */}
        <div className="absolute bottom-16 right-0 bg-gray-900 dark:bg-gray-700 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Need Help? Click here!
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
        </div>
      </div>

      {/* Help Modal */}
      <HelpSupport isOpen={showHelp} onClose={() => setShowHelp(false)} user={user} />
    </>
  )
}
