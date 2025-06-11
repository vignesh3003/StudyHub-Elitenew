"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  FileText,
  ImageIcon,
  BookOpen,
  Lightbulb,
  Upload,
  Loader2,
  Calendar,
  MessageSquare,
  Send,
  Copy,
  Trash2,
  CheckCircle,
  Search,
  PresentationIcon,
  Calculator,
  Brain,
  Languages,
  ArrowLeft,
  Target,
} from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

interface AIServicesHubProps {
  user: any
}

export default function AIServicesHub({ user }: AIServicesHubProps) {
  const [activeService, setActiveService] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [inputText, setInputText] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [result, setResult] = useState<string>("")
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: string; type: "user" | "ai"; content: string; timestamp: Date }>
  >([])
  const [chatInput, setChatInput] = useState("")
  const { isMobile } = useMobile()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const services = [
    {
      id: "chat",
      title: "AI Study Assistant",
      description: "Get instant help with your studies, explanations, and personalized advice",
      icon: MessageSquare,
      color: "bg-blue-500",
      status: "available",
    },
    {
      id: "study-guide",
      title: "Study Guide Generator",
      description: "Create comprehensive study guides from your topics and materials",
      icon: BookOpen,
      color: "bg-green-500",
      status: "available",
    },
    {
      id: "image-analysis",
      title: "Image Analysis",
      description: "Upload photos of textbooks, notes, or whiteboards for AI analysis",
      icon: ImageIcon,
      color: "bg-orange-500",
      status: "available",
    },
    {
      id: "flashcards",
      title: "Flashcard Generator",
      description: "Generate flashcards automatically from your study materials",
      icon: Brain,
      color: "bg-purple-500",
      status: "available",
    },
    {
      id: "essay-writer",
      title: "Essay Writer",
      description: "Generate well-structured essays on any topic with proper citations",
      icon: FileText,
      color: "bg-blue-500",
      status: "available",
    },
    {
      id: "math-solver",
      title: "Math Problem Solver",
      description: "Solve complex mathematical problems with step-by-step explanations",
      icon: Calculator,
      color: "bg-blue-500",
      status: "available",
    },
    {
      id: "language-tutor",
      title: "Language Tutor",
      description: "Practice conversations and learn new languages with AI",
      icon: Languages,
      color: "bg-purple-500",
      status: "coming-soon",
    },
    {
      id: "research-assistant",
      title: "Research Assistant",
      description: "Find credible sources and summarize research papers",
      icon: Search,
      color: "bg-blue-500",
      status: "available",
    },
    {
      id: "concept-explainer",
      title: "Concept Explainer",
      description: "Break down complex concepts into simple, understandable explanations",
      icon: Lightbulb,
      color: "bg-purple-500",
      status: "available",
    },
    {
      id: "study-planner",
      title: "Smart Study Planner",
      description: "Create personalized study schedules based on your goals and deadlines",
      icon: Calendar,
      color: "bg-blue-500",
      status: "available",
    },
    {
      id: "quiz-generator",
      title: "Quiz Generator",
      description: "Generate practice quizzes from your study materials",
      icon: CheckCircle,
      color: "bg-purple-500",
      status: "available",
    },
    {
      id: "presentation-maker",
      title: "Presentation Maker",
      description: "Create engaging presentations with AI-generated content and design",
      icon: PresentationIcon,
      color: "bg-purple-500",
      status: "coming-soon",
    },
  ]

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB.",
          variant: "destructive",
        })
        return
      }

      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const processRequest = async () => {
    if (!inputText.trim() && !selectedImage) {
      toast({
        title: "Input Required",
        description: "Please provide text input or select an image.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setResult("")

    try {
      let response
      const endpoint = "/api/ai-chat"

      if (selectedImage) {
        // Handle image upload
        const formData = new FormData()
        formData.append("image", selectedImage)
        formData.append("message", inputText || "Please analyze this image and provide study notes")
        formData.append(
          "context",
          JSON.stringify({
            tasks: 12,
            completedTasks: 8,
            studyHours: 25,
            subjects: ["Mathematics", "Physics", "Chemistry"],
          }),
        )

        response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        })
      } else {
        // Handle text request
        const requestBody = {
          message: inputText,
          context: {
            tasks: 12,
            completedTasks: 8,
            studyHours: 25,
            subjects: ["Mathematics", "Physics", "Chemistry"],
          },
          isStudyPlanRequest: activeService === "study-planner" || inputText.toLowerCase().includes("study plan"),
        }

        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        })
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()

      if (data.success) {
        setResult(data.response || "No response received")
        toast({
          title: "Success!",
          description: "AI analysis completed successfully.",
        })
      } else {
        throw new Error(data.error || "Unknown error occurred")
      }
    } catch (error: any) {
      console.error("AI Service Error:", error)
      setResult(`Error: ${error.message}`)
      toast({
        title: "Error",
        description: error.message || "Failed to process request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage = {
      id: `user-${Date.now()}`,
      type: "user" as const,
      content: chatInput,
      timestamp: new Date(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    const currentInput = chatInput
    setChatInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
          context: {
            tasks: 12,
            completedTasks: 8,
            studyHours: 25,
            subjects: ["Mathematics", "Physics", "Chemistry"],
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        const aiMessage = {
          id: `ai-${Date.now()}`,
          type: "ai" as const,
          content: data.response,
          timestamp: new Date(),
        }
        setChatMessages((prev) => [...prev, aiMessage])
      } else {
        throw new Error(data.error || "Unknown error")
      }
    } catch (error: any) {
      const errorMessage = {
        id: `error-${Date.now()}`,
        type: "ai" as const,
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const copyResult = () => {
    navigator.clipboard.writeText(result)
    toast({
      title: "Copied!",
      description: "Result copied to clipboard.",
    })
  }

  const clearResult = () => {
    setResult("")
    setInputText("")
    removeImage()
  }

  const clearChat = () => {
    setChatMessages([])
    setChatInput("")
  }

  // Render the service grid
  if (!activeService) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">AI Services Hub</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Powerful AI tools to enhance your learning experience</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const IconComponent = service.icon
            const isDisabled = service.status === "coming-soon"

            return (
              <Card
                key={service.id}
                className={`border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all duration-300 ${
                  isDisabled ? "opacity-70" : "cursor-pointer"
                }`}
                onClick={() => !isDisabled && setActiveService(service.id)}
              >
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 ${service.color} rounded-lg`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{service.title}</h3>
                        <div
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            isDisabled
                              ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          }`}
                        >
                          {isDisabled ? "Coming Soon" : "Available"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{service.description}</p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  const currentService = services.find((s) => s.id === activeService)!
  const IconComponent = currentService.icon

  // Render the active service interface
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="mb-6">
        <Button
          onClick={() => setActiveService(null)}
          variant="outline"
          className="mb-4 flex items-center gap-2"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Services
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <div className={`p-3 ${currentService.color} rounded-lg`}>
            <IconComponent className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold">{currentService.title}</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300">{currentService.description}</p>
      </div>

      {/* AI Study Assistant (Chat Interface) */}
      {activeService === "chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  <h3 className="font-medium">AI Study Chat</h3>
                </div>
                <Button onClick={clearChat} variant="ghost" size="sm" className="h-8 px-2">
                  <Trash2 className="h-4 w-4 mr-1" /> Clear
                </Button>
              </div>

              <div className="h-[500px] flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start a conversation
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md">
                        Ask me anything about your studies, homework, or learning goals!
                      </p>
                    </div>
                  ) : (
                    chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl ${
                            message.type === "user"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.type === "user" ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] p-3 rounded-2xl bg-gray-100 dark:bg-gray-800">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          <span className="text-gray-500 dark:text-gray-400">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask me anything about your studies..."
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendChatMessage()}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button
                      onClick={sendChatMessage}
                      disabled={isLoading || !chatInput.trim()}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <Card className="border border-gray-200 dark:border-gray-800">
              <div className="p-4 border-b">
                <h3 className="font-medium">Quick Actions</h3>
              </div>
              <div className="p-4 space-y-3">
                <Button
                  onClick={() => setChatInput("Create a study plan for my upcoming exams")}
                  variant="outline"
                  className="w-full justify-start text-left"
                  disabled={isLoading}
                >
                  <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Study Plan</span>
                </Button>
                <Button
                  onClick={() => setChatInput("Give me study tips for better focus")}
                  variant="outline"
                  className="w-full justify-start text-left"
                  disabled={isLoading}
                >
                  <Target className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Study Tips</span>
                </Button>
                <Button
                  onClick={() => setChatInput("Explain a difficult concept to me")}
                  variant="outline"
                  className="w-full justify-start text-left"
                  disabled={isLoading}
                >
                  <Lightbulb className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Explain Concept</span>
                </Button>
                <Button
                  onClick={() => setChatInput("Help me with my homework")}
                  variant="outline"
                  className="w-full justify-start text-left"
                  disabled={isLoading}
                >
                  <BookOpen className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Homework Help</span>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Math Problem Solver */}
      {activeService === "math-solver" && (
        <Card className="border border-gray-200 dark:border-gray-800 max-w-2xl mx-auto">
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Math Problem</label>
                <Textarea
                  placeholder="Enter your mathematical problem or equation..."
                  className="min-h-[100px]"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-3">Or Upload an Image</p>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />

                  {imagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Math problem"
                        className="max-h-48 mx-auto rounded-lg border"
                      />
                      <Button onClick={removeImage} variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Upload an image of your math problem</p>
                      <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="mx-auto">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Image
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={processRequest}
                disabled={isLoading || (!inputText.trim() && !selectedImage)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Solving Problem...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" /> Solve Problem
                  </>
                )}
              </Button>
            </div>

            {result && (
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Solution</h3>
                  <Button onClick={copyResult} variant="ghost" size="sm">
                    <Copy className="h-4 w-4 mr-1" /> Copy
                  </Button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">{result}</pre>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Concept Explainer */}
      {activeService === "concept-explainer" && (
        <Card className="border border-gray-200 dark:border-gray-800 max-w-2xl mx-auto">
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject Area</label>
                <Input placeholder="Enter the subject area (e.g., Physics, Economics)..." />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Concept to Explain</label>
                <Textarea
                  placeholder="Enter a specific concept you want explained..."
                  className="min-h-[100px]"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Explanation Level</label>
                <Select defaultValue="intermediate">
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={processRequest}
                disabled={isLoading || !inputText.trim()}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating Explanation...
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-4 w-4 mr-2" /> Explain Concept
                  </>
                )}
              </Button>
            </div>

            {result && (
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Explanation</h3>
                  <Button onClick={copyResult} variant="ghost" size="sm">
                    <Copy className="h-4 w-4 mr-1" /> Copy
                  </Button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                  <div className="whitespace-pre-wrap text-sm">{result}</div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Research Assistant */}
      {activeService === "research-assistant" && (
        <Card className="border border-gray-200 dark:border-gray-800 max-w-2xl mx-auto">
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Research Subject</label>
                <Input placeholder="Enter the general subject area..." />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Specific Research Topic</label>
                <Input placeholder="Enter your specific research topic..." />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Research Purpose</label>
                <Select defaultValue="essay">
                  <SelectTrigger>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="essay">Essay or Paper</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                    <SelectItem value="thesis">Thesis or Dissertation</SelectItem>
                    <SelectItem value="general">General Knowledge</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={processRequest}
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Researching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" /> Start Research
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Quiz Generator */}
      {activeService === "quiz-generator" && (
        <Card className="border border-gray-200 dark:border-gray-800 max-w-2xl mx-auto">
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <Input placeholder="Enter the subject (e.g., Biology, History)..." />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Specific Topic</label>
                <Input placeholder="Enter the specific topic for your quiz..." />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Number of Questions</label>
                <Select defaultValue="10">
                  <SelectTrigger>
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 questions</SelectItem>
                    <SelectItem value="10">10 questions</SelectItem>
                    <SelectItem value="15">15 questions</SelectItem>
                    <SelectItem value="20">20 questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={processRequest}
                disabled={isLoading}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating Quiz...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" /> Generate Quiz
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Smart Study Planner */}
      {activeService === "study-planner" && (
        <Card className="border border-gray-200 dark:border-gray-800 max-w-2xl mx-auto">
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subjects to Study</label>
                <Input placeholder="e.g., Mathematics, Biology, History" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Specific Topics (Optional)</label>
                <Textarea
                  placeholder="e.g., Calculus: Derivatives and Integrals, Biology: Cell Structure, History: World War II"
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Study Deadline</label>
                <Input type="date" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Study Goal</label>
                <Input placeholder="e.g., Prepare for final exam, Master the basics, etc." />
              </div>

              <Button
                onClick={processRequest}
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating Plan...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" /> Create Study Plan
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Essay Writer */}
      {activeService === "essay-writer" && (
        <Card className="border border-gray-200 dark:border-gray-800 max-w-2xl mx-auto">
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Essay Topic</label>
                <Input placeholder="Enter your essay topic or question..." />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Word Count</label>
                <Select defaultValue="500">
                  <SelectTrigger>
                    <SelectValue placeholder="Select word count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="300">300 words</SelectItem>
                    <SelectItem value="500">500 words</SelectItem>
                    <SelectItem value="750">750 words</SelectItem>
                    <SelectItem value="1000">1000 words</SelectItem>
                    <SelectItem value="1500">1500 words</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={processRequest}
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Writing Essay...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" /> Generate Essay
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Default interface for other services */}
      {![
        "chat",
        "math-solver",
        "concept-explainer",
        "research-assistant",
        "quiz-generator",
        "study-planner",
        "essay-writer",
      ].includes(activeService) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-gray-200 dark:border-gray-800">
            <div className="p-6 space-y-4">
              <h3 className="font-medium">Input</h3>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Enter your ${activeService.replace("-", " ")} request...`}
                className="min-h-[200px]"
              />
              {["image-analysis", "flashcards"].includes(activeService) && (
                <div>
                  <p className="text-sm font-medium mb-2">Upload Image (optional)</p>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    {imagePreview ? (
                      <div className="space-y-2">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Selected for analysis"
                          className="max-h-48 mx-auto rounded-lg border"
                        />
                        <Button onClick={removeImage} variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="mx-auto">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Image
                      </Button>
                    )}
                  </div>
                </div>
              )}
              <Button
                onClick={processRequest}
                disabled={isLoading || (!inputText.trim() && !selectedImage)}
                className={`w-full bg-${currentService.color.replace("bg-", "")} hover:bg-${currentService.color.replace("bg-", "")}/90 text-white`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <IconComponent className="h-4 w-4 mr-2" /> Generate {currentService.title}
                  </>
                )}
              </Button>
            </div>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Result</h3>
                {result && (
                  <div className="flex gap-2">
                    <Button onClick={copyResult} variant="ghost" size="sm">
                      <Copy className="h-4 w-4 mr-1" /> Copy
                    </Button>
                    <Button onClick={clearResult} variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4 mr-1" /> Clear
                    </Button>
                  </div>
                )}
              </div>
              {result ? (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 min-h-[300px] max-h-[500px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">{result}</pre>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 min-h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">No result yet</h3>
                    <p className="text-gray-400 dark:text-gray-500 max-w-md">
                      Your AI-generated content will appear here after processing.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
