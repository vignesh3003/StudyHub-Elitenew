"use client"

import { useState } from "react"
import MobileAITools from "@/components/mobile-ai-tools"
import { Button } from "@/components/ui/button"
import { ArrowLeft, GraduationCap } from "lucide-react"
import Link from "next/link"

interface Flashcard {
  id: string
  question: string
  answer: string
  subject: string
  difficulty: "easy" | "medium" | "hard"
}

export default function AIToolsPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])

  const handleAddFlashcards = (newFlashcards: Array<Omit<Flashcard, "id">>) => {
    const flashcardsWithIds = newFlashcards.map((card) => ({
      ...card,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }))
    setFlashcards([...flashcards, ...flashcardsWithIds])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to StudyHub
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    AI Study Tools
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Mobile-Optimized Learning</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <MobileAITools onAddFlashcards={handleAddFlashcards} />

        {/* Flashcards Summary */}
        {flashcards.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              📚 You've created {flashcards.length} flashcards total!
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
