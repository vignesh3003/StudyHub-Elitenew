"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  PenTool,
  Calculator,
  Languages,
  FileText,
  Lightbulb,
  Target,
  CheckCircle,
  TrendingUp,
  Loader2,
  ImageIcon,
  Upload,
  X,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AIService {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: string
  status: "available" | "coming-soon" | "beta"
}

const aiServices: AIService[] = [
  {
    id: "essay-writer",
    name: "Essay Writer",
    description: "Generate well-structured essays on any topic with proper citations",
    icon: <PenTool className="h-6 w-6" />,
    category: "writing",
    status: "available",
  },
  {
    id: "math-solver",
    name: "Math Problem Solver",
    description: "Solve complex mathematical problems with step-by-step explanations",
    icon: <Calculator className="h-6 w-6" />,
    category: "math",
    status: "available",
  },
  {
    id: "language-tutor",
    name: "Language Tutor",
    description: "Practice conversations and learn new languages with AI",
    icon: <Languages className="h-6 w-6" />,
    category: "language",
    status: "coming-soon",
  },
  {
    id: "research-assistant",
    name: "Research Assistant",
    description: "Find credible sources and summarize research papers",
    icon: <FileText className="h-6 w-6" />,
    category: "research",
    status: "available",
  },
  {
    id: "concept-explainer",
    name: "Concept Explainer",
    description: "Break down complex concepts into simple, understandable explanations",
    icon: <Lightbulb className="h-6 w-6" />,
    category: "learning",
    status: "available",
  },
  {
    id: "study-planner",
    name: "Smart Study Planner",
    description: "Create personalized study schedules based on your goals and deadlines",
    icon: <Target className="h-6 w-6" />,
    category: "planning",
    status: "available",
  },
  {
    id: "quiz-generator",
    name: "Quiz Generator",
    description: "Generate practice quizzes from your study materials",
    icon: <CheckCircle className="h-6 w-6" />,
    category: "testing",
    status: "available",
  },
  {
    id: "presentation-maker",
    name: "Presentation Maker",
    description: "Create engaging presentations with AI-generated content and design",
    icon: <TrendingUp className="h-6 w-6" />,
    category: "presentation",
    status: "coming-soon",
  },
]

export default function AIServicesHub() {
  const [activeService, setActiveService] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string>("")
  const { toast } = useToast()

  // Form states for different services
  const [essayTopic, setEssayTopic] = useState("")
  const [essayLength, setEssayLength] = useState("500")
  const [mathProblem, setMathProblem] = useState("")
  const [researchTopic, setResearchTopic] = useState("")
  const [conceptToExplain, setConceptToExplain] = useState("")
  const [studySubjects, setStudySubjects] = useState("")
  const [studyDeadline, setStudyDeadline] = useState("")

  // Additional form states for enhanced services
  const [mathImage, setMathImage] = useState<File | null>(null)
  const [mathImagePreview, setMathImagePreview] = useState("")
  const [studyTopics, setStudyTopics] = useState("")
  const [studyGoal, setStudyGoal] = useState("")
  const [subject, setSubject] = useState("")
  const [explanationLevel, setExplanationLevel] = useState("intermediate")
  const [researchPurpose, setResearchPurpose] = useState("essay")
  const [quizQuestions, setQuizQuestions] = useState("10")

  const handleServiceAction = async (serviceId: string) => {
    setIsLoading(true)
    setResult("")

    try {
      let prompt = ""
      let requestData = {}

      switch (serviceId) {
        case "essay-writer":
          prompt = `Write a well-structured ${essayLength}-word essay on the topic: "${essayTopic}". Include an introduction, body paragraphs with supporting arguments, and a conclusion. Use proper academic formatting and include relevant examples.`
          requestData = { topic: essayTopic, length: essayLength }
          break

        case "math-solver":
          if (mathImage) {
            // Create FormData for image upload
            const formData = new FormData()
            formData.append("image", mathImage)
            formData.append(
              "message",
              "Solve this mathematical problem from the uploaded image. Provide detailed step-by-step explanations and show all work clearly.",
            )

            // Call the AI chat API with image
            const response = await fetch("/api/ai-chat", {
              method: "POST",
              body: formData,
            })

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()

            if (data.success) {
              setResult(data.response)
              toast({
                title: "✨ Math Problem Solved!",
                description: "Your uploaded math problem has been analyzed and solved.",
              })
            } else {
              throw new Error(data.error || "Failed to process image")
            }
            return // Exit early for image processing
          } else {
            prompt = `Solve this mathematical problem step by step: ${mathProblem}. Provide detailed explanations for each step and show all work clearly.`
            requestData = { problem: mathProblem }
          }
          break

        case "research-assistant":
          prompt = `Help me research the topic: "${researchTopic}" in the subject area of "${subject}". This research is for a ${researchPurpose}. Provide key points to investigate, suggest credible sources, and outline the main areas of study for this topic.`
          requestData = { topic: researchTopic, subject, purpose: researchPurpose }
          break

        case "concept-explainer":
          prompt = `Explain the concept "${conceptToExplain}" in the field of "${subject}" at a ${explanationLevel} level. Break it down into key components, provide examples, and explain why it's important.`
          requestData = { concept: conceptToExplain, subject, level: explanationLevel }
          break

        case "study-planner":
          prompt = `Create a personalized study plan for these subjects: ${studySubjects}. ${studyTopics ? `Focus on these specific topics: ${studyTopics}.` : ""} The deadline is: ${studyDeadline}. ${studyGoal ? `The study goal is: ${studyGoal}.` : ""} Include daily schedules, milestones, and study techniques for each subject.`
          requestData = { subjects: studySubjects, topics: studyTopics, deadline: studyDeadline, goal: studyGoal }
          break

        case "quiz-generator":
          prompt = `Generate a ${quizQuestions}-question quiz on the subject "${subject}" focusing on the topic: "${researchTopic}". Include multiple choice, true/false, and short answer questions with correct answers provided.`
          requestData = { subject, topic: researchTopic, questions: quizQuestions }
          break

        default:
          throw new Error("Service not implemented yet")
      }

      // Only call the regular AI API if we haven't already processed an image
      if (activeService !== "math-solver" || !mathImage) {
        // Call the AI API
        const response = await fetch("/api/ai-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: prompt,
            context: {
              service: serviceId,
              ...requestData,
            },
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          setResult(data.response)
          toast({
            title: "✨ AI Service Complete!",
            description: `Your ${aiServices.find((s) => s.id === serviceId)?.name} request has been processed.`,
          })
        } else {
          throw new Error(data.error || "Failed to process request")
        }
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

  const renderServiceForm = (service: AIService) => {
    switch (service.id) {
      case "essay-writer":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Essay Topic</label>
              <Textarea
                placeholder="Enter your essay topic or question..."
                value={essayTopic}
                onChange={(e) => setEssayTopic(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Word Count</label>
              <Select value={essayLength} onValueChange={setEssayLength}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="250">250 words</SelectItem>
                  <SelectItem value="500">500 words</SelectItem>
                  <SelectItem value="750">750 words</SelectItem>
                  <SelectItem value="1000">1000 words</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => handleServiceAction("essay-writer")}
              disabled={!essayTopic || isLoading}
              className="w-full"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PenTool className="h-4 w-4 mr-2" />}
              Generate Essay
            </Button>
          </div>
        )

      case "math-solver":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Math Problem</label>
              <Textarea
                placeholder="Enter your mathematical problem or equation..."
                value={mathProblem}
                onChange={(e) => setMathProblem(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium mb-2 block">Or Upload an Image</label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setMathImage(e.target.files[0])
                      // Optional: Show image preview
                      setMathImagePreview(URL.createObjectURL(e.target.files[0]))
                    }
                  }}
                  className="hidden"
                  id="math-image-upload"
                />
                {mathImagePreview ? (
                  <div className="relative w-full max-w-md mx-auto h-48 mb-2">
                    <img
                      src={mathImagePreview || "/placeholder.svg"}
                      alt="Math problem"
                      className="w-full h-full object-contain"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full"
                      onClick={() => {
                        setMathImage(null)
                        setMathImagePreview("")
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-2">Upload an image of your math problem</p>
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById("math-image-upload")?.click()}
                      className="mx-auto"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Image
                    </Button>
                  </>
                )}
              </div>
            </div>
            <Button
              onClick={() => handleServiceAction("math-solver")}
              disabled={(!mathProblem && !mathImage) || isLoading}
              className="w-full"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Calculator className="h-4 w-4 mr-2" />}
              Solve Problem
            </Button>
          </div>
        )

      case "research-assistant":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Research Subject</label>
              <Input
                placeholder="Enter the general subject area..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Specific Research Topic</label>
              <Input
                placeholder="Enter your specific research topic..."
                value={researchTopic}
                onChange={(e) => setResearchTopic(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Research Purpose</label>
              <Select value={researchPurpose} onValueChange={setResearchPurpose}>
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
              onClick={() => handleServiceAction("research-assistant")}
              disabled={!researchTopic || !subject || isLoading}
              className="w-full"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
              Start Research
            </Button>
          </div>
        )

      case "concept-explainer":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Subject Area</label>
              <Input
                placeholder="Enter the subject area (e.g., Physics, Economics)..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Concept to Explain</label>
              <Input
                placeholder="Enter a specific concept you want explained..."
                value={conceptToExplain}
                onChange={(e) => setConceptToExplain(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Explanation Level</label>
              <Select value={explanationLevel} onValueChange={setExplanationLevel}>
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
              onClick={() => handleServiceAction("concept-explainer")}
              disabled={!conceptToExplain || !subject || isLoading}
              className="w-full"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lightbulb className="h-4 w-4 mr-2" />}
              Explain Concept
            </Button>
          </div>
        )

      case "study-planner":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Subjects to Study</label>
              <Input
                placeholder="e.g., Mathematics, Biology, History"
                value={studySubjects}
                onChange={(e) => setStudySubjects(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Specific Topics (Optional)</label>
              <Textarea
                placeholder="e.g., Calculus: Derivatives and Integrals, Biology: Cell Structure, History: World War II"
                value={studyTopics}
                onChange={(e) => setStudyTopics(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Study Deadline</label>
              <Input type="date" value={studyDeadline} onChange={(e) => setStudyDeadline(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Study Goal</label>
              <Input
                placeholder="e.g., Prepare for final exam, Master the basics, etc."
                value={studyGoal}
                onChange={(e) => setStudyGoal(e.target.value)}
              />
            </div>
            <Button
              onClick={() => handleServiceAction("study-planner")}
              disabled={!studySubjects || !studyDeadline || isLoading}
              className="w-full"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Target className="h-4 w-4 mr-2" />}
              Create Study Plan
            </Button>
          </div>
        )

      case "quiz-generator":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Input
                placeholder="Enter the subject (e.g., Biology, History)..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Specific Topic</label>
              <Input
                placeholder="Enter the specific topic for your quiz..."
                value={researchTopic}
                onChange={(e) => setResearchTopic(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Number of Questions</label>
              <Select value={quizQuestions} onValueChange={setQuizQuestions}>
                <SelectTrigger>
                  <SelectValue />
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
              onClick={() => handleServiceAction("quiz-generator")}
              disabled={!researchTopic || !subject || isLoading}
              className="w-full"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Generate Quiz
            </Button>
          </div>
        )

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">This service is coming soon!</p>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Services Hub
              </span>
              <p className="text-sm text-gray-600 font-normal mt-1">
                Powerful AI tools to enhance your learning experience
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {aiServices.map((service) => (
          <Card
            key={service.id}
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
              activeService === service.id ? "ring-2 ring-blue-500 shadow-lg" : ""
            } ${service.status === "coming-soon" ? "opacity-60" : ""}`}
            onClick={() => service.status !== "coming-soon" && setActiveService(service.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg text-white">
                    {service.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <Badge
                      variant={
                        service.status === "available" ? "default" : service.status === "beta" ? "secondary" : "outline"
                      }
                      className="mt-1"
                    >
                      {service.status === "available"
                        ? "Available"
                        : service.status === "beta"
                          ? "Beta"
                          : "Coming Soon"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{service.description}</p>
              {activeService === service.id && service.status !== "coming-soon" && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">{renderServiceForm(service)}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Service-specific result display */}
          {activeService === "essay-writer" && (
            <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200/50 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
              <CardHeader className="relative border-b border-blue-200/50 bg-white/50 backdrop-blur-sm">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                    <PenTool className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold">
                      Your Essay
                    </span>
                    <p className="text-sm text-blue-600/70 font-normal mt-1">Ready for review and submission</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative p-8">
                <div className="prose prose-lg max-w-none">
                  <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-blue-200/50 shadow-xl">
                    <pre className="whitespace-pre-wrap font-serif text-gray-800 leading-relaxed text-lg">{result}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeService === "math-solver" && (
            <Card className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-emerald-200/50 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5"></div>
              <CardHeader className="relative border-b border-emerald-200/50 bg-white/50 backdrop-blur-sm">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                    <Calculator className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent font-bold">
                      Solution
                    </span>
                    <p className="text-sm text-emerald-600/70 font-normal mt-1">Step-by-step mathematical solution</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative p-8">
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-emerald-200/50 shadow-xl">
                  <pre className="whitespace-pre-wrap font-mono text-gray-800 leading-relaxed text-base">{result}</pre>
                </div>
              </CardContent>
            </Card>
          )}

          {activeService === "research-assistant" && (
            <Card className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-orange-200/50 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-yellow-500/5"></div>
              <CardHeader className="relative border-b border-orange-200/50 bg-white/50 backdrop-blur-sm">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl shadow-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent font-bold">
                      Research Guide
                    </span>
                    <p className="text-sm text-orange-600/70 font-normal mt-1">Comprehensive research roadmap</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative p-8">
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-orange-200/50 shadow-xl">
                  <div className="prose prose-lg max-w-none">
                    <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed text-base">{result}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeService === "concept-explainer" && (
            <Card className="bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 border-purple-200/50 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5"></div>
              <CardHeader className="relative border-b border-purple-200/50 bg-white/50 backdrop-blur-sm">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl shadow-lg">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent font-bold">
                      Concept Breakdown
                    </span>
                    <p className="text-sm text-purple-600/70 font-normal mt-1">Clear and detailed explanation</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative p-8">
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-purple-200/50 shadow-xl">
                  <div className="prose prose-lg max-w-none">
                    <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed text-base">{result}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeService === "study-planner" && (
            <Card className="bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 border-rose-200/50 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-red-500/5"></div>
              <CardHeader className="relative border-b border-rose-200/50 bg-white/50 backdrop-blur-sm">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-3 bg-gradient-to-r from-rose-500 to-red-500 rounded-xl shadow-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent font-bold">
                      Your Study Plan
                    </span>
                    <p className="text-sm text-rose-600/70 font-normal mt-1">Personalized learning schedule</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative p-8">
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-rose-200/50 shadow-xl">
                  <div className="prose prose-lg max-w-none">
                    <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed text-base">{result}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeService === "quiz-generator" && (
            <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-200/50 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-500/5"></div>
              <CardHeader className="relative border-b border-green-200/50 bg-white/50 backdrop-blur-sm">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold">
                      Practice Quiz
                    </span>
                    <p className="text-sm text-green-600/70 font-normal mt-1">Test your knowledge</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative p-8">
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-green-200/50 shadow-xl">
                  <div className="prose prose-lg max-w-none">
                    <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed text-base">{result}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => navigator.clipboard.writeText(result)}
              className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:bg-gray-50/80 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3"
            >
              <span className="mr-2">📋</span>
              Copy to Clipboard
            </Button>
            <Button
              variant="outline"
              onClick={() => setResult("")}
              className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:bg-gray-50/80 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3"
            >
              <span className="mr-2">🗑️</span>
              Clear Result
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const blob = new Blob([result], { type: "text/plain" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `${activeService}-result.txt`
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:bg-gray-50/80 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3"
            >
              <span className="mr-2">💾</span>
              Download
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
