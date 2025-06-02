"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type TimerMode = "study" | "break"

interface TimerContextType {
  minutes: number
  seconds: number
  isRunning: boolean
  mode: TimerMode
  studyDuration: number
  breakDuration: number
  showPersistentTimer: boolean
  completedSessions: number
  toggleTimer: () => void
  resetTimer: () => void
  setTimerDurations: (study: number, break_: number) => void
  togglePersistentTimer: () => void
  handleTimerComplete: () => void
  switchMode: (newMode: TimerMode) => void
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [studyDuration, setStudyDuration] = useState(25)
  const [breakDuration, setBreakDuration] = useState(5)
  const [minutes, setMinutes] = useState(studyDuration)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<TimerMode>("study")
  const [showPersistentTimer, setShowPersistentTimer] = useState(false)
  const [completedSessions, setCompletedSessions] = useState(0)

  // Load timer state from localStorage on component mount
  useEffect(() => {
    const savedTimerState = localStorage.getItem("timerState")
    if (savedTimerState) {
      try {
        const {
          minutes: savedMinutes,
          seconds: savedSeconds,
          isRunning: savedIsRunning,
          mode: savedMode,
          studyDuration: savedStudyDuration,
          breakDuration: savedBreakDuration,
          showPersistentTimer: savedShowPersistentTimer,
          completedSessions: savedCompletedSessions,
          lastUpdated,
        } = JSON.parse(savedTimerState)

        // If the timer was running, calculate elapsed time
        if (savedIsRunning && lastUpdated) {
          const now = Date.now()
          const elapsedSeconds = Math.floor((now - lastUpdated) / 1000)

          if (elapsedSeconds > 0) {
            const totalSeconds = savedMinutes * 60 + savedSeconds - elapsedSeconds

            // If timer would have completed while away
            if (totalSeconds <= 0) {
              // Handle timer completion
              if (savedMode === "study") {
                setMode("break")
                setMinutes(savedBreakDuration)
                setCompletedSessions(savedCompletedSessions + 1)
              } else {
                setMode("study")
                setMinutes(savedStudyDuration)
              }
              setSeconds(0)
              setIsRunning(false)
            } else {
              // Update timer with elapsed time
              setMinutes(Math.floor(totalSeconds / 60))
              setSeconds(totalSeconds % 60)
              setIsRunning(savedIsRunning)
              setMode(savedMode)
            }
          } else {
            // No significant time elapsed
            setMinutes(savedMinutes)
            setSeconds(savedSeconds)
            setIsRunning(savedIsRunning)
            setMode(savedMode)
          }
        } else {
          // Timer wasn't running, just restore state
          setMinutes(savedMinutes)
          setSeconds(savedSeconds)
          setIsRunning(savedIsRunning)
          setMode(savedMode)
        }

        setStudyDuration(savedStudyDuration)
        setBreakDuration(savedBreakDuration)
        setShowPersistentTimer(savedShowPersistentTimer)
        setCompletedSessions(savedCompletedSessions)
      } catch (error) {
        console.error("Error restoring timer state:", error)
      }
    }
  }, [])

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    const timerState = {
      minutes,
      seconds,
      isRunning,
      mode,
      studyDuration,
      breakDuration,
      showPersistentTimer,
      completedSessions,
      lastUpdated: isRunning ? Date.now() : null,
    }
    localStorage.setItem("timerState", JSON.stringify(timerState))
  }, [minutes, seconds, isRunning, mode, studyDuration, breakDuration, showPersistentTimer, completedSessions])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1)
        } else if (minutes > 0) {
          setMinutes(minutes - 1)
          setSeconds(59)
        }
      }, 1000)
    } else if (minutes === 0 && seconds === 0 && isRunning) {
      setIsRunning(false)
      handleTimerComplete()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, minutes, seconds])

  const toggleTimer = () => {
    if (!isRunning && !showPersistentTimer) {
      // Request notification permission
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission()
      }
      setShowPersistentTimer(true)
    }
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    if (mode === "study") {
      setMinutes(studyDuration)
    } else {
      setMinutes(breakDuration)
    }
    setSeconds(0)
  }

  const setTimerDurations = (study: number, break_: number) => {
    setStudyDuration(study)
    setBreakDuration(break_)

    // Update current timer if not running
    if (!isRunning) {
      if (mode === "study") {
        setMinutes(study)
        setSeconds(0)
      } else {
        setMinutes(break_)
        setSeconds(0)
      }
    }
  }

  const togglePersistentTimer = () => {
    setShowPersistentTimer(!showPersistentTimer)
  }

  const handleTimerComplete = () => {
    const currentDuration = mode === "study" ? studyDuration : breakDuration

    if (mode === "study") {
      setCompletedSessions((prev) => prev + 1)
      setMode("break")
      setMinutes(breakDuration)
      setSeconds(0)

      // Play notification sound (if supported)
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Study Session Complete!", {
          body: `Time for a ${breakDuration} minute break!`,
          icon: "/favicon.ico",
        })
      }
    } else {
      setMode("study")
      setMinutes(studyDuration)
      setSeconds(0)

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Break Complete!", {
          body: `Time to get back to studying!`,
          icon: "/favicon.ico",
        })
      }
    }
  }

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false)
    setMode(newMode)
    if (newMode === "study") {
      setMinutes(studyDuration)
    } else {
      setMinutes(breakDuration)
    }
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
        showPersistentTimer,
        completedSessions,
        toggleTimer,
        resetTimer,
        setTimerDurations,
        togglePersistentTimer,
        handleTimerComplete,
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
