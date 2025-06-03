"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

export default function RealTimeClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="flex items-center gap-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
      <div className="relative">
        <Clock className="h-5 w-5 text-blue-500" />
        <div className="absolute inset-0 bg-blue-400/30 rounded-full blur-sm animate-pulse"></div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums">{formatTime(time)}</div>
        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{formatDate(time)}</div>
      </div>
    </div>
  )
}
