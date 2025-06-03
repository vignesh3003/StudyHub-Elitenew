"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Sparkles, Plus, Upload, FileText, CheckCircle, Wand2, Star, Zap, ImageIcon, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface GeneratedFlashcard {
  question: string
  answer: string
}

interface AIFlashcardGeneratorProps {
  onAddFlashcards: (
    flashcards: Array<{
      question: string
      answer: string
      subject: string
      difficulty: "easy" | "medium" | "hard"
    }>,
  ) => void
}

export default function AIFlashcardGenerator({ onAddFlashcards }: AIFlashcardGeneratorProps) {
  const [activeTab, setActiveTab] = useState("text")

  // Text input states
  const [userQuestion, setUserQuestion] = useState("")
  const [userAnswer, setUserAnswer] = useState("")

  // Common states
  const [subject, setSubject] = useState("")
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [generatedCards, setGeneratedCards] = useState<GeneratedFlashcard[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const { toast } = useToast()

  const generateFromText = async () => {
    if (!userQuestion || !userAnswer || !subject) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before generating AI flashcards.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      console.log("🚀 Generating flashcards...")
      console.log("📝 Data:", { question: userQuestion, answer: userAnswer, subject, difficulty })

      const response = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userQuestion,
          answer: userAnswer,
          subject,
          difficulty,
        }),
      })

      console.log("📡 Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ API Error Response:", errorText)
        throw new Error(`API returned status ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("📊 Response data:", data)

      if (!data.success) {
        throw new Error(data.error || "Failed to generate flashcards")
      }

      if (!data.flashcards || data.flashcards.length === 0) {
        throw new Error("No flashcards were generated")
      }

      setGeneratedCards(data.flashcards)

      toast({
        title: "🎉 Amazing AI Flashcards Generated!",
        description: `Created ${data.flashcards.length} high-quality educational flashcards using AI!`,
      })
    } catch (error) {
      console.error("❌ Error generating flashcards:", error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate flashcards. Please try again.",
        variant: "destructive",
      })
    }
    setIsGenerating(false)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file)
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, etc.)",
        variant: "destructive",
      })
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file)
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, etc.)",
        variant: "destructive",
      })
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
  }

  const generateFromFile = async () => {
    if (!selectedFile || !subject) {
      toast({
        title: "Missing Information",
        description: "Please select an image file and specify a subject before generating flashcards.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      console.log("🚀 Generating flashcards from image...")

      const formData = new FormData()
      formData.append("image", selectedFile)
      formData.append("subject", subject)
      formData.append("difficulty", difficulty)

      const response = await fetch("/api/generate-flashcards-from-image", {
        method: "POST",
        body: formData,
      })

      console.log("📡 Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ API Error Response:", errorText)
        throw new Error(`API returned status ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("📊 Response data:", data)

      if (!data.success) {
        throw new Error(data.error || "Failed to generate flashcards")
      }

      if (!data.flashcards || data.flashcards.length === 0) {
        throw new Error("No flashcards were generated")
      }

      setGeneratedCards(data.flashcards)
      setUserQuestion(`Image: ${selectedFile.name}`)
      setUserAnswer("Generated from image upload")

      toast({
        title: "🎉 Image Flashcards Generated!",
        description: `Created ${data.flashcards.length} high-quality flashcards from your image using AI!`,
      })
    } catch (error) {
      console.error("❌ Error generating flashcards:", error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate flashcards. Please try again.",
        variant: "destructive",
      })
    }
    setIsGenerating(false)
  }

  const addAllFlashcards = () => {
    let allCards = []

    if (userQuestion && userAnswer) {
      allCards = [
        {
          question: userQuestion,
          answer: userAnswer,
          subject,
          difficulty,
        },
        ...generatedCards.map((card) => ({
          question: card.question,
          answer: card.answer,
          subject,
          difficulty,
        })),
      ]
    } else {
      allCards = generatedCards.map((card) => ({
        question: card.question,
        answer: card.answer,
        subject,
        difficulty,
      }))
    }

    onAddFlashcards(allCards)

    // Reset form
    setUserQuestion("")
    setUserAnswer("")
    setSubject("")
    setGeneratedCards([])

    toast({
      title: "🎉 Flashcards Added Successfully!",
      description: `Added ${allCards.length} high-quality flashcards to your collection.`,
    })
  }

  return (
    <div className="space-y-6 sm:space-y-12 px-2 sm:px-0">
      {/* Mobile-Optimized Main Generator Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 dark:from-sky-900/20 dark:via-blue-900/20 dark:to-cyan-900/20 border-sky-200/50 dark:border-sky-700/50 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-indigo-500/5"></div>

        {/* Floating decorative elements - hidden on mobile */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-r from-sky-400/20 to-blue-400/20 rounded-full blur-xl animate-pulse hidden sm:block"></div>
        <div className="absolute bottom-10 left-10 w-16 h-16 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-lg animate-pulse delay-1000 hidden sm:block"></div>

        <CardHeader className="relative pb-4 sm:pb-8 p-4 sm:p-6">
          <CardTitle className="text-2xl sm:text-4xl flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl sm:rounded-3xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-r from-sky-500 to-blue-500 p-3 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl group-hover:scale-105 transition-transform duration-300">
                <Sparkles className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent font-bold block">
                AI Flashcard Generator
              </span>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mt-2 sm:mt-3">
                <Badge className="bg-gradient-to-r from-sky-500 to-blue-500 text-white px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-lg font-bold">
                  <Star className="h-3 w-3 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                  Smart Learning
                </Badge>
                <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-lg font-bold">
                  <Zap className="h-3 w-3 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                  Instant
                </Badge>
              </div>
            </div>
          </CardTitle>
          <p className="text-purple-600/80 dark:text-purple-400/80 text-base sm:text-2xl mt-2 sm:mt-4 font-medium text-center sm:text-left">
            Transform your study materials into powerful flashcards with AI ✨
          </p>
        </CardHeader>
        <CardContent className="relative p-4 sm:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 sm:space-y-8">
            {/* Mobile-Optimized Tab Navigation */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-2 shadow-2xl border border-purple-200/50 dark:border-purple-700/50">
              <TabsList className="grid w-full grid-cols-2 gap-2 bg-transparent relative">
                <TabsTrigger
                  value="text"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-xl py-3 sm:py-6 px-3 sm:px-8 transition-all duration-300 hover:scale-105 font-bold text-sm sm:text-lg"
                >
                  <FileText className="h-4 w-4 sm:h-6 sm:w-6" />
                  <span>Text Input</span>
                </TabsTrigger>
                <TabsTrigger
                  value="file"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-xl py-3 sm:py-6 px-3 sm:px-8 transition-all duration-300 hover:scale-105 font-bold text-sm sm:text-lg"
                >
                  <Upload className="h-4 w-4 sm:h-6 sm:w-6" />
                  <span>File Upload</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Mobile-Optimized Common Settings */}
            <div className="grid grid-cols-1 gap-4 sm:gap-8">
              <div className="space-y-2 sm:space-y-4">
                <label className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">
                  <span className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full"></span>
                  Subject *
                </label>
                <Input
                  placeholder="e.g., Biology, Math, History"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="h-12 sm:h-16 text-base sm:text-xl border-sky-200 dark:border-sky-700 focus:border-blue-400 bg-white/90 dark:bg-gray-800/90 rounded-xl sm:rounded-2xl shadow-lg"
                />
              </div>
              <div className="space-y-2 sm:space-y-4">
                <label className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">
                  <span className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full"></span>
                  Difficulty Level
                </label>
                <Select value={difficulty} onValueChange={(value: "easy" | "medium" | "hard") => setDifficulty(value)}>
                  <SelectTrigger className="h-12 sm:h-16 text-base sm:text-xl border-sky-200 dark:border-sky-700 focus:border-blue-400 bg-white/90 dark:bg-gray-800/90 rounded-xl sm:rounded-2xl shadow-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50 rounded-xl sm:rounded-2xl">
                    <SelectItem value="easy" className="text-base sm:text-lg py-2 sm:py-3">
                      🟢 Easy
                    </SelectItem>
                    <SelectItem value="medium" className="text-base sm:text-lg py-2 sm:py-3">
                      🟡 Medium
                    </SelectItem>
                    <SelectItem value="hard" className="text-base sm:text-lg py-2 sm:py-3">
                      🔴 Hard
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="text" className="space-y-6 sm:space-y-8">
              <div className="space-y-4 sm:space-y-6">
                <label className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">
                  <span className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full"></span>
                  Your Question *
                </label>
                <Textarea
                  placeholder="Enter your flashcard question..."
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  rows={4}
                  className="text-base sm:text-xl border-sky-200 dark:border-sky-700 focus:border-blue-400 bg-white/90 dark:bg-gray-800/90 rounded-xl sm:rounded-2xl shadow-lg resize-none"
                />
              </div>

              <div className="space-y-4 sm:space-y-6">
                <label className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">
                  <span className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full"></span>
                  Your Answer *
                </label>
                <Textarea
                  placeholder="Enter the answer to your question..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  rows={4}
                  className="text-base sm:text-xl border-sky-200 dark:border-sky-700 focus:border-blue-400 bg-white/90 dark:bg-gray-800/90 rounded-xl sm:rounded-2xl shadow-lg resize-none"
                />
              </div>

              <Button
                onClick={generateFromText}
                disabled={isGenerating || !userQuestion || !userAnswer || !subject}
                className="w-full h-14 sm:h-20 text-lg sm:text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 rounded-xl sm:rounded-2xl"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-4" />
                    Generate AI Flashcards
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="file" className="space-y-6 sm:space-y-8">
              <div className="space-y-6 sm:space-y-8">
                <div
                  className={`border-4 border-dashed rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center transition-colors duration-300 ${
                    dragActive
                      ? "border-purple-400 bg-purple-50/60 dark:bg-purple-900/20"
                      : "border-purple-300 dark:border-purple-700 hover:border-purple-400 bg-white/60 dark:bg-gray-800/60"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {selectedFile ? (
                    <div className="flex flex-col items-center">
                      <div className="relative w-full max-w-md h-48 sm:h-64 mb-4 sm:mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                        <img
                          src={URL.createObjectURL(selectedFile) || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 rounded-full"
                          onClick={removeFile}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-purple-700 dark:text-purple-400 font-bold text-lg sm:text-xl mb-2">
                        {selectedFile.name}
                      </div>
                      <p className="text-purple-500 dark:text-purple-400 text-sm mb-4">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="relative inline-block mb-6 sm:mb-8">
                        <div className="absolute inset-0 bg-blue-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                        <Upload className="relative h-16 w-16 sm:h-24 sm:w-24 mx-auto text-purple-400" />
                      </div>
                      <p className="text-purple-700 dark:text-purple-400 font-bold text-xl sm:text-3xl mb-4 sm:mb-6">
                        Upload Study Material
                      </p>
                      <p className="text-purple-500 dark:text-purple-400 text-base sm:text-xl max-w-lg mx-auto leading-relaxed mb-4 sm:mb-6">
                        Drag and drop an image of your notes, textbook page, or study material
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="flashcard-file-upload"
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById("flashcard-file-upload")?.click()}
                        className="border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-12 px-6 text-base font-medium"
                      >
                        <ImageIcon className="h-5 w-5 mr-2" />
                        Choose Image
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  onClick={generateFromFile}
                  disabled={isGenerating || !selectedFile || !subject}
                  className="w-full h-14 sm:h-20 text-lg sm:text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 rounded-xl sm:rounded-2xl"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-4 animate-spin" />
                      Analyzing Image...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-4" />
                      Generate from Image
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Mobile-Optimized Generated Cards Display */}
      {generatedCards.length > 0 && (
        <Card className="bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-900/20 dark:to-cyan-900/20 border-sky-200/50 dark:border-sky-700/50 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5"></div>
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl"></div>

          <CardHeader className="relative p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="flex items-center gap-3 sm:gap-4 text-sky-700 dark:text-sky-400">
                <div className="p-3 sm:p-4 bg-sky-500 rounded-xl sm:rounded-2xl shadow-2xl">
                  <CheckCircle className="h-6 w-6 sm:h-10 sm:w-10 text-white" />
                </div>
                Generated Flashcards
              </span>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <Badge
                  variant="secondary"
                  className="bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-400 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-xl font-bold"
                >
                  ✍️ From Text
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-400 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-xl font-bold"
                >
                  {generatedCards.length + 1} total cards
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 sm:space-y-8 relative p-4 sm:p-6">
            {/* Original card */}
            {userQuestion && userAnswer && (
              <div className="p-4 sm:p-8 bg-blue-50 dark:bg-blue-900/20 rounded-2xl sm:rounded-3xl border-2 border-blue-200 dark:border-blue-700 shadow-xl">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <Badge className="bg-blue-600 text-white px-3 sm:px-4 py-2 text-sm sm:text-xl font-bold">
                    Your Original
                  </Badge>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <span className="font-bold text-blue-800 dark:text-blue-400 text-base sm:text-xl">Q: </span>
                    <span className="text-blue-700 dark:text-blue-300 text-base sm:text-xl">{userQuestion}</span>
                  </div>
                  <div>
                    <span className="font-bold text-blue-800 dark:text-blue-400 text-base sm:text-xl">A: </span>
                    <span className="text-blue-700 dark:text-blue-300 text-base sm:text-xl">{userAnswer}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Generated cards */}
            {generatedCards.map((card, index) => (
              <div
                key={index}
                className="p-4 sm:p-8 bg-blue-50 dark:bg-blue-900/20 rounded-2xl sm:rounded-3xl border-2 border-blue-200 dark:border-blue-700 shadow-xl hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-400 px-3 sm:px-4 py-2 text-sm sm:text-xl font-bold"
                  >
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                    AI Generated #{index + 1}
                  </Badge>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <span className="font-bold text-blue-800 dark:text-blue-400 text-base sm:text-xl">Q: </span>
                    <span className="text-blue-700 dark:text-blue-300 text-base sm:text-xl">{card.question}</span>
                  </div>
                  <div>
                    <span className="font-bold text-blue-800 dark:text-blue-400 text-base sm:text-xl">A: </span>
                    <span className="text-blue-700 dark:text-blue-300 text-base sm:text-xl">{card.answer}</span>
                  </div>
                </div>
              </div>
            ))}

            <Button
              onClick={addAllFlashcards}
              className="w-full h-16 sm:h-20 text-lg sm:text-2xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 rounded-xl sm:rounded-2xl"
              size="lg"
            >
              <Plus className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-4" />
              Add All {generatedCards.length + 1} Flashcards
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Mobile-Optimized Empty State */}
      {generatedCards.length === 0 && (
        <Card className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <CardContent className="text-center py-12 sm:py-24 p-4 sm:p-6">
            <div className="relative inline-block mb-8 sm:mb-12">
              <div className="absolute inset-0 bg-blue-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <Sparkles className="relative h-20 w-20 sm:h-32 sm:w-32 mx-auto text-blue-400" />
            </div>
            <h3 className="text-2xl sm:text-4xl font-bold text-gray-700 dark:text-gray-300 mb-4 sm:mb-6">
              Ready to Create Amazing Flashcards!
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-2xl max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed">
              Enter your question and answer, then let our AI create 5 additional high-quality study flashcards!
            </p>
            <div className="space-y-6 sm:space-y-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 sm:p-8 rounded-xl sm:rounded-2xl border border-blue-200 dark:border-blue-700 max-w-2xl mx-auto">
                <h4 className="font-bold text-blue-800 dark:text-blue-400 mb-3 sm:mb-4 text-lg sm:text-xl">
                  💡 Example:
                </h4>
                <p className="text-blue-700 dark:text-blue-300 text-sm sm:text-lg text-left">
                  <strong>Subject:</strong> Biology
                  <br />
                  <strong>Question:</strong> What is photosynthesis?
                  <br />
                  <strong>Answer:</strong> The process by which plants convert sunlight into energy
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
