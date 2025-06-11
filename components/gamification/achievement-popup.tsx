"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Crown, Gem, Medal, Shield, X, Sparkles } from "lucide-react"
import type { Achievement } from "@/lib/gamification-service"

interface AchievementPopupProps {
  achievement: Achievement | null
  isVisible: boolean
  onClose: () => void
}

export default function AchievementPopup({ achievement, isVisible, onClose }: AchievementPopupProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible && achievement) {
      setIsAnimating(true)
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        handleClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, achievement])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "from-gray-400 to-gray-600"
      case "uncommon":
        return "from-green-400 to-green-600"
      case "rare":
        return "from-blue-400 to-blue-600"
      case "epic":
        return "from-purple-400 to-purple-600"
      case "legendary":
        return "from-yellow-400 to-yellow-600"
      default:
        return "from-gray-400 to-gray-600"
    }
  }

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case "common":
        return <Medal className="h-6 w-6" />
      case "uncommon":
        return <Shield className="h-6 w-6" />
      case "rare":
        return <Star className="h-6 w-6" />
      case "epic":
        return <Crown className="h-6 w-6" />
      case "legendary":
        return <Gem className="h-6 w-6" />
      default:
        return <Medal className="h-6 w-6" />
    }
  }

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "shadow-lg shadow-gray-300/50"
      case "uncommon":
        return "shadow-lg shadow-green-300/50"
      case "rare":
        return "shadow-xl shadow-blue-300/50"
      case "epic":
        return "shadow-xl shadow-purple-300/50"
      case "legendary":
        return "shadow-2xl shadow-yellow-300/50"
      default:
        return "shadow-lg"
    }
  }

  if (!isVisible || !achievement) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Achievement Card */}
      <Card
        className={`relative bg-gradient-to-br from-white to-gray-50 border-2 border-yellow-300 max-w-md w-full transform transition-all duration-500 ${getRarityGlow(
          achievement.rarity,
        )} ${isAnimating ? "scale-100 opacity-100 translate-y-0" : "scale-75 opacity-0 translate-y-8"}`}
      >
        {/* Close Button */}
        <Button
          onClick={handleClose}
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 z-10 text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Confetti Animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-gradient-to-r ${getRarityColor(
                achievement.rarity,
              )} rounded-full animate-bounce`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            />
          ))}
        </div>

        <CardContent className="p-8 text-center relative">
          {/* Achievement Icon */}
          <div className="relative mb-6">
            <div
              className={`absolute inset-0 bg-gradient-to-r ${getRarityColor(
                achievement.rarity,
              )} rounded-full blur-xl opacity-50 animate-pulse`}
            />
            <div
              className={`relative bg-gradient-to-r ${getRarityColor(
                achievement.rarity,
              )} p-6 rounded-full shadow-2xl mx-auto w-24 h-24 flex items-center justify-center`}
            >
              <div className="text-4xl">{achievement.icon}</div>
            </div>
          </div>

          {/* Achievement Unlocked Text */}
          <div className="mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="h-6 w-6 text-yellow-600" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Achievement Unlocked!
              </h2>
              <Trophy className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-yellow-600 font-medium">Congratulations!</span>
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </div>
          </div>

          {/* Achievement Details */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-800">{achievement.name}</h3>
            <p className="text-gray-600 text-lg">{achievement.description}</p>

            {/* Rarity Badge */}
            <div className="flex justify-center">
              <Badge
                className={`bg-gradient-to-r ${getRarityColor(
                  achievement.rarity,
                )} text-white px-4 py-2 text-lg font-bold flex items-center gap-2`}
              >
                {getRarityIcon(achievement.rarity)}
                {achievement.rarity.toUpperCase()}
              </Badge>
            </div>

            {/* XP Reward */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <span className="text-blue-700 font-bold text-xl">+{achievement.xpReward} XP</span>
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-blue-600 text-sm mt-1">Experience Points Earned!</p>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6">
            <Button
              onClick={handleClose}
              className={`bg-gradient-to-r ${getRarityColor(
                achievement.rarity,
              )} hover:opacity-90 text-white px-8 py-3 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200`}
            >
              Awesome! 🎉
            </Button>
          </div>
        </CardContent>

        {/* Animated Border */}
        <div
          className={`absolute inset-0 rounded-lg bg-gradient-to-r ${getRarityColor(
            achievement.rarity,
          )} opacity-20 animate-pulse pointer-events-none`}
        />
      </Card>
    </div>
  )
}
