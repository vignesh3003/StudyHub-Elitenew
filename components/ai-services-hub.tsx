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
  Sparkles,
  Zap,
  Star,
  Rocket,
  Wand2,
  Bot,
  GraduationCap,
  FlaskConical,
  Eye,
  Clock,
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

  // Service-specific states
  const [essayResult, setEssayResult] = useState<string>("")
  const [flashcardResult, setFlashcardResult] = useState<string>("")
  const [studyGuideResult, setStudyGuideResult] = useState<string>("")
  const [conceptResult, setConceptResult] = useState<string>("")
  const [mathResult, setMathResult] = useState<string>("")
  const [researchResult, setResearchResult] = useState<string>("")
  const [imageAnalysisResult, setImageAnalysisResult] = useState<string>("")
  const [plannerResult, setPlannerResult] = useState<string>("")
  const [quizResult, setQuizResult] = useState<string>("")
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: string; type: "user" | "ai"; content: string; timestamp: Date }>
  >([])
  const [chatInput, setChatInput] = useState("")
  const { isMobile } = useMobile()

  // Quiz Generator states
  const [quizSubject, setQuizSubject] = useState("")
  const [quizTopic, setQuizTopic] = useState("")
  const [numQuestions, setNumQuestions] = useState("10")
  const [difficulty, setDifficulty] = useState("medium")
  const [questionType, setQuestionType] = useState("mcq")
  const [parsedQuiz, setParsedQuiz] = useState<
    Array<{
      id: number
      question: string
      options?: string[]
      answer: string
      explanation?: string
      type: string
      showAnswer: boolean
    }>
  >([])

  // Essay Writer states
  const [essayWordCount, setEssayWordCount] = useState("500")
  const [essayType, setEssayType] = useState("argumentative")

  // Research Assistant states
  const [researchSubject, setResearchSubject] = useState("")
  const [researchTopic, setResearchTopic] = useState("")
  const [researchPurpose, setResearchPurpose] = useState("essay")
  const [researchLevel, setResearchLevel] = useState("intermediate")

  // Smart Study Planner states
  const [studyLevel, setStudyLevel] = useState("")
  const [studyStyle, setStudyStyle] = useState("")
  const [subjects, setSubjects] = useState("")
  const [challengingSubject, setChallengingSubject] = useState("")
  const [favoriteSubject, setFavoriteSubject] = useState("")
  const [dailyStudyTime, setDailyStudyTime] = useState("")
  const [bestStudyTime, setBestStudyTime] = useState("")
  const [weekendStudy, setWeekendStudy] = useState("")
  const [primaryGoal, setPrimaryGoal] = useState("")
  const [timeline, setTimeline] = useState("")
  const [deadlines, setDeadlines] = useState("")
  const [studyMethods, setStudyMethods] = useState("")
  const [breakPreference, setBreakPreference] = useState("")
  const [additionalInfo, setAdditionalInfo] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const services = [
    {
      id: "chat",
      title: "AI Study Assistant",
      description: "Get instant help with your studies, explanations, and personalized advice",
      icon: Bot,
      gradient: "from-blue-500 via-purple-500 to-pink-500",
      bgGradient: "from-blue-50 to-purple-50",
      darkBgGradient: "from-blue-950/50 to-purple-950/50",
      status: "available",
      badge: "Popular",
      badgeColor: "bg-blue-500",
      category: "Interactive",
    },
    {
      id: "essay-writer",
      title: "Essay Writer",
      description: "Generate well-structured essays on any topic with proper citations",
      icon: FileText,
      gradient: "from-indigo-500 via-blue-500 to-cyan-500",
      bgGradient: "from-indigo-50 to-blue-50",
      darkBgGradient: "from-indigo-950/50 to-blue-950/50",
      status: "available",
      badge: "Academic",
      badgeColor: "bg-indigo-500",
      category: "Writing",
    },
    {
      id: "quiz-generator",
      title: "Quiz Generator",
      description: "Generate practice quizzes from your study materials",
      icon: CheckCircle,
      gradient: "from-teal-500 via-cyan-500 to-blue-500",
      bgGradient: "from-teal-50 to-cyan-50",
      darkBgGradient: "from-teal-950/50 to-cyan-950/50",
      status: "available",
      badge: "Practice",
      badgeColor: "bg-teal-500",
      category: "Assessment",
    },
    {
      id: "study-guide",
      title: "Study Guide Generator",
      description: "Create comprehensive study guides from your topics and materials",
      icon: BookOpen,
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      bgGradient: "from-emerald-50 to-teal-50",
      darkBgGradient: "from-emerald-950/50 to-teal-950/50",
      status: "available",
      badge: "Essential",
      badgeColor: "bg-emerald-500",
      category: "Study Tools",
    },
    {
      id: "concept-explainer",
      title: "Concept Explainer",
      description: "Break down complex concepts into simple, understandable explanations",
      icon: Lightbulb,
      gradient: "from-amber-500 via-yellow-500 to-orange-500",
      bgGradient: "from-amber-50 to-yellow-50",
      darkBgGradient: "from-amber-950/50 to-yellow-950/50",
      status: "available",
      badge: "Clarity",
      badgeColor: "bg-amber-500",
      category: "Learning",
    },
    {
      id: "math-solver",
      title: "Math Problem Solver",
      description: "Solve complex mathematical problems with step-by-step explanations",
      icon: Calculator,
      gradient: "from-green-500 via-emerald-500 to-teal-500",
      bgGradient: "from-green-50 to-emerald-50",
      darkBgGradient: "from-green-950/50 to-emerald-950/50",
      status: "available",
      badge: "Precise",
      badgeColor: "bg-green-500",
      category: "STEM",
    },
    {
      id: "research-assistant",
      title: "Research Assistant",
      description: "Find credible sources and summarize research papers",
      icon: Search,
      gradient: "from-sky-500 via-blue-500 to-indigo-500",
      bgGradient: "from-sky-50 to-blue-50",
      darkBgGradient: "from-sky-950/50 to-blue-950/50",
      status: "available",
      badge: "Research",
      badgeColor: "bg-sky-500",
      category: "Research",
    },
    {
      id: "flashcards",
      title: "Flashcard Generator",
      description: "Generate flashcards automatically from your study materials",
      icon: Brain,
      gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
      bgGradient: "from-violet-50 to-purple-50",
      darkBgGradient: "from-violet-950/50 to-purple-950/50",
      status: "available",
      badge: "Memory",
      badgeColor: "bg-violet-500",
      category: "Study Tools",
    },
    {
      id: "image-analysis",
      title: "Image Analysis",
      description: "Upload photos of textbooks, notes, or whiteboards for AI analysis",
      icon: ImageIcon,
      gradient: "from-orange-500 via-red-500 to-pink-500",
      bgGradient: "from-orange-50 to-red-50",
      darkBgGradient: "from-orange-950/50 to-red-950/50",
      status: "available",
      badge: "Smart",
      badgeColor: "bg-orange-500",
      category: "Visual",
    },
    {
      id: "study-planner",
      title: "Smart Study Planner",
      description: "Create personalized study schedules based on your goals and deadlines",
      icon: Calendar,
      gradient: "from-purple-500 via-violet-500 to-indigo-500",
      bgGradient: "from-purple-50 to-violet-50",
      darkBgGradient: "from-purple-950/50 to-violet-950/50",
      status: "available",
      badge: "Organize",
      badgeColor: "bg-purple-500",
      category: "Planning",
    },
    {
      id: "language-tutor",
      title: "Language Tutor",
      description: "Practice conversations and learn new languages with AI",
      icon: Languages,
      gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
      bgGradient: "from-rose-50 to-pink-50",
      darkBgGradient: "from-rose-950/50 to-pink-950/50",
      status: "coming-soon",
      badge: "Soon",
      badgeColor: "bg-rose-500",
      category: "Languages",
    },
    {
      id: "presentation-maker",
      title: "Presentation Maker",
      description: "Create engaging presentations with AI-generated content and design",
      icon: PresentationIcon,
      gradient: "from-fuchsia-500 via-purple-500 to-violet-500",
      bgGradient: "from-fuchsia-50 to-purple-50",
      darkBgGradient: "from-fuchsia-950/50 to-purple-950/50",
      status: "coming-soon",
      badge: "Soon",
      badgeColor: "bg-fuchsia-500",
      category: "Presentation",
    },
  ]

  const categories = [
    "All",
    "Interactive",
    "Writing",
    "Assessment",
    "Study Tools",
    "Learning",
    "STEM",
    "Research",
    "Visual",
    "Planning",
  ]
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredServices =
    selectedCategory === "All" ? services : services.filter((service) => service.category === selectedCategory)

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
    const setServiceResult = getResultSetter(activeService)
    setServiceResult("")

    try {
      let response
      const endpoint = "/api/ai-chat"

      // Create service-specific prompts
      let enhancedPrompt = ""

      if (activeService === "study-guide") {
        enhancedPrompt = `GENERATE STUDY GUIDE ONLY - NOT AN ESSAY

Topic: ${inputText}

Create a structured study guide with:
• Key concepts and definitions
• Important facts and figures  
• Study tips and memory aids
• Practice questions
• Summary of main points

Format as bullet points and sections, NOT essay paragraphs.`
      } else if (activeService === "essay-writer") {
        enhancedPrompt = `WRITE COMPLETE ESSAY ONLY - ${essayWordCount} WORDS

Topic: "${inputText}"

Write a complete academic essay with:
- Title
- Introduction with thesis
- Body paragraphs with examples
- Conclusion
- Exactly ${essayWordCount} words

Write the full essay, not advice about writing.`
      } else if (activeService === "math-solver") {
        enhancedPrompt = `SOLVE MATH PROBLEM ONLY - NOT AN ESSAY

Problem: ${inputText}

Provide:
1. Step-by-step solution
2. Explanation of each step
3. Final answer
4. Relevant formulas

Show mathematical work, not essay writing.`
      } else if (activeService === "concept-explainer") {
        enhancedPrompt = `EXPLAIN CONCEPT ONLY - NOT AN ESSAY

Concept: ${inputText}

Provide:
• Clear definition
• Simple explanation with examples
• Why it's important
• How it relates to other concepts
• Memory aids

Format as explanatory points, not essay paragraphs.`
      } else if (activeService === "quiz-generator") {
        enhancedPrompt = `GENERATE QUIZ QUESTIONS ONLY - NOT AN ESSAY

Subject: ${quizSubject}
Topic: ${quizTopic}
Questions: ${numQuestions}
Difficulty: ${difficulty}

Create exactly ${numQuestions} multiple choice questions in this format:

Question 1: [Question text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Correct Answer: [Letter]
Explanation: [Brief explanation]

Continue for all ${numQuestions} questions.

IMPORTANT: Generate ONLY quiz questions, NOT essays or research papers.`
      } else {
        enhancedPrompt = inputText
      }

      if (selectedImage) {
        const formData = new FormData()
        formData.append("image", selectedImage)
        formData.append("message", enhancedPrompt)
        formData.append("serviceType", activeService || "")

        response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        })
      } else {
        const requestBody = {
          message: enhancedPrompt,
          serviceType: activeService,
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
        setServiceResult(data.response || "No response received")
        toast({
          title: "Success!",
          description: "Content generated successfully.",
        })
      } else {
        throw new Error(data.error || "Unknown error occurred")
      }
    } catch (error: any) {
      console.error("AI Service Error:", error)
      setServiceResult(`Error: ${error.message}`)
      toast({
        title: "Error",
        description: error.message || "Failed to process request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Helper functions
  const getResultSetter = (serviceId: string | null) => {
    switch (serviceId) {
      case "essay-writer":
        return setEssayResult
      case "flashcards":
        return setFlashcardResult
      case "study-guide":
        return setStudyGuideResult
      case "concept-explainer":
        return setConceptResult
      case "math-solver":
        return setMathResult
      case "research-assistant":
        return setResearchResult
      case "image-analysis":
        return setImageAnalysisResult
      case "study-planner":
        return setPlannerResult
      case "quiz-generator":
        return setQuizResult
      default:
        return setEssayResult
    }
  }

  const getCurrentResult = (serviceId: string | null) => {
    switch (serviceId) {
      case "essay-writer":
        return essayResult
      case "flashcards":
        return flashcardResult
      case "study-guide":
        return studyGuideResult
      case "concept-explainer":
        return conceptResult
      case "math-solver":
        return mathResult
      case "research-assistant":
        return researchResult
      case "image-analysis":
        return imageAnalysisResult
      case "study-planner":
        return plannerResult
      case "quiz-generator":
        return quizResult
      default:
        return essayResult
    }
  }

  const copyResult = () => {
    const currentResult = getCurrentResult(activeService)
    navigator.clipboard.writeText(currentResult)
    toast({
      title: "Copied!",
      description: "Result copied to clipboard.",
    })
  }

  const clearResult = () => {
    const setServiceResult = getResultSetter(activeService)
    setServiceResult("")
    setInputText("")
    removeImage()
  }

  const clearChat = () => {
    setChatMessages([])
    setChatInput("")
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return

    setIsLoading(true)

    const newMessage = {
      id: Date.now().toString(),
      type: "user" as const,
      content: chatInput,
      timestamp: new Date(),
    }

    setChatMessages((prevMessages) => [...prevMessages, newMessage])
    setChatInput("")

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: chatInput, serviceType: "chat" }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()

      if (data.success) {
        const aiResponse = {
          id: Date.now().toString(),
          type: "ai" as const,
          content: data.response || "No response received",
          timestamp: new Date(),
        }
        setChatMessages((prevMessages) => [...prevMessages, aiResponse])
      } else {
        throw new Error(data.error || "Unknown error occurred")
      }
    } catch (error: any) {
      console.error("AI Chat Error:", error)
      const errorResponse = {
        id: Date.now().toString(),
        type: "ai" as const,
        content: `Error: ${error.message}`,
        timestamp: new Date(),
      }
      setChatMessages((prevMessages) => [...prevMessages, errorResponse])
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Render the service grid
  if (!activeService) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Header Section */}
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-75 animate-pulse"></div>
                <div className="relative p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-2xl">
                  <GraduationCap className="h-12 w-12 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AI Services Hub
                </h1>
                <div className="flex items-center justify-center gap-3 mt-3">
                  <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                  <span className="text-lg text-gray-600 dark:text-gray-300 font-medium">Powered by Advanced AI</span>
                  <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                </div>
              </div>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Transform your learning experience with cutting-edge AI tools designed specifically for students. From
              essay writing to quiz generation, we've got everything you need to excel.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-slate-900/50 rounded-full backdrop-blur-sm">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>Lightning Fast</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-slate-900/50 rounded-full backdrop-blur-sm">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Premium Quality</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-slate-900/50 rounded-full backdrop-blur-sm">
                <Rocket className="h-4 w-4 text-yellow-500" />
                <span>Always Improving</span>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-900/80"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredServices.map((service) => {
              const IconComponent = service.icon
              const isDisabled = service.status === "coming-soon"

              return (
                <Card
                  key={service.id}
                  className={`group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 ${
                    isDisabled ? "opacity-70" : "cursor-pointer hover:scale-105"
                  } bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm`}
                  onClick={() => !isDisabled && setActiveService(service.id)}
                >
                  {/* Background Gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${service.bgGradient} dark:${service.darkBgGradient} opacity-60`}
                  ></div>

                  {/* Animated Border */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-[2px] rounded-lg`}
                  >
                    <div className="w-full h-full bg-white dark:bg-slate-900 rounded-lg"></div>
                  </div>

                  {/* Content */}
                  <div className="relative p-8 space-y-6 h-full flex flex-col">
                    {/* Badge */}
                    <div className="flex items-center justify-between">
                      <div
                        className={`px-3 py-1 ${service.badgeColor} text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg`}
                      >
                        <Wand2 className="h-3 w-3" />
                        {service.badge}
                      </div>
                      {isDisabled && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                          Coming Soon
                        </div>
                      )}
                    </div>

                    {/* Icon */}
                    <div className="flex items-center justify-center">
                      <div
                        className={`relative p-6 bg-gradient-to-r ${service.gradient} rounded-3xl group-hover:scale-110 transition-transform duration-300 shadow-2xl`}
                      >
                        <IconComponent className="h-10 w-10 text-white" />
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-3xl transition-opacity duration-300"></div>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="text-center space-y-3 flex-1">
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{service.description}</p>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4">
                      <Button
                        className={`w-full bg-gradient-to-r ${service.gradient} hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 border-0 text-white font-semibold py-3 text-base ${
                          isDisabled ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={isDisabled}
                      >
                        {isDisabled ? (
                          <>
                            <FlaskConical className="h-4 w-4 mr-2" />
                            Coming Soon
                          </>
                        ) : (
                          <>
                            Get Started
                            <Sparkles className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Footer Stats */}
          <div className="text-center pt-12">
            <div className="inline-flex items-center gap-12 px-8 py-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-xl">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  12+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">AI Tools</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  24/7
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
                  ∞
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Possibilities</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentService = services.find((s) => s.id === activeService)!
  const IconComponent = currentService.icon

  // Render the active service interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => setActiveService(null)}
            variant="outline"
            className="mb-6 flex items-center gap-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-white/30 dark:border-slate-700/30 hover:bg-white/80 dark:hover:bg-slate-900/80 shadow-lg"
            size="lg"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Services
          </Button>

          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <div
                className={`absolute inset-0 bg-gradient-to-r ${currentService.gradient} rounded-3xl blur-2xl opacity-75 animate-pulse`}
              ></div>
              <div className={`relative p-6 bg-gradient-to-r ${currentService.gradient} rounded-3xl shadow-2xl`}>
                <IconComponent className="h-10 w-10 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {currentService.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">{currentService.description}</p>
            </div>
          </div>
        </div>

        {/* AI Study Assistant (Chat Interface) */}
        {activeService === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-gray-200/50 dark:border-gray-700/50 p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-xl">AI Study Chat</h3>
                  </div>
                  <Button
                    onClick={clearChat}
                    variant="ghost"
                    size="sm"
                    className="h-10 px-4 hover:bg-red-50 hover:text-red-600 rounded-xl"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Clear
                  </Button>
                </div>

                <div className="h-[600px] flex flex-col">
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {chatMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-12">
                        <div className="relative mb-8">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                          <div className="relative p-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-2xl">
                            <MessageSquare className="h-16 w-16 text-white" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                          Start a conversation
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md text-lg">
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
                            className={`max-w-[80%] p-5 rounded-2xl shadow-xl ${
                              message.type === "user"
                                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                                : "bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                            }`}
                          >
                            <p className="whitespace-pre-wrap text-base leading-relaxed">{message.content}</p>
                            <p
                              className={`text-xs mt-3 ${
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
                        <div className="max-w-[80%] p-5 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 shadow-xl">
                          <div className="flex items-center gap-3">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                            <span className="text-gray-600 dark:text-gray-400">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-6">
                    <div className="flex gap-4">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask me anything about your studies..."
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendChatMessage()}
                        disabled={isLoading}
                        className="flex-1 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 h-12 text-base rounded-xl"
                      />
                      <Button
                        onClick={sendChatMessage}
                        disabled={isLoading || !chatInput.trim()}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl h-12 px-6 rounded-xl"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div>
              <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
                <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    Quick Actions
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <Button
                    onClick={() => setChatInput("Create a study plan for my upcoming exams")}
                    variant="outline"
                    className="w-full justify-start text-left hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 h-12 rounded-xl"
                    disabled={isLoading}
                  >
                    <Calendar className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span>Study Plan</span>
                  </Button>
                  <Button
                    onClick={() => setChatInput("Give me study tips for better focus")}
                    variant="outline"
                    className="w-full justify-start text-left hover:bg-green-50 hover:border-green-200 hover:text-green-700 h-12 rounded-xl"
                    disabled={isLoading}
                  >
                    <Target className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span>Study Tips</span>
                  </Button>
                  <Button
                    onClick={() => setChatInput("Explain a difficult concept to me")}
                    variant="outline"
                    className="w-full justify-start text-left hover:bg-yellow-50 hover:border-yellow-200 hover:text-yellow-700 h-12 rounded-xl"
                    disabled={isLoading}
                  >
                    <Lightbulb className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span>Explain Concept</span>
                  </Button>
                  <Button
                    onClick={() => setChatInput("Help me with my homework")}
                    variant="outline"
                    className="w-full justify-start text-left hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 h-12 rounded-xl"
                    disabled={isLoading}
                  >
                    <BookOpen className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span>Homework Help</span>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Quiz Generator - Enhanced with Question Types */}
        {activeService === "quiz-generator" && (
          <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm max-w-6xl mx-auto">
            <div className="p-10 space-y-10">
              <div className="space-y-8">
                <div>
                  <label className="block text-base font-bold mb-4 text-gray-700 dark:text-gray-300">Subject</label>
                  <Input
                    placeholder="Enter the subject (e.g., Biology, History)..."
                    value={quizSubject}
                    onChange={(e) => setQuizSubject(e.target.value)}
                    className="border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 h-12 text-base rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-base font-bold mb-4 text-gray-700 dark:text-gray-300">
                    Specific Topic
                  </label>
                  <Textarea
                    placeholder="Enter the specific topic for your quiz (e.g., Cell Biology, World War II, Algebra)..."
                    className="min-h-[140px] border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 text-base rounded-xl"
                    value={quizTopic}
                    onChange={(e) => setQuizTopic(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-base font-bold mb-4 text-gray-700 dark:text-gray-300">
                      Question Type
                    </label>
                    <Select value={questionType} onValueChange={setQuestionType}>
                      <SelectTrigger className="border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 h-12 text-base rounded-xl">
                        <SelectValue placeholder="Select question type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
                        <SelectItem value="short">Short Answer</SelectItem>
                        <SelectItem value="long">Long Answer</SelectItem>
                        <SelectItem value="true-false">True/False</SelectItem>
                        <SelectItem value="fill-blank">Fill in the Blanks</SelectItem>
                        <SelectItem value="mixed">Mixed (All Types)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-base font-bold mb-4 text-gray-700 dark:text-gray-300">
                      Number of Questions
                    </label>
                    <Select value={numQuestions} onValueChange={setNumQuestions}>
                      <SelectTrigger className="border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 h-12 text-base rounded-xl">
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

                  <div>
                    <label className="block text-base font-bold mb-4 text-gray-700 dark:text-gray-300">
                      Difficulty Level
                    </label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger className="border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 h-12 text-base rounded-xl">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    let quizPrompt = ""

                    if (questionType === "mcq") {
                      quizPrompt = `GENERATE MULTIPLE CHOICE QUESTIONS ONLY

Subject: ${quizSubject}
Topic: ${quizTopic}
Questions: ${numQuestions}
Difficulty: ${difficulty}

Create exactly ${numQuestions} multiple choice questions in this EXACT format:

Q1: [Question text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
ANSWER: [Letter]
EXPLANATION: [Brief explanation]

Q2: [Question text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
ANSWER: [Letter]
EXPLANATION: [Brief explanation]

Continue this pattern for all ${numQuestions} questions.`
                    } else if (questionType === "short") {
                      quizPrompt = `GENERATE SHORT ANSWER QUESTIONS ONLY

Subject: ${quizSubject}
Topic: ${quizTopic}
Questions: ${numQuestions}
Difficulty: ${difficulty}

Create exactly ${numQuestions} short answer questions in this EXACT format:

Q1: [Question text]
ANSWER: [Short answer - 1-2 sentences]
EXPLANATION: [Brief explanation]

Q2: [Question text]
ANSWER: [Short answer - 1-2 sentences]
EXPLANATION: [Brief explanation]

Continue this pattern for all ${numQuestions} questions.`
                    } else if (questionType === "long") {
                      quizPrompt = `GENERATE LONG ANSWER QUESTIONS ONLY

Subject: ${quizSubject}
Topic: ${quizTopic}
Questions: ${numQuestions}
Difficulty: ${difficulty}

Create exactly ${numQuestions} long answer questions in this EXACT format:

Q1: [Question text]
ANSWER: [Detailed answer - 3-5 sentences]
EXPLANATION: [Brief explanation of key points]

Q2: [Question text]
ANSWER: [Detailed answer - 3-5 sentences]
EXPLANATION: [Brief explanation of key points]

Continue this pattern for all ${numQuestions} questions.`
                    } else if (questionType === "true-false") {
                      quizPrompt = `GENERATE TRUE/FALSE QUESTIONS ONLY

Subject: ${quizSubject}
Topic: ${quizTopic}
Questions: ${numQuestions}
Difficulty: ${difficulty}

Create exactly ${numQuestions} true/false questions in this EXACT format:

Q1: [Statement to evaluate]
ANSWER: [True or False]
EXPLANATION: [Brief explanation why it's true or false]

Q2: [Statement to evaluate]
ANSWER: [True or False]
EXPLANATION: [Brief explanation why it's true or false]

Continue this pattern for all ${numQuestions} questions.`
                    } else if (questionType === "fill-blank") {
                      quizPrompt = `GENERATE FILL IN THE BLANK QUESTIONS ONLY

Subject: ${quizSubject}
Topic: ${quizTopic}
Questions: ${numQuestions}
Difficulty: ${difficulty}

Create exactly ${numQuestions} fill-in-the-blank questions in this EXACT format:

Q1: [Sentence with _______ blank]
ANSWER: [Word or phrase that fills the blank]
EXPLANATION: [Brief explanation]

Q2: [Sentence with _______ blank]
ANSWER: [Word or phrase that fills the blank]
EXPLANATION: [Brief explanation]

Continue this pattern for all ${numQuestions} questions.`
                    } else if (questionType === "mixed") {
                      quizPrompt = `GENERATE MIXED QUESTION TYPES

Subject: ${quizSubject}
Topic: ${quizTopic}
Questions: ${numQuestions}
Difficulty: ${difficulty}

Create exactly ${numQuestions} questions using different types (MCQ, Short Answer, True/False, Fill-in-blank). Mix them up and use this format:

For MCQ:
Q1: [Question text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
ANSWER: [Letter]
EXPLANATION: [Brief explanation]

For Short Answer:
Q2: [Question text]
ANSWER: [Short answer]
EXPLANATION: [Brief explanation]

For True/False:
Q3: [Statement]
ANSWER: [True or False]
EXPLANATION: [Brief explanation]

For Fill-in-blank:
Q4: [Sentence with _______ blank]
ANSWER: [Word/phrase]
EXPLANATION: [Brief explanation]

Continue mixing question types for all ${numQuestions} questions.`
                    }

                    setInputText(quizPrompt)
                    processRequest()
                  }}
                  disabled={isLoading || !quizSubject.trim() || !quizTopic.trim()}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-2xl py-4 text-lg font-bold rounded-xl h-14"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-6 w-6 mr-3 animate-spin" /> Generating Quiz...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-6 w-6 mr-3" /> Generate {numQuestions}{" "}
                      {questionType === "mcq"
                        ? "MCQ"
                        : questionType === "short"
                          ? "Short Answer"
                          : questionType === "long"
                            ? "Long Answer"
                            : questionType === "true-false"
                              ? "True/False"
                              : questionType === "fill-blank"
                                ? "Fill-in-Blank"
                                : "Mixed"}{" "}
                      Questions
                    </>
                  )}
                </Button>
              </div>

              {getCurrentResult(activeService) && (
                <div className="mt-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-2xl flex items-center gap-3">
                      <Sparkles className="h-6 w-6 text-yellow-500" />
                      Interactive Quiz ({numQuestions} Questions)
                    </h3>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => {
                          // Parse and show interactive quiz
                          const rawQuiz = getCurrentResult(activeService)
                          const questions = parseQuizContent(rawQuiz)
                          setParsedQuiz(questions)
                        }}
                        variant="outline"
                        size="lg"
                        className="hover:bg-blue-50 hover:text-blue-600 rounded-xl"
                      >
                        <Brain className="h-5 w-5 mr-2" /> Start Interactive Quiz
                      </Button>
                      <Button
                        onClick={copyResult}
                        variant="ghost"
                        size="lg"
                        className="hover:bg-green-50 hover:text-green-600 rounded-xl"
                      >
                        <Copy className="h-5 w-5 mr-2" /> Copy Raw Text
                      </Button>
                      <Button
                        onClick={() => {
                          clearResult()
                          setQuizSubject("")
                          setQuizTopic("")
                          setNumQuestions("10")
                          setDifficulty("medium")
                          setQuestionType("mcq")
                          setParsedQuiz([])
                        }}
                        variant="ghost"
                        size="lg"
                        className="hover:bg-red-50 hover:text-red-600 rounded-xl"
                      >
                        <Trash2 className="h-5 w-5 mr-2" /> Clear
                      </Button>
                    </div>
                  </div>

                  {parsedQuiz.length > 0 ? (
                    <div className="space-y-6">
                      {parsedQuiz.map((question, index) => (
                        <Card key={question.id} className="border border-gray-200 dark:border-gray-700 shadow-lg">
                          <div className="p-6 space-y-4">
                            <div className="flex items-start justify-between">
                              <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200">
                                Question {index + 1}
                              </h4>
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 text-xs font-medium rounded-full">
                                  {question.type}
                                </span>
                                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full">
                                  {difficulty}
                                </span>
                              </div>
                            </div>

                            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                              {question.question}
                            </p>

                            {question.options && (
                              <div className="space-y-2 ml-4">
                                {question.options.map((option, optIndex) => (
                                  <div key={optIndex} className="text-gray-600 dark:text-gray-400">
                                    {option}
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                              {question.showAnswer ? (
                                <div className="space-y-3">
                                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                                    <p className="font-semibold text-green-800 dark:text-green-300 mb-2">Answer:</p>
                                    <p className="text-green-700 dark:text-green-400">{question.answer}</p>
                                  </div>
                                  {question.explanation && (
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                                      <p className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                                        Explanation:
                                      </p>
                                      <p className="text-blue-700 dark:text-blue-400">{question.explanation}</p>
                                    </div>
                                  )}
                                  <Button
                                    onClick={() => {
                                      const updated = [...parsedQuiz]
                                      updated[index].showAnswer = false
                                      setParsedQuiz(updated)
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="hover:bg-gray-50 rounded-xl"
                                  >
                                    Hide Answer
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  onClick={() => {
                                    const updated = [...parsedQuiz]
                                    updated[index].showAnswer = true
                                    setParsedQuiz(updated)
                                  }}
                                  className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Reveal Answer
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}

                      <div className="text-center pt-6">
                        <Button
                          onClick={() => {
                            const allRevealed = parsedQuiz.every((q) => q.showAnswer)
                            const updated = parsedQuiz.map((q) => ({ ...q, showAnswer: !allRevealed }))
                            setParsedQuiz(updated)
                          }}
                          variant="outline"
                          size="lg"
                          className="hover:bg-blue-50 hover:text-blue-600 rounded-xl"
                        >
                          {parsedQuiz.every((q) => q.showAnswer) ? "Hide All Answers" : "Reveal All Answers"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-gray-50 to-teal-50 dark:from-gray-900 dark:to-teal-950 rounded-2xl p-8 max-h-[600px] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-inner">
                      <div className="whitespace-pre-wrap text-base leading-relaxed">
                        {getCurrentResult(activeService)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Research Assistant - Enhanced with Form Fields */}
        {activeService === "research-assistant" && (
          <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm max-w-5xl mx-auto">
            <div className="p-10 space-y-10">
              <div className="space-y-8">
                <div>
                  <label className="block text-base font-bold mb-4 text-gray-700 dark:text-gray-300">
                    Research Topic
                  </label>
                  <Input
                    placeholder="Enter your research topic (e.g., Climate Change, Artificial Intelligence)..."
                    value={researchTopic}
                    onChange={(e) => setResearchTopic(e.target.value)}
                    className="border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 h-12 text-base rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-base font-bold mb-4 text-gray-700 dark:text-gray-300">
                      Research Purpose
                    </label>
                    <Select value={researchPurpose} onValueChange={setResearchPurpose}>
                      <SelectTrigger className="border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 h-12 text-base rounded-xl">
                        <SelectValue placeholder="What is this research for?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="essay">Essay/Paper</SelectItem>
                        <SelectItem value="thesis">Thesis/Dissertation</SelectItem>
                        <SelectItem value="presentation">Presentation</SelectItem>
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="general">General Knowledge</SelectItem>
                        <SelectItem value="career-prep">Career Preparation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-base font-bold mb-4 text-gray-700 dark:text-gray-300">
                      Academic Level
                    </label>
                    <Select value={researchLevel} onValueChange={setResearchLevel}>
                      <SelectTrigger className="border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 h-12 text-base rounded-xl">
                        <SelectValue placeholder="Select your level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high-school">High School</SelectItem>
                        <SelectItem value="undergraduate">Undergraduate</SelectItem>
                        <SelectItem value="graduate">Graduate</SelectItem>
                        <SelectItem value="phd">PhD/Doctoral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-base font-bold mb-4 text-gray-700 dark:text-gray-300">
                    Subject Area (Optional)
                  </label>
                  <Input
                    placeholder="e.g., Biology, Computer Science, History, Psychology..."
                    value={researchSubject}
                    onChange={(e) => setResearchSubject(e.target.value)}
                    className="border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 h-12 text-base rounded-xl"
                  />
                </div>

                <Button
                  onClick={() => {
                    const researchPrompt = `PROVIDE RESEARCH INFORMATION ONLY - NOT AN ESSAY

Topic: ${researchTopic}
Purpose: ${researchPurpose}
Academic Level: ${researchLevel}
Subject Area: ${researchSubject || "General"}

Provide brief, structured research information in this format:

## Key Points
• [Important point 1]
• [Important point 2]
• [Important point 3]

## Different Perspectives
• [Perspective 1]
• [Perspective 2]

## Research Areas to Explore
• [Area 1]
• [Area 2]
• [Area 3]

## Credible Sources
• [Source type 1]
• [Source type 2]
• [Source type 3]

## Important Questions
• [Question 1]
• [Question 2]

IMPORTANT: Keep it brief and structured. Provide research guidance, NOT essays.`

                    setInputText(researchPrompt)
                    processRequest()
                  }}
                  disabled={isLoading || !researchTopic.trim()}
                  className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-2xl py-4 text-lg font-bold rounded-xl h-14"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-6 w-6 mr-3 animate-spin" /> Researching...
                    </>
                  ) : (
                    <>
                      <Search className="h-6 w-6 mr-3" /> Start Research
                    </>
                  )}
                </Button>
              </div>

              {getCurrentResult(activeService) && (
                <div className="mt-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-2xl flex items-center gap-3">
                      <Sparkles className="h-6 w-6 text-yellow-500" />
                      Research Information
                    </h3>
                    <div className="flex gap-3">
                      <Button
                        onClick={copyResult}
                        variant="ghost"
                        size="lg"
                        className="hover:bg-green-50 hover:text-green-600 rounded-xl"
                      >
                        <Copy className="h-5 w-5 mr-2" /> Copy
                      </Button>
                      <Button
                        onClick={() => {
                          clearResult()
                          setResearchTopic("")
                          setResearchSubject("")
                          setResearchPurpose("essay")
                          setResearchLevel("undergraduate")
                        }}
                        variant="ghost"
                        size="lg"
                        className="hover:bg-red-50 hover:text-red-600 rounded-xl"
                      >
                        <Trash2 className="h-5 w-5 mr-2" /> Clear
                      </Button>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-sky-50 dark:from-gray-900 dark:to-sky-950 rounded-2xl p-8 max-h-[600px] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-inner">
                    <div className="whitespace-pre-wrap text-base leading-relaxed">
                      {getCurrentResult(activeService)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Essay Writer - Enhanced with Word Count */}
        {activeService === "essay-writer" && (
          <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm max-w-5xl mx-auto">
            <div className="p-10 space-y-10">
              <div className="space-y-8">
                <div>
                  <label className="block text-base font-bold mb-4 text-gray-700 dark:text-gray-300">Essay Topic</label>
                  <Input
                    placeholder="Enter your essay topic..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 h-12 text-base rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-base font-bold mb-4 text-gray-700 dark:text-gray-300">
                      Word Count
                    </label>
                    <Select value={essayWordCount} onValueChange={setEssayWordCount}>
                      <SelectTrigger className="border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 h-12 text-base rounded-xl">
                        <SelectValue placeholder="Select word count" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="250">250 words</SelectItem>
                        <SelectItem value="500">500 words</SelectItem>
                        <SelectItem value="750">750 words</SelectItem>
                        <SelectItem value="1000">1000 words</SelectItem>
                        <SelectItem value="1500">1500 words</SelectItem>
                        <SelectItem value="2000">2000 words</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-base font-bold mb-4 text-gray-700 dark:text-gray-300">
                      Essay Type
                    </label>
                    <Select value={essayType} onValueChange={setEssayType}>
                      <SelectTrigger className="border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 h-12 text-base rounded-xl">
                        <SelectValue placeholder="Select essay type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="argumentative">Argumentative</SelectItem>
                        <SelectItem value="descriptive">Descriptive</SelectItem>
                        <SelectItem value="narrative">Narrative</SelectItem>
                        <SelectItem value="expository">Expository</SelectItem>
                        <SelectItem value="analytical">Analytical</SelectItem>
                        <SelectItem value="compare-contrast">Compare & Contrast</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={processRequest}
                  disabled={isLoading || !inputText.trim()}
                  className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white shadow-2xl py-4 text-lg font-bold rounded-xl h-14"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-6 w-6 mr-3 animate-spin" /> Writing Essay...
                    </>
                  ) : (
                    <>
                      <FileText className="h-6 w-6 mr-3" /> Generate {essayWordCount}-Word {essayType} Essay
                    </>
                  )}
                </Button>
              </div>

              {getCurrentResult(activeService) && (
                <div className="mt-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-2xl flex items-center gap-3">
                      <Sparkles className="h-6 w-6 text-yellow-500" />
                      Generated Essay ({essayWordCount} words)
                    </h3>
                    <div className="flex gap-3">
                      <Button
                        onClick={copyResult}
                        variant="ghost"
                        size="lg"
                        className="hover:bg-green-50 hover:text-green-600 rounded-xl"
                      >
                        <Copy className="h-5 w-5 mr-2" /> Copy
                      </Button>
                      <Button
                        onClick={clearResult}
                        variant="ghost"
                        size="lg"
                        className="hover:bg-red-50 hover:text-red-600 rounded-xl"
                      >
                        <Trash2 className="h-5 w-5 mr-2" /> Clear
                      </Button>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950 rounded-2xl p-8 max-h-[600px] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-inner">
                    <div className="whitespace-pre-wrap text-base leading-relaxed">
                      {getCurrentResult(activeService)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Smart Study Planner - Enhanced with Comprehensive Form */}
        {activeService === "study-planner" && (
          <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm max-w-6xl mx-auto">
            <div className="p-10 space-y-10">
              <div className="space-y-8">
                {/* Personal Information */}
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
                  <h4 className="font-bold text-lg text-purple-800 dark:text-purple-300 mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Personal Study Profile
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                        Academic Level
                      </label>
                      <Select value={studyLevel} onValueChange={setStudyLevel}>
                        <SelectTrigger className="border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500 h-12 text-base rounded-xl">
                          <SelectValue placeholder="Select your level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high-school">High School</SelectItem>
                          <SelectItem value="undergraduate">Undergraduate</SelectItem>
                          <SelectItem value="graduate">Graduate School</SelectItem>
                          <SelectItem value="professional">Professional/Certification</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                        Study Style Preference
                      </label>
                      <Select value={studyStyle} onValueChange={setStudyStyle}>
                        <SelectTrigger className="border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500 h-12 text-base rounded-xl">
                          <SelectValue placeholder="How do you prefer to study?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="intensive">Intensive (Long sessions)</SelectItem>
                          <SelectItem value="frequent">Frequent (Short sessions)</SelectItem>
                          <SelectItem value="mixed">Mixed approach</SelectItem>
                          <SelectItem value="deadline-driven">Deadline-driven</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Subjects and Priorities */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-bold text-lg text-blue-800 dark:text-blue-300 mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Subjects & Priorities
                  </h4>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                        Subjects/Courses (one per line)
                      </label>
                      <Textarea
                        placeholder="Enter your subjects or courses, one per line:&#10;Mathematics&#10;Physics&#10;Chemistry&#10;English Literature"
                        className="min-h-[120px] border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 text-base rounded-xl"
                        value={subjects}
                        onChange={(e) => setSubjects(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                          Most Challenging Subject
                        </label>
                        <Input
                          placeholder="Which subject needs the most attention?"
                          value={challengingSubject}
                          onChange={(e) => setChallengingSubject(e.target.value)}
                          className="border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 h-12 text-base rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                          Favorite Subject
                        </label>
                        <Input
                          placeholder="Which subject do you enjoy most?"
                          value={favoriteSubject}
                          onChange={(e) => setFavoriteSubject(e.target.value)}
                          className="border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 h-12 text-base rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Schedule and Availability */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                  <h4 className="font-bold text-lg text-green-800 dark:text-green-300 mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Schedule & Availability
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                        Daily Study Time Available
                      </label>
                      <Select value={dailyStudyTime} onValueChange={setDailyStudyTime}>
                        <SelectTrigger className="border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-green-500 h-12 text-base rounded-xl">
                          <SelectValue placeholder="Hours per day" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-2">1-2 hours</SelectItem>
                          <SelectItem value="3-4">3-4 hours</SelectItem>
                          <SelectItem value="5-6">5-6 hours</SelectItem>
                          <SelectItem value="7-8">7-8 hours</SelectItem>
                          <SelectItem value="9+">9+ hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                        Best Study Time
                      </label>
                      <Select value={bestStudyTime} onValueChange={setBestStudyTime}>
                        <SelectTrigger className="border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-green-500 h-12 text-base rounded-xl">
                          <SelectValue placeholder="When do you focus best?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="early-morning">Early Morning (5-8 AM)</SelectItem>
                          <SelectItem value="morning">Morning (8-12 PM)</SelectItem>
                          <SelectItem value="afternoon">Afternoon (12-5 PM)</SelectItem>
                          <SelectItem value="evening">Evening (5-9 PM)</SelectItem>
                          <SelectItem value="night">Night (9 PM-12 AM)</SelectItem>
                          <SelectItem value="late-night">Late Night (12-3 AM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                        Weekend Availability
                      </label>
                      <Select value={weekendStudy} onValueChange={setWeekendStudy}>
                        <SelectTrigger className="border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-green-500 h-12 text-base rounded-xl">
                          <SelectValue placeholder="Weekend study time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No weekend study</SelectItem>
                          <SelectItem value="light">Light study (1-2 hours)</SelectItem>
                          <SelectItem value="moderate">Moderate (3-5 hours)</SelectItem>
                          <SelectItem value="intensive">Intensive (6+ hours)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Goals and Deadlines */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
                  <h4 className="font-bold text-lg text-orange-800 dark:text-orange-300 mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Goals & Deadlines
                  </h4>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                          Primary Goal
                        </label>
                        <Select value={primaryGoal} onValueChange={setPrimaryGoal}>
                          <SelectTrigger className="border-gray-200 dark:border-gray-700 focus:border-orange-500 focus:ring-orange-500 h-12 text-base rounded-xl">
                            <SelectValue placeholder="What's your main goal?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="exam-prep">Exam Preparation</SelectItem>
                            <SelectItem value="grade-improvement">Grade Improvement</SelectItem>
                            <SelectItem value="skill-building">Skill Building</SelectItem>
                            <SelectItem value="certification">Certification/License</SelectItem>
                            <SelectItem value="knowledge">General Knowledge</SelectItem>
                            <SelectItem value="career-prep">Career Preparation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                          Timeline
                        </label>
                        <Select value={timeline} onValueChange={setTimeline}>
                          <SelectTrigger className="border-gray-200 dark:border-gray-700 focus:border-orange-500 focus:ring-orange-500 h-12 text-base rounded-xl">
                            <SelectValue placeholder="When do you need to achieve this?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-week">1 Week</SelectItem>
                            <SelectItem value="2-weeks">2 Weeks</SelectItem>
                            <SelectItem value="1-month">1 Month</SelectItem>
                            <SelectItem value="2-months">2 Months</SelectItem>
                            <SelectItem value="3-months">3 Months</SelectItem>
                            <SelectItem value="semester">Full Semester</SelectItem>
                            <SelectItem value="year">Academic Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                        Specific Deadlines or Important Dates
                      </label>
                      <Textarea
                        placeholder="List any important dates, exams, or deadlines:&#10;Math Final Exam - June 25th&#10;Physics Project Due - July 1st&#10;Chemistry Quiz - June 22nd"
                        className="min-h-[100px] border-gray-200 dark:border-gray-700 focus:border-orange-500 focus:ring-orange-500 text-base rounded-xl"
                        value={deadlines}
                        onChange={(e) => setDeadlines(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Study Preferences */}
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 rounded-2xl p-6 border border-pink-200 dark:border-pink-800">
                  <h4 className="font-bold text-lg text-pink-800 dark:text-pink-300 mb-4 flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Study Preferences & Methods
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                        Preferred Study Methods
                      </label>
                      <Select value={studyMethods} onValueChange={setStudyMethods}>
                        <SelectTrigger className="border-gray-200 dark:border-gray-700 focus:border-pink-500 focus:ring-pink-500 h-12 text-base rounded-xl">
                          <SelectValue placeholder="How do you like to study?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reading-notes">Reading & Note-taking</SelectItem>
                          <SelectItem value="practice-problems">Practice Problems</SelectItem>
                          <SelectItem value="flashcards">Flashcards & Memorization</SelectItem>
                          <SelectItem value="group-study">Group Study</SelectItem>
                          <SelectItem value="visual-learning">Visual Learning (Diagrams, Videos)</SelectItem>
                          <SelectItem value="mixed-methods">Mixed Methods</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                        Break Preferences
                      </label>
                      <Select value={breakPreference} onValueChange={setBreakPreference}>
                        <SelectTrigger className="border-gray-200 dark:border-gray-700 focus:border-pink-500 focus:ring-pink-500 h-12 text-base rounded-xl">
                          <SelectValue placeholder="How often do you need breaks?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pomodoro">Pomodoro (25min study, 5min break)</SelectItem>
                          <SelectItem value="short-frequent">Short & Frequent (45min study, 15min break)</SelectItem>
                          <SelectItem value="long-sessions">Long Sessions (90min study, 30min break)</SelectItem>
                          <SelectItem value="flexible">Flexible based on energy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                    Additional Information (Optional)
                  </label>
                  <Textarea
                    placeholder="Any other information that might help create your perfect study plan:&#10;- I have a part-time job on weekdays&#10;- I'm more productive after exercise&#10;- I struggle with procrastination&#10;- I prefer studying in quiet environments"
                    className="min-h-[100px] border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500 text-base rounded-xl"
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                  />
                </div>

                <Button
                  onClick={() => {
                    const studyPlanPrompt = `CREATE PERSONALIZED STUDY PLAN ONLY - NOT AN ESSAY

STUDENT PROFILE:
Academic Level: ${studyLevel}
Study Style: ${studyStyle}
Daily Study Time: ${dailyStudyTime}
Best Study Time: ${bestStudyTime}
Weekend Study: ${weekendStudy}
Primary Goal: ${primaryGoal}
Timeline: ${timeline}
Study Methods: ${studyMethods}
Break Preference: ${breakPreference}

SUBJECTS:
${subjects}

CHALLENGING SUBJECT: ${challengingSubject}
FAVORITE SUBJECT: ${favoriteSubject}

DEADLINES:
${deadlines}

ADDITIONAL INFO:
${additionalInfo}

Create a detailed, personalized study plan with:

## Weekly Schedule
[Day-by-day breakdown with specific times and subjects]

## Daily Study Routine
[Recommended daily structure with breaks]

## Subject Priority & Time Allocation
[How much time to spend on each subject]

## Study Strategies
[Specific methods for each subject based on preferences]

## Milestone Tracking
[Weekly goals and checkpoints]

## Tips for Success
[Personalized advice based on their profile]

IMPORTANT: Create a PRACTICAL, ACTIONABLE study plan, NOT generic advice.`

                    setInputText(studyPlanPrompt)
                    processRequest()
                  }}
                  disabled={isLoading || !subjects.trim() || !studyLevel || !primaryGoal}
                  className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white shadow-2xl py-4 text-lg font-bold rounded-xl h-14"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-6 w-6 mr-3 animate-spin" /> Creating Your Study Plan...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-6 w-6 mr-3" /> Generate My Personalized Study Plan
                    </>
                  )}
                </Button>
              </div>

              {getCurrentResult(activeService) && (
                <div className="mt-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-2xl flex items-center gap-3">
                      <Sparkles className="h-6 w-6 text-yellow-500" />
                      Your Personalized Study Plan
                    </h3>
                    <div className="flex gap-3">
                      <Button
                        onClick={copyResult}
                        variant="ghost"
                        size="lg"
                        className="hover:bg-green-50 hover:text-green-600 rounded-xl"
                      >
                        <Copy className="h-5 w-5 mr-2" /> Copy Plan
                      </Button>
                      <Button
                        onClick={() => {
                          clearResult()
                          setStudyLevel("")
                          setStudyStyle("")
                          setSubjects("")
                          setChallengingSubject("")
                          setFavoriteSubject("")
                          setDailyStudyTime("")
                          setBestStudyTime("")
                          setWeekendStudy("")
                          setPrimaryGoal("")
                          setTimeline("")
                          setDeadlines("")
                          setStudyMethods("")
                          setBreakPreference("")
                          setAdditionalInfo("")
                        }}
                        variant="ghost"
                        size="lg"
                        className="hover:bg-red-50 hover:text-red-600 rounded-xl"
                      >
                        <Trash2 className="h-5 w-5 mr-2" /> Clear
                      </Button>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-purple-950 rounded-2xl p-8 max-h-[600px] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-inner">
                    <div className="whitespace-pre-wrap text-base leading-relaxed">
                      {getCurrentResult(activeService)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Default interface for other services */}
        {!["chat", "quiz-generator", "research-assistant", "essay-writer"].includes(activeService) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
              <div className="p-10 space-y-8">
                <h3 className="font-bold text-2xl flex items-center gap-3">
                  <Wand2 className="h-6 w-6 text-purple-500" />
                  Input
                </h3>
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Enter your ${activeService.replace("-", " ")} request...`}
                  className="min-h-[250px] border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 text-base rounded-xl"
                />
                {["image-analysis", "flashcards", "math-solver", "concept-explainer", "study-guide"].includes(
                  activeService,
                ) && (
                  <div>
                    <p className="text-base font-bold mb-4 text-gray-700 dark:text-gray-300">Upload Image (optional)</p>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      {imagePreview ? (
                        <div className="space-y-6">
                          <img
                            src={imagePreview || "/placeholder.svg"}
                            alt="Selected for analysis"
                            className="max-h-60 mx-auto rounded-xl border shadow-2xl"
                          />
                          <Button
                            onClick={removeImage}
                            variant="outline"
                            size="lg"
                            className="hover:bg-red-50 hover:text-red-600 rounded-xl"
                          >
                            <Trash2 className="h-5 w-5 mr-2" />
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          size="lg"
                          className="mx-auto rounded-xl"
                        >
                          <Upload className="h-5 w-5 mr-3" />
                          Choose Image
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                <Button
                  onClick={processRequest}
                  disabled={isLoading || (!inputText.trim() && !selectedImage)}
                  className={`w-full bg-gradient-to-r ${currentService.gradient} hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 border-0 text-white font-bold py-4 text-lg rounded-xl h-14`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-6 w-6 mr-3 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <IconComponent className="h-6 w-6 mr-3" /> Generate {currentService.title}
                    </>
                  )}
                </Button>
              </div>
            </Card>

            <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
              <div className="p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-2xl flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-yellow-500" />
                    Result
                  </h3>
                  {getCurrentResult(activeService) && (
                    <div className="flex gap-3">
                      <Button
                        onClick={copyResult}
                        variant="ghost"
                        size="lg"
                        className="hover:bg-green-50 hover:text-green-600 rounded-xl"
                      >
                        <Copy className="h-5 w-5 mr-2" /> Copy
                      </Button>
                      <Button
                        onClick={clearResult}
                        variant="ghost"
                        size="lg"
                        className="hover:bg-red-50 hover:text-red-600 rounded-xl"
                      >
                        <Trash2 className="h-5 w-5 mr-2" /> Clear
                      </Button>
                    </div>
                  )}
                </div>
                {getCurrentResult(activeService) ? (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950 rounded-2xl p-8 min-h-[400px] max-h-[600px] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-inner">
                    <pre className="whitespace-pre-wrap text-base leading-relaxed">
                      {getCurrentResult(activeService)}
                    </pre>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950 rounded-2xl p-12 min-h-[400px] flex items-center justify-center border border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="relative mb-8">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                        <div className="relative p-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-2xl">
                          <FileText className="h-16 w-16 text-white" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-3">No result yet</h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md text-base">
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
    </div>
  )
}

const parseQuizContent = (content: string) => {
  const questions = []
  const lines = content.split("\n").filter((line) => line.trim())

  let currentQuestion = null
  let questionCounter = 1

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (line.match(/^Q\d+:/)) {
      if (currentQuestion) {
        questions.push(currentQuestion)
      }

      currentQuestion = {
        id: questionCounter++,
        question: line.replace(/^Q\d+:\s*/, ""),
        options: [],
        answer: "",
        explanation: "",
        type: questionType === "mixed" ? "Mixed" : questionType.toUpperCase(),
        showAnswer: false,
      }
    } else if (line.match(/^[A-D]\)/)) {
      if (currentQuestion) {
        currentQuestion.options.push(line)
      }
    } else if (line.startsWith("ANSWER:")) {
      if (currentQuestion) {
        currentQuestion.answer = line.replace("ANSWER:", "").trim()
      }
    } else if (line.startsWith("EXPLANATION:")) {
      if (currentQuestion) {
        currentQuestion.explanation = line.replace("EXPLANATION:", "").trim()
      }
    }
  }

  if (currentQuestion) {
    questions.push(currentQuestion)
  }

  return questions
}
