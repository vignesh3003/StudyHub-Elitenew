"use client"

import { useState, useEffect, useRef } from "react"
import { getFirebaseAuth, getAuthFunctions, initializeFirebase } from "@/lib/firebase"
import SignIn from "@/components/auth/sign-in"
import { Button } from "@/components/ui/button"
import {
  GraduationCap,
  LogOut,
  AlertCircle,
  RefreshCw,
  CheckSquare,
  BookOpen,
  Loader2,
  Wifi,
  WifiOff,
  Calendar,
  Timer,
  TrendingUp,
  Brain,
  Sun,
  Target,
  Clock,
  Sparkles,
  Menu,
  X,
  Award,
  Activity,
  BarChart3,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { User } from "firebase/auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { TimerProvider, useTimer } from "@/contexts/timer-context"
import EnhancedTaskManager from "@/components/enhanced-task-manager"
import AIFlashcardGenerator from "@/components/ai-flashcard-generator"
import AIStudyAssistant from "@/components/ai-study-assistant"
import TaskCalendar from "@/components/task-calendar"
import PomodoroTimer from "@/components/pomodoro-timer"
import PersistentTimer from "@/components/persistent-timer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AIServicesHub from "@/components/ai-services-hub"
import { Progress } from "@/components/ui/progress"
import RealTimeClock from "@/components/real-time-clock"

interface Task {
  id: string
  title: string
  subject: string
  priority: "low" | "medium" | "high"
  completed: boolean
  dueDate: string
  description?: string
  tags?: string[]
}

interface StudySession {
  id: string
  subject: string
  duration: number
  date: string
}

interface Flashcard {
  id: string
  question: string
  answer: string
  subject: string
  difficulty: "easy" | "medium" | "hard"
}

interface Grade {
  id: string
  subject: string
  assignment: string
  grade: number
  maxGrade: number
  weight: number
}

// Wrapper component to use the timer context
function StudyHubContent() {
  const { showPersistentTimer } = useTimer()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [initializationStatus, setInitializationStatus] = useState<string>("Starting...")
  const [retryCount, setRetryCount] = useState(0)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [tasks, setTasks] = useState<Task[]>([])
  const [studySessions, setStudySessions] = useState<StudySession[]>([])
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null)

  // Use ref to prevent multiple auth listener setups
  const authListenerSetup = useRef(false)

  const { toast } = useToast()

  // Initialize Firebase and auth state listener
  useEffect(() => {
    // Prevent multiple auth listener setups
    if (authListenerSetup.current) {
      return
    }
    authListenerSetup.current = true

    let unsubscribe: (() => void) | undefined
    let mounted = true

    const setupAuth = async () => {
      try {
        console.log("🚀 Setting up authentication...")
        setInitializationStatus("Checking environment variables...")

        // Log environment variables for debugging
        console.log("Environment variables check:")
        console.log(
          "NEXT_PUBLIC_FIREBASE_API_KEY:",
          process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✅ Present" : "❌ Missing",
        )
        console.log(
          "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:",
          process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "✅ Present" : "❌ Missing",
        )
        console.log(
          "NEXT_PUBLIC_FIREBASE_PROJECT_ID:",
          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✅ Present" : "❌ Missing",
        )

        setInitializationStatus("Initializing Firebase...")

        // Initialize Firebase with proper error handling and retries
        let attempts = 0
        const maxAttempts = 3
        let firebaseReady = false

        while (attempts < maxAttempts && !firebaseReady && mounted) {
          attempts++
          setInitializationStatus(`Initializing Firebase... (${attempts}/${maxAttempts})`)

          try {
            // Add delay between attempts
            if (attempts > 1) {
              await new Promise((resolve) => setTimeout(resolve, 1000 * attempts))
            }

            firebaseReady = await initializeFirebase()

            if (firebaseReady) {
              console.log("✅ Firebase initialized successfully")
              break
            }
          } catch (error) {
            console.error(`Firebase initialization attempt ${attempts} failed:`, error)

            // If it's an auth/invalid-api-key error, don't retry
            if (error instanceof Error && error.message.includes("auth/invalid-api-key")) {
              throw new Error(
                `Invalid Firebase API key. Please verify your NEXT_PUBLIC_FIREBASE_API_KEY in Vercel project settings.`,
              )
            }

            if (attempts === maxAttempts) {
              throw error
            }
          }
        }

        if (!mounted) return

        if (!firebaseReady) {
          throw new Error(
            "Firebase failed to initialize after multiple attempts. Please check your internet connection and try refreshing the page.",
          )
        }

        setInitializationStatus("Setting up authentication...")

        // Get auth instance and functions
        const auth = getFirebaseAuth()
        const authFunctions = await getAuthFunctions()
        console.log("🔗 Setting up auth state listener...")

        // Set up auth state listener
        unsubscribe = authFunctions.onAuthStateChanged(
          auth,
          (user) => {
            if (!mounted) return
            console.log("👤 Auth state changed:", user?.uid || "No user")
            setUser(user)
            setLoading(false)
            setAuthError(null)
            setInitializationStatus("Ready")
            setRetryCount(0) // Reset retry count on success
          },
          (error) => {
            if (!mounted) return
            console.error("🚨 Auth state error:", error)
            setAuthError(`Authentication error: ${error.message}`)
            setLoading(false)
            setInitializationStatus("Error")
          },
        )

        console.log("✅ Auth listener set up successfully")
      } catch (error: any) {
        if (!mounted) return

        console.error("💥 Firebase setup error:", error)
        setAuthError(`Failed to initialize: ${error.message}`)
        setLoading(false)
        setInitializationStatus("Failed")
      }
    }

    setupAuth()

    return () => {
      mounted = false
      if (unsubscribe) {
        console.log("🧹 Cleaning up auth listener")
        unsubscribe()
      }
    }
  }, [])

  // Check if user is new or returning
  useEffect(() => {
    if (user) {
      const userId = user.uid
      const userFirstVisit = localStorage.getItem(`studyHub_firstVisit_${userId}`)

      if (!userFirstVisit) {
        // New user
        setIsNewUser(true)
        localStorage.setItem(`studyHub_firstVisit_${userId}`, new Date().toISOString())

        // Show welcome message for 5 seconds, then switch to "Welcome back"
        setTimeout(() => {
          setIsNewUser(false)
        }, 5000)
      } else {
        // Returning user
        setIsNewUser(false)
      }
    }
  }, [user])

  // Load data from localStorage on component mount
  useEffect(() => {
    if (user) {
      try {
        const userId = user.uid
        const savedTasks = localStorage.getItem(`studyHub_tasks_${userId}`)
        const savedSessions = localStorage.getItem(`studyHub_sessions_${userId}`)
        const savedFlashcards = localStorage.getItem(`studyHub_flashcards_${userId}`)
        const savedGrades = localStorage.getItem(`studyHub_grades_${userId}`)

        if (savedTasks) setTasks(JSON.parse(savedTasks))
        if (savedSessions) setStudySessions(JSON.parse(savedSessions))
        if (savedFlashcards) setFlashcards(JSON.parse(savedFlashcards))
        if (savedGrades) setGrades(JSON.parse(savedGrades))
      } catch (error) {
        console.error("Error loading saved data:", error)
        toast({
          title: "Data Loading Error",
          description: "Some saved data could not be loaded.",
          variant: "destructive",
        })
      }
    }
  }, [user, toast])

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (user) {
      try {
        const userId = user.uid
        localStorage.setItem(`studyHub_tasks_${userId}`, JSON.stringify(tasks))
      } catch (error) {
        console.error("Error saving tasks:", error)
      }
    }
  }, [tasks, user])

  useEffect(() => {
    if (user) {
      try {
        const userId = user.uid
        localStorage.setItem(`studyHub_sessions_${userId}`, JSON.stringify(studySessions))
      } catch (error) {
        console.error("Error saving sessions:", error)
      }
    }
  }, [studySessions, user])

  useEffect(() => {
    if (user) {
      try {
        const userId = user.uid
        localStorage.setItem(`studyHub_flashcards_${userId}`, JSON.stringify(flashcards))
      } catch (error) {
        console.error("Error saving flashcards:", error)
      }
    }
  }, [flashcards, user])

  useEffect(() => {
    if (user) {
      try {
        const userId = user.uid
        localStorage.setItem(`studyHub_grades_${userId}`, JSON.stringify(grades))
      } catch (error) {
        console.error("Error saving grades:", error)
      }
    }
  }, [grades, user])

  const handleSignOut = async () => {
    try {
      const auth = getFirebaseAuth()
      const authFunctions = await getAuthFunctions()
      await authFunctions.signOut(auth)
      toast({
        title: "Signed out successfully",
        description: "See you next time!",
      })
    } catch (error) {
      console.error("Sign out error:", error)
      toast({
        title: "Sign out error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const retryInitialization = async () => {
    setRetryCount(retryCount + 1)
    setLoading(true)
    setAuthError(null)
    setInitializationStatus("Retrying initialization...")

    try {
      // Force reinitialize Firebase
      const success = await initializeFirebase()
      if (success) {
        // Reset the auth listener flag and restart the setup
        authListenerSetup.current = false
        window.location.reload()
      } else {
        throw new Error("Failed to reinitialize Firebase")
      }
    } catch (error: any) {
      console.error("Retry failed:", error)
      setAuthError(`Retry failed: ${error.message}`)
      setLoading(false)
      setInitializationStatus("Retry Failed")
    }
  }

  const addTask = (task: Omit<Task, "id" | "completed">) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      completed: false,
    }
    setTasks([...tasks, newTask])
  }

  const toggleTask = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const updateTask = (updatedTask: Task) => {
    setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
  }

  const reorderTasks = (reorderedTasks: Task[]) => {
    setTasks(reorderedTasks)
  }

  const addMultipleFlashcards = (
    newFlashcards: Array<{
      question: string
      answer: string
      subject: string
      difficulty: "easy" | "medium" | "hard"
    }>,
  ) => {
    const flashcardsWithIds = newFlashcards.map((card) => ({
      ...card,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }))
    setFlashcards([...flashcards, ...flashcardsWithIds])
  }

  const handleSessionComplete = (type: "study" | "break", duration: number) => {
    if (type === "study") {
      const newSession: StudySession = {
        id: Date.now().toString(),
        subject: "General Study",
        duration: duration,
        date: new Date().toISOString(),
      }
      setStudySessions([...studySessions, newSession])
    }
  }

  const getProductivityScore = () => {
    const completedTasks = tasks.filter((task) => task.completed).length
    const totalTasks = tasks.length
    const studyHours = studySessions.reduce((sum, session) => sum + session.duration, 0) / 60

    let score = 0
    if (totalTasks > 0) score += (completedTasks / totalTasks) * 40
    if (studyHours > 0) score += Math.min(studyHours * 10, 40)
    score += Math.min(flashcards.length * 2, 20)

    return Math.round(score)
  }

  const getStreakData = () => {
    const today = new Date()
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      return date.toDateString()
    }).reverse()

    return last7Days.map((date) => {
      const dayTasks = tasks.filter((task) => {
        const taskDate = new Date(task.dueDate).toDateString()
        return taskDate === date && task.completed
      })
      return dayTasks.length
    })
  }

  const getMotivationalMessage = () => {
    const score = getProductivityScore()
    const completedTasks = tasks.filter((task) => task.completed).length

    if (score >= 80) return { message: "🔥 You're on fire! Keep crushing it!", color: "text-orange-600" }
    if (score >= 60) return { message: "⚡ Great momentum! You're doing amazing!", color: "text-blue-600" }
    if (score >= 40) return { message: "🌟 Good progress! Keep building that streak!", color: "text-purple-600" }
    if (completedTasks > 0) return { message: "🚀 Nice start! Every step counts!", color: "text-green-600" }
    return { message: "💪 Ready to conquer today? Let's go!", color: "text-gray-600" }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setMobileMenuOpen(false) // Close mobile menu when tab is selected
  }

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">{initializationStatus}</p>
          <p className="text-sm text-gray-500 mt-2">Setting up your study environment...</p>
        </div>
      </div>
    )
  }

  // Show error screen if there's an auth error
  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-rose-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="text-center max-w-lg mx-auto relative z-10">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-red-400 rounded-full blur-2xl opacity-40 animate-pulse"></div>
            <div className="relative bg-red-500/20 backdrop-blur-sm p-8 rounded-3xl border border-red-400/30 shadow-2xl">
              <AlertCircle className="h-20 w-20 text-red-300 mx-auto" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-red-200 mb-6">Firebase Configuration Error</h1>
          <div className="bg-red-500/10 rounded-2xl p-6 mb-8 text-left">
            <p className="text-red-300 mb-4 leading-relaxed text-lg font-medium">Error Details:</p>
            <code className="text-red-200 text-sm bg-red-900/30 p-4 rounded-lg block whitespace-pre-wrap break-all">
              {authError}
            </code>
          </div>

          {/* Connection status indicator */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {navigator.onLine ? (
              <>
                <div className="relative">
                  <Wifi className="h-6 w-6 text-green-400" />
                  <div className="absolute inset-0 bg-green-400/30 rounded-full blur-lg"></div>
                </div>
                <span className="text-green-300 text-lg font-medium">Online</span>
              </>
            ) : (
              <>
                <div className="relative">
                  <WifiOff className="h-6 w-6 text-red-400" />
                  <div className="absolute inset-0 bg-red-400/30 rounded-full blur-lg"></div>
                </div>
                <span className="text-red-300 text-lg font-medium">Offline</span>
              </>
            )}
          </div>

          <div className="space-y-4">
            <Button
              onClick={retryInitialization}
              className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-xl h-14 text-lg font-medium"
              size="lg"
            >
              <RefreshCw className="h-6 w-6 mr-3" />
              Retry Connection {retryCount > 0 && `(${retryCount})`}
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full border-red-400/30 text-red-200 hover:bg-red-500/10 h-14 text-lg font-medium"
              size="lg"
            >
              Refresh Page
            </Button>
          </div>

          <div className="mt-8 p-6 bg-red-500/10 rounded-2xl border border-red-400/30 backdrop-blur-sm">
            <p className="text-red-200 text-lg font-semibold mb-3">Environment Variables Required:</p>
            <ul className="text-red-300 text-sm space-y-1 text-left">
              <li>• NEXT_PUBLIC_FIREBASE_API_KEY</li>
              <li>• NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</li>
              <li>• NEXT_PUBLIC_FIREBASE_PROJECT_ID</li>
              <li>• NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</li>
              <li>• NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</li>
              <li>• NEXT_PUBLIC_FIREBASE_APP_ID</li>
            </ul>
            <p className="text-red-300 text-sm mt-4">Please add these to your Vercel project settings and redeploy.</p>
          </div>
        </div>
      </div>
    )
  }

  // Show sign-in screen if not authenticated
  if (!user) {
    return (
      <SignIn
        onSignIn={() => {
          // The auth state listener will handle setting the user
          console.log("Sign-in completed, waiting for auth state change...")
        }}
      />
    )
  }

  // Main application UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-b border-gray-200/50 dark:border-gray-700/50 fixed top-0 left-0 right-0 z-50 shadow-xl">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 relative">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl sm:rounded-3xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-r from-sky-500 to-blue-500 p-3 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl group-hover:scale-105 transition-transform duration-300">
                  <GraduationCap className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  StudyHub Elite
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-xl font-medium mt-1 hidden sm:block">
                  {isNewUser === null
                    ? `Hello, ${user.displayName?.split(" ")[0] || user.email?.split("@")[0]}! ✨`
                    : isNewUser
                      ? `Welcome to StudyHub Elite, ${user.displayName?.split(" ")[0] || user.email?.split("@")[0]}! ✨`
                      : `Welcome back, ${user.displayName?.split(" ")[0] || user.email?.split("@")[0]}! ✨`}
                </p>
              </div>
            </div>

            {/* Real-time Clock */}
            <div className="hidden sm:block">
              <RealTimeClock />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-4">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="lg"
                onClick={handleSignOut}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3"
              >
                <LogOut className="h-6 w-6 mr-2" />
                Sign Out
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 p-3"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-2xl z-40">
              <div className="container mx-auto px-4 py-6 space-y-2">
                {/* User Welcome */}
                <div className="text-center pb-4 border-b border-gray-200/50 dark:border-gray-700/50 mb-4">
                  <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
                    {isNewUser === null
                      ? `Hello, ${user.displayName?.split(" ")[0] || user.email?.split("@")[0]}! ✨`
                      : isNewUser
                        ? `Welcome, ${user.displayName?.split(" ")[0] || user.email?.split("@")[0]}! ✨`
                        : `Welcome back, ${user.displayName?.split(" ")[0] || user.email?.split("@")[0]}! ✨`}
                  </p>
                </div>

                {/* Mobile Clock */}
                <div className="sm:hidden flex justify-center pb-4 border-b border-gray-200/50 dark:border-gray-700/50 mb-4">
                  <RealTimeClock />
                </div>

                {/* Navigation Items */}
                <Button
                  variant={activeTab === "dashboard" ? "default" : "ghost"}
                  onClick={() => handleTabChange("dashboard")}
                  className="w-full justify-start h-12 text-lg font-medium"
                >
                  <TrendingUp className="h-5 w-5 mr-3" />
                  Dashboard
                </Button>

                <Button
                  variant={activeTab === "tasks" ? "default" : "ghost"}
                  onClick={() => handleTabChange("tasks")}
                  className="w-full justify-start h-12 text-lg font-medium"
                >
                  <CheckSquare className="h-5 w-5 mr-3" />
                  Tasks
                </Button>

                <Button
                  variant={activeTab === "calendar" ? "default" : "ghost"}
                  onClick={() => handleTabChange("calendar")}
                  className="w-full justify-start h-12 text-lg font-medium"
                >
                  <Calendar className="h-5 w-5 mr-3" />
                  Calendar
                </Button>

                <Button
                  variant={activeTab === "timer" ? "default" : "ghost"}
                  onClick={() => handleTabChange("timer")}
                  className="w-full justify-start h-12 text-lg font-medium"
                >
                  <Timer className="h-5 w-5 mr-3" />
                  Timer
                </Button>

                <Button
                  variant={activeTab === "flashcards" ? "default" : "ghost"}
                  onClick={() => handleTabChange("flashcards")}
                  className="w-full justify-start h-12 text-lg font-medium"
                >
                  <BookOpen className="h-5 w-5 mr-3" />
                  Flashcards
                </Button>

                <Button
                  variant={activeTab === "ai-assistant" ? "default" : "ghost"}
                  onClick={() => handleTabChange("ai-assistant")}
                  className="w-full justify-start h-12 text-lg font-medium"
                >
                  <Brain className="h-5 w-5 mr-3" />
                  AI Assistant
                </Button>

                <Button
                  variant={activeTab === "ai-services" ? "default" : "ghost"}
                  onClick={() => handleTabChange("ai-services")}
                  className="w-full justify-start h-12 text-lg font-medium"
                >
                  <Sparkles className="h-5 w-5 mr-3" />
                  AI Tools
                </Button>

                {/* Divider */}
                <div className="border-t border-gray-200/50 dark:border-gray-700/50 my-4"></div>

                {/* Theme Toggle */}
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Theme</span>
                  <ThemeToggle />
                </div>

                {/* Sign Out */}
                <Button
                  variant="destructive"
                  onClick={handleSignOut}
                  className="w-full justify-start h-12 text-lg font-medium bg-red-500 hover:bg-red-600"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 relative pt-32 sm:pt-36">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8 sm:space-y-12">
          {/* Desktop Tab Navigation */}
          <div className="hidden lg:block bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-3xl p-2 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-400/10 via-blue-400/10 to-cyan-400/10"></div>

            <div className="relative">
              <TabsList className="grid w-full grid-cols-7 gap-3 bg-transparent relative">
                <TabsTrigger
                  value="dashboard"
                  className="flex items-center justify-start gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-2xl rounded-2xl py-5 px-6 transition-all duration-300 hover:scale-105 font-bold text-base"
                >
                  <TrendingUp className="h-6 w-6" />
                  <span>Dashboard</span>
                </TabsTrigger>
                <TabsTrigger
                  value="tasks"
                  className="flex items-center justify-start gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400 data-[state=active]:to-sky-400 data-[state=active]:text-white data-[state=active]:shadow-2xl rounded-2xl py-5 px-6 transition-all duration-300 hover:scale-105 font-bold text-base"
                >
                  <CheckSquare className="h-6 w-6" />
                  <span>Tasks</span>
                </TabsTrigger>
                <TabsTrigger
                  value="calendar"
                  className="flex items-center justify-start gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-2xl rounded-2xl py-5 px-6 transition-all duration-300 hover:scale-105 font-bold text-base"
                >
                  <Calendar className="h-6 w-6" />
                  <span>Calendar</span>
                </TabsTrigger>
                <TabsTrigger
                  value="timer"
                  className="flex items-center justify-start gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-2xl rounded-2xl py-5 px-6 transition-all duration-300 hover:scale-105 font-bold text-base"
                >
                  <Timer className="h-6 w-6" />
                  <span>Timer</span>
                </TabsTrigger>
                <TabsTrigger
                  value="flashcards"
                  className="flex items-center justify-start gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-2xl rounded-2xl py-5 px-6 transition-all duration-300 hover:scale-105 font-bold text-base"
                >
                  <BookOpen className="h-6 w-6" />
                  <span>Flashcards</span>
                </TabsTrigger>
                <TabsTrigger
                  value="ai-assistant"
                  className="flex items-center justify-start gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-sky-600 data-[state=active]:text-white data-[state=active]:shadow-2xl rounded-2xl py-5 px-6 transition-all duration-300 hover:scale-105 font-bold text-base"
                >
                  <Brain className="h-6 w-6" />
                  <span>AI Assistant</span>
                </TabsTrigger>
                <TabsTrigger
                  value="ai-services"
                  className="flex items-center justify-start gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-2xl rounded-2xl py-5 px-6 transition-all duration-300 hover:scale-105 font-bold text-base"
                >
                  <Sparkles className="h-6 w-6" />
                  <span>AI Tools</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-8 sm:space-y-12 animate-in fade-in-50 duration-500">
            {/* Hero Section with Motivational Message */}
            <div className="text-center py-8 sm:py-20 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl"></div>
              <div className="relative px-4">
                <h2 className="text-3xl sm:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight">
                  {isNewUser === null ? "Loading..." : isNewUser ? "Welcome!" : "Welcome Back!"}
                </h2>

                {/* Motivational Message */}
                <div className="mb-6 sm:mb-10">
                  <p className={`text-lg sm:text-2xl font-bold ${getMotivationalMessage().color} mb-2`}>
                    {getMotivationalMessage().message}
                  </p>
                  <p className="text-base sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                    Ready to supercharge your learning journey? 🚀
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
                  <div className="flex items-center gap-2 sm:gap-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 sm:px-6 py-2 sm:py-4 rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-xl text-sm sm:text-lg">
                    <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-bold">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 sm:px-6 py-2 sm:py-4 rounded-full shadow-xl text-sm sm:text-lg">
                    <Sun className="h-4 w-4 sm:h-6 sm:w-6" />
                    <span className="font-bold">
                      Good{" "}
                      {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}!
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
              <Button
                onClick={() => handleTabChange("tasks")}
                className="h-16 sm:h-20 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex flex-col gap-1 sm:gap-2"
              >
                <CheckSquare className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm font-bold">Add Task</span>
              </Button>
              <Button
                onClick={() => handleTabChange("timer")}
                className="h-16 sm:h-20 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex flex-col gap-1 sm:gap-2"
              >
                <Timer className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm font-bold">Start Timer</span>
              </Button>
              <Button
                onClick={() => handleTabChange("flashcards")}
                className="h-16 sm:h-20 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex flex-col gap-1 sm:gap-2"
              >
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm font-bold">AI Cards</span>
              </Button>
              <Button
                onClick={() => handleTabChange("ai-assistant")}
                className="h-16 sm:h-20 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex flex-col gap-1 sm:gap-2"
              >
                <Brain className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm font-bold">AI Help</span>
              </Button>
            </div>

            {/* Stats Grid with Enhanced Design */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-0">
              {/* Tasks Card with Progress Animation */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200/50 dark:border-emerald-700/50 hover:shadow-2xl transition-all duration-500 group hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10"></div>
                <CardHeader className="relative pb-2 sm:pb-4 p-3 sm:p-6">
                  <CardTitle className="text-sm sm:text-2xl flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-emerald-700 dark:text-emerald-400">
                    <div className="p-2 sm:p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl sm:rounded-3xl shadow-2xl group-hover:scale-110 transition-transform duration-300 relative">
                      <CheckSquare className="h-4 w-4 sm:h-8 sm:w-8 text-white" />
                      {tasks.filter((t) => t.completed).length > 0 && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="text-sm sm:text-xl font-bold">Tasks</div>
                      <div className="text-xs sm:text-sm text-emerald-600/70 dark:text-emerald-400/70 font-normal hidden sm:block">
                        Completed Today
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative p-3 sm:p-6 pt-0 sm:pt-0">
                  <div className="text-center sm:text-left">
                    <div className="flex items-baseline justify-center sm:justify-start gap-1 sm:gap-4 mb-3 sm:mb-6">
                      <p className="text-2xl sm:text-6xl font-bold text-emerald-600 dark:text-emerald-400">
                        {tasks.filter((t) => t.completed).length}
                      </p>
                      <p className="text-lg sm:text-3xl text-emerald-500 dark:text-emerald-500 font-medium">
                        /{tasks.length}
                      </p>
                    </div>
                    <Progress
                      value={tasks.length > 0 ? (tasks.filter((t) => t.completed).length / tasks.length) * 100 : 0}
                      className="h-2 sm:h-3 mb-2 sm:mb-4"
                    />
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-emerald-600/70 dark:text-emerald-400/70 font-medium">Progress</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {tasks.length > 0
                          ? Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Study Hours Card with Activity Indicator */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 dark:from-blue-900/20 dark:via-sky-900/20 dark:to-cyan-900/20 border-blue-200/50 dark:border-blue-700/50 hover:shadow-2xl transition-all duration-500 group hover:scale-105">
                <CardHeader className="relative pb-2 sm:pb-4 p-3 sm:p-6">
                  <CardTitle className="text-sm sm:text-2xl flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-blue-700 dark:text-blue-400">
                    <div className="p-2 sm:p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl sm:rounded-3xl shadow-2xl group-hover:scale-110 transition-transform duration-300 relative">
                      <Clock className="h-4 w-4 sm:h-8 sm:w-8 text-white" />
                      <Activity className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 animate-pulse" />
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="text-sm sm:text-xl font-bold">Study</div>
                      <div className="text-xs sm:text-sm text-blue-600/70 dark:text-blue-400/70 font-normal hidden sm:block">
                        Hours Logged
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative p-3 sm:p-6 pt-0 sm:pt-0">
                  <div className="text-center sm:text-left">
                    <div className="flex items-baseline justify-center sm:justify-start gap-1 sm:gap-4 mb-2">
                      <p className="text-2xl sm:text-6xl font-bold text-blue-600 dark:text-blue-400">
                        {Math.round(studySessions.reduce((sum, session) => sum + session.duration, 0) / 60)}
                      </p>
                      <p className="text-lg sm:text-3xl text-blue-500 dark:text-blue-500 font-medium">hrs</p>
                    </div>
                    <div className="text-xs sm:text-sm text-blue-600/70 dark:text-blue-400/70">
                      {studySessions.length} sessions completed
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Flashcards Card with AI Badge */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200/50 dark:border-purple-700/50 hover:shadow-2xl transition-all duration-500 group hover:scale-105">
                <CardHeader className="relative pb-2 sm:pb-4 p-3 sm:p-6">
                  <CardTitle className="text-sm sm:text-2xl flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-purple-700 dark:text-purple-400">
                    <div className="p-2 sm:p-4 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl sm:rounded-3xl shadow-2xl group-hover:scale-110 transition-transform duration-300 relative">
                      <BookOpen className="h-4 w-4 sm:h-8 sm:w-8 text-white" />
                      <Sparkles className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 animate-pulse" />
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="text-sm sm:text-xl font-bold">Cards</div>
                      <div className="text-xs sm:text-sm text-purple-600/70 dark:text-purple-400/70 font-normal hidden sm:block">
                        AI Generated
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative p-3 sm:p-6 pt-0 sm:pt-0">
                  <div className="text-center sm:text-left">
                    <div className="flex items-baseline justify-center sm:justify-start gap-1 sm:gap-4 mb-2">
                      <p className="text-2xl sm:text-6xl font-bold text-purple-600 dark:text-purple-400">
                        {flashcards.length}
                      </p>
                      <p className="text-lg sm:text-3xl text-purple-500 dark:text-purple-500 font-medium">total</p>
                    </div>
                    <div className="text-xs sm:text-sm text-purple-600/70 dark:text-purple-400/70">
                      Ready for review
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Productivity Score Card with Achievement Badge */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200/50 dark:border-orange-700/50 hover:shadow-2xl transition-all duration-500 group hover:scale-105">
                <CardHeader className="relative pb-2 sm:pb-4 p-3 sm:p-6">
                  <CardTitle className="text-sm sm:text-2xl flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-orange-700 dark:text-orange-400">
                    <div className="p-2 sm:p-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl sm:rounded-3xl shadow-2xl group-hover:scale-110 transition-transform duration-300 relative">
                      <Target className="h-4 w-4 sm:h-8 sm:w-8 text-white" />
                      {getProductivityScore() >= 80 && (
                        <Award className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 animate-bounce" />
                      )}
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="text-sm sm:text-xl font-bold">Score</div>
                      <div className="text-xs sm:text-sm text-orange-600/70 dark:text-orange-400/70 font-normal hidden sm:block">
                        Overall
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative p-3 sm:p-6 pt-0 sm:pt-0">
                  <div className="text-center sm:text-left">
                    <div className="flex items-baseline justify-center sm:justify-start gap-1 sm:gap-4 mb-2">
                      <p className="text-2xl sm:text-6xl font-bold text-orange-600 dark:text-orange-400">
                        {getProductivityScore()}
                      </p>
                      <p className="text-lg sm:text-3xl text-orange-500 dark:text-orange-500 font-medium">%</p>
                    </div>
                    <div className="text-xs sm:text-sm text-orange-600/70 dark:text-orange-400/70">
                      {getProductivityScore() >= 80
                        ? "Excellent!"
                        : getProductivityScore() >= 60
                          ? "Great job!"
                          : "Keep going!"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Activity Chart */}
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                  Weekly Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between gap-2 h-32 sm:h-40">
                  {getStreakData().map((count, index) => (
                    <div key={index} className="flex flex-col items-center gap-2 flex-1">
                      <div
                        className="bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t-lg w-full transition-all duration-500 hover:from-blue-600 hover:to-cyan-600"
                        style={{ height: `${Math.max((count / Math.max(...getStreakData(), 1)) * 100, 10)}%` }}
                      ></div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {["S", "M", "T", "W", "T", "F", "S"][index]}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tasks completed this week:{" "}
                    <span className="font-bold text-blue-600">{getStreakData().reduce((a, b) => a + b, 0)}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-500">
            <EnhancedTaskManager
              tasks={tasks}
              onAddTask={addTask}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              onUpdateTask={updateTask}
              onReorderTasks={reorderTasks}
            />
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-500">
            <TaskCalendar
              tasks={tasks}
              onSelectDate={(date) => {
                console.log("Selected date:", date)
              }}
              onToggleTask={toggleTask}
              onAddTask={addTask}
            />
          </TabsContent>

          {/* Timer Tab */}
          <TabsContent value="timer" className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-500">
            <PomodoroTimer />
          </TabsContent>

          {/* Flashcards Tab */}
          <TabsContent value="flashcards" className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-500">
            <AIFlashcardGenerator onAddFlashcards={addMultipleFlashcards} />
          </TabsContent>

          {/* AI Assistant Tab */}
          <TabsContent value="ai-assistant" className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-500">
            <AIStudyAssistant
              tasks={tasks}
              studyHours={studySessions.reduce((sum, session) => sum + session.duration, 0) / 60}
              grades={grades}
            />
          </TabsContent>

          {/* AI Services Tab */}
          <TabsContent value="ai-services" className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-500">
            <AIServicesHub />
          </TabsContent>
        </Tabs>
      </div>

      {/* Global Persistent Timer */}
      {showPersistentTimer && <PersistentTimer />}
    </div>
  )
}

export default function StudyHubElite() {
  return (
    <TimerProvider>
      <StudyHubContent />
    </TimerProvider>
  )
}
