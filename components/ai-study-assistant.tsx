"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Send, Loader2, Upload, ImageIcon, X, Bot, User, Sparkles, Brain } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import ReactMarkdown from "react-markdown"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  hasImage?: boolean
}

interface AIStudyAssistantProps {
  tasks: { id: string; name: string; completed: boolean; subject: string }[]
  studyHours: number
  grades: { subject: string; grade: number }[]
  setTasks: React.Dispatch<React.SetStateAction<{ id: string; name: string; completed: boolean; subject: string }[]>>
}

const AIStudyAssistant: React.FC<AIStudyAssistantProps> = ({ tasks, studyHours, grades, setTasks }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content:
        "👋 **Welcome to your AI Study Assistant!**\n\nI'm here to help you with:\n• 📚 Analyzing study materials from photos\n• 💡 Answering study questions\n• 🎯 Creating personalized study plans\n• 📝 Generating study notes\n\nHow can I help you study better today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return

    setIsLoading(true)

    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newUserMessage])
    setInput("")

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          context: {
            tasks: tasks.length,
            completedTasks: tasks.filter((t) => t.completed).length,
            studyHours: studyHours,
            subjects: [...new Set(tasks.map((t) => t.subject))],
            grades: grades,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          role: "assistant",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiMessage])
      } else {
        throw new Error(data.error || "Failed to get AI response")
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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

  const sendMessageWithFile = async () => {
    if (!selectedFile && !input.trim()) return

    setIsUploading(true)
    const userMessage = input.trim() || "Please analyze this image and provide study notes"

    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: userMessage,
      role: "user",
      timestamp: new Date(),
      hasImage: !!selectedFile,
    }

    setMessages((prev) => [...prev, newUserMessage])
    setInput("")

    try {
      const formData = new FormData()
      formData.append("message", userMessage)
      formData.append(
        "context",
        JSON.stringify({
          tasks: tasks.length,
          completedTasks: tasks.filter((t) => t.completed).length,
          studyHours: studyHours,
          subjects: [...new Set(tasks.map((t) => t.subject))],
          grades: grades,
        }),
      )

      if (selectedFile) {
        formData.append("image", selectedFile)
      }

      const response = await fetch("/api/ai-chat", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          role: "assistant",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiMessage])

        if (selectedFile) {
          toast({
            title: "✨ Image analyzed successfully!",
            description: "I've generated structured study notes from your uploaded image.",
          })
        }
      } else {
        throw new Error(data.error || "Failed to get AI response")
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setSelectedFile(null)
    }
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI Study Assistant
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Your intelligent study companion</p>
          </div>
          <div className="ml-auto">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700 dark:text-green-400">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            {message.role === "assistant" && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              </div>
            )}

            <Card
              className={`max-w-[80%] ${
                message.role === "user"
                  ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0"
                  : "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50"
              }`}
            >
              <CardContent className="p-4">
                {message.hasImage && (
                  <div className="mb-2 flex items-center gap-2 text-sm opacity-75">
                    <ImageIcon className="h-4 w-4" />
                    <span>Image uploaded</span>
                  </div>
                )}

                {message.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        h2: ({ children }) => (
                          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                            {children}
                          </h2>
                        ),
                        ul: ({ children }) => <ul className="space-y-1 ml-4">{children}</ul>,
                        li: ({ children }) => (
                          <li className="text-slate-700 dark:text-slate-300 flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{children}</span>
                          </li>
                        ),
                        strong: ({ children }) => (
                          <strong className="text-slate-800 dark:text-slate-200 font-semibold">{children}</strong>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}

                <div
                  className={`text-xs mt-2 ${message.role === "user" ? "text-blue-100" : "text-slate-500 dark:text-slate-400"}`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </CardContent>
            </Card>

            {message.role === "user" && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
            )}
          </div>
        ))}

        {(isLoading || isUploading) && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
            </div>
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {isUploading ? "Analyzing your image..." : "Thinking..."}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input Section */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-t border-slate-200/50 dark:border-slate-700/50 p-6">
        {/* File Upload Area */}
        {!selectedFile && (
          <div
            className={`mb-4 border-2 border-dashed rounded-2xl p-6 transition-all duration-300 ${
              dragActive
                ? "border-blue-400 bg-blue-50/50 dark:bg-blue-900/20 scale-105"
                : "border-slate-300 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-3">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-medium mb-2">Upload study material</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Drag and drop an image here, or click to browse
              </p>
              <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" id="file-upload" />
              <Button
                variant="outline"
                onClick={() => document.getElementById("file-upload")?.click()}
                className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 rounded-xl"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Choose Image
              </Button>
            </div>
          </div>
        )}

        {selectedFile && (
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                  <ImageIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-blue-700 dark:text-blue-300">{selectedFile.name}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 rounded-xl"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                selectedFile ? "Ask me anything about the uploaded image..." : "Ask me anything about your studies..."
              }
              className="min-h-[60px] resize-none border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  if (selectedFile) {
                    sendMessageWithFile()
                  } else {
                    sendMessage()
                  }
                }
              }}
            />
          </div>
          <Button
            onClick={selectedFile ? sendMessageWithFile : sendMessage}
            disabled={(!input.trim() && !selectedFile) || isLoading || isUploading}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg h-[60px] px-6 rounded-2xl transition-all duration-200 hover:scale-105"
          >
            {isLoading || isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                {selectedFile && <Sparkles className="h-4 w-4" />}
              </div>
            )}
          </Button>
        </div>

        {selectedFile && (
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Ready to analyze your study material with AI!
          </p>
        )}
      </div>
    </div>
  )
}

export default AIStudyAssistant
