"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Timer, Coffee, BookOpen, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTimer } from "@/contexts/timer-context"

export default function PomodoroTimer() {
  const {
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
  } = useTimer()

  const [studyDurationSlider, setStudyDurationSlider] = useState([studyDuration])
  const [breakDurationSlider, setBreakDurationSlider] = useState([breakDuration])
  const [showSettings, setShowSettings] = useState(false)

  const { toast } = useToast()

  const formatTime = (mins: number, secs: number) => {
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  const getProgressPercentage = () => {
    const totalDuration = mode === "study" ? studyDuration : breakDuration
    const currentTime = minutes * 60 + seconds
    const totalTime = totalDuration * 60
    return ((totalTime - currentTime) / totalTime) * 100
  }

  const handleStudyDurationChange = (value: number[]) => {
    setStudyDurationSlider(value)
  }

  const handleBreakDurationChange = (value: number[]) => {
    setBreakDurationSlider(value)
  }

  const applyDurationChanges = () => {
    setTimerDurations(studyDurationSlider[0], breakDurationSlider[0])
    toast({
      title: "Timer settings updated",
      description: `Study: ${studyDurationSlider[0]} min, Break: ${breakDurationSlider[0]} min`,
    })
  }

  return (
    <div className="space-y-8">
      {/* Main Timer Card */}
      <Card
        className={`relative overflow-hidden transition-all duration-500 ${
          mode === "study"
            ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50"
            : "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200/50"
        } shadow-2xl hover:shadow-3xl`}
      >
        <div
          className={`absolute inset-0 ${
            mode === "study"
              ? "bg-gradient-to-br from-blue-500/10 to-indigo-500/10"
              : "bg-gradient-to-br from-orange-500/10 to-amber-500/10"
          }`}
        ></div>

        <CardHeader className="relative text-center pb-4">
          <CardTitle
            className={`text-3xl flex items-center justify-center gap-4 ${
              mode === "study" ? "text-blue-700" : "text-orange-700"
            }`}
          >
            <div
              className={`p-4 rounded-3xl shadow-2xl ${
                mode === "study"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                  : "bg-gradient-to-r from-orange-500 to-amber-500"
              }`}
            >
              {mode === "study" ? (
                <BookOpen className="h-10 w-10 text-white" />
              ) : (
                <Coffee className="h-10 w-10 text-white" />
              )}
            </div>
            <div>
              <div className="text-2xl font-bold">{mode === "study" ? "Study Time" : "Break Time"}</div>
              <div className={`text-lg font-normal ${mode === "study" ? "text-blue-600/70" : "text-orange-600/70"}`}>
                {mode === "study" ? `${studyDuration} minute focus session` : `${breakDuration} minute break`}
              </div>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="relative text-center space-y-8">
          {/* Timer Display */}
          <div className="space-y-6">
            <div
              className={`text-8xl lg:text-9xl font-bold font-mono ${
                mode === "study" ? "text-blue-600" : "text-orange-600"
              } tracking-wider`}
            >
              {formatTime(minutes, seconds)}
            </div>

            {/* Progress Bar */}
            <div
              className={`w-full h-4 rounded-full overflow-hidden ${
                mode === "study" ? "bg-blue-200/50" : "bg-orange-200/50"
              }`}
            >
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  mode === "study"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                    : "bg-gradient-to-r from-orange-500 to-amber-500"
                } shadow-lg`}
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>

          {/* Mode Toggle Buttons */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => switchMode("study")}
              variant={mode === "study" ? "default" : "outline"}
              className={`px-6 py-3 text-lg font-medium transition-all duration-300 ${
                mode === "study"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-xl hover:shadow-2xl"
                  : "border-blue-300 text-blue-600 hover:bg-blue-50"
              }`}
              disabled={isRunning}
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Study
            </Button>
            <Button
              onClick={() => switchMode("break")}
              variant={mode === "break" ? "default" : "outline"}
              className={`px-6 py-3 text-lg font-medium transition-all duration-300 ${
                mode === "break"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xl hover:shadow-2xl"
                  : "border-orange-300 text-orange-600 hover:bg-orange-50"
              }`}
              disabled={isRunning}
            >
              <Coffee className="h-5 w-5 mr-2" />
              Break
            </Button>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center gap-6">
            <Button
              onClick={toggleTimer}
              size="lg"
              className={`px-8 py-4 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 ${
                isRunning
                  ? mode === "study"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    : "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600"
                  : mode === "study"
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
              } text-white`}
            >
              {isRunning ? (
                <>
                  <Pause className="h-6 w-6 mr-3" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-6 w-6 mr-3" />
                  Start
                </>
              )}
            </Button>

            <Button
              onClick={resetTimer}
              variant="outline"
              size="lg"
              className={`px-6 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
                mode === "study"
                  ? "border-blue-300 text-blue-600 hover:bg-blue-50"
                  : "border-orange-300 text-orange-600 hover:bg-orange-50"
              }`}
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Reset
            </Button>

            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              size="lg"
              className={`px-6 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
                mode === "study"
                  ? "border-blue-300 text-blue-600 hover:bg-blue-50"
                  : "border-orange-300 text-orange-600 hover:bg-orange-50"
              }`}
            >
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </Button>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className={`text-3xl font-bold ${mode === "study" ? "text-blue-600" : "text-orange-600"}`}>
                {completedSessions}
              </div>
              <div className={`text-sm font-medium ${mode === "study" ? "text-blue-600/70" : "text-orange-600/70"}`}>
                Sessions Completed
              </div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${mode === "study" ? "text-blue-600" : "text-orange-600"}`}>
                {Math.round(completedSessions * studyDuration)}
              </div>
              <div className={`text-sm font-medium ${mode === "study" ? "text-blue-600/70" : "text-orange-600/70"}`}>
                Minutes Studied
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-3 text-gray-800">
              <Settings className="h-6 w-6" />
              Timer Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Study Duration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-lg font-medium text-gray-700">Study Duration</label>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                    {studyDurationSlider[0]} minutes
                  </Badge>
                </div>
                <Slider
                  value={studyDurationSlider}
                  onValueChange={handleStudyDurationChange}
                  max={60}
                  min={5}
                  step={5}
                  className="w-full"
                  disabled={isRunning}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>5 min</span>
                  <span>60 min</span>
                </div>
              </div>

              {/* Break Duration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-lg font-medium text-gray-700">Break Duration</label>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 px-3 py-1">
                    {breakDurationSlider[0]} minutes
                  </Badge>
                </div>
                <Slider
                  value={breakDurationSlider}
                  onValueChange={handleBreakDurationChange}
                  max={30}
                  min={1}
                  step={1}
                  className="w-full"
                  disabled={isRunning}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>1 min</span>
                  <span>30 min</span>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="flex justify-end">
              <Button
                onClick={applyDurationChanges}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-xl hover:shadow-2xl"
                disabled={isRunning}
              >
                Apply Changes
              </Button>
            </div>

            {/* Preset Buttons */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Quick Presets</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  onClick={() => {
                    setStudyDurationSlider([25])
                    setBreakDurationSlider([5])
                  }}
                  variant="outline"
                  className="p-4 h-auto flex-col gap-2"
                  disabled={isRunning}
                >
                  <Timer className="h-5 w-5" />
                  <div className="text-sm font-medium">Classic</div>
                  <div className="text-xs text-gray-500">25/5 min</div>
                </Button>
                <Button
                  onClick={() => {
                    setStudyDurationSlider([45])
                    setBreakDurationSlider([15])
                  }}
                  variant="outline"
                  className="p-4 h-auto flex-col gap-2"
                  disabled={isRunning}
                >
                  <Timer className="h-5 w-5" />
                  <div className="text-sm font-medium">Extended</div>
                  <div className="text-xs text-gray-500">45/15 min</div>
                </Button>
                <Button
                  onClick={() => {
                    setStudyDurationSlider([15])
                    setBreakDurationSlider([3])
                  }}
                  variant="outline"
                  className="p-4 h-auto flex-col gap-2"
                  disabled={isRunning}
                >
                  <Timer className="h-5 w-5" />
                  <div className="text-sm font-medium">Quick</div>
                  <div className="text-xs text-gray-500">15/3 min</div>
                </Button>
                <Button
                  onClick={() => {
                    setStudyDurationSlider([50])
                    setBreakDurationSlider([10])
                  }}
                  variant="outline"
                  className="p-4 h-auto flex-col gap-2"
                  disabled={isRunning}
                >
                  <Timer className="h-5 w-5" />
                  <div className="text-sm font-medium">Deep Work</div>
                  <div className="text-xs text-gray-500">50/10 min</div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
