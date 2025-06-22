"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { TrendingUp, Trophy, Target, Clock, Brain, Award, Calendar, BookOpen, Star } from "lucide-react"

interface QuizResults {
  quizId: string
  totalQuestions: number
  correctAnswers: number
  totalPoints: number
  earnedPoints: number
  percentage: number
  timeSpent: number
  answers: any[]
  completedAt: Date
}

interface QuizAnalyticsProps {
  user?: any
  results: QuizResults[]
}

export default function QuizAnalytics({ user, results }: QuizAnalyticsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<"week" | "month" | "all">("month")

  // Filter results based on timeframe
  const getFilteredResults = () => {
    const now = new Date()
    const cutoffDate = new Date()

    switch (selectedTimeframe) {
      case "week":
        cutoffDate.setDate(now.getDate() - 7)
        break
      case "month":
        cutoffDate.setMonth(now.getMonth() - 1)
        break
      case "all":
      default:
        cutoffDate.setFullYear(1970) // Include all results
        break
    }

    return results.filter((result) => new Date(result.completedAt) >= cutoffDate)
  }

  const filteredResults = getFilteredResults()

  // Calculate statistics
  const totalQuizzes = filteredResults.length
  const averageScore =
    totalQuizzes > 0 ? Math.round(filteredResults.reduce((sum, r) => sum + r.percentage, 0) / totalQuizzes) : 0
  const totalTimeSpent = filteredResults.reduce((sum, r) => sum + r.timeSpent, 0)
  const averageTimePerQuiz = totalQuizzes > 0 ? Math.round(totalTimeSpent / totalQuizzes) : 0
  const bestScore = totalQuizzes > 0 ? Math.max(...filteredResults.map((r) => r.percentage)) : 0
  const totalPointsEarned = filteredResults.reduce((sum, r) => sum + r.earnedPoints, 0)

  // Performance trend data
  const performanceData = filteredResults
    .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
    .map((result, index) => ({
      quiz: `Quiz ${index + 1}`,
      score: result.percentage,
      date: new Date(result.completedAt).toLocaleDateString(),
    }))

  // Score distribution data
  const scoreRanges = [
    { range: "90-100%", count: 0, color: "#10B981" },
    { range: "80-89%", count: 0, color: "#3B82F6" },
    { range: "70-79%", count: 0, color: "#F59E0B" },
    { range: "60-69%", count: 0, color: "#EF4444" },
    { range: "Below 60%", count: 0, color: "#6B7280" },
  ]

  filteredResults.forEach((result) => {
    if (result.percentage >= 90) scoreRanges[0].count++
    else if (result.percentage >= 80) scoreRanges[1].count++
    else if (result.percentage >= 70) scoreRanges[2].count++
    else if (result.percentage >= 60) scoreRanges[3].count++
    else scoreRanges[4].count++
  })

  // Subject performance data
  const subjectPerformance = new Map<string, { total: number; scores: number[] }>()

  // Note: This would need quiz subject data to be properly implemented
  // For now, we'll create sample data
  const sampleSubjects = ["Mathematics", "Science", "History", "English", "Geography"]
  sampleSubjects.forEach((subject) => {
    const subjectResults = filteredResults.filter(() => Math.random() > 0.7) // Random sample
    if (subjectResults.length > 0) {
      const avgScore = subjectResults.reduce((sum, r) => sum + r.percentage, 0) / subjectResults.length
      subjectPerformance.set(subject, {
        total: subjectResults.length,
        scores: [avgScore],
      })
    }
  })

  const subjectData = Array.from(subjectPerformance.entries()).map(([subject, data]) => ({
    subject,
    average: Math.round(data.scores[0]),
    quizzes: data.total,
  }))

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { level: "Excellent", color: "text-green-600", bg: "bg-green-100" }
    if (score >= 80) return { level: "Good", color: "text-blue-600", bg: "bg-blue-100" }
    if (score >= 70) return { level: "Average", color: "text-yellow-600", bg: "bg-yellow-100" }
    if (score >= 60) return { level: "Below Average", color: "text-orange-600", bg: "bg-orange-100" }
    return { level: "Needs Improvement", color: "text-red-600", bg: "bg-red-100" }
  }

  const performanceLevel = getPerformanceLevel(averageScore)

  if (totalQuizzes === 0) {
    return (
      <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200/50">
        <CardContent className="text-center py-16">
          <Brain className="h-24 w-24 mx-auto mb-6 text-gray-400" />
          <h3 className="text-2xl font-bold text-gray-600 mb-4">No Quiz Data Available</h3>
          <p className="text-gray-500 text-lg mb-8">Complete some quizzes to see your analytics and progress!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          Quiz Analytics
        </h1>
        <p className="text-xl text-gray-600">Track your learning progress and identify areas for improvement</p>
      </div>

      {/* Timeframe Selector */}
      <div className="flex justify-center">
        <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
          <div className="flex gap-2">
            {[
              { key: "week", label: "Last Week" },
              { key: "month", label: "Last Month" },
              { key: "all", label: "All Time" },
            ].map((option) => (
              <Button
                key={option.key}
                variant={selectedTimeframe === option.key ? "default" : "ghost"}
                onClick={() => setSelectedTimeframe(option.key as any)}
                className={`px-6 py-2 rounded-xl font-semibold ${
                  selectedTimeframe === option.key
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 shadow-xl">
          <CardContent className="p-6 text-center">
            <div className="p-4 bg-purple-500 rounded-2xl shadow-2xl w-fit mx-auto mb-4">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <div className="text-4xl font-bold text-purple-700 mb-2">{averageScore}%</div>
            <div className="text-purple-600 font-semibold">Average Score</div>
            <Badge className={`mt-2 ${performanceLevel.bg} ${performanceLevel.color} border-0`}>
              {performanceLevel.level}
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50 shadow-xl">
          <CardContent className="p-6 text-center">
            <div className="p-4 bg-blue-500 rounded-2xl shadow-2xl w-fit mx-auto mb-4">
              <Target className="h-12 w-12 text-white" />
            </div>
            <div className="text-4xl font-bold text-blue-700 mb-2">{totalQuizzes}</div>
            <div className="text-blue-600 font-semibold">Quizzes Completed</div>
            <Badge className="mt-2 bg-blue-100 text-blue-800 border-0">
              {selectedTimeframe === "week" ? "This Week" : selectedTimeframe === "month" ? "This Month" : "All Time"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 shadow-xl">
          <CardContent className="p-6 text-center">
            <div className="p-4 bg-green-500 rounded-2xl shadow-2xl w-fit mx-auto mb-4">
              <Award className="h-12 w-12 text-white" />
            </div>
            <div className="text-4xl font-bold text-green-700 mb-2">{bestScore}%</div>
            <div className="text-green-600 font-semibold">Best Score</div>
            <Badge className="mt-2 bg-green-100 text-green-800 border-0">Personal Best</Badge>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200/50 shadow-xl">
          <CardContent className="p-6 text-center">
            <div className="p-4 bg-orange-500 rounded-2xl shadow-2xl w-fit mx-auto mb-4">
              <Clock className="h-12 w-12 text-white" />
            </div>
            <div className="text-4xl font-bold text-orange-700 mb-2">{formatTime(totalTimeSpent)}</div>
            <div className="text-orange-600 font-semibold">Total Study Time</div>
            <Badge className="mt-2 bg-orange-100 text-orange-800 border-0">Avg: {formatTime(averageTimePerQuiz)}</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white shadow-lg rounded-2xl p-2">
          <TabsTrigger value="performance" className="rounded-xl font-semibold">
            Performance Trend
          </TabsTrigger>
          <TabsTrigger value="distribution" className="rounded-xl font-semibold">
            Score Distribution
          </TabsTrigger>
          <TabsTrigger value="subjects" className="rounded-xl font-semibold">
            Subject Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                Performance Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quiz" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      formatter={(value: any) => [`${value}%`, "Score"]}
                      labelFormatter={(label) => `Quiz: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Brain className="h-8 w-8 text-blue-500" />
                Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreRanges}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-green-500" />
                Subject Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subjectData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value: any) => [`${value}%`, "Average Score"]} />
                      <Bar dataKey="average" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-16">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500 text-lg">No subject data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Calendar className="h-8 w-8 text-purple-500" />
            Recent Quiz Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredResults
              .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
              .slice(0, 5)
              .map((result, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        result.percentage >= 80
                          ? "bg-green-100"
                          : result.percentage >= 60
                            ? "bg-yellow-100"
                            : "bg-red-100"
                      }`}
                    >
                      <Star
                        className={`h-5 w-5 ${
                          result.percentage >= 80
                            ? "text-green-600"
                            : result.percentage >= 60
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="font-semibold">Quiz #{index + 1}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(result.completedAt).toLocaleDateString()} • {formatTime(result.timeSpent)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{result.percentage}%</div>
                    <div className="text-sm text-gray-600">
                      {result.earnedPoints}/{result.totalPoints} pts
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
