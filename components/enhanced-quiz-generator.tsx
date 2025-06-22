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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Loader2,
  Brain,
  Plus,
  Upload,
  FileText,
  CheckCircle,
  Wand2,
  Star,
  Zap,
  ImageIcon,
  X,
  Download,
  FileDown,
  Camera,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { gamificationService } from "@/lib/gamification-service"

interface GeneratedQuestion {
  id: string
  type: "multiple_choice" | "short_answer" | "long_answer"
  question: string
  options?: string[]
  correct_answer: string
  explanation?: string
  points: number
  difficulty?: "easy" | "medium" | "hard"
}

interface EnhancedQuizGeneratorProps {
  user?: any
  onAddQuiz?: (quiz: {
    title: string
    subject: string
    difficulty: string
    questions: GeneratedQuestion[]
    totalPoints: number
  }) => void
}

export default function EnhancedQuizGenerator({ user, onAddQuiz }: EnhancedQuizGeneratorProps) {
  const [activeTab, setActiveTab] = useState("text")

  // Text input states
  const [topic, setTopic] = useState("")
  const [description, setDescription] = useState("")

  // Common states
  const [subject, setSubject] = useState("")
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [questionCount, setQuestionCount] = useState(10)
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  // Question type preferences
  const [includeMultipleChoice, setIncludeMultipleChoice] = useState(false)
  const [includeShortAnswer, setIncludeShortAnswer] = useState(false)
  const [includeLongAnswer, setIncludeLongAnswer] = useState(true)

  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const { toast } = useToast()

  const generateFromText = async () => {
    // Validation
    if (!topic.trim()) {
      toast({
        title: "Missing Topic",
        description: "Please enter a quiz topic before generating questions.",
        variant: "destructive",
      })
      return
    }

    if (!subject.trim()) {
      toast({
        title: "Missing Subject",
        description: "Please enter a subject before generating questions.",
        variant: "destructive",
      })
      return
    }

    if (!includeMultipleChoice && !includeShortAnswer && !includeLongAnswer) {
      toast({
        title: "No Question Types Selected",
        description: "Please select at least one question type.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      console.log("🚀 Generating quiz questions...")

      const questionTypes = []
      if (includeMultipleChoice) questionTypes.push("multiple_choice")
      if (includeShortAnswer) questionTypes.push("short_answer")
      if (includeLongAnswer) questionTypes.push("long_answer")

      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topic.trim(),
          description: description.trim(),
          subject: subject.trim(),
          difficulty,
          questionCount,
          questionTypes,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API returned status ${response.status}: ${errorText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to generate quiz questions")
      }

      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions were generated")
      }

      setGeneratedQuestions(data.questions)

      // Show success message with question type breakdown
      const typeBreakdown = data.questions.reduce((acc: any, q: any) => {
        acc[q.type] = (acc[q.type] || 0) + 1
        return acc
      }, {})

      const breakdownText = Object.entries(typeBreakdown)
        .map(([type, count]) => `${count} ${type.replace("_", " ")}`)
        .join(", ")

      toast({
        title: "🎉 Quiz Generated Successfully!",
        description: `Created ${data.questions.length} questions: ${breakdownText}`,
      })
    } catch (error) {
      console.error("❌ Error generating quiz:", error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate quiz. Please try again.",
        variant: "destructive",
      })
    }
    setIsGenerating(false)
  }

  const generateFromImage = async () => {
    if (!selectedFile) {
      toast({
        title: "No Image Selected",
        description: "Please select an image file before generating questions.",
        variant: "destructive",
      })
      return
    }

    if (!subject.trim()) {
      toast({
        title: "Missing Subject",
        description: "Please enter a subject before generating questions.",
        variant: "destructive",
      })
      return
    }

    if (!includeMultipleChoice && !includeShortAnswer && !includeLongAnswer) {
      toast({
        title: "No Question Types Selected",
        description: "Please select at least one question type.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      console.log("🚀 Generating quiz questions from image...")

      const questionTypes = []
      if (includeMultipleChoice) questionTypes.push("multiple_choice")
      if (includeShortAnswer) questionTypes.push("short_answer")
      if (includeLongAnswer) questionTypes.push("long_answer")

      const formData = new FormData()
      formData.append("image", selectedFile)
      formData.append("subject", subject.trim())
      formData.append("difficulty", difficulty)
      formData.append("questionCount", questionCount.toString())
      formData.append("questionTypes", JSON.stringify(questionTypes))

      const response = await fetch("/api/generate-quiz-from-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API returned status ${response.status}: ${errorText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to generate quiz questions from image")
      }

      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions were generated from the image")
      }

      setGeneratedQuestions(data.questions)
      setTopic(`Quiz from ${selectedFile.name}`)

      // Show success message
      const typeBreakdown = data.questions.reduce((acc: any, q: any) => {
        acc[q.type] = (acc[q.type] || 0) + 1
        return acc
      }, {})

      const breakdownText = Object.entries(typeBreakdown)
        .map(([type, count]) => `${count} ${type.replace("_", " ")}`)
        .join(", ")

      toast({
        title: "🎉 Image Quiz Generated!",
        description: `Created ${data.questions.length} questions from your image: ${breakdownText}`,
      })
    } catch (error) {
      console.error("❌ Error generating quiz from image:", error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate quiz from image. Please try again.",
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

  const downloadPDF = async (includeAnswers: boolean) => {
    if (generatedQuestions.length === 0) {
      toast({
        title: "No Questions Available",
        description: "Please generate quiz questions first.",
        variant: "destructive",
      })
      return
    }

    try {
      // Import jsPDF dynamically
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF()

      // Set up the document
      doc.setFontSize(20)
      doc.text(topic || "Quiz Questions", 20, 30)

      doc.setFontSize(12)
      doc.text(`Subject: ${subject}`, 20, 45)
      doc.text(`Difficulty: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`, 20, 55)
      doc.text(`Total Questions: ${generatedQuestions.length}`, 20, 65)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 75)

      let yPosition = 90
      const pageHeight = doc.internal.pageSize.height
      const margin = 20

      generatedQuestions.forEach((question, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 60) {
          doc.addPage()
          yPosition = 30
        }

        // Question number and type
        doc.setFontSize(14)
        doc.setFont(undefined, "bold")
        const questionTypeLabel =
          question.type === "multiple_choice"
            ? "MCQ"
            : question.type === "short_answer"
              ? "Short Answer"
              : "Long Answer"
        doc.text(`${index + 1}. [${questionTypeLabel}] (${question.points} pts)`, margin, yPosition)
        yPosition += 10

        // Question text
        doc.setFont(undefined, "normal")
        doc.setFontSize(12)
        const questionLines = doc.splitTextToSize(question.question, 170)
        doc.text(questionLines, margin, yPosition)
        yPosition += questionLines.length * 7 + 5

        // Multiple choice options
        if (question.type === "multiple_choice" && question.options) {
          question.options.forEach((option, optIndex) => {
            const optionText = `${String.fromCharCode(65 + optIndex)}. ${option}`
            const optionLines = doc.splitTextToSize(optionText, 160)
            doc.text(optionLines, margin + 10, yPosition)
            yPosition += optionLines.length * 6
          })
          yPosition += 5
        }

        // Answer space for non-MCQ questions
        if (question.type !== "multiple_choice" && !includeAnswers) {
          const lines = question.type === "long_answer" ? 8 : 3
          for (let i = 0; i < lines; i++) {
            doc.line(margin, yPosition + i * 10, 190, yPosition + i * 10)
          }
          yPosition += lines * 10 + 5
        }

        // Include answers if requested
        if (includeAnswers) {
          doc.setFont(undefined, "bold")
          doc.text("Answer:", margin, yPosition)
          doc.setFont(undefined, "normal")
          yPosition += 7

          const answerLines = doc.splitTextToSize(question.correct_answer, 160)
          doc.text(answerLines, margin + 10, yPosition)
          yPosition += answerLines.length * 6

          if (question.explanation) {
            doc.setFont(undefined, "bold")
            doc.text("Explanation:", margin, yPosition + 5)
            doc.setFont(undefined, "normal")
            yPosition += 12

            const explanationLines = doc.splitTextToSize(question.explanation, 160)
            doc.text(explanationLines, margin + 10, yPosition)
            yPosition += explanationLines.length * 6
          }
        }

        yPosition += 15
      })

      // Save the PDF
      const filename = `${topic || "quiz"}_${includeAnswers ? "with_answers" : "questions_only"}.pdf`
      doc.save(filename)

      toast({
        title: "📄 PDF Downloaded!",
        description: `Quiz ${includeAnswers ? "with answers" : "questions only"} has been downloaded successfully.`,
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "PDF Generation Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  const saveQuiz = async () => {
    if (generatedQuestions.length === 0) {
      toast({
        title: "No Questions Available",
        description: "Please generate quiz questions first.",
        variant: "destructive",
      })
      return
    }

    const totalPoints = generatedQuestions.reduce((sum, q) => sum + q.points, 0)

    const quiz = {
      title: topic || "Generated Quiz",
      subject,
      difficulty,
      questions: generatedQuestions,
      totalPoints,
    }

    // Save to localStorage
    if (user?.uid) {
      const existingQuizzes = JSON.parse(localStorage.getItem(`quizzes_${user.uid}`) || "[]")
      const newQuiz = {
        id: `quiz_${Date.now()}`,
        ...quiz,
        createdAt: new Date(),
      }

      const updatedQuizzes = [...existingQuizzes, newQuiz]
      localStorage.setItem(`quizzes_${user.uid}`, JSON.stringify(updatedQuizzes))

      // Record quiz creation for gamification
      if (user?.uid) {
        await gamificationService.recordQuizCreated(user.uid)
      }
    }

    if (onAddQuiz) {
      onAddQuiz(quiz)
    }

    // Reset form
    setTopic("")
    setDescription("")
    setSubject("")
    setGeneratedQuestions([])
    setSelectedFile(null)

    toast({
      title: "🎉 Quiz Saved Successfully!",
      description: `Saved quiz with ${generatedQuestions.length} questions.`,
    })
  }

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "multiple_choice":
        return "🔘"
      case "short_answer":
        return "✏️"
      case "long_answer":
        return "📝"
      default:
        return "❓"
    }
  }

  return (
    <div className="space-y-12">
      {/* Main Generator Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 border-purple-200/50 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-rose-500/5"></div>

        <CardHeader className="relative pb-8">
          <CardTitle className="text-4xl flex items-center gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-5 rounded-3xl shadow-2xl group-hover:scale-105 transition-transform duration-300">
                <Brain className="h-12 w-12 text-white" />
              </div>
            </div>
            <div>
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent font-bold">
                Enhanced Quiz Generator
              </span>
              <div className="flex items-center gap-3 mt-3">
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 text-lg font-bold">
                  <Star className="h-5 w-5 mr-2" />
                  Mixed Questions
                </Badge>
                <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 text-lg font-bold">
                  <Camera className="h-5 w-5 mr-2" />
                  Image Upload
                </Badge>
                <Badge className="bg-gradient-to-r from-rose-500 to-orange-500 text-white px-4 py-2 text-lg font-bold">
                  <Zap className="h-5 w-5 mr-2" />
                  PDF Export
                </Badge>
              </div>
            </div>
          </CardTitle>
          <p className="text-purple-600/80 text-2xl mt-4 font-medium">
            Create comprehensive quizzes from text or images with multiple question types and PDF export
          </p>
        </CardHeader>

        <CardContent className="relative">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            {/* Tab Navigation */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-2 sm:p-4 shadow-2xl border border-purple-200/50">
              <TabsList className="grid w-full grid-cols-2 gap-2 sm:gap-4 bg-transparent relative">
                <TabsTrigger
                  value="text"
                  className="flex items-center gap-2 sm:gap-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-2xl py-3 sm:py-6 px-4 sm:px-8 transition-all duration-300 hover:scale-105 font-bold text-sm sm:text-lg"
                >
                  <FileText className="h-4 w-4 sm:h-6 sm:w-6" />
                  <span>Text Input</span>
                </TabsTrigger>
                <TabsTrigger
                  value="image"
                  className="flex items-center gap-2 sm:gap-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white rounded-2xl py-3 sm:py-6 px-4 sm:px-8 transition-all duration-300 hover:scale-105 font-bold text-sm sm:text-lg"
                >
                  <Upload className="h-4 w-4 sm:h-6 sm:w-6" />
                  <span>📸 Image Upload</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Common Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              <div className="space-y-2 sm:space-y-4">
                <label className="text-xl sm:text-2xl font-bold text-purple-700 flex items-center gap-2">
                  <span className="w-2 h-2 sm:w-3 sm:h-3 bg-pink-500 rounded-full"></span>
                  Subject *
                </label>
                <Input
                  placeholder="e.g., Biology, Mathematics, History"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="h-12 sm:h-16 text-base sm:text-xl border-purple-200 focus:border-pink-400 bg-white/90 rounded-2xl shadow-lg"
                />
              </div>
              <div className="space-y-2 sm:space-y-4">
                <label className="text-xl sm:text-2xl font-bold text-purple-700 flex items-center gap-2">
                  <span className="w-2 h-2 sm:w-3 sm:h-3 bg-pink-500 rounded-full"></span>
                  Difficulty Level
                </label>
                <Select value={difficulty} onValueChange={(value: "easy" | "medium" | "hard") => setDifficulty(value)}>
                  <SelectTrigger className="h-12 sm:h-16 text-base sm:text-xl border-purple-200 focus:border-pink-400 bg-white/90 rounded-2xl shadow-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm border border-purple-200/50 rounded-2xl">
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
              <div className="space-y-2 sm:space-y-4">
                <label className="text-xl sm:text-2xl font-bold text-purple-700 flex items-center gap-2">
                  <span className="w-2 h-2 sm:w-3 sm:h-3 bg-pink-500 rounded-full"></span>
                  Question Count
                </label>
                <Select
                  value={questionCount.toString()}
                  onValueChange={(value) => setQuestionCount(Number.parseInt(value))}
                >
                  <SelectTrigger className="h-12 sm:h-16 text-base sm:text-xl border-purple-200 focus:border-pink-400 bg-white/90 rounded-2xl shadow-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm border border-purple-200/50 rounded-2xl">
                    <SelectItem value="5" className="text-base sm:text-lg py-2 sm:py-3">
                      5 Questions
                    </SelectItem>
                    <SelectItem value="10" className="text-base sm:text-lg py-2 sm:py-3">
                      10 Questions
                    </SelectItem>
                    <SelectItem value="15" className="text-base sm:text-lg py-2 sm:py-3">
                      15 Questions
                    </SelectItem>
                    <SelectItem value="20" className="text-base sm:text-lg py-2 sm:py-3">
                      20 Questions
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Question Type Selection */}
            <div className="space-y-6">
              <label className="text-2xl font-bold text-purple-700 flex items-center gap-2">
                <span className="w-3 h-3 bg-pink-500 rounded-full"></span>
                Question Types * (Select at least one)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-4 p-6 bg-white/80 rounded-2xl border border-purple-200 shadow-lg">
                  <Checkbox
                    id="multiple-choice"
                    checked={includeMultipleChoice}
                    onCheckedChange={setIncludeMultipleChoice}
                    className="w-6 h-6"
                  />
                  <label htmlFor="multiple-choice" className="text-lg font-semibold text-purple-700 cursor-pointer">
                    🔘 Multiple Choice
                  </label>
                </div>
                <div className="flex items-center space-x-4 p-6 bg-white/80 rounded-2xl border border-purple-200 shadow-lg">
                  <Checkbox
                    id="short-answer"
                    checked={includeShortAnswer}
                    onCheckedChange={setIncludeShortAnswer}
                    className="w-6 h-6"
                  />
                  <label htmlFor="short-answer" className="text-lg font-semibold text-purple-700 cursor-pointer">
                    ✏️ Short Answer
                  </label>
                </div>
                <div className="flex items-center space-x-4 p-6 bg-white/80 rounded-2xl border border-purple-200 shadow-lg">
                  <Checkbox
                    id="long-answer"
                    checked={includeLongAnswer}
                    onCheckedChange={setIncludeLongAnswer}
                    className="w-6 h-6"
                  />
                  <label htmlFor="long-answer" className="text-lg font-semibold text-purple-700 cursor-pointer">
                    📝 Long Answer
                  </label>
                </div>
              </div>
            </div>

            <TabsContent value="text" className="space-y-8">
              <div className="space-y-6">
                <label className="text-2xl font-bold text-purple-700 flex items-center gap-2">
                  <span className="w-3 h-3 bg-pink-500 rounded-full"></span>
                  Quiz Topic *
                </label>
                <Input
                  placeholder="e.g., Cell Biology, Algebra, World War II"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="h-16 text-xl border-purple-200 focus:border-pink-400 bg-white/90 rounded-2xl shadow-lg"
                />
              </div>

              <div className="space-y-6">
                <label className="text-2xl font-bold text-purple-700 flex items-center gap-2">
                  <span className="w-3 h-3 bg-pink-500 rounded-full"></span>
                  Additional Details (Optional)
                </label>
                <Textarea
                  placeholder="Provide any specific topics, chapters, or areas you want to focus on..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="text-xl border-purple-200 focus:border-pink-400 bg-white/90 rounded-2xl shadow-lg"
                />
              </div>

              <Button
                onClick={generateFromText}
                disabled={isGenerating || !topic || !subject}
                className="w-full h-14 sm:h-20 text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 rounded-2xl"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-4 animate-spin" />
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-4" />
                    Generate AI Quiz
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="image" className="space-y-8">
              <div className="space-y-8">
                <div
                  className={`border-4 border-dashed rounded-3xl p-8 text-center transition-colors duration-300 ${
                    dragActive ? "border-pink-400 bg-pink-50/60" : "border-pink-300 hover:border-pink-400 bg-white/60"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {selectedFile ? (
                    <div className="flex flex-col items-center">
                      <div className="relative w-full max-w-md h-64 mb-6 bg-gray-100 rounded-xl overflow-hidden">
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
                      <div className="text-purple-700 font-bold text-xl mb-2">{selectedFile.name}</div>
                      <p className="text-purple-500 text-sm mb-4">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <>
                      <div className="relative inline-block mb-8">
                        <div className="absolute inset-0 bg-pink-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                        <Upload className="relative h-24 w-24 mx-auto text-purple-400" />
                      </div>
                      <p className="text-purple-700 font-bold text-3xl mb-6">📸 Upload Study Material</p>
                      <p className="text-purple-500 text-xl max-w-lg mx-auto leading-relaxed mb-6">
                        Drag and drop an image of your notes, textbook page, or study material to generate quiz
                        questions
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="quiz-file-upload"
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById("quiz-file-upload")?.click()}
                        className="border-purple-300 text-purple-600 hover:bg-purple-50"
                      >
                        <ImageIcon className="h-5 w-5 mr-2" />
                        Choose Image
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  onClick={generateFromImage}
                  disabled={isGenerating || !selectedFile || !subject}
                  className="w-full h-14 sm:h-20 text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 rounded-2xl"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-4 animate-spin" />
                      Analyzing Image...
                    </>
                  ) : (
                    <>
                      <Camera className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-4" />
                      Generate Quiz from Image
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Generated Questions Display */}
      {generatedQuestions.length > 0 && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>

          <CardHeader className="relative">
            <CardTitle className="text-3xl flex items-center justify-between">
              <span className="flex items-center gap-4 text-purple-700">
                <div className="p-4 bg-purple-500 rounded-2xl shadow-2xl">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                Generated Quiz Questions
              </span>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 px-4 py-3 text-xl font-bold">
                  {generatedQuestions.length} Questions
                </Badge>
                <Badge variant="secondary" className="bg-pink-100 text-pink-800 px-4 py-3 text-xl font-bold">
                  {generatedQuestions.reduce((sum, q) => sum + q.points, 0)} Points
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-8 relative">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                onClick={() => downloadPDF(false)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <Download className="h-5 w-5 mr-2" />📄 Download Questions Only
              </Button>
              <Button
                onClick={() => downloadPDF(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <FileDown className="h-5 w-5 mr-2" />📋 Download with Answers
              </Button>
              <Button
                onClick={saveQuiz}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="h-5 w-5 mr-2" />💾 Save Quiz
              </Button>
            </div>

            {/* Questions Display */}
            {generatedQuestions.map((question, index) => (
              <div
                key={question.id}
                className="p-8 bg-white/80 rounded-3xl border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="flex items-center gap-4 mb-6 flex-wrap">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 px-4 py-2 text-lg font-bold">
                    {getQuestionTypeIcon(question.type)} {question.type.replace("_", " ").toUpperCase()}
                  </Badge>
                  <Badge variant="secondary" className="bg-pink-100 text-pink-800 px-3 py-2 text-lg font-bold">
                    {question.points} pts
                  </Badge>
                  {question.difficulty && (
                    <Badge
                      variant="secondary"
                      className={`px-3 py-2 text-lg font-bold ${
                        question.difficulty === "easy"
                          ? "bg-green-100 text-green-800"
                          : question.difficulty === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {question.difficulty.toUpperCase()}
                    </Badge>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <span className="font-bold text-purple-800 text-xl">Q{index + 1}: </span>
                    <span className="text-purple-700 text-xl">{question.question}</span>
                  </div>

                  {question.type === "multiple_choice" && question.options && (
                    <div className="ml-8 space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="text-purple-600 text-lg">
                          <span className="font-semibold">{String.fromCharCode(65 + optIndex)}.</span> {option}
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <span className="font-bold text-green-800 text-xl">Answer: </span>
                    <span className="text-green-700 text-xl">{question.correct_answer}</span>
                  </div>

                  {question.explanation && (
                    <div>
                      <span className="font-bold text-blue-800 text-xl">Explanation: </span>
                      <span className="text-blue-700 text-xl">{question.explanation}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
