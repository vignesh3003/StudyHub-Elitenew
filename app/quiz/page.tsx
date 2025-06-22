"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Plus, BookOpen, Trophy, Clock, Target, TrendingUp } from "lucide-react"
import AIQuizGenerator from "@/components/ai-quiz-generator"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import QuizTaker from "@/components/quiz-taker"
import QuizAnalytics from "@/components/quiz-analytics"

interface Quiz {
  id: string
  title: string
  subject: string
  difficulty: string
  questions: any[]
  totalPoints: number
  createdAt: Date
}

export default function QuizPage() {
  const [user] = useAuthState(auth)
  const [savedQuizzes, setSavedQuizzes] = useState<Quiz[]>([])
  const [showGenerator, setShowGenerator] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [quizResults, setQuizResults] = useState<any[]>([])

  useEffect(() => {
    if (user?.uid) {
      const quizzes = JSON.parse(localStorage.getItem(`quizzes_${user.uid}`) || "[]")
      setSavedQuizzes(quizzes)
    }
  }, [user])

  useEffect(() => {
    if (user?.uid) {
      const results = JSON.parse(localStorage.getItem(`quiz_results_${user.uid}`) || "[]")
      setQuizResults(results)
    }
  }, [user])

  const handleAddQuiz = (quiz: any) => {
    const newQuiz = {
      id: `quiz_${Date.now()}`,
      ...quiz,
      createdAt: new Date(),
    }

    const updatedQuizzes = [...savedQuizzes, newQuiz]
    setSavedQuizzes(updatedQuizzes)

    if (user?.uid) {
      localStorage.setItem(`quizzes_${user.uid}`, JSON.stringify(updatedQuizzes))
    }

    setShowGenerator(false)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleTakeQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
  }

  const handleQuizComplete = (results: any) => {
    const updatedResults = [...quizResults, results]
    setQuizResults(updatedResults)
    setSelectedQuiz(null)
    setShowAnalytics(true)
  }

  const handleExitQuiz = () => {
    setSelectedQuiz(null)
  }

  if (selectedQuiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <QuizTaker quiz={selectedQuiz} user={user} onComplete={handleQuizComplete} onExit={handleExitQuiz} />
      </div>
    )
  }

  if (showAnalytics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button onClick={() => setShowAnalytics(false)} variant="outline" className="mb-4">
            ← Back to Quizzes
          </Button>
        </div>
        <QuizAnalytics user={user} results={quizResults} />
      </div>
    )
  }

  if (showGenerator) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button onClick={() => setShowGenerator(false)} variant="outline" className="mb-4">
            ← Back to Quizzes
          </Button>
        </div>
        <AIQuizGenerator user={user} onAddQuiz={handleAddQuiz} />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-2xl">
            <Brain className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Quiz Generator
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Create comprehensive quizzes with mixed question types, download as PDF, and generate from images using
          advanced AI
        </p>
      </div>

      {/* Create New Quiz Button */}
      <div className="text-center mb-12">
        <Button
          onClick={() => setShowGenerator(true)}
          className="h-16 px-8 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 rounded-2xl"
        >
          <Plus className="h-6 w-6 mr-3" />
          Create New AI Quiz
        </Button>
        <Button
          onClick={() => setShowAnalytics(true)}
          variant="outline"
          className="h-16 px-8 text-xl font-bold border-2 border-purple-300 text-purple-600 hover:bg-purple-50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl"
        >
          <TrendingUp className="h-6 w-6 mr-3" />
          View Analytics
        </Button>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <h3 className="font-bold text-lg mb-2 text-blue-700">Mixed Questions</h3>
            <p className="text-blue-600">Multiple choice, short answer, and long answer questions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50">
          <CardContent className="p-6 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h3 className="font-bold text-lg mb-2 text-green-700">PDF Export</h3>
            <p className="text-green-600">Download with or without answers for printing</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50">
          <CardContent className="p-6 text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-purple-500" />
            <h3 className="font-bold text-lg mb-2 text-purple-700">Image Analysis</h3>
            <p className="text-purple-600">Generate questions from uploaded study materials</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200/50">
          <CardContent className="p-6 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-orange-500" />
            <h3 className="font-bold text-lg mb-2 text-orange-700">Smart Scoring</h3>
            <p className="text-orange-600">Automatic point assignment based on question difficulty</p>
          </CardContent>
        </Card>
      </div>

      {/* Saved Quizzes */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <Clock className="h-8 w-8 text-purple-500" />
          Your Saved Quizzes
        </h2>

        {savedQuizzes.length === 0 ? (
          <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200/50">
            <CardContent className="text-center py-16">
              <Brain className="h-24 w-24 mx-auto mb-6 text-gray-400" />
              <h3 className="text-2xl font-bold text-gray-600 mb-4">No Quizzes Yet</h3>
              <p className="text-gray-500 text-lg mb-8">Create your first AI-generated quiz to get started!</p>
              <Button
                onClick={() => setShowGenerator(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-bold"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Quiz
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedQuizzes.map((quiz) => (
              <Card
                key={quiz.id}
                className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800 flex items-center justify-between">
                    <span className="truncate">{quiz.title}</span>
                    <Badge className={getDifficultyColor(quiz.difficulty)}>{quiz.difficulty}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Subject: {quiz.subject}</span>
                      <span>{quiz.questions.length} questions</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Total Points: {quiz.totalPoints}</span>
                      <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleTakeQuiz(quiz)}>
                        Take Quiz
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          // Here you could implement quiz editing functionality
                          console.log("Edit quiz:", quiz.id)
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
