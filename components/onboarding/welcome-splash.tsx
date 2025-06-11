"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCap, Sparkles, Target, Brain, Trophy, Rocket, CheckCircle, ArrowRight } from "lucide-react"

interface WelcomeSplashProps {
  user: any
  onComplete: (displayName: string) => void
}

export default function WelcomeSplash({ user, onComplete }: WelcomeSplashProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [displayName, setDisplayName] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)

  const steps = [
    {
      title: "Welcome to StudyHub Elite! 🎉",
      subtitle: "Your journey to academic excellence starts here",
      content: (
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-8 rounded-2xl shadow-xl">
              <GraduationCap className="h-20 w-20 text-white" />
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Ready to transform your learning?</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              StudyHub Elite combines AI-powered tools, gamification, and smart analytics to make studying more
              effective and enjoyable.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "What's your name? ✨",
      subtitle: "Let's personalize your experience",
      content: (
        <div className="text-center space-y-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-2xl shadow-xl">
            <Sparkles className="h-16 w-16 text-white mx-auto" />
          </div>
          <div className="space-y-4">
            <Label htmlFor="displayName" className="text-lg font-medium text-gray-700">
              What should we call you?
            </Label>
            <Input
              id="displayName"
              type="text"
              placeholder="Enter your preferred name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="text-center text-lg h-12 bg-white border-2 border-purple-200 focus:border-purple-400"
              autoFocus
            />
            <p className="text-sm text-gray-500">This is how you'll appear throughout the platform</p>
          </div>
        </div>
      ),
    },
    {
      title: "Your Learning Arsenal 🚀",
      subtitle: "Discover what makes StudyHub Elite special",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
            <Brain className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="font-bold text-blue-800 mb-2">AI-Powered Tools</h3>
            <p className="text-blue-600 text-sm">
              Smart flashcards, study assistance, and personalized recommendations
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-200">
            <Trophy className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="font-bold text-purple-800 mb-2">Gamification</h3>
            <p className="text-purple-600 text-sm">Earn XP, unlock achievements, and level up your learning</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
            <Target className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="font-bold text-green-800 mb-2">Smart Planning</h3>
            <p className="text-green-600 text-sm">Intelligent task management and study scheduling</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
            <Rocket className="h-12 w-12 text-orange-600 mb-4" />
            <h3 className="font-bold text-orange-800 mb-2">Analytics</h3>
            <p className="text-orange-600 text-sm">Track progress and optimize your study habits</p>
          </div>
        </div>
      ),
    },
    {
      title: "You're all set! 🎯",
      subtitle: "Let's begin your learning journey",
      content: (
        <div className="text-center space-y-6">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-8 rounded-2xl shadow-xl">
            <CheckCircle className="h-20 w-20 text-white" />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Welcome aboard, {displayName || "Champion"}! 🌟</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Your personalized study dashboard is ready. Start by adding your first task or exploring the AI tools!
            </p>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
              <p className="text-yellow-700 font-medium">🎁 Welcome Bonus: +50 XP</p>
              <p className="text-yellow-600 text-sm">You've earned your first achievement!</p>
            </div>
          </div>
        </div>
      ),
    },
  ]

  const nextStep = () => {
    if (currentStep === 1 && !displayName.trim()) {
      return // Don't proceed without a name
    }

    if (currentStep < steps.length - 1) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
        setIsAnimating(false)
      }, 200)
    } else {
      onComplete(displayName.trim() || "Study Champion")
    }
  }

  const canProceed = currentStep !== 1 || displayName.trim().length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-white shadow-xl">
        <CardContent className="p-8 md:p-12">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-600">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className={`transition-opacity duration-200 ${isAnimating ? "opacity-0" : "opacity-100"}`}>
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{steps[currentStep].title}</h1>
              <p className="text-gray-600 text-lg">{steps[currentStep].subtitle}</p>
            </div>

            <div className="mb-8">{steps[currentStep].content}</div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index <= currentStep ? "bg-blue-500" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={nextStep}
              disabled={!canProceed}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg disabled:opacity-50"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Start Learning
                  <Rocket className="ml-2 h-5 w-5" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
