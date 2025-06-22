"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
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
  Code,
  Settings,
} from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import EnhancedQuizGenerator from "./enhanced-quiz-generator"

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
  const [codeResult, setCodeResult] = useState<string>("")
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: string; type: "user" | "ai"; content: string; timestamp: Date }>
  >([])
  const [chatInput, setChatInput] = useState("")

  // Enhanced Essay Writer states
  const [essayTopic, setEssayTopic] = useState("")
  const [essayWordCount, setEssayWordCount] = useState("500")
  const [essayType, setEssayType] = useState("argumentative")
  const [essayLevel, setEssayLevel] = useState("high-school")
  const [essayStyle, setEssayStyle] = useState("academic")
  const [essayRequirements, setEssayRequirements] = useState("")

  // Enhanced Code Helper states
  const [codeLanguage, setCodeLanguage] = useState("python")
  const [codeProblem, setCodeProblem] = useState("")
  const [codeLevel, setCodeLevel] = useState("beginner")
  const [codeApproach, setCodeApproach] = useState("step-by-step")
  const [codeContext, setCodeContext] = useState("")

  // Enhanced Research Assistant states
  const [researchTopic, setResearchTopic] = useState("")
  const [researchPurpose, setResearchPurpose] = useState("essay")
  const [researchLevel, setResearchLevel] = useState("undergraduate")
  const [researchScope, setResearchScope] = useState("general")
  const [researchSources, setResearchSources] = useState("academic")
  const [researchLength, setResearchLength] = useState("medium")

  // Study Guide states
  const [studyTopic, setStudyTopic] = useState("")
  const [studySubject, setStudySubject] = useState("")
  const [studyLevel, setStudyLevel] = useState("intermediate")
  const [studyFormat, setStudyFormat] = useState("comprehensive")

  // Concept Explainer states
  const [conceptTopic, setConceptTopic] = useState("")
  const [conceptSubject, setConceptSubject] = useState("")
  const [conceptLevel, setConceptLevel] = useState("beginner")
  const [conceptStyle, setConceptStyle] = useState("simple")

  // Math Solver states
  const [mathProblem, setMathProblem] = useState("")
  const [mathType, setMathType] = useState("algebra")
  const [mathLevel, setMathLevel] = useState("high-school")
  const [mathShowSteps, setMathShowSteps] = useState("detailed")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { isMobile } = useMobile()

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
      id: "quiz-generator",
      title: "Enhanced Quiz Generator",
      description: "Generate comprehensive quizzes with multiple question types and PDF export",
      icon: Brain,
      gradient: "from-purple-500 via-pink-500 to-rose-500",
      bgGradient: "from-purple-50 to-pink-50",
      darkBgGradient: "from-purple-950/50 to-pink-950/50",
      status: "available",
      badge: "Enhanced",
      badgeColor: "bg-purple-500",
      category: "Assessment",
    },
    {
      id: "essay-writer",
      title: "Advanced Essay Writer",
      description: "Generate well-structured essays with custom word counts, styles, and academic levels",
      icon: FileText,
      gradient: "from-indigo-500 via-blue-500 to-cyan-500",
      bgGradient: "from-indigo-50 to-blue-50",
      darkBgGradient: "from-indigo-950/50 to-blue-950/50",
      status: "available",
      badge: "Enhanced",
      badgeColor: "bg-indigo-500",
      category: "Writing",
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
      description: "Find credible sources and create research outlines for essays, thesis, and projects",
      icon: Search,
      gradient: "from-sky-500 via-blue-500 to-indigo-500",
      bgGradient: "from-sky-50 to-blue-50",
      darkBgGradient: "from-sky-950/50 to-blue-950/50",
      status: "available",
      badge: "Enhanced",
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
      id: "code-helper",
      title: "Code Approach Guide",
      description: "Learn programming approaches and problem-solving strategies for any language",
      icon: Code,
      gradient: "from-gray-500 via-slate-500 to-zinc-500",
      bgGradient: "from-gray-50 to-slate-50",
      darkBgGradient: "from-gray-950/50 to-slate-950/50",
      status: "available",
      badge: "Enhanced",
      badgeColor: "bg-gray-500",
      category: "STEM",
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
  ]

  const categories = [
    "All",
    "Interactive",
    "Assessment",
    "Writing",
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
    let enhancedPrompt = ""
    let hasRequiredInput = false

    // Create service-specific prompts with validation
    if (activeService === "essay-writer") {
      if (!essayTopic.trim()) {
        toast({
          title: "Topic Required",
          description: "Please enter an essay topic.",
          variant: "destructive",
        })
        return
      }
      hasRequiredInput = true
      enhancedPrompt = `WRITE COMPLETE ${essayType.toUpperCase()} ESSAY - EXACTLY ${essayWordCount} WORDS

Topic: "${essayTopic}"
Academic Level: ${essayLevel}
Writing Style: ${essayStyle}
Word Count: ${essayWordCount} words
${essayRequirements ? `Special Requirements: ${essayRequirements}` : ""}

Write a complete academic essay with:
- Engaging title
- Strong introduction with clear thesis statement
- Well-developed body paragraphs with examples and evidence
- Logical transitions between paragraphs
- Compelling conclusion that reinforces the thesis
- Exactly ${essayWordCount} words

Write the full essay, not advice about writing.`
    } else if (activeService === "code-helper") {
      if (!codeProblem.trim()) {
        toast({
          title: "Problem Required",
          description: "Please describe your coding problem or challenge.",
          variant: "destructive",
        })
        return
      }
      hasRequiredInput = true
      enhancedPrompt = `CODING APPROACH GUIDE - ${codeLanguage.toUpperCase()}

Problem: ${codeProblem}
Programming Language: ${codeLanguage}
Experience Level: ${codeLevel}
Approach Style: ${codeApproach}
${codeContext ? `Additional Context: ${codeContext}` : ""}

Provide a comprehensive approach guide including:
1. PROBLEM ANALYSIS
   - Break down the problem into smaller parts
   - Identify key requirements and constraints
   - Determine input/output specifications

2. SOLUTION STRATEGY
   - Recommend the best approach/algorithm
   - Explain why this approach is suitable
   - Discuss time and space complexity

3. STEP-BY-STEP IMPLEMENTATION PLAN
   - Outline the logical steps to solve the problem
   - Suggest data structures to use
   - Identify potential edge cases

4. CODING BEST PRACTICES
   - ${codeLanguage} specific conventions
   - Error handling strategies
   - Code organization tips

5. TESTING APPROACH
   - How to test your solution
   - Sample test cases to consider
   - Debugging strategies

Focus on teaching problem-solving methodology, not just providing code.`
    } else if (activeService === "research-assistant") {
      if (!researchTopic.trim()) {
        toast({
          title: "Topic Required",
          description: "Please enter a research topic.",
          variant: "destructive",
        })
        return
      }
      hasRequiredInput = true
      enhancedPrompt = `RESEARCH ASSISTANT - ${researchPurpose.toUpperCase()}

Research Topic: "${researchTopic}"
Purpose: ${researchPurpose}
Academic Level: ${researchLevel}
Research Scope: ${researchScope}
Source Type: ${researchSources}
Depth: ${researchLength}

Provide a comprehensive research guide including:

1. RESEARCH OUTLINE
   - Main research questions to explore
   - Key subtopics and themes
   - Suggested research methodology

2. SOURCE RECOMMENDATIONS
   - Types of sources to look for (books, journals, websites)
   - Specific databases and search terms
   - Key authors and experts in this field

3. RESEARCH STRUCTURE
   ${
     researchPurpose === "thesis"
       ? "- Thesis chapter breakdown\n   - Literature review approach\n   - Methodology suggestions"
       : researchPurpose === "essay"
         ? "- Essay structure outline\n   - Argument development strategy\n   - Evidence organization"
         : "- General research organization\n   - Information categorization\n   - Analysis framework"
   }

4. CRITICAL ANALYSIS FRAMEWORK
   - Questions to ask about sources
   - How to evaluate credibility
   - Identifying bias and limitations

5. CITATION AND DOCUMENTATION
   - Proper citation formats
   - Note-taking strategies
   - Source organization tips

Focus on providing research methodology and guidance, not just information.`
    } else if (activeService === "study-guide") {
      if (!studyTopic.trim()) {
        toast({
          title: "Topic Required",
          description: "Please enter a study topic.",
          variant: "destructive",
        })
        return
      }
      hasRequiredInput = true
      enhancedPrompt = `COMPREHENSIVE STUDY GUIDE

Topic: ${studyTopic}
Subject: ${studySubject}
Level: ${studyLevel}
Format: ${studyFormat}

Create a structured study guide with:

1. TOPIC OVERVIEW
   • Main concepts and definitions
   • Key terminology with explanations
   • Important dates, figures, or formulas

2. DETAILED BREAKDOWN
   • Core principles and theories
   • Step-by-step processes
   • Examples and applications

3. STUDY STRATEGIES
   • Memory techniques and mnemonics
   • Visual aids and diagrams suggestions
   • Practice methods

4. SELF-ASSESSMENT
   • Review questions
   • Practice problems
   • Key points checklist

5. EXAM PREPARATION
   • Likely exam topics
   • Study schedule suggestions
   • Last-minute review tips

Format as organized sections with bullet points, NOT essay paragraphs.`
    } else if (activeService === "concept-explainer") {
      if (!conceptTopic.trim()) {
        toast({
          title: "Concept Required",
          description: "Please enter a concept to explain.",
          variant: "destructive",
        })
        return
      }
      hasRequiredInput = true
      enhancedPrompt = `CONCEPT EXPLANATION - ${conceptLevel.toUpperCase()} LEVEL

Concept: ${conceptTopic}
Subject Area: ${conceptSubject}
Explanation Level: ${conceptLevel}
Style: ${conceptStyle}

Provide a clear explanation including:

1. SIMPLE DEFINITION
   • What is this concept in plain language?
   • Why is it important?

2. DETAILED EXPLANATION
   • How does it work?
   • What are the key components?
   • Step-by-step breakdown if applicable

3. REAL-WORLD EXAMPLES
   • Practical applications
   • Analogies and comparisons
   • Everyday examples

4. COMMON MISCONCEPTIONS
   • What people often get wrong
   • Clarifications and corrections

5. CONNECTIONS
   • How it relates to other concepts
   • Prerequisites to understand
   • What builds upon this concept

6. MEMORY AIDS
   • Mnemonics or memory tricks
   • Visual representation suggestions
   • Key phrases to remember

Use ${conceptStyle} language appropriate for ${conceptLevel} level understanding.`
    } else if (activeService === "math-solver") {
      if (!mathProblem.trim()) {
        toast({
          title: "Problem Required",
          description: "Please enter a math problem to solve.",
          variant: "destructive",
        })
        return
      }
      hasRequiredInput = true
      enhancedPrompt = `MATH PROBLEM SOLVER - ${mathType.toUpperCase()}

Problem: ${mathProblem}
Math Type: ${mathType}
Level: ${mathLevel}
Show Steps: ${mathShowSteps}

Provide a complete solution including:

1. PROBLEM ANALYSIS
   • Identify what type of problem this is
   • What information is given?
   • What are we trying to find?

2. SOLUTION APPROACH
   • Which method/formula to use
   • Why this approach is best
   • Any prerequisites or assumptions

3. ${mathShowSteps === "detailed" ? "DETAILED" : "STEP-BY-STEP"} SOLUTION
   • Show each calculation step
   • Explain the reasoning for each step
   • Highlight key mathematical operations

4. FINAL ANSWER
   • Clear, highlighted final result
   • Units if applicable
   • Verification if possible

5. RELATED CONCEPTS
   • Formulas used
   • Similar problem types
   • Common mistakes to avoid

Show all mathematical work clearly, not just the final answer.`
    } else {
      if (!inputText.trim() && !selectedImage) {
        toast({
          title: "Input Required",
          description: "Please provide text input or select an image.",
          variant: "destructive",
        })
        return
      }
      hasRequiredInput = true
      enhancedPrompt = inputText
    }

    if (!hasRequiredInput) return

    setIsLoading(true)
    const setServiceResult = getResultSetter(activeService)
    setServiceResult("")

    try {
      let response
      const endpoint = "/api/ai-chat"

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
      case "code-helper":
        return setCodeResult
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
      case "code-helper":
        return codeResult
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
    // Clear all form fields
    setInputText("")
    setEssayTopic("")
    setCodeProblem("")
    setResearchTopic("")
    setStudyTopic("")
    setConceptTopic("")
    setMathProblem("")
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
        <div className="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Header Section */}
          <div className="text-center space-y-8">
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-3xl opacity-75 animate-pulse"></div>
                <div className="relative p-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-2xl">
                  <GraduationCap className="h-16 w-16 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AI Services Hub
                </h1>
                <div className="flex items-center justify-center gap-4 mt-4">
                  <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
                  <span className="text-2xl text-gray-600 dark:text-gray-300 font-medium">Powered by Advanced AI</span>
                  <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
                </div>
              </div>
            </div>
            <p className="text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Transform your learning experience with cutting-edge AI tools designed specifically for students. From
              essay writing to quiz generation, we've got everything you need to excel.
            </p>
            <div className="flex items-center justify-center gap-8 text-lg text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-3 px-6 py-3 bg-white/50 dark:bg-slate-900/50 rounded-full backdrop-blur-sm">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span>Lightning Fast</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-white/50 dark:bg-slate-900/50 rounded-full backdrop-blur-sm">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>Premium Quality</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-white/50 dark:bg-slate-900/50 rounded-full backdrop-blur-sm">
                <Rocket className="h-5 w-5 text-yellow-500" />
                <span>Always Improving</span>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`px-8 py-3 rounded-full transition-all duration-300 text-lg font-semibold ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105"
                    : "bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-900/80 hover:scale-105"
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
                  className={`group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 ${
                    isDisabled ? "opacity-70" : "cursor-pointer hover:scale-105"
                  } bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm h-full`}
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
                        className={`px-4 py-2 ${service.badgeColor} text-white text-sm font-bold rounded-full flex items-center gap-2 shadow-lg`}
                      >
                        <Wand2 className="h-4 w-4" />
                        {service.badge}
                      </div>
                      {isDisabled && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                          Coming Soon
                        </div>
                      )}
                    </div>

                    {/* Icon */}
                    <div className="flex items-center justify-center">
                      <div
                        className={`relative p-6 bg-gradient-to-r ${service.gradient} rounded-3xl group-hover:scale-110 transition-transform duration-300 shadow-2xl`}
                      >
                        <IconComponent className="h-12 w-12 text-white" />
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-3xl transition-opacity duration-300"></div>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="text-center space-y-4 flex-1">
                      <h3 className="font-bold text-2xl text-gray-900 dark:text-white group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4">
                      <Button
                        className={`w-full bg-gradient-to-r ${service.gradient} hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 border-0 text-white font-semibold py-4 text-lg ${
                          isDisabled ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={isDisabled}
                      >
                        {isDisabled ? (
                          <>
                            <FlaskConical className="h-5 w-5 mr-2" />
                            Coming Soon
                          </>
                        ) : (
                          <>
                            Get Started
                            <Sparkles className="h-5 w-5 ml-2" />
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
          <div className="text-center pt-16">
            <div className="inline-flex items-center gap-16 px-12 py-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-3xl border border-white/30 dark:border-slate-700/30 shadow-xl">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  12+
                </div>
                <div className="text-lg text-gray-600 dark:text-gray-400 font-medium">AI Tools</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  24/7
                </div>
                <div className="text-lg text-gray-600 dark:text-gray-400 font-medium">Available</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
                  ∞
                </div>
                <div className="text-lg text-gray-600 dark:text-gray-400 font-medium">Possibilities</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentService = services.find((s) => s.id === activeService)!
  const IconComponent = currentService.icon

  // Special handling for quiz generator
  if (activeService === "quiz-generator") {
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
              <ArrowLeft className="h-4 w-4" /> Back to AI Services
            </Button>
          </div>

          <EnhancedQuizGenerator user={user} onAddQuiz={(quiz) => console.log("Quiz created:", quiz)} />
        </div>
      </div>
    )
  }

  // Render the active service interface for other services
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
            <ArrowLeft className="h-4 w-4" /> Back to AI Services
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

        {/* Enhanced Essay Writer Interface */}
        {activeService === "essay-writer" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Settings className="h-6 w-6 text-indigo-500" />
                  Essay Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="essayTopic" className="text-base font-semibold">
                    Essay Topic *
                  </Label>
                  <Textarea
                    id="essayTopic"
                    value={essayTopic}
                    onChange={(e) => setEssayTopic(e.target.value)}
                    placeholder="Enter your essay topic or question..."
                    className="min-h-[100px] border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 text-base rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Word Count</Label>
                    <Select value={essayWordCount} onValueChange={setEssayWordCount}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="250">250 words</SelectItem>
                        <SelectItem value="500">500 words</SelectItem>
                        <SelectItem value="750">750 words</SelectItem>
                        <SelectItem value="1000">1000 words</SelectItem>
                        <SelectItem value="1500">1500 words</SelectItem>
                        <SelectItem value="2000">2000 words</SelectItem>
                        <SelectItem value="2500">2500 words</SelectItem>
                        <SelectItem value="3000">3000 words</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Essay Type</Label>
                    <Select value={essayType} onValueChange={setEssayType}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="argumentative">Argumentative</SelectItem>
                        <SelectItem value="persuasive">Persuasive</SelectItem>
                        <SelectItem value="expository">Expository</SelectItem>
                        <SelectItem value="descriptive">Descriptive</SelectItem>
                        <SelectItem value="narrative">Narrative</SelectItem>
                        <SelectItem value="compare-contrast">Compare & Contrast</SelectItem>
                        <SelectItem value="cause-effect">Cause & Effect</SelectItem>
                        <SelectItem value="analytical">Analytical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Academic Level</Label>
                    <Select value={essayLevel} onValueChange={setEssayLevel}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="middle-school">Middle School</SelectItem>
                        <SelectItem value="high-school">High School</SelectItem>
                        <SelectItem value="undergraduate">Undergraduate</SelectItem>
                        <SelectItem value="graduate">Graduate</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Writing Style</Label>
                    <Select value={essayStyle} onValueChange={setEssayStyle}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="informal">Informal</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                        <SelectItem value="journalistic">Journalistic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="essayRequirements" className="text-base font-semibold">
                    Special Requirements (Optional)
                  </Label>
                  <Textarea
                    id="essayRequirements"
                    value={essayRequirements}
                    onChange={(e) => setEssayRequirements(e.target.value)}
                    placeholder="Any specific requirements, citations needed, format preferences..."
                    className="min-h-[80px] border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 text-base rounded-xl"
                  />
                </div>

                <Button
                  onClick={processRequest}
                  disabled={isLoading || !essayTopic.trim()}
                  className={`w-full bg-gradient-to-r ${currentService.gradient} hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 border-0 text-white font-bold py-4 text-lg rounded-xl h-14`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-6 w-6 mr-3 animate-spin" /> Writing Essay...
                    </>
                  ) : (
                    <>
                      <FileText className="h-6 w-6 mr-3" /> Generate {essayWordCount}-Word Essay
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-yellow-500" />
                    Generated Essay
                  </CardTitle>
                  {essayResult && (
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
              </CardHeader>
              <CardContent>
                {essayResult ? (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950 rounded-2xl p-8 min-h-[500px] max-h-[700px] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-inner">
                    <div className="prose prose-lg max-w-none">
                      <pre className="whitespace-pre-wrap text-base leading-relaxed font-serif">{essayResult}</pre>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950 rounded-2xl p-12 min-h-[500px] flex items-center justify-center border border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="relative mb-8">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                        <div className="relative p-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full shadow-2xl">
                          <FileText className="h-16 w-16 text-white" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-3">Ready to write</h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md text-base">
                        Configure your essay settings and click generate to create your custom essay.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Code Helper Interface */}
        {activeService === "code-helper" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Settings className="h-6 w-6 text-gray-500" />
                  Coding Problem Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="codeProblem" className="text-base font-semibold">
                    Describe Your Coding Problem *
                  </Label>
                  <Textarea
                    id="codeProblem"
                    value={codeProblem}
                    onChange={(e) => setCodeProblem(e.target.value)}
                    placeholder="Describe the coding problem you're trying to solve, what you're trying to build, or the concept you need help understanding..."
                    className="min-h-[120px] border-gray-200 dark:border-gray-700 focus:border-gray-500 focus:ring-gray-500 text-base rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Programming Language</Label>
                    <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="typescript">TypeScript</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                        <SelectItem value="c">C</SelectItem>
                        <SelectItem value="csharp">C#</SelectItem>
                        <SelectItem value="go">Go</SelectItem>
                        <SelectItem value="rust">Rust</SelectItem>
                        <SelectItem value="php">PHP</SelectItem>
                        <SelectItem value="ruby">Ruby</SelectItem>
                        <SelectItem value="swift">Swift</SelectItem>
                        <SelectItem value="kotlin">Kotlin</SelectItem>
                        <SelectItem value="sql">SQL</SelectItem>
                        <SelectItem value="html-css">HTML/CSS</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Experience Level</Label>
                    <Select value={codeLevel} onValueChange={setCodeLevel}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">Approach Style</Label>
                  <Select value={codeApproach} onValueChange={setCodeApproach}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="step-by-step">Step-by-Step Breakdown</SelectItem>
                      <SelectItem value="conceptual">Conceptual Understanding</SelectItem>
                      <SelectItem value="algorithmic">Algorithm Design</SelectItem>
                      <SelectItem value="debugging">Debugging Strategy</SelectItem>
                      <SelectItem value="optimization">Performance Optimization</SelectItem>
                      <SelectItem value="best-practices">Best Practices</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="codeContext" className="text-base font-semibold">
                    Additional Context (Optional)
                  </Label>
                  <Textarea
                    id="codeContext"
                    value={codeContext}
                    onChange={(e) => setCodeContext(e.target.value)}
                    placeholder="Any additional context, constraints, or specific requirements..."
                    className="min-h-[80px] border-gray-200 dark:border-gray-700 focus:border-gray-500 focus:ring-gray-500 text-base rounded-xl"
                  />
                </div>

                <Button
                  onClick={processRequest}
                  disabled={isLoading || !codeProblem.trim()}
                  className={`w-full bg-gradient-to-r ${currentService.gradient} hover:shadow-2xl hover:shadow-gray-500/25 transition-all duration-300 border-0 text-white font-bold py-4 text-lg rounded-xl h-14`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-6 w-6 mr-3 animate-spin" /> Analyzing Problem...
                    </>
                  ) : (
                    <>
                      <Code className="h-6 w-6 mr-3" /> Get Coding Approach
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-yellow-500" />
                    Approach Guide
                  </CardTitle>
                  {codeResult && (
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
              </CardHeader>
              <CardContent>
                {codeResult ? (
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900 dark:to-slate-950 rounded-2xl p-8 min-h-[500px] max-h-[700px] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-inner">
                    <div className="prose prose-lg max-w-none dark:prose-invert">
                      <div
                        className="text-gray-800 dark:text-gray-200 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: codeResult
                            .replace(
                              /\*\*(.*?)\*\*/g,
                              '<strong class="text-gray-900 dark:text-white font-bold">$1</strong>',
                            )
                            .replace(
                              /## (.*?)(?=\n|$)/g,
                              '<h2 class="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4 pb-2 border-b-2 border-gray-200 dark:border-gray-700">$1</h2>',
                            )
                            .replace(
                              /### (.*?)(?=\n|$)/g,
                              '<h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">$1</h3>',
                            )
                            .replace(
                              /#### (.*?)(?=\n|$)/g,
                              '<h4 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-2">$1</h4>',
                            )
                            .replace(/^\* (.*?)$/gm, '<li class="ml-4 mb-2 text-gray-700 dark:text-gray-300">• $1</li>')
                            .replace(
                              /^(\d+)\. (.*?)$/gm,
                              '<li class="ml-4 mb-2 text-gray-700 dark:text-gray-300"><span class="font-semibold text-blue-600 dark:text-blue-400">$1.</span> $2</li>',
                            )
                            .replace(
                              /`([^`]+)`/g,
                              '<code class="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-blue-600 dark:text-blue-400">$1</code>',
                            )
                            .replace(/\n\n/g, "<br><br>")
                            .replace(/\n/g, "<br>"),
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900 dark:to-slate-950 rounded-2xl p-12 min-h-[500px] flex items-center justify-center border border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="relative mb-8">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-slate-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                        <div className="relative p-8 bg-gradient-to-r from-gray-500 to-slate-500 rounded-full shadow-2xl">
                          <Code className="h-16 w-16 text-white" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-3">Ready to help</h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md text-base">
                        Describe your coding problem and get a comprehensive approach guide.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Research Assistant Interface */}
        {activeService === "research-assistant" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Settings className="h-6 w-6 text-sky-500" />
                  Research Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="researchTopic" className="text-base font-semibold">
                    Research Topic *
                  </Label>
                  <Textarea
                    id="researchTopic"
                    value={researchTopic}
                    onChange={(e) => setResearchTopic(e.target.value)}
                    placeholder="Enter your research topic or question..."
                    className="min-h-[100px] border-gray-200 dark:border-gray-700 focus:border-sky-500 focus:ring-sky-500 text-base rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Research Purpose</Label>
                    <Select value={researchPurpose} onValueChange={setResearchPurpose}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="essay">Essay Writing</SelectItem>
                        <SelectItem value="thesis">Thesis/Dissertation</SelectItem>
                        <SelectItem value="research-paper">Research Paper</SelectItem>
                        <SelectItem value="presentation">Presentation</SelectItem>
                        <SelectItem value="project">Class Project</SelectItem>
                        <SelectItem value="literature-review">Literature Review</SelectItem>
                        <SelectItem value="case-study">Case Study</SelectItem>
                        <SelectItem value="general">General Knowledge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Academic Level</Label>
                    <Select value={researchLevel} onValueChange={setResearchLevel}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high-school">High School</SelectItem>
                        <SelectItem value="undergraduate">Undergraduate</SelectItem>
                        <SelectItem value="graduate">Graduate</SelectItem>
                        <SelectItem value="doctoral">Doctoral</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Research Scope</Label>
                    <Select value={researchScope} onValueChange={setResearchScope}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Overview</SelectItem>
                        <SelectItem value="focused">Focused Analysis</SelectItem>
                        <SelectItem value="comprehensive">Comprehensive Study</SelectItem>
                        <SelectItem value="comparative">Comparative Analysis</SelectItem>
                        <SelectItem value="historical">Historical Perspective</SelectItem>
                        <SelectItem value="current">Current Trends</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Source Types</Label>
                    <Select value={researchSources} onValueChange={setResearchSources}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">Academic Sources</SelectItem>
                        <SelectItem value="mixed">Mixed Sources</SelectItem>
                        <SelectItem value="primary">Primary Sources</SelectItem>
                        <SelectItem value="secondary">Secondary Sources</SelectItem>
                        <SelectItem value="contemporary">Contemporary Sources</SelectItem>
                        <SelectItem value="historical">Historical Sources</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">Research Depth</Label>
                  <Select value={researchLength} onValueChange={setResearchLength}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brief">Brief Overview</SelectItem>
                      <SelectItem value="medium">Medium Depth</SelectItem>
                      <SelectItem value="detailed">Detailed Analysis</SelectItem>
                      <SelectItem value="extensive">Extensive Research</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={processRequest}
                  disabled={isLoading || !researchTopic.trim()}
                  className={`w-full bg-gradient-to-r ${currentService.gradient} hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 border-0 text-white font-bold py-4 text-lg rounded-xl h-14`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-6 w-6 mr-3 animate-spin" /> Researching...
                    </>
                  ) : (
                    <>
                      <Search className="h-6 w-6 mr-3" /> Generate Research Guide
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-yellow-500" />
                    Research Guide
                  </CardTitle>
                  {researchResult && (
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
              </CardHeader>
              <CardContent>
                {researchResult ? (
                  <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900 dark:to-blue-950 rounded-2xl p-8 min-h-[500px] max-h-[700px] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-inner">
                    <pre className="whitespace-pre-wrap text-base leading-relaxed">{researchResult}</pre>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900 dark:to-blue-950 rounded-2xl p-12 min-h-[500px] flex items-center justify-center border border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="relative mb-8">
                        <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                        <div className="relative p-8 bg-gradient-to-r from-sky-500 to-blue-500 rounded-full shadow-2xl">
                          <Search className="h-16 w-16 text-white" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-3">Ready to research</h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md text-base">
                        Configure your research parameters and get a comprehensive research guide.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Default interface for other services */}
        {!["chat", "essay-writer", "code-helper", "research-assistant"].includes(activeService) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Wand2 className="h-6 w-6 text-purple-500" />
                  Input
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Enter your ${activeService?.replace("-", " ")} request...`}
                  className="min-h-[250px] border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 text-base rounded-xl"
                />
                {["image-analysis", "flashcards", "math-solver", "concept-explainer", "study-guide"].includes(
                  activeService || "",
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
              </CardContent>
            </Card>

            <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-yellow-500" />
                    Result
                  </CardTitle>
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
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
