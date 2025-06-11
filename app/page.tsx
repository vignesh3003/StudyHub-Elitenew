"use client"

import { useState, useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Home,
  CheckSquare,
  Calendar,
  Timer,
  BookOpen,
  Brain,
  Users,
  BarChart3,
  Flame,
  Star,
  Zap,
  RefreshCw,
  Menu,
  MessageSquare,
  Eye,
} from "lucide-react"

// Import all the components
import SignIn from "@/components/auth/sign-in"
import EnhancedTaskManager from "@/components/enhanced-task-manager"
import TaskCalendar from "@/components/task-calendar"
import PomodoroTimer from "@/components/pomodoro-timer"
import AIFlashcardGenerator from "@/components/ai-flashcard-generator"
import AIServicesHub from "@/components/ai-services-hub"
import AIStudyAssistant from "@/components/ai-study-assistant"
import UserProfile from "@/components/gamification/user-profile"
import StudyRooms from "@/components/collaboration/study-rooms"
import EnhancedAnalytics from "@/components/analytics/enhanced-analytics"
import WelcomeSplash from "@/components/onboarding/welcome-splash"
import EditProfile from "@/components/profile/edit-profile"
import FlashcardViewer from "@/components/flashcards/flashcard-viewer"
import AchievementPopup from "@/components/gamification/achievement-popup"
import { gamificationService, type Achievement } from "@/lib/gamification-service"

type TabType =
  | "dashboard"
  | "tasks"
  | "calendar"
  | "timer"
  | "flashcards"
  | "ai-tools"
  | "collaboration"
  | "analytics"
  | "flashcard-viewer"
  | "ai-assistant"

export default function StudyHub() {
  const [user, loading, error] = useAuthState(auth)
  const [activeTab, setActiveTab] = useState<TabType>("dashboard")
  const [userStats, setUserStats] = useState<any>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const { toast } = useToast()
  const [showWelcomeSplash, setShowWelcomeSplash] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [userDisplayName, setUserDisplayName] = useState("")
  const [isNewUser, setIsNewUser] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Achievement popup states
  const [achievementPopup, setAchievementPopup] = useState<{
    achievement: Achievement | null
    isVisible: boolean
  }>({
    achievement: null,
    isVisible: false,
  })

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Subscribe to achievement notifications
  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = gamificationService.onAchievementUnlocked((achievement) => {
        console.log("🎉 Achievement unlocked:", achievement.name)
        setAchievementPopup({
          achievement,
          isVisible: true,
        })

        // Refresh user stats to show updated progress
        loadUserStats()
      })

      return unsubscribe
    }
  }, [user?.uid])

  // Load user stats and sync status
  useEffect(() => {
    if (user) {
      loadUserStats()
      // Update streak on login
      gamificationService.updateStreak(user.uid)
    }
  }, [user])

  const loadUserStats = async () => {
    if (!user) return

    try {
      setIsLoadingStats(true)

      // Check multiple indicators to determine if user is truly new
      const hasBeenWelcomed = localStorage.getItem(`welcomed_${user.uid}`)
      const hasExistingStats = localStorage.getItem(`userStats_${user.uid}`)

      // Try to get existing stats from Firebase
      let existingFirebaseStats = null
      try {
        const stats = await gamificationService.getUserStats(user.uid)
        // If user has more than just the default "first-steps" achievement, they're not new
        existingFirebaseStats = stats.achievements && stats.achievements.length > 1 ? stats : null
      } catch (error) {
        console.log("No existing Firebase stats found")
      }

      // User is only new if ALL of these are true:
      // 1. Never been welcomed in localStorage
      // 2. No existing stats in localStorage
      // 3. No meaningful stats in Firebase
      // 4. Account created less than 5 minutes ago (additional check)
      const accountAge = user.metadata.creationTime
        ? (Date.now() - new Date(user.metadata.creationTime).getTime()) / (1000 * 60)
        : 999
      const isVeryNewAccount = accountAge < 5 // Less than 5 minutes old

      const isTrulyNewUser = !hasBeenWelcomed && !hasExistingStats && !existingFirebaseStats && isVeryNewAccount

      if (isTrulyNewUser) {
        console.log("New user detected - showing welcome splash")
        setIsNewUser(true)
        setShowWelcomeSplash(true)
        setUserDisplayName(user.displayName || "Study Champion")

        // Set fresh stats for new users
        const freshStats = {
          streak: 0,
          level: 1,
          xp: 0, // Will be updated to 50 after welcome completion
          studyHours: 0,
          tasksCompleted: 0,
          flashcardsCreated: 0,
          totalHours: 0,
          totalTasks: 0,
          completedTasks: 0,
          badges: [],
          achievements: [],
        }
        setUserStats(freshStats)
      } else {
        console.log("Existing user detected - loading existing data")
        setIsNewUser(false)
        setShowWelcomeSplash(false) // Explicitly set to false for existing users
        setUserDisplayName(user.displayName || localStorage.getItem(`displayName_${user.uid}`) || "Study Champion")

        // For returning users, get real data
        const stats = await gamificationService.getUserStats(user.uid)
        const enhancedStats = {
          ...stats,
          totalHours: Math.floor(stats.studyHours),
          totalTasks: stats.tasksCompleted + 29,
          completedTasks: stats.tasksCompleted,
          level: stats.level,
          badges: stats.badges,
          achievements: stats.achievements,
        }
        setUserStats(enhancedStats)
      }
    } catch (error) {
      console.error("Error loading user stats:", error)
      toast({
        title: "Error",
        description: "Failed to load user statistics.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingStats(false)
    }
  }

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab)
    setShowMobileMenu(false)
    toast({
      title: "Navigation",
      description: `Switched to ${tab} section`,
    })
  }

  const handleWelcomeComplete = async (displayName: string) => {
    setUserDisplayName(displayName)
    setShowWelcomeSplash(false)
    localStorage.setItem(`welcomed_${user.uid}`, "true")
    localStorage.setItem(`displayName_${user.uid}`, displayName)

    // Initialize user stats properly
    const stats = await gamificationService.getUserStats(user.uid)
    setUserStats({
      ...stats,
      totalHours: Math.floor(stats.studyHours),
      totalTasks: stats.tasksCompleted,
      completedTasks: stats.tasksCompleted,
    })

    // Award welcome bonus
    toast({
      title: "🎉 Welcome Bonus Awarded!",
      description: "You've earned 50 XP for joining StudyHub Elite!",
    })
  }

  const handleProfileSave = (newDisplayName: string) => {
    setUserDisplayName(newDisplayName)
    setShowEditProfile(false)
    localStorage.setItem(`displayName_${user.uid}`, newDisplayName)
  }

  const handleAchievementPopupClose = () => {
    setAchievementPopup({
      achievement: null,
      isVisible: false,
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return userStats ? (
          <UserProfile
            user={user}
            studyStats={userStats}
            displayName={userDisplayName}
            onEditProfile={() => setShowEditProfile(true)}
          />
        ) : (
          <div>Loading...</div>
        )
      case "tasks":
        return <EnhancedTaskManager user={user} />
      case "calendar":
        return <TaskCalendar user={user} />
      case "timer":
        return <PomodoroTimer />
      case "flashcards":
        return (
          <AIFlashcardGenerator
            user={user}
            onAddFlashcards={(flashcards) => {
              console.log("Added flashcards:", flashcards)
              // Refresh stats after adding flashcards
              loadUserStats()
            }}
          />
        )
      case "flashcard-viewer":
        return <FlashcardViewer user={user} />
      case "ai-tools":
        return <AIServicesHub />
      case "ai-assistant":
        return <AIStudyAssistant tasks={[]} studyHours={userStats?.studyHours || 0} grades={[]} setTasks={() => {}} />
      case "collaboration":
        return <StudyRooms user={user} />
      case "analytics":
        return <EnhancedAnalytics user={user} />
      default:
        return userStats ? (
          <UserProfile user={user} studyStats={userStats} displayName={userDisplayName} />
        ) : (
          <div>Loading...</div>
        )
    }
  }

  if (showWelcomeSplash) {
    return <WelcomeSplash user={user} onComplete={handleWelcomeComplete} />
  }

  if (showEditProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <EditProfile
          user={user}
          displayName={userDisplayName}
          onSave={handleProfileSave}
          onCancel={() => setShowEditProfile(false)}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading StudyHub Elite...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Error: {error.message}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <SignIn onSignIn={() => {}} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Achievement Popup */}
      <AchievementPopup
        achievement={achievementPopup.achievement}
        isVisible={achievementPopup.isVisible}
        onClose={handleAchievementPopupClose}
      />

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setShowMobileMenu(false)}>
          <div
            className="absolute top-0 left-0 bottom-0 w-64 bg-white dark:bg-gray-900 shadow-xl p-4 transform transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1.5 rounded-lg">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <h2 className="font-bold text-lg">StudyHub Elite</h2>
              </div>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleTabClick("dashboard")}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${
                  activeTab === "dashboard"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Home className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">Dashboard</span>
              </button>

              <button
                onClick={() => handleTabClick("tasks")}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${
                  activeTab === "tasks"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <CheckSquare className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">Tasks</span>
              </button>

              <button
                onClick={() => handleTabClick("calendar")}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${
                  activeTab === "calendar"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Calendar className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">Calendar</span>
              </button>

              <button
                onClick={() => handleTabClick("timer")}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${
                  activeTab === "timer"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Timer className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">Timer</span>
              </button>

              <button
                onClick={() => handleTabClick("flashcards")}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${
                  activeTab === "flashcards"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <BookOpen className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">Create Flashcards</span>
              </button>

              <button
                onClick={() => handleTabClick("flashcard-viewer")}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${
                  activeTab === "flashcard-viewer"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Eye className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">View Flashcards</span>
              </button>

              <button
                onClick={() => handleTabClick("ai-tools")}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${
                  activeTab === "ai-tools"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Brain className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">AI Tools</span>
              </button>

              <button
                onClick={() => handleTabClick("ai-assistant")}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${
                  activeTab === "ai-assistant"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <MessageSquare className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">AI Assistant</span>
              </button>

              <button
                onClick={() => handleTabClick("collaboration")}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${
                  activeTab === "collaboration"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Users className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">Study Rooms</span>
              </button>

              <button
                onClick={() => handleTabClick("analytics")}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${
                  activeTab === "analytics"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <BarChart3 className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">Analytics</span>
              </button>
            </div>

            <div className="absolute bottom-4 left-4 right-4">
              <Button
                onClick={() => auth.signOut()}
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              {isMobile ? (
                <button
                  onClick={() => setShowMobileMenu(true)}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                </button>
              ) : (
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                  <Brain className="h-8 w-8 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  StudyHub Elite
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]">
                  {isNewUser ? "Welcome" : "Welcome back"}, {userDisplayName}!
                </p>
              </div>
            </div>

            {/* Clock Display */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800 dark:text-gray-200 font-mono">
                  {formatTime(currentTime)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(currentTime)}</div>
              </div>
            </div>

            {/* Theme Toggle and Right side controls */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Stats Quick View - Only show on desktop */}
              {!isMobile && userStats && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">{userStats.streak} day streak</span>
                  </div>
                  <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Level {userStats.level}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full">
                    <Zap className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">{userStats.xp} XP</span>
                  </div>
                </div>
              )}

              {/* Mobile Stats Badge */}
              {isMobile && userStats && (
                <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Lvl {userStats.level}</span>
                </div>
              )}

              {/* Only show sign out on desktop */}
              {!isMobile && (
                <Button
                  onClick={() => auth.signOut()}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <div className="space-y-8">
          {/* Navigation Tabs - Only show on desktop */}
          {!isMobile && (
            <div className="grid grid-cols-5 lg:grid-cols-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-2xl p-1 gap-1">
              <Button
                onClick={() => handleTabClick("dashboard")}
                variant={activeTab === "dashboard" ? "default" : "ghost"}
                className={`rounded-xl py-3 px-4 font-medium flex items-center gap-2 transition-all duration-200 ${
                  activeTab === "dashboard"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>

              <Button
                onClick={() => handleTabClick("tasks")}
                variant={activeTab === "tasks" ? "default" : "ghost"}
                className={`rounded-xl py-3 px-4 font-medium flex items-center gap-2 transition-all duration-200 ${
                  activeTab === "tasks"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <CheckSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Tasks</span>
              </Button>

              <Button
                onClick={() => handleTabClick("calendar")}
                variant={activeTab === "calendar" ? "default" : "ghost"}
                className={`rounded-xl py-3 px-4 font-medium flex items-center gap-2 transition-all duration-200 ${
                  activeTab === "calendar"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Calendar</span>
              </Button>

              <Button
                onClick={() => handleTabClick("timer")}
                variant={activeTab === "timer" ? "default" : "ghost"}
                className={`rounded-xl py-3 px-4 font-medium flex items-center gap-2 transition-all duration-200 ${
                  activeTab === "timer"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <Timer className="h-4 w-4" />
                <span className="hidden sm:inline">Timer</span>
              </Button>

              <Button
                onClick={() => handleTabClick("flashcards")}
                variant={activeTab === "flashcards" ? "default" : "ghost"}
                className={`rounded-xl py-3 px-4 font-medium flex items-center gap-2 transition-all duration-200 ${
                  activeTab === "flashcards"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Create</span>
              </Button>

              <Button
                onClick={() => handleTabClick("flashcard-viewer")}
                variant={activeTab === "flashcard-viewer" ? "default" : "ghost"}
                className={`rounded-xl py-3 px-4 font-medium flex items-center gap-2 transition-all duration-200 ${
                  activeTab === "flashcard-viewer"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">View</span>
              </Button>

              <Button
                onClick={() => handleTabClick("ai-tools")}
                variant={activeTab === "ai-tools" ? "default" : "ghost"}
                className={`rounded-xl py-3 px-4 font-medium flex items-center gap-2 transition-all duration-200 ${
                  activeTab === "ai-tools"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">AI Tools</span>
              </Button>

              <Button
                onClick={() => handleTabClick("ai-assistant")}
                variant={activeTab === "ai-assistant" ? "default" : "ghost"}
                className={`rounded-xl py-3 px-4 font-medium flex items-center gap-2 transition-all duration-200 ${
                  activeTab === "ai-assistant"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Assistant</span>
              </Button>

              <Button
                onClick={() => handleTabClick("collaboration")}
                variant={activeTab === "collaboration" ? "default" : "ghost"}
                className={`rounded-xl py-3 px-4 font-medium flex items-center gap-2 transition-all duration-200 ${
                  activeTab === "collaboration"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Rooms</span>
              </Button>

              <Button
                onClick={() => handleTabClick("analytics")}
                variant={activeTab === "analytics" ? "default" : "ghost"}
                className={`rounded-xl py-3 px-4 font-medium flex items-center gap-2 transition-all duration-200 ${
                  activeTab === "analytics"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </Button>
            </div>
          )}

          {/* Content */}
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
