"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  Star,
  Trophy,
  Flame,
  Target,
  Clock,
  CheckCircle,
  Zap,
  Award,
  Camera,
  Sparkles,
  Crown,
  Medal,
  Gem,
  UserPlus,
  MessageSquare,
  Edit3,
  Shield,
  Lock,
  Calendar,
  Mail,
  User,
} from "lucide-react"
import { gamificationService, type UserStats } from "@/lib/gamification-service"
import { taskService } from "@/lib/task-service"
import { Button } from "@/components/ui/button"

interface UserProfileProps {
  user: any
  studyStats: any
  displayName?: string
  onEditProfile?: () => void
}

export default function UserProfile({ user, studyStats, displayName, onEditProfile }: UserProfileProps) {
  // Add a new state to track the selected rarity filter
  const [activeTab, setActiveTab] = useState("profile")
  const [rarityFilter, setRarityFilter] = useState<string | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const { toast } = useToast()

  // Load user stats and tasks
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.uid) return

      try {
        setIsLoadingStats(true)

        // Load gamification stats
        const stats = await gamificationService.getUserStats(user.uid)
        setUserStats(stats)

        // Subscribe to real-time task updates
        const unsubscribe = taskService.subscribeToTasks(user.uid, (updatedTasks) => {
          setTasks(updatedTasks)
        })

        setIsLoadingStats(false)
        return unsubscribe
      } catch (error) {
        console.error("Error loading user data:", error)
        setIsLoadingStats(false)
      }
    }

    const unsubscribe = loadUserData()
    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe()
      }
    }
  }, [user?.uid])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // For now, just show a toast that this feature is coming soon
    toast({
      title: "Feature Coming Soon! 📸",
      description: "Profile picture upload will be available in the next update.",
    })
  }

  const getRarityColor = (rarity: string | undefined) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
      case "uncommon":
        return "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700"
      case "rare":
        return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700"
      case "epic":
        return "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700"
      case "legendary":
        return "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700"
      default:
        return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
    }
  }

  const getRarityIcon = (rarity: string | undefined) => {
    switch (rarity) {
      case "common":
        return <Medal className="h-4 w-4" />
      case "uncommon":
        return <Shield className="h-4 w-4" />
      case "rare":
        return <Star className="h-4 w-4" />
      case "epic":
        return <Crown className="h-4 w-4" />
      case "legendary":
        return <Gem className="h-4 w-4" />
      default:
        return <Medal className="h-4 w-4" />
    }
  }

  const getRarityGlow = (rarity: string | undefined) => {
    switch (rarity) {
      case "common":
        return "shadow-md"
      case "uncommon":
        return "shadow-lg shadow-green-200/50"
      case "rare":
        return "shadow-lg shadow-blue-200/50"
      case "epic":
        return "shadow-xl shadow-purple-300/50"
      case "legendary":
        return "shadow-2xl shadow-yellow-300/50 animate-pulse"
      default:
        return "shadow-md"
    }
  }

  // Calculate task completion rate
  const completedTasks = tasks.filter((task) => task.completed).length
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  // Calculate today's tasks
  const today = new Date().toISOString().split("T")[0]
  const todayTasks = tasks.filter((task) => task.dueDate === today)
  const todayCompleted = todayTasks.filter((task) => task.completed).length

  // Add a function to filter achievements by rarity - ALWAYS SHOW ALL ACHIEVEMENTS
  const getFilteredAchievements = () => {
    if (!userStats?.achievements) return []

    if (!rarityFilter) return userStats.achievements

    return userStats.achievements.filter((achievement) => achievement.rarity === rarityFilter.toLowerCase())
  }

  // Calculate achievement stats
  const earnedAchievements = userStats?.achievements?.filter((a) => a.earned) || []
  const totalAchievements = userStats?.achievements?.length || 0
  const achievementProgress =
    totalAchievements > 0 ? Math.round((earnedAchievements.length / totalAchievements) * 100) : 0

  if (isLoadingStats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Sparkles className="h-8 w-8 animate-pulse text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-blue-200/50 dark:border-blue-700/50 shadow-2xl">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Profile Picture */}
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                <AvatarImage src={user?.photoURL || "/placeholder.svg?height=128&width=128"} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-4xl font-bold">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-lg transition-all duration-200 hover:scale-110">
                <Camera className="h-4 w-4" />
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {displayName || "Study Champion"}
              </h1>

              {/* Add edit button */}
              {onEditProfile && (
                <Button onClick={onEditProfile} variant="outline" size="sm" className="mb-4">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}

              {/* Level and XP */}
              <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-full shadow-lg">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">Level {userStats?.level || 1}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{userStats?.xp || 0} XP</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-orange-400 to-red-500 p-3 rounded-full shadow-lg">
                    <Flame className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{userStats?.streak || 0} Days</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Study Streak</p>
                  </div>
                </div>
              </div>

              {/* XP Progress Bar */}
              <div className="w-full max-w-md mx-auto md:mx-0">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Level {userStats?.level || 1}</span>
                  <span>Level {(userStats?.level || 1) + 1}</span>
                </div>
                <Progress value={((userStats?.xp || 0) % 1000) / 10} className="h-3 bg-gray-200 dark:bg-gray-700" />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                  {1000 - ((userStats?.xp || 0) % 1000)} XP to next level
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Tasks Completed</p>
                <p className="text-3xl font-bold text-green-700">{completedTasks}</p>
                <p className="text-green-500 text-xs">{taskCompletionRate}% completion rate</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Study Hours</p>
                <p className="text-3xl font-bold text-blue-700">{(userStats?.studyHours || 0).toFixed(1)}</p>
                <p className="text-blue-500 text-xs">Total focused time</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200/50 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Achievements</p>
                <p className="text-3xl font-bold text-purple-700">
                  {earnedAchievements.length}/{totalAchievements}
                </p>
                <p className="text-purple-500 text-xs">{achievementProgress}% unlocked</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200/50 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Today's Progress</p>
                <p className="text-3xl font-bold text-yellow-700">
                  {todayCompleted}/{todayTasks.length}
                </p>
                <p className="text-yellow-500 text-xs">Tasks due today</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Target className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid grid-cols-4 bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg rounded-2xl p-1">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl py-3 px-4 font-medium"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl py-3 px-4 font-medium"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="achievements"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl py-3 px-4 font-medium"
          >
            Achievements
          </TabsTrigger>
          <TabsTrigger
            value="social"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl py-3 px-4 font-medium"
          >
            Social
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-8 animate-in fade-in-50 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Personal Information */}
            <Card className="lg:col-span-2 bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <User className="h-5 w-5 text-blue-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Display Name</label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-800">{displayName || "Study Champion"}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-800">{user?.email || "Not provided"}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Member Since</label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-800">
                        {user?.metadata?.creationTime
                          ? new Date(user.metadata.creationTime).toLocaleDateString()
                          : "Recently"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Last Active</label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-800">
                        {userStats?.lastActive ? new Date(userStats.lastActive.toDate()).toLocaleDateString() : "Today"}
                      </span>
                    </div>
                  </div>
                </div>

                {onEditProfile && (
                  <div className="pt-4 border-t">
                    <Button onClick={onEditProfile} className="w-full">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile Information
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Achievement Summary */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-purple-600" />
                  Achievement Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {earnedAchievements.length}/{totalAchievements}
                  </div>
                  <p className="text-purple-700 font-medium">Achievements Unlocked</p>
                  <Progress value={achievementProgress} className="mt-3 h-2" />
                  <p className="text-sm text-purple-500 mt-2">{achievementProgress}% Complete</p>
                </div>

                <div className="space-y-3">
                  {["common", "uncommon", "rare", "epic", "legendary"].map((rarity) => {
                    const rarityAchievements = userStats?.achievements?.filter((a) => a.rarity === rarity) || []
                    const earnedInRarity = rarityAchievements.filter((a) => a.earned).length
                    return (
                      <div key={rarity} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getRarityIcon(rarity)}
                          <span className="text-sm font-medium capitalize">{rarity}</span>
                        </div>
                        <Badge variant="outline" className={getRarityColor(rarity)}>
                          {earnedInRarity}/{rarityAchievements.length}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements */}
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Award className="h-5 w-5 text-yellow-600" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {earnedAchievements.slice(0, 4).map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border-2 ${getRarityColor(achievement.rarity)} ${getRarityGlow(achievement.rarity)}`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <h4 className="font-bold text-sm mb-1">{achievement.name}</h4>
                      <p className="text-xs opacity-75">{achievement.description}</p>
                      {achievement.date && <p className="text-xs mt-2 opacity-60">Earned {achievement.date}</p>}
                    </div>
                  </div>
                ))}
              </div>
              {earnedAchievements.length === 0 && (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No achievements earned yet. Start studying to unlock your first achievement!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8 animate-in fade-in-50 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Tasks */}
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Recent Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No tasks yet. Add your first task to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-3 h-3 rounded-full ${task.completed ? "bg-green-500" : "bg-gray-300"}`} />
                        <div className="flex-1">
                          <p
                            className={`font-medium ${task.completed ? "line-through text-gray-500" : "text-gray-800"}`}
                          >
                            {task.title}
                          </p>
                          <p className="text-sm text-gray-500">{task.subject}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={task.completed ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
                        >
                          {task.completed ? "Done" : "Pending"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Study Streak */}
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Flame className="h-5 w-5 text-orange-600" />
                  Study Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-6xl font-bold text-orange-600 mb-4">{userStats?.streak || 0}</div>
                  <p className="text-xl text-orange-700 mb-2">Days in a row!</p>
                  <p className="text-gray-600">
                    {userStats?.streak === 0
                      ? "Start studying today to begin your streak!"
                      : userStats?.streak === 1
                        ? "Great start! Keep it going tomorrow."
                        : `Amazing! You're on fire! 🔥`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-8 animate-in fade-in-50 duration-500">
          {/* Achievement Categories */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card
              className={`bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 cursor-pointer transition-all ${rarityFilter === "common" ? "ring-2 ring-gray-500 shadow-lg" : ""}`}
              onClick={() => setRarityFilter(rarityFilter === "common" ? null : "common")}
            >
              <CardContent className="p-4 text-center">
                <Medal className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <h3 className="font-bold text-gray-700">Common</h3>
                <p className="text-xs text-gray-500">Easy to earn</p>
              </CardContent>
            </Card>
            <Card
              className={`bg-gradient-to-br from-green-50 to-green-100 border-green-200 cursor-pointer transition-all ${rarityFilter === "uncommon" ? "ring-2 ring-green-500 shadow-lg" : ""}`}
              onClick={() => setRarityFilter(rarityFilter === "uncommon" ? null : "uncommon")}
            >
              <CardContent className="p-4 text-center">
                <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-bold text-green-700">Uncommon</h3>
                <p className="text-xs text-green-500">Some effort</p>
              </CardContent>
            </Card>
            <Card
              className={`bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 cursor-pointer transition-all ${rarityFilter === "rare" ? "ring-2 ring-blue-500 shadow-lg" : ""}`}
              onClick={() => setRarityFilter(rarityFilter === "rare" ? null : "rare")}
            >
              <CardContent className="p-4 text-center">
                <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-bold text-blue-700">Rare</h3>
                <p className="text-xs text-blue-500">Good dedication</p>
              </CardContent>
            </Card>
            <Card
              className={`bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 cursor-pointer transition-all ${rarityFilter === "epic" ? "ring-2 ring-purple-500 shadow-lg" : ""}`}
              onClick={() => setRarityFilter(rarityFilter === "epic" ? null : "epic")}
            >
              <CardContent className="p-4 text-center">
                <Crown className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-bold text-purple-700">Epic</h3>
                <p className="text-xs text-purple-500">High commitment</p>
              </CardContent>
            </Card>
            <Card
              className={`bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 cursor-pointer transition-all ${rarityFilter === "legendary" ? "ring-2 ring-yellow-500 shadow-lg" : ""}`}
              onClick={() => setRarityFilter(rarityFilter === "legendary" ? null : "legendary")}
            >
              <CardContent className="p-4 text-center">
                <Gem className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <h3 className="font-bold text-yellow-700">Legendary</h3>
                <p className="text-xs text-yellow-500">Ultimate mastery</p>
              </CardContent>
            </Card>
          </div>

          {/* Achievements Grid - ALWAYS SHOW ALL ACHIEVEMENTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredAchievements().map((achievement) => (
              <Card
                key={achievement.id}
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                  achievement.earned
                    ? `bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 ${getRarityGlow(achievement.rarity)}`
                    : "bg-gray-50 border-gray-200 opacity-75"
                }`}
              >
                <CardContent className="p-6">
                  <div className="text-center">
                    {/* Lock overlay for unearned achievements */}
                    {!achievement.earned && (
                      <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <div className="bg-gray-800 text-white p-3 rounded-full">
                          <Lock className="h-6 w-6" />
                        </div>
                      </div>
                    )}

                    <div className={`text-6xl mb-4 ${achievement.earned ? "" : "grayscale opacity-50"}`}>
                      {achievement.icon}
                    </div>
                    <h3 className={`font-bold text-lg mb-2 ${achievement.earned ? "text-gray-800" : "text-gray-500"}`}>
                      {achievement.name}
                    </h3>
                    <p className={`text-sm mb-4 ${achievement.earned ? "text-gray-600" : "text-gray-400"}`}>
                      {achievement.description}
                    </p>

                    {/* Rarity Badge */}
                    <div className="flex justify-center mb-4">
                      <Badge className={`${getRarityColor(achievement.rarity)} flex items-center gap-1`}>
                        {getRarityIcon(achievement.rarity)}
                        {(achievement.rarity || "common").toUpperCase()}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    {!achievement.earned && achievement.maxProgress && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Progress</span>
                          <span>
                            {achievement.progress || 0}/{achievement.maxProgress}
                          </span>
                        </div>
                        <Progress
                          value={((achievement.progress || 0) / achievement.maxProgress) * 100}
                          className="h-2"
                        />
                      </div>
                    )}

                    {/* XP Reward */}
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-yellow-600">{achievement.xpReward} XP</span>
                    </div>

                    {/* Earned Date */}
                    {achievement.earned && achievement.date && (
                      <p className="text-xs text-gray-500 mt-2">Earned on {achievement.date}</p>
                    )}
                  </div>
                </CardContent>

                {/* Earned Overlay */}
                {achievement.earned && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-green-500 text-white p-1 rounded-full">
                      <Trophy className="h-4 w-4" />
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social" className="space-y-8 animate-in fade-in-50 duration-500">
          {/* Coming Soon Section */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 shadow-xl">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="bg-purple-100 p-4 rounded-full mb-6">
                <UserPlus className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">🚀 Social Features Coming Soon!</h3>
              <p className="text-gray-600 text-center max-w-md mb-8">
                Connect with study buddies, join study groups, and compete with friends to make learning more engaging
                and fun!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                  <UserPlus className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-800 mb-2">Friend Connections</h4>
                  <p className="text-sm text-gray-600">
                    Add friends, see their progress, and motivate each other to reach study goals together.
                  </p>
                </div>

                <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                  <MessageSquare className="h-8 w-8 text-green-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-800 mb-2">Study Groups</h4>
                  <p className="text-sm text-gray-600">
                    Create private study groups, share resources, and collaborate on projects.
                  </p>
                </div>

                <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                  <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-800 mb-2">Leaderboards</h4>
                  <p className="text-sm text-gray-600">
                    Compete with friends on study streaks, task completion, and learning achievements.
                  </p>
                </div>

                <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                  <Award className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-800 mb-2">Team Challenges</h4>
                  <p className="text-sm text-gray-600">
                    Participate in weekly challenges and earn exclusive badges with your study team.
                  </p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 text-sm">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Coming in the next update!
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
