"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Clock,
  CheckCircle,
  XCircle,
  Trophy,
  Target,
  Brain,
  ArrowLeft,
  ArrowRight,
  Flag,
  RotateCcw,
  Award,
  TrendingUp,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { gamificationService } from "@/lib/gamification-service"

interface QuizQuestion {
  id: string
  type: "multiple_choice" | "short_answer" | "long_answer"
  question: string
  options?: string[]
  correct_answer: string
  explanation?: string
  points: number
}

interface Quiz {
  id: string
  title: string
  subject: string
  difficulty: string
  questions: QuizQuestion[]
  totalPoints: number
}

interface QuizAnswer {
  questionId: string
  answer: string
  isCorrect?: boolean
  pointsEarned: number
  timeSpent: number
}

interface QuizTakerProps {
  quiz: Quiz
  user?: any
  onComplete: (results: QuizResults) => void
  onExit: () => void
}

interface QuizResults {
  quizId: string
  totalQuestions: number
  correctAnswers: number
  totalPoints: number
  earnedPoints: number
  percentage: number
  timeSpent: number
  answers: QuizAnswer[]
  completedAt: Date
}

export default function QuizTaker({ quiz, user, onComplete, onExit }: QuizTakerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeSpent, setTimeSpent] = useState(0)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({})
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<QuizResults | null>(null)
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())

  const { toast } = useToast()

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Track time per question
  useEffect(() => {
    setQuestionStartTime(Date.now())
  }, [currentQuestionIndex])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const recordQuestionTime = () => {
    const timeForQuestion = Math.floor((Date.now() - questionStartTime) / 1000)
    setQuestionTimes((prev) => ({
      ...prev,
      [currentQuestion.id]: timeForQuestion,
    }))
  }

  const goToNextQuestion = () => {
    recordQuestionTime()
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const goToPreviousQuestion = () => {
    recordQuestionTime()
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const evaluateAnswer = (question: QuizQuestion, userAnswer: string): { isCorrect: boolean; pointsEarned: number } => {
    if (!userAnswer.trim()) {
      return { isCorrect: false, pointsEarned: 0 }
    }

    if (question.type === "multiple_choice") {
      const isCorrect = userAnswer.toLowerCase() === question.correct_answer.toLowerCase()
      return { isCorrect, pointsEarned: isCorrect ? question.points : 0 }
    } else {
      // For short and long answers, we'll use a simple keyword matching approach
      // In a real application, you might want to use AI for more sophisticated evaluation
      const userWords = userAnswer.toLowerCase().split(/\s+/)
      const correctWords = question.correct_answer.toLowerCase().split(/\s+/)

      const matchingWords = userWords.filter((word) =>
        correctWords.some((correctWord) => correctWord.includes(word) || word.includes(correctWord)),
      )

      const matchPercentage = matchingWords.length / correctWords.length

      if (matchPercentage >= 0.7) {
        return { isCorrect: true, pointsEarned: question.points }
      } else if (matchPercentage >= 0.4) {
        return { isCorrect: true, pointsEarned: Math.floor(question.points * 0.7) }
      } else if (matchPercentage >= 0.2) {
        return { isCorrect: true, pointsEarned: Math.floor(question.points * 0.4) }
      } else {
        return { isCorrect: false, pointsEarned: 0 }
      }
    }
  }

  const submitQuiz = async () => {
    recordQuestionTime()

    const quizAnswers: QuizAnswer[] = quiz.questions.map((question) => {
      const userAnswer = answers[question.id] || ""
      const { isCorrect, pointsEarned } = evaluateAnswer(question, userAnswer)

      return {
        questionId: question.id,
        answer: userAnswer,
        isCorrect,
        pointsEarned,
        timeSpent: questionTimes[question.id] || 0,
      }
    })

    const correctAnswers = quizAnswers.filter((a) => a.isCorrect).length
    const earnedPoints = quizAnswers.reduce((sum, a) => sum + a.pointsEarned, 0)
    const percentage = Math.round((earnedPoints / quiz.totalPoints) * 100)

    const quizResults: QuizResults = {
      quizId: quiz.id,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      totalPoints: quiz.totalPoints,
      earnedPoints,
      percentage,
      timeSpent,
      answers: quizAnswers,
      completedAt: new Date(),
    }

    setResults(quizResults)
    setShowResults(true)

    // Save results to localStorage
    if (user?.uid) {
      const existingResults = JSON.parse(localStorage.getItem(`quiz_results_${user.uid}`) || "[]")
      const updatedResults = [...existingResults, quizResults]
      localStorage.setItem(`quiz_results_${user.uid}`, JSON.stringify(updatedResults))

      // Record quiz completion for gamification
      await gamificationService.recordQuizCompleted(user.uid, percentage)
    }

    toast({
      title: "🎉 Quiz Completed!",
      description: `You scored ${percentage}% (${earnedPoints}/${quiz.totalPoints} points)`,
    })
  }

  const retakeQuiz = () => {
    setCurrentQuestionIndex(0)
    setAnswers({})
    setTimeSpent(0)
    setQuestionTimes({})
    setShowResults(false)
    setResults(null)
    setFlaggedQuestions(new Set())
  }

  if (showResults && results) {
    return (
      <Card className="max-w-4xl mx-auto bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl flex items-center justify-center gap-4">
            <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-2xl">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Quiz Results
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white/80 border-purple-200">
              <CardContent className="p-6 text-center">
                <Award className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                <div className="text-3xl font-bold text-purple-700">{results.percentage}%</div>
                <div className="text-purple-600">Final Score</div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 border-green-200">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <div className="text-3xl font-bold text-green-700">{results.correctAnswers}</div>
                <div className="text-green-600">Correct Answers</div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 border-blue-200">
              <CardContent className="p-6 text-center">
                <Target className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <div className="text-3xl font-bold text-blue-700">{results.earnedPoints}</div>
                <div className="text-blue-600">Points Earned</div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 border-orange-200">
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-orange-500" />
                <div className="text-3xl font-bold text-orange-700">{formatTime(results.timeSpent)}</div>
                <div className="text-orange-600">Time Spent</div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Badge */}
          <div className="text-center">
            <Badge
              className={`px-6 py-3 text-xl font-bold ${
                results.percentage >= 90
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                  : results.percentage >= 80
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                    : results.percentage >= 70
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                      : "bg-gradient-to-r from-red-500 to-pink-500 text-white"
              }`}
            >
              {results.percentage >= 90
                ? "🏆 Excellent!"
                : results.percentage >= 80
                  ? "🎯 Great Job!"
                  : results.percentage >= 70
                    ? "👍 Good Work!"
                    : "📚 Keep Studying!"}
            </Badge>
          </div>

          {/* Detailed Results */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-purple-700 flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Question-by-Question Results
            </h3>

            {quiz.questions.map((question, index) => {
              const answer = results.answers.find((a) => a.questionId === question.id)
              return (
                <Card key={question.id} className="bg-white/80 border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-lg font-bold">
                          Q{index + 1}
                        </Badge>
                        {answer?.isCorrect ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-500" />
                        )}
                        <Badge
                          className={answer?.isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          {answer?.pointsEarned || 0}/{question.points} pts
                        </Badge>
                      </div>
                      <Badge variant="outline">{formatTime(answer?.timeSpent || 0)}</Badge>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="font-semibold text-gray-800">Question: </span>
                        <span className="text-gray-700">{question.question}</span>
                      </div>

                      {question.type === "multiple_choice" && question.options && (
                        <div>
                          <span className="font-semibold text-gray-800">Options: </span>
                          <div className="ml-4 space-y-1">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={`text-gray-700 ${
                                  option === question.correct_answer
                                    ? "font-semibold text-green-700"
                                    : option === answer?.answer
                                      ? "font-semibold text-red-700"
                                      : ""
                                }`}
                              >
                                {String.fromCharCode(65 + optIndex)}. {option}
                                {option === question.correct_answer && " ✓"}
                                {option === answer?.answer && option !== question.correct_answer && " ✗"}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <span className="font-semibold text-gray-800">Your Answer: </span>
                        <span className={answer?.isCorrect ? "text-green-700" : "text-red-700"}>
                          {answer?.answer || "No answer provided"}
                        </span>
                      </div>

                      <div>
                        <span className="font-semibold text-gray-800">Correct Answer: </span>
                        <span className="text-green-700">{question.correct_answer}</span>
                      </div>

                      {question.explanation && (
                        <div>
                          <span className="font-semibold text-gray-800">Explanation: </span>
                          <span className="text-gray-700">{question.explanation}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={retakeQuiz}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-bold"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Retake Quiz
            </Button>
            <Button
              onClick={() => onComplete(results)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-bold"
            >
              <Trophy className="h-5 w-5 mr-2" />
              View All Results
            </Button>
            <Button onClick={onExit} variant="outline" className="px-6 py-3 rounded-xl font-bold">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Quizzes
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Quiz Header */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{quiz.title}</h1>
              <p className="text-purple-100 text-lg">
                {quiz.subject} • {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatTime(timeSpent)}</div>
              <div className="text-purple-100">Time Elapsed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
            <Badge variant="outline" className="text-lg">
              {Math.round(progress)}% Complete
            </Badge>
          </div>
          <Progress value={progress} className="h-3" />
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-3">
              <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <span className="text-blue-700">
                {currentQuestion.type === "multiple_choice"
                  ? "Multiple Choice"
                  : currentQuestion.type === "short_answer"
                    ? "Short Answer"
                    : "Long Answer"}
              </span>
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-100 text-blue-800 px-3 py-2 text-lg font-bold">
                {currentQuestion.points} pts
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleFlag(currentQuestion.id)}
                className={flaggedQuestions.has(currentQuestion.id) ? "bg-yellow-100 border-yellow-400" : ""}
              >
                <Flag className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-xl text-blue-800 font-medium leading-relaxed">{currentQuestion.question}</div>

          {currentQuestion.type === "multiple_choice" && currentQuestion.options ? (
            <RadioGroup
              value={answers[currentQuestion.id] || ""}
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              className="space-y-4"
            >
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-4 bg-white/80 rounded-xl border border-blue-200 hover:bg-blue-50/50 transition-colors"
                >
                  <RadioGroupItem value={option} id={`option-${index}`} className="w-5 h-5" />
                  <Label htmlFor={`option-${index}`} className="text-lg cursor-pointer flex-1">
                    <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="space-y-3">
              <Label className="text-lg font-semibold text-blue-700">Your Answer:</Label>
              <Textarea
                placeholder={
                  currentQuestion.type === "short_answer"
                    ? "Write a brief answer (1-3 sentences)..."
                    : "Write a detailed answer (paragraph length)..."
                }
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                rows={currentQuestion.type === "long_answer" ? 8 : 4}
                className="text-lg border-blue-200 focus:border-blue-400 bg-white/90 rounded-xl"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Button
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="px-6 py-3 rounded-xl font-bold"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Previous
            </Button>

            <div className="flex items-center gap-4">
              <Button onClick={onExit} variant="outline" className="px-6 py-3 rounded-xl font-bold">
                Exit Quiz
              </Button>

              {flaggedQuestions.size > 0 && (
                <Badge variant="outline" className="px-3 py-2 text-lg">
                  <Flag className="h-4 w-4 mr-2" />
                  {flaggedQuestions.size} Flagged
                </Badge>
              )}
            </div>

            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button
                onClick={submitQuiz}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-bold"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Submit Quiz
              </Button>
            ) : (
              <Button
                onClick={goToNextQuestion}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-bold"
              >
                Next
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Question Overview */}
      <Card className="bg-gray-50">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Question Overview</h3>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {quiz.questions.map((question, index) => (
              <Button
                key={question.id}
                variant="outline"
                size="sm"
                onClick={() => {
                  recordQuestionTime()
                  setCurrentQuestionIndex(index)
                }}
                className={`h-12 w-12 rounded-xl font-bold ${
                  index === currentQuestionIndex
                    ? "bg-purple-500 text-white border-purple-500"
                    : answers[question.id]
                      ? "bg-green-100 text-green-800 border-green-300"
                      : flaggedQuestions.has(question.id)
                        ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                        : ""
                }`}
              >
                {index + 1}
                {flaggedQuestions.has(question.id) && <Flag className="h-3 w-3 absolute -top-1 -right-1" />}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              Current
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              Answered
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
              Flagged
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
              Unanswered
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
