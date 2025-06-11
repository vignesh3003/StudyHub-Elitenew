"use client"

import { useState, useEffect, useRef } from "react"
import { getGoogleAuthProvider, getAuthFunctions } from "@/lib/firebase"
import { getFirebaseAuth } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { GraduationCap, Mail, Chrome, Eye, EyeOff, Loader2, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SignInProps {
  onSignIn: () => void
}

export default function SignIn({ onSignIn }: SignInProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [initializationStatus, setInitializationStatus] = useState<string>("Initializing...")

  // Prevent multiple initialization attempts
  const initializationAttempted = useRef(false)

  const { toast } = useToast()

  // Check if auth is ready
  useEffect(() => {
    if (initializationAttempted.current) {
      return
    }
    initializationAttempted.current = true

    const checkAuthReady = async () => {
      try {
        console.log("🔍 Checking if Firebase Auth is ready for sign-in...")
        setInitializationStatus("Initializing Firebase...")

        // Test Firebase Auth initialization
        getFirebaseAuth()
        console.log("✅ Firebase Auth is ready")

        setIsAuthReady(true)
        setInitializationStatus("Ready")
        console.log("✅ Firebase Auth is ready for sign-in")
      } catch (error: any) {
        console.error("❌ Error checking auth readiness:", error)
        setInitializationStatus("Failed")
        toast({
          title: "Initialization Error",
          description: `Authentication system failed to initialize: ${error.message}`,
          variant: "destructive",
        })
      }
    }

    checkAuthReady()
  }, [toast])

  const handleEmailSignIn = async (isSignUp: boolean) => {
    if (!isAuthReady) {
      toast({
        title: "System Not Ready",
        description: "Please wait for the authentication system to initialize.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const auth = getFirebaseAuth()
      const authFunctions = await getAuthFunctions()

      if (isSignUp) {
        await authFunctions.createUserWithEmailAndPassword(auth, email, password)
        toast({
          title: "Account created successfully!",
          description: "Welcome to StudyHub Elite!",
        })
      } else {
        await authFunctions.signInWithEmailAndPassword(auth, email, password)
        toast({
          title: "Welcome back!",
          description: "Successfully signed in to StudyHub Elite.",
        })
      }
      onSignIn()
    } catch (error: any) {
      console.error("Email auth error:", error)
      let errorMessage = "Authentication failed. Please try again."

      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email. Please create an account."
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again."
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists."
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address."
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection."
      }

      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  const handleGoogleSignIn = async () => {
    if (!isAuthReady) {
      toast({
        title: "System Not Ready",
        description: "Please wait for the authentication system to initialize.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const auth = getFirebaseAuth()
      const googleProvider = await getGoogleAuthProvider()
      const authFunctions = await getAuthFunctions()

      await authFunctions.signInWithPopup(auth, googleProvider)
      toast({
        title: "Welcome!",
        description: "Successfully signed in with Google.",
      })
      onSignIn()
    } catch (error: any) {
      console.error("Google auth error:", error)
      let errorMessage = "Google sign-in failed. Please try again."

      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in was cancelled. Please try again."
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Popup was blocked. Please allow popups and try again."
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection."
      }

      toast({
        title: "Google Sign-In Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  // Rest of the component remains the same...
  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardContent className="text-center py-16">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-violet-500 to-purple-500 p-6 rounded-2xl shadow-2xl">
                <GraduationCap className="h-16 w-16 text-white animate-bounce" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-200 to-purple-200 bg-clip-text text-transparent mt-6 mb-4">
              StudyHub Elite
            </h1>
            <div className="flex items-center justify-center gap-3 mt-6">
              <Loader2 className="h-5 w-5 animate-spin text-violet-300" />
              <p className="text-violet-200 text-lg">{initializationStatus}</p>
            </div>
            <div className="mt-6 w-64 mx-auto bg-violet-800/30 rounded-full h-2">
              <div className="bg-gradient-to-r from-violet-400 to-purple-400 h-2 rounded-full animate-pulse w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-400 rounded-2xl blur opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-violet-500 to-purple-500 p-4 rounded-2xl shadow-lg">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl bg-gradient-to-r from-violet-200 to-purple-200 bg-clip-text text-transparent font-bold">
            StudyHub Elite
          </CardTitle>
          <CardDescription className="text-violet-300 text-lg mt-2">
            Your Ultimate Academic Success Platform
          </CardDescription>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Sparkles className="h-4 w-4 text-violet-400" />
            <span className="text-violet-300 text-sm">AI-Powered Learning</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2">
              <div className="w-full bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl py-3 text-center font-medium">
                Email Authentication
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-violet-200 font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-12 bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:border-blue-400 focus:bg-white/25 transition-all duration-200"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="password" className="text-violet-200 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-12 bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:border-blue-400 focus:bg-white/25 transition-all duration-200 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-violet-300 hover:text-violet-200"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={() => handleEmailSignIn(false)}
                  disabled={isLoading || !email || !password}
                  className="w-full h-12 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
                <Button
                  onClick={() => handleEmailSignIn(true)}
                  disabled={isLoading || !email || !password}
                  variant="outline"
                  className="w-full h-12 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed border-0"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </div>
            </div>

            <div className="relative my-8">
              <Separator className="bg-white/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-gradient-to-r from-violet-900 to-purple-900 px-4 text-violet-300">or</span>
              </div>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              variant="outline"
              className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed border-0"
            >
              <Chrome className="h-5 w-5 mr-2" />
              {isLoading ? "Connecting..." : "Continue with Google"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
