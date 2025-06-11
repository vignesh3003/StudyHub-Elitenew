"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  MessageSquare,
  Send,
  ImageIcon,
  GraduationCap,
  Loader2,
  Copy,
  Trash2,
  User,
  Bot,
  Camera,
  X,
  Calendar,
  Brain,
  Target,
  BookOpen,
} from "lucide-react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { gamificationService } from "@/lib/gamification-service"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  hasImage?: boolean
}

interface AIStudyAssistantProps {
  tasks: any[]
  studyHours: number
  grades: any[]
  setTasks: (tasks: any[]) => void
}

export default function AIStudyAssistant({ tasks, studyHours, grades, setTasks }: AIStudyAssistantProps) {
  const [user] = useAuthState(auth)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [subject, setSubject] = useState("")
  const [course, setCourse] = useState("")
  const [studyLevel, setStudyLevel] = useState("")
  const [examDate, setExamDate] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Add welcome message when component mounts
  useEffect(() => {
    const welcomeMessage: Message = {
      id: `ai-welcome`,
      type: "ai",
      content: `🎓 **Welcome to your AI Study Assistant!**

I'm here to help you succeed in your studies. Here are some ways I can assist you:

📚 **Study Support**
• Answer questions about any subject
• Explain difficult concepts in simple terms
• Help with homework and assignments
• Provide study strategies and tips

📋 **Study Planning**
• Create personalized study schedules
• Break down large projects into manageable tasks
• Set realistic goals and deadlines
• Track your progress

🖼️ **Image Analysis**
• Analyze photos of textbooks, notes, or whiteboards
• Extract key information from images
• Create study notes from visual content
• Explain diagrams and charts

💡 **Smart Features**
• Generate flashcards from your content
• Suggest study techniques based on your learning style
• Provide motivation and encouragement
• Help with exam preparation

**To get started:**
1. Fill in your course and subject information in the sidebar
2. Ask me any study-related question
3. Upload an image of your study material
4. Request a personalized study plan

What would you like to work on today?`,
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])
  }, [])

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

  const sendMessage = async () => {
    if (!inputMessage.trim() && !selectedImage) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
      hasImage: !!selectedImage,
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputMessage
    const currentImage = selectedImage

    setInputMessage("")
    setSelectedImage(null)
    setImagePreview(null)
    setIsLoading(true)

    try {
      let response
      const context = {
        tasks: tasks.length,
        completedTasks: tasks.filter((t) => t.completed).length,
        studyHours: studyHours,
        subjects: subject ? [subject] : ["General"],
        course: course || "General Studies",
        studyLevel: studyLevel || "Intermediate",
        examDate: examDate || "",
        grades: grades,
        userName: user?.displayName || user?.email || "Student",
      }

      if (currentImage) {
        const formData = new FormData()
        formData.append("image", currentImage)
        formData.append("message", currentInput || "Please analyze this image and provide study notes")
        formData.append("context", JSON.stringify(context))

        response = await fetch("/api/ai-chat", {
          method: "POST",
          body: formData,
        })
      } else {
        const requestBody = {
          message: currentInput,
          context: context,
          isStudyPlanRequest:
            currentInput.toLowerCase().includes("study plan") || currentInput.toLowerCase().includes("plan"),
        }

        response = await fetch("/api/ai-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        })
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          type: "ai",
          content: data.response,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiMessage])

        // Record AI feature usage for gamification
        if (user?.uid) {
          await gamificationService.recordAIFeatureUsed(user.uid, "study-assistant")
        }
      } else {
        throw new Error(data.error || "Unknown error occurred")
      }
    } catch (error: any) {
      console.error("AI Chat Error:", error)
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: "ai",
        content: `Sorry, I encountered an error: ${error.message}. Please try again.

**In the meantime, here are some study tips:**

📚 **Effective Study Techniques**
• **Pomodoro Technique**: Study for 25 minutes, then take a 5-minute break
• **Active Recall**: Test yourself without looking at notes
• **Spaced Repetition**: Review material at increasing intervals
• **Teach Others**: Explain concepts to friends or family

🎯 **Stay Organized**
• Break large tasks into smaller, manageable chunks
• Use a study schedule and stick to it
• Prioritize based on deadlines and difficulty
• Keep your study space clean and organized

Please try asking your question again in a moment!`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])

      toast({
        title: "Connection Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Copied!",
      description: "Message copied to clipboard.",
    })
  }

  const clearChat = () => {
    // Keep the welcome message
    const welcomeMessage = messages.find((m) => m.id === "ai-welcome")
    if (welcomeMessage) {
      setMessages([welcomeMessage])
    } else {
      setMessages([])
    }
    setInputMessage("")
    removeImage()
  }

  const quickActions = [
    {
      label: "Create Study Plan",
      message: `Create a detailed study plan for my ${course || "[course]"} in ${subject || "[subject]"} at ${studyLevel || "intermediate"} level. ${examDate ? `My exam is on ${examDate}.` : ""} I can study about ${studyLevel === "beginner" ? "1-2" : studyLevel === "intermediate" ? "2-3" : "3-4"} hours per day.`,
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      label: "Explain Concept",
      message: `Explain the key concepts of ${subject || "[subject]"} at ${studyLevel || "intermediate"} level. Focus on the most important principles and provide examples.`,
      icon: <Brain className="h-4 w-4" />,
    },
    {
      label: "Study Tips",
      message: `Give me effective study techniques for ${subject || "[subject]"} at ${studyLevel || "intermediate"} level. I want to improve my retention and understanding.`,
      icon: <Target className="h-4 w-4" />,
    },
    {
      label: "Practice Questions",
      message: `Generate practice questions for ${course || "[course]"} in ${subject || "[subject]"} at ${studyLevel || "intermediate"} level. Include answers and explanations.`,
      icon: <BookOpen className="h-4 w-4" />,
    },
  ]

  const renderMessageContent = (content: string) => {
    return content.split("\n").map((line, index) => {
      if (line.startsWith("🎓 **") && line.endsWith("**")) {
        return (
          <h2 key={index} className="text-xl font-bold text-blue-600 mb-3 mt-4">
            {line.replace(/\*\*/g, "")}
          </h2>
        )
      }
      if (line.startsWith("📚 **") || line.startsWith("📋 **") || line.startsWith("🖼️ **") || line.startsWith("💡 **")) {
        return (
          <h3 key={index} className="text-lg font-semibold text-gray-700 mb-2 mt-4">
            {line.replace(/\*\*/g, "")}
          </h3>
        )
      }
      if (line.startsWith("• ")) {
        return (
          <li key={index} className="text-gray-600 mb-1 ml-4 list-disc">
            {line.substring(2)}
          </li>
        )
      }
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <p key={index} className="font-semibold text-gray-700 mb-2 mt-3">
            {line.replace(/\*\*/g, "")}
          </p>
        )
      }
      if (line.trim() === "") {
        return <br key={index} />
      }
      return (
        <p key={index} className="text-gray-600 mb-2 leading-relaxed">
          {line}
        </p>
      )
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Study Assistant
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Your intelligent study companion powered by advanced AI. Get personalized help, study plans, and instant
            answers to boost your academic success.
          </p>
        </div>

        {/* Study Context Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">Tasks</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {tasks.filter((t) => t.completed).length}/{tasks.length}
              </div>
              <div className="text-sm text-gray-500">Completed</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-green-200/50 dark:border-green-700/50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">Study Hours</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{studyHours}</div>
              <div className="text-sm text-gray-500">This week</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <GraduationCap className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">Subjects</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{subject ? 1 : 0}</div>
              <div className="text-sm text-gray-500">Active</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-orange-200/50 dark:border-orange-700/50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="h-5 w-5 text-orange-600" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">Avg Grade</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {grades.length > 0 ? Math.round(grades.reduce((acc, g) => acc + (g.grade || 0), 0) / grades.length) : 0}
                %
              </div>
              <div className="text-sm text-gray-500">Overall</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Study Context Sidebar */}
          <Card className="lg:col-span-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                Study Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Course</label>
                <Input
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g., Computer Science"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Subject</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Mathematics"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Level</label>
                <select
                  value={studyLevel}
                  onChange={(e) => setStudyLevel(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900"
                >
                  <option value="">Select level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Exam Date (optional)
                </label>
                <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="text-sm" />
              </div>

              {/* Quick Actions */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      onClick={() => setInputMessage(action.message)}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs"
                      disabled={isLoading}
                    >
                      {action.icon}
                      <span className="ml-2">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card className="lg:col-span-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <CardHeader className="border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  AI Chat Assistant
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                    Online
                  </Badge>
                </CardTitle>
                <div className="flex gap-2">
                  <Button onClick={clearChat} variant="outline" size="sm" className="text-gray-600">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Messages Area */}
              <div className="h-[500px] overflow-y-auto p-6 space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.type === "ai" && (
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] ${
                        message.type === "user"
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-br-md"
                          : "bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-md border border-gray-200 dark:border-gray-700"
                      } p-4 shadow-lg`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {message.type === "user" ? "You" : "AI Assistant"}
                          </span>
                          {message.hasImage && (
                            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                              <ImageIcon className="h-3 w-3 mr-1" />
                              Image
                            </Badge>
                          )}
                        </div>
                        <Button
                          onClick={() => copyMessage(message.content)}
                          variant="ghost"
                          size="sm"
                          className={`h-6 w-6 p-0 ${
                            message.type === "user"
                              ? "text-white/70 hover:text-white hover:bg-white/20"
                              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className={message.type === "user" ? "text-white" : ""}>
                        {message.type === "ai" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            {renderMessageContent(message.content)}
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{message.content}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/20 dark:border-gray-600">
                        <span
                          className={`text-xs ${
                            message.type === "user" ? "text-white/70" : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    {message.type === "user" && (
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-4 justify-start">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl rounded-bl-md border border-gray-200 dark:border-gray-700 p-4 shadow-lg">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        <span className="text-gray-600 dark:text-gray-400">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-6">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Image selected for analysis
                      </span>
                      <Button onClick={removeImage} variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Selected for analysis"
                      className="max-h-32 rounded-lg border border-blue-200 dark:border-blue-700"
                    />
                  </div>
                )}

                {/* Input Controls */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                      placeholder={
                        selectedImage
                          ? "Ask me anything about this image or leave blank for general analysis..."
                          : `Ask me anything about ${subject || "your studies"}, request a study plan, or upload an image...`
                      }
                      className="min-h-[60px] resize-none border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      size="icon"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                      disabled={isLoading}
                    >
                      <Camera className="h-5 w-5" />
                    </Button>
                    <Button
                      onClick={sendMessage}
                      disabled={isLoading || (!inputMessage.trim() && !selectedImage)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                    >
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
