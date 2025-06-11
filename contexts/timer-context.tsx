"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"

interface TimerContextType {
  minutes: number
  seconds: number
  isRunning: boolean
  mode: "study" | "break"
  studyDuration: number
  breakDuration: number
  completedSessions: number
  toggleTimer: () => void
  resetTimer: () => void
  setTimerDurations: (study: number, breakTime: number) => void
  switchMode: (newMode: "study" | "break") => void
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<"study" | "break">("study")
  const [studyDuration, setStudyDuration] = useState(25)
  const [breakDuration, setBreakDuration] = useState(5)
  const [completedSessions, setCompletedSessions] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 0) {
            setMinutes((prevMinutes) => {
              if (prevMinutes === 0) {
                // Timer finished
                setIsRunning(false)
                handleTimerComplete()
                return mode === "study" ? breakDuration : studyDuration
              }
              return prevMinutes - 1
            })
            return 59
          }
          return prevSeconds - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, mode, studyDuration, breakDuration])

  const handleTimerComplete = () => {
    if (mode === "study") {
      setCompletedSessions((prev) => prev + 1)
      toast({
        title: "🎉 Study Session Complete!",
        description: "Great job! Time for a well-deserved break.",
      })
      setMode("break")
      setMinutes(breakDuration)
    } else {
      toast({
        title: "⏰ Break Time Over!",
        description: "Ready to get back to studying?",
      })
      setMode("study")
      setMinutes(studyDuration)
    }
    setSeconds(0)
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setMinutes(mode === "study" ? studyDuration : breakDuration)
    setSeconds(0)
  }

  const setTimerDurations = (study: number, breakTime: number) => {
    setStudyDuration(study)
    setBreakDuration(breakTime)
    if (!isRunning) {
      setMinutes(mode === "study" ? study : breakTime)
      setSeconds(0)
    }
  }

  const switchMode = (newMode: "study" | "break") => {
    setMode(newMode)
    setIsRunning(false)
    setMinutes(newMode === "study" ? studyDuration : breakDuration)
    setSeconds(0)
  }

  return (
    <TimerContext.Provider
      value={{
        minutes,
        seconds,
        isRunning,
        mode,
        studyDuration,
        breakDuration,
        completedSessions,
        toggleTimer,
        resetTimer,
        setTimerDurations,
        switchMode,
      }}
    >
      {children}
    </TimerContext.Provider>
  )
}

export function useTimer() {
  const context = useContext(TimerContext)
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider")
  }
  return context
}
