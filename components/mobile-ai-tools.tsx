"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, BookOpen, Sparkles, Loader2, Zap, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Flashcard {
  id: string
  question: string
  answer: string
  subject: string
  difficulty: "easy" | "medium" | "hard"
}

interface MobileAIToolsProps {
  onAddFlashcards?: (flashcards: Array<Omit<Flashcard, "id">>) => void
}

export default function MobileAITools({ onAddFlashcards }: MobileAIToolsProps) {
  const [activeTab, setActiveTab] = useState("flashcards")
  const [isGenerating, setIsGenerating] = useState(false)
  const [flashcardText, setFlashcardText] = useState("")
  const [flashcardSubject, setFlashcardSubject] = useState("")
  const [chatInput, setChatInput] = useState("")
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [generatedFlashcards, setGeneratedFlashcards] = useState<Flashcard[]>([])

  const { toast } = useToast()

  const generateFlashcards = async () => {
    if (!flashcardText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter some text to generate flashcards from.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: flashcardText,
          subject: flashcardSubject || "General",
          count: 5,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate flashcards")
      }

      const data = await response.json()
      const newFlashcards = data.flashcards.map((card: any, index: number) => ({
        id: Date.now().toString() + index,
        question: card.question,
        answer: card.answer,
        subject: flashcardSubject || "General",
        difficulty: card.difficulty || "medium",
      }))

      setGeneratedFlashcards(newFlashcards)
      if (onAddFlashcards) {
        onAddFlashcards(newFlashcards)
      }

      toast({
        title: "Flashcards Generated! 🎉",
        description: `Created ${newFlashcards.length} flashcards successfully.`,
      })

      setFlashcardText("")
    } catch (error) {
      console.error("Error generating flashcards:", error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate flashcards. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage = chatInput.trim()
    setChatInput("")
    setChatMessages((prev) => [...prev, { role: "user", content: userMessage }])

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          context: "study_assistant",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = await response.json()
      setChatMessages((prev) => [...prev, { role: "assistant", content: data.response }])
    } catch (error) {
      console.error("Error sending chat message:", error)
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble responding right now. Please try again." },
      ])
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Mobile-Optimized Header */}
      <div className="text-center py-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Study Tools
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Supercharge your learning with AI-powered study tools! 🚀
        </p>
      </div>

      {/* Mobile-Optimized Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-14">
          <TabsTrigger
            value="flashcards"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-base font-semibold py-3"
          >
            <BookOpen className="h-5 w-5" />
            <span className="hidden sm:inline">AI Flashcards</span>
            <span className="sm:hidden">Cards</span>
          </TabsTrigger>
          <TabsTrigger
            value="assistant"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-base font-semibold py-3"
          >
            <Brain className="h-5 w-5" />
            <span className="hidden sm:inline">AI Assistant</span>
            <span className="sm:hidden">Chat</span>
          </TabsTrigger>
        </TabsList>

        {/* AI Flashcard Generator */}
        <TabsContent value="flashcards" className="space-y-6">
          <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                AI Flashcard Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Subject Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Subject (Optional)</label>
                <Input
                  placeholder="e.g., Biology, History, Math..."
                  value={flashcardSubject}
                  onChange={(e) => setFlashcardSubject(e.target.value)}
                  className="h-12 text-base"
                />
              </div>

              {/* Text Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Study Material or Topic
                </label>
                <Textarea
                  placeholder="Paste your study material here, or describe what you want to learn about..."
                  value={flashcardText}
                  onChange={(e) => setFlashcardText(e.target.value)}
                  className="min-h-32 text-base resize-none"
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateFlashcards}
                disabled={isGenerating || !flashcardText.trim()}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                    Generating Flashcards...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-6 w-6 mr-3" />
                    Generate AI Flashcards
                  </>
                )}
              </Button>

              {/* Generated Flashcards Preview */}
              {generatedFlashcards.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Generated Flashcards ({generatedFlashcards.length})
                  </h3>
                  <div className="grid gap-4">
                    {generatedFlashcards.slice(0, 3).map((card, index) => (
                      <Card key={card.id} className="border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs">
                                {card.subject}
                              </Badge>
                              <Badge
                                variant={
                                  card.difficulty === "easy"
                                    ? "default"
                                    : card.difficulty === "medium"
                                      ? "secondary"
                                      : "destructive"
                                }
                                className="text-xs"
                              >
                                {card.difficulty}
                              </Badge>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Q: {card.question}</p>
                              <p className="text-gray-600 dark:text-gray-400">A: {card.answer}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {generatedFlashcards.length > 3 && (
                      <p className="text-center text-gray-500 text-sm">
                        +{generatedFlashcards.length - 3} more flashcards added to your collection
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Study Assistant */}
        <TabsContent value="assistant" className="space-y-6">
          <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                AI Study Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Chat Messages */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">Ask me anything about your studies!</p>
                    <p className="text-sm">I can help with explanations, study tips, and more.</p>
                  </div>
                ) : (
                  chatMessages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] p-4 rounded-2xl ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Chat Input */}
              <div className="flex gap-3">
                <Input
                  placeholder="Ask me anything about your studies..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                  className="flex-1 h-12 text-base"
                />
                <Button
                  onClick={sendChatMessage}
                  disabled={!chatInput.trim()}
                  className="h-12 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Zap className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
