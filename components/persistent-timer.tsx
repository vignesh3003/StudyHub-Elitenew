"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, X, Minimize, Maximize, RotateCcw } from "lucide-react"
import { useTimer } from "@/contexts/timer-context"

export default function PersistentTimer() {
  const {
    minutes,
    seconds,
    isRunning,
    mode,
    studyDuration,
    breakDuration,
    toggleTimer,
    resetTimer,
    togglePersistentTimer,
  } = useTimer()

  const [isMinimized, setIsMinimized] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Set initial position on mount
  useEffect(() => {
    const updatePosition = () => {
      const isMobile = window.innerWidth < 768
      if (isMobile) {
        // On mobile, position at bottom center
        setPosition({
          x: window.innerWidth / 2 - 150, // Half of card width
          y: window.innerHeight - 120, // Above bottom navigation
        })
      } else {
        // On desktop, position at bottom right
        setPosition({
          x: window.innerWidth - 280,
          y: window.innerHeight - 200,
        })
      }
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    return () => window.removeEventListener("resize", updatePosition)
  }, [])

  // Handle drag functionality for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (window.innerWidth >= 768) {
      // Only allow dragging on desktop
      setIsDragging(true)
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && window.innerWidth >= 768) {
      const newX = Math.max(0, Math.min(window.innerWidth - 280, e.clientX - dragOffset.x))
      const newY = Math.max(0, Math.min(window.innerHeight - 200, e.clientY - dragOffset.y))
      setPosition({ x: newX, y: newY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const closeTimer = () => {
    togglePersistentTimer()
  }

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isMobile ? "bottom-4 left-1/2 transform -translate-x-1/2" : ""
      } ${isMinimized ? "w-auto" : isMobile ? "w-80" : "w-72"}`}
      style={
        !isMobile
          ? {
              left: `${position.x}px`,
              top: `${position.y}px`,
              cursor: isDragging ? "grabbing" : "grab",
            }
          : {}
      }
    >
      <Card
        className={`shadow-2xl border-2 ${
          mode === "study"
            ? "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50"
            : "border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50"
        } backdrop-blur-xl`}
      >
        <div
          className={`${
            mode === "study"
              ? "bg-gradient-to-r from-blue-500 to-indigo-500"
              : "bg-gradient-to-r from-orange-500 to-amber-500"
          } text-white p-3 flex items-center justify-between rounded-t-lg cursor-grab active:cursor-grabbing`}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{mode === "study" ? "📚" : "☕"}</span>
            <span className="font-semibold text-lg">{mode === "study" ? "Study Time" : "Break Time"}</span>
          </div>
          <div className="flex items-center gap-1">
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20 transition-colors"
                onClick={toggleMinimize}
              >
                {isMinimized ? <Maximize className="h-4 w-4" /> : <Minimize className="h-4 w-4" />}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20 transition-colors"
              onClick={closeTimer}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {(!isMinimized || isMobile) && (
          <div className="p-4 bg-white/90 backdrop-blur-sm rounded-b-lg">
            <div className="text-center mb-4">
              <div
                className={`text-4xl lg:text-5xl font-bold font-mono ${
                  mode === "study" ? "text-blue-600" : "text-orange-600"
                }`}
              >
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {mode === "study" ? `Focus Session (${studyDuration}m)` : `Break Time (${breakDuration}m)`}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={toggleTimer}
                className={`flex-1 ${
                  isRunning
                    ? mode === "study"
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "bg-red-500 hover:bg-red-600"
                    : mode === "study"
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-blue-500 hover:bg-blue-600"
                } text-white shadow-lg hover:shadow-xl transition-all duration-200`}
              >
                {isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                {isRunning ? "Pause" : "Start"}
              </Button>

              <Button
                onClick={resetTimer}
                variant="outline"
                size="icon"
                className={`${
                  mode === "study"
                    ? "border-blue-300 text-blue-600 hover:bg-blue-50"
                    : "border-orange-300 text-orange-600 hover:bg-orange-50"
                } shadow-lg hover:shadow-xl transition-all duration-200`}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {isMinimized && !isMobile && (
          <div className="p-3 bg-white/90 backdrop-blur-sm rounded-b-lg flex items-center justify-between">
            <div className={`text-xl font-bold font-mono ${mode === "study" ? "text-blue-600" : "text-orange-600"}`}>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleTimer}
                className={`${
                  isRunning
                    ? mode === "study"
                      ? "text-orange-500"
                      : "text-red-500"
                    : mode === "study"
                      ? "text-green-500"
                      : "text-blue-500"
                } hover:bg-gray-100`}
              >
                {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={resetTimer}
                className={`${mode === "study" ? "text-blue-500" : "text-orange-500"} hover:bg-gray-100`}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
