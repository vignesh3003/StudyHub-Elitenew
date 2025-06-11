"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, Brain, Copy, Sparkles, Clock, Target, RefreshCw, CheckCircle, X, Plus } from "lucide-react"

interface PDFSummarizerProps {
  user: any
}

interface SummaryResult {
  id: string
  fileName: string
  summary: string
  keyPoints: string[]
  concepts: string[]
  questions: string[]
  createdAt: Date
  wordCount: number
  readingTime: number
}

interface SmartRecapItem {
  id: string
  title: string
  content: string
  difficulty: "easy" | "medium" | "hard"
  lastReviewed: Date
  nextReview: Date
  reviewCount: number
  mastery: number
}

export default function PDFSummarizer({ user }: PDFSummarizerProps) {
  const [activeTab, setActiveTab] = useState("summarizer")
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [summaries, setSummaries] = useState<SummaryResult[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [summaryLength, setSummaryLength] = useState("medium")
  const [focusArea, setFocusArea] = useState("general")
  const [smartRecapItems, setSmartRecapItems] = useState<SmartRecapItem[]>([])
  const [isGeneratingRecap, setIsGeneratingRecap] = useState(false)
  const [recapSettings, setRecapSettings] = useState({
    includeFlashcards: true,
    includeConcepts: true,
    includeQuestions: true,
    difficulty: "mixed" as "easy" | "medium" | "hard" | "mixed",
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF file.",
          variant: "destructive",
        })
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast({
          title: "File Too Large",
          description: "Please upload a PDF file smaller than 10MB.",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
    }
  }

  // Process PDF and generate summary
  const processPDF = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a PDF file to summarize.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setUploadProgress(0)

    try {
      // Simulate file upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(uploadInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Simulate API call to process PDF
      await new Promise((resolve) => setTimeout(resolve, 3000))

      setUploadProgress(100)

      // Mock summary result
      const mockSummary: SummaryResult = {
        id: `summary_${Date.now()}`,
        fileName: selectedFile.name,
        summary: `This document covers key concepts in ${focusArea === "general" ? "various topics" : focusArea}. The main themes include theoretical foundations, practical applications, and current research trends. The content is structured to provide both comprehensive coverage and detailed analysis of the subject matter.

Key findings suggest that understanding these concepts is crucial for academic success. The document emphasizes the importance of practical application alongside theoretical knowledge. Several case studies are presented to illustrate real-world applications.

The conclusion highlights the interconnected nature of the topics and suggests areas for further study. This material serves as an excellent foundation for deeper exploration of the subject.`,
        keyPoints: [
          "Theoretical foundations are essential for understanding",
          "Practical applications demonstrate real-world relevance",
          "Current research trends shape future developments",
          "Case studies provide concrete examples",
          "Interconnected concepts require holistic understanding",
        ],
        concepts: [
          "Fundamental Principles",
          "Applied Methodology",
          "Research Framework",
          "Case Study Analysis",
          "Future Implications",
        ],
        questions: [
          "What are the key theoretical foundations discussed?",
          "How do practical applications relate to theory?",
          "What current research trends are most significant?",
          "How do the case studies support the main arguments?",
          "What areas warrant further investigation?",
        ],
        createdAt: new Date(),
        wordCount: 1250,
        readingTime: 5,
      }

      setSummaries((prev) => [mockSummary, ...prev])

      toast({
        title: "PDF Summarized Successfully",
        description: `Generated summary for "${selectedFile.name}"`,
      })

      setSelectedFile(null)
      setUploadProgress(0)
    } catch (error) {
      console.error("Error processing PDF:", error)
      toast({
        title: "Processing Failed",
        description: "Failed to process the PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Generate smart recap
  const generateSmartRecap = async () => {
    setIsGeneratingRecap(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock smart recap items based on user's study history
      const mockRecapItems: SmartRecapItem[] = [
        {
          id: "recap_1",
          title: "Quadratic Equations",
          content:
            "Review the standard form ax² + bx + c = 0 and solution methods including factoring, completing the square, and the quadratic formula.",
          difficulty: "medium",
          lastReviewed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          nextReview: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          reviewCount: 3,
          mastery: 75,
        },
        {
          id: "recap_2",
          title: "Photosynthesis Process",
          content:
            "The process by which plants convert light energy into chemical energy, involving chlorophyll, carbon dioxide, and water to produce glucose and oxygen.",
          difficulty: "easy",
          lastReviewed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          nextReview: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          reviewCount: 5,
          mastery: 90,
        },
        {
          id: "recap_3",
          title: "Newton's Laws of Motion",
          content:
            "Three fundamental laws describing the relationship between forces acting on a body and its motion: inertia, F=ma, and action-reaction.",
          difficulty: "hard",
          lastReviewed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          nextReview: new Date(),
          reviewCount: 2,
          mastery: 60,
        },
        {
          id: "recap_4",
          title: "World War II Timeline",
          content:
            "Key events from 1939-1945 including major battles, political changes, and the impact on global society and economics.",
          difficulty: "medium",
          lastReviewed: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          nextReview: new Date(),
          reviewCount: 1,
          mastery: 45,
        },
      ]

      setSmartRecapItems(mockRecapItems)

      toast({
        title: "Smart Recap Generated",
        description: "Your personalized review session is ready!",
      })
    } catch (error) {
      console.error("Error generating smart recap:", error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate smart recap. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingRecap(false)
    }
  }

  // Copy summary to clipboard
  const copySummary = (summary: string) => {
    navigator.clipboard.writeText(summary)
    toast({
      title: "Copied to Clipboard",
      description: "Summary has been copied to your clipboard.",
    })
  }

  // Delete summary
  const deleteSummary = (id: string) => {
    setSummaries((prev) => prev.filter((s) => s.id !== id))
    toast({
      title: "Summary Deleted",
      description: "The summary has been removed.",
    })
  }

  // Mark recap item as reviewed
  const markAsReviewed = (id: string) => {
    setSmartRecapItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              lastReviewed: new Date(),
              nextReview: new Date(
                Date.now() + (item.mastery > 80 ? 7 : item.mastery > 60 ? 3 : 1) * 24 * 60 * 60 * 1000,
              ),
              reviewCount: item.reviewCount + 1,
              mastery: Math.min(100, item.mastery + 10),
            }
          : item,
      ),
    )

    toast({
      title: "Marked as Reviewed",
      description: "Your progress has been updated!",
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Study Enhancements
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Advanced AI tools for summarization and personalized review
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid grid-cols-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-2xl p-1">
          <TabsTrigger
            value="summarizer"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl py-3 px-4 font-medium"
          >
            PDF Summarizer
          </TabsTrigger>
          <TabsTrigger
            value="smart-recap"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl py-3 px-4 font-medium"
          >
            Smart Recap
          </TabsTrigger>
          <TabsTrigger
            value="study-plans"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl py-3 px-4 font-medium"
          >
            Study Plans
          </TabsTrigger>
        </TabsList>

        {/* PDF Summarizer Tab */}
        <TabsContent value="summarizer" className="space-y-8 animate-in fade-in-50 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Section */}
            <Card className="lg:col-span-1 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200/50 dark:border-blue-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Upload className="h-5 w-5 text-blue-600" />
                  Upload PDF
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileText className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {selectedFile ? selectedFile.name : "Click to upload PDF"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Max file size: 10MB</p>
                  <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                </div>

                {selectedFile && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-200 truncate">{selectedFile.name}</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setSelectedFile(null)}
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Settings */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                          Summary Length
                        </label>
                        <select
                          value={summaryLength}
                          onChange={(e) => setSummaryLength(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                          <option value="short">Short (1-2 paragraphs)</option>
                          <option value="medium">Medium (3-4 paragraphs)</option>
                          <option value="long">Long (5+ paragraphs)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                          Focus Area
                        </label>
                        <select
                          value={focusArea}
                          onChange={(e) => setFocusArea(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                          <option value="general">General Summary</option>
                          <option value="key-concepts">Key Concepts</option>
                          <option value="methodology">Methodology</option>
                          <option value="conclusions">Conclusions</option>
                          <option value="examples">Examples & Cases</option>
                        </select>
                      </div>
                    </div>

                    {isProcessing && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Processing PDF...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                      </div>
                    )}

                    <Button
                      onClick={processPDF}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Generate Summary
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summaries List */}
            <div className="lg:col-span-2 space-y-6">
              {summaries.length === 0 ? (
                <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No Summaries Yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                      Upload a PDF document to generate an AI-powered summary with key points and study questions.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                summaries.map((summary) => (
                  <Card
                    key={summary.id}
                    className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">
                            {summary.fileName}
                          </CardTitle>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {summary.readingTime} min read
                            </span>
                            <span>{summary.wordCount} words</span>
                            <span>{summary.createdAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button onClick={() => copySummary(summary.summary)} variant="outline" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => deleteSummary(summary.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Summary Text */}
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Summary</h4>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{summary.summary}</p>
                      </div>

                      {/* Key Points */}
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Key Points</h4>
                        <ul className="space-y-2">
                          {summary.keyPoints.map((point, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600 dark:text-gray-400">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Concepts */}
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Key Concepts</h4>
                        <div className="flex flex-wrap gap-2">
                          {summary.concepts.map((concept, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                            >
                              {concept}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Study Questions */}
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Study Questions</h4>
                        <div className="space-y-2">
                          {summary.questions.map((question, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
                            >
                              <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">
                                Q{index + 1}:
                              </span>
                              <span className="text-gray-700 dark:text-gray-300">{question}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* Smart Recap Tab */}
        <TabsContent value="smart-recap" className="space-y-8 animate-in fade-in-50 duration-500">
          <div className="space-y-6">
            {/* Recap Settings */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50 dark:border-green-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-green-600" />
                  Smart Recap Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="flashcards"
                      checked={recapSettings.includeFlashcards}
                      onChange={(e) => setRecapSettings({ ...recapSettings, includeFlashcards: e.target.checked })}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="flashcards" className="text-sm text-gray-700 dark:text-gray-300">
                      Include Flashcards
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="concepts"
                      checked={recapSettings.includeConcepts}
                      onChange={(e) => setRecapSettings({ ...recapSettings, includeConcepts: e.target.checked })}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="concepts" className="text-sm text-gray-700 dark:text-gray-300">
                      Include Concepts
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="questions"
                      checked={recapSettings.includeQuestions}
                      onChange={(e) => setRecapSettings({ ...recapSettings, includeQuestions: e.target.checked })}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="questions" className="text-sm text-gray-700 dark:text-gray-300">
                      Include Questions
                    </label>
                  </div>
                  <div>
                    <select
                      value={recapSettings.difficulty}
                      onChange={(e) =>
                        setRecapSettings({
                          ...recapSettings,
                          difficulty: e.target.value as "easy" | "medium" | "hard" | "mixed",
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                    >
                      <option value="mixed">Mixed Difficulty</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                <Button
                  onClick={generateSmartRecap}
                  disabled={isGeneratingRecap}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  {isGeneratingRecap ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating Recap...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Generate Smart Recap
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Recap Items */}
            {smartRecapItems.length === 0 ? (
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Brain className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No Recap Generated</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                    Generate a smart recap to review your study materials using spaced repetition algorithms.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {smartRecapItems.map((item) => (
                  <Card
                    key={item.id}
                    className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-200">
                          {item.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`${
                              item.difficulty === "easy"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : item.difficulty === "medium"
                                  ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                  : "bg-red-100 text-red-700 border-red-200"
                            }`}
                          >
                            {item.difficulty}
                          </Badge>
                          {new Date() >= item.nextReview && (
                            <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                              Due
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.content}</p>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Mastery</span>
                          <span className="font-medium">{item.mastery}%</span>
                        </div>
                        <Progress value={item.mastery} className="h-2" />
                      </div>

                      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                        <span>Reviewed {item.reviewCount} times</span>
                        <span>Next: {item.nextReview.toLocaleDateString()}</span>
                      </div>

                      <Button
                        onClick={() => markAsReviewed(item.id)}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Reviewed
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Study Plans Tab */}
        <TabsContent value="study-plans" className="space-y-8 animate-in fade-in-50 duration-500">
          <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">AI Study Plans</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                Coming soon! AI-generated personalized study plans based on your learning patterns and upcoming
                deadlines.
              </p>
              <Button disabled className="bg-gray-300 text-gray-500 cursor-not-allowed">
                <Plus className="h-4 w-4 mr-2" />
                Generate Study Plan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
