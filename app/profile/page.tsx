"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Target, BookOpen, Clock, TrendingUp, Settings, Edit } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const [user] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    avatar: "/placeholder.svg?height=100&width=100",
    level: 12,
    xp: 2450,
    xpToNext: 550,
    streak: 7,
    totalStudyTime: 156,
    completedTasks: 89,
    createdFlashcards: 234,
  })

  const achievements = [
    { id: 1, name: "First Steps", description: "Complete your first study session", earned: true },
    { id: 2, name: "Streak Master", description: "Maintain a 7-day study streak", earned: true },
    { id: 3, name: "Quiz Champion", description: "Score 100% on 5 quizzes", earned: false },
    { id: 4, name: "Flashcard Creator", description: "Create 100 flashcards", earned: true },
  ]

  const recentActivity = [
    { id: 1, action: "Completed Math Quiz", time: "2 hours ago", xp: 50 },
    { id: 2, action: "Created Biology Flashcards", time: "1 day ago", xp: 25 },
    { id: 3, action: "Finished Study Session", time: "2 days ago", xp: 75 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">← Back to Dashboard</Link>
            </Button>
            <h1 className="text-3xl font-bold">Profile</h1>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Profile Overview */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="text-2xl">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-muted-foreground mb-4">{user.email}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">Level {user.level}</div>
                    <div className="text-sm text-muted-foreground">Current Level</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{user.streak}</div>
                    <div className="text-sm text-muted-foreground">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{user.totalStudyTime}h</div>
                    <div className="text-sm text-muted-foreground">Study Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{user.completedTasks}</div>
                    <div className="text-sm text-muted-foreground">Tasks Done</div>
                  </div>
                </div>
              </div>
            </div>

            {/* XP Progress */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress to Level {user.level + 1}</span>
                <span className="text-sm text-muted-foreground">
                  {user.xp}/{user.xp + user.xpToNext} XP
                </span>
              </div>
              <Progress value={(user.xp / (user.xp + user.xpToNext)) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="achievements" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {achievements.map((achievement) => (
                <Card key={achievement.id} className={achievement.earned ? "border-green-200 bg-green-50" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${achievement.earned ? "bg-green-100" : "bg-gray-100"}`}>
                        <Trophy className={`w-5 h-5 ${achievement.earned ? "text-green-600" : "text-gray-400"}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                      {achievement.earned && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Earned
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest study activities and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <BookOpen className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                      <Badge variant="outline">+{activity.xp} XP</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Study Sessions</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">127</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Flashcards Created</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.createdFlashcards}</div>
                  <p className="text-xs text-muted-foreground">+8% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87%</div>
                  <p className="text-xs text-muted-foreground">+3% from last month</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
