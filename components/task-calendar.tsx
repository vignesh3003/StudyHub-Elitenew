"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, CalendarIcon, CheckCircle, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface TaskCalendarProps {
  user: any
}

export default function TaskCalendar({ user }: TaskCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [calendarDays, setCalendarDays] = useState<Array<{ date: Date; isCurrentMonth: boolean }>>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskSubject, setNewTaskSubject] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium")

  // Initialize with sample tasks
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]

    const sampleTasks: Task[] = [
      {
        id: "1",
        title: "Complete Math Assignment",
        subject: "Mathematics",
        priority: "high",
        completed: false,
        dueDate: today,
        description: "Solve problems 1-20 from chapter 5",
        tags: ["homework", "algebra"],
      },
      {
        id: "2",
        title: "Read History Chapter",
        subject: "History",
        priority: "medium",
        completed: false,
        dueDate: tomorrow,
        description: "Read chapter 12 about World War II",
        tags: ["reading", "wwii"],
      },
      {
        id: "3",
        title: "Science Lab Report",
        subject: "Science",
        priority: "high",
        completed: true,
        dueDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        description: "Write lab report on chemical reactions",
        tags: ["lab", "chemistry"],
      },
    ]
    setTasks(sampleTasks)
  }, [])

  // Generate calendar days for the current month view
  useEffect(() => {
    const days = []
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)

    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay()

    // Add days from previous month to fill the first week
    for (let i = firstDayOfWeek; i > 0; i--) {
      const prevMonthDay = new Date(year, month, 1 - i)
      days.push({ date: prevMonthDay, isCurrentMonth: false })
    }

    // Add all days of the current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true })
    }

    // Add days from next month to complete the last week
    const remainingDays = 7 - (days.length % 7)
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        const nextMonthDay = new Date(year, month + 1, i)
        days.push({ date: nextMonthDay, isCurrentMonth: false })
      }
    }

    setCalendarDays(days)
  }, [currentMonth])

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleDateSelect = (date: Date) => {
    // Fix: Use local date string to avoid timezone issues
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const dateString = `${year}-${month}-${day}`

    setSelectedDate(dateString)
  }

  const getTasksForDate = (date: Date) => {
    // Fix: Use local date string to avoid timezone issues
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const dateString = `${year}-${month}-${day}`

    return tasks.filter((task) => task.dueDate === dateString)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const dateString = `${year}-${month}-${day}`
    return dateString === selectedDate
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleToggleTask = (id: string) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const handleQuickAddTask = () => {
    if (!newTaskTitle.trim() || !newTaskSubject.trim()) return

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      subject: newTaskSubject,
      priority: newTaskPriority,
      dueDate: selectedDate,
      description: "",
      completed: false,
    }

    setTasks((prev) => [...prev, newTask])
    setNewTaskTitle("")
    setNewTaskSubject("")
    setNewTaskPriority("medium")
    setIsAddingTask(false)
  }

  // Format month and year for display
  const monthYearString = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">Please sign in to view calendar.</p>
      </div>
    )
  }

  return (
    <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
              <CalendarIcon className="h-6 w-6 text-white" />
            </div>
            Task Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevMonth}
              className="h-10 w-10 rounded-full border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-lg font-medium text-gray-700 dark:text-gray-300 min-w-[180px] text-center">
              {monthYearString}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              className="h-10 w-10 rounded-full border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Grid */}
        <div className="mb-6">
          {/* Day names */}
          <div className="grid grid-cols-7 mb-2 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-2 font-medium text-gray-500 dark:text-gray-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dayTasks = getTasksForDate(day.date)
              const hasHighPriority = dayTasks.some((task) => task.priority === "high" && !task.completed)
              const hasCompletedTasks = dayTasks.some((task) => task.completed)
              const allTasksCompleted = dayTasks.length > 0 && dayTasks.every((task) => task.completed)

              return (
                <div
                  key={index}
                  onClick={() => handleDateSelect(day.date)}
                  className={`
                    min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 border rounded-lg cursor-pointer transition-all duration-200
                    ${!day.isCurrentMonth ? "bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-100 dark:border-gray-700" : "border-gray-200 dark:border-gray-700"}
                    ${isToday(day.date) ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20" : ""}
                    ${isSelected(day.date) ? "ring-2 ring-blue-500 border-blue-500" : ""}
                    ${hasHighPriority ? "bg-red-50 dark:bg-red-900/20" : ""}
                    ${allTasksCompleted ? "bg-green-50 dark:bg-green-900/20" : ""}
                    hover:bg-gray-100 dark:hover:bg-gray-800
                  `}
                >
                  <div className="flex justify-between items-start">
                    <span
                      className={`
                      text-sm sm:text-base font-medium
                      ${isToday(day.date) ? "text-blue-600 dark:text-blue-400" : day.isCurrentMonth ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-600"}
                    `}
                    >
                      {day.date.getDate()}
                    </span>

                    {dayTasks.length > 0 && (
                      <Badge
                        className={`
                          text-xs px-1.5 py-0.5
                          ${allTasksCompleted ? "bg-green-500" : hasHighPriority ? "bg-red-500" : "bg-blue-500"}
                        `}
                      >
                        {dayTasks.length}
                      </Badge>
                    )}
                  </div>

                  {/* Task indicators */}
                  <div className="mt-1 space-y-1 overflow-hidden max-h-[40px] sm:max-h-[60px]">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-1 text-xs truncate"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleTask(task.id)
                        }}
                      >
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                        <span
                          className={
                            task.completed
                              ? "line-through text-gray-400 dark:text-gray-600"
                              : "text-gray-600 dark:text-gray-400"
                          }
                        >
                          {task.title.length > 12 ? `${task.title.substring(0, 12)}...` : task.title}
                        </span>
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">+{dayTasks.length - 3} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Selected Day Tasks */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              Tasks for{" "}
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </h3>
            <Button
              onClick={() => setIsAddingTask(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>

          {/* Quick Add Task Form */}
          {isAddingTask && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="space-y-3">
                <Input
                  placeholder="Task title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="bg-white dark:bg-gray-800"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Subject"
                    value={newTaskSubject}
                    onChange={(e) => setNewTaskSubject(e.target.value)}
                    className="bg-white dark:bg-gray-800"
                  />
                  <Select
                    value={newTaskPriority}
                    onValueChange={(value: "low" | "medium" | "high") => setNewTaskPriority(value)}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🟢 Low</SelectItem>
                      <SelectItem value="medium">🟡 Medium</SelectItem>
                      <SelectItem value="high">🔴 High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleQuickAddTask}
                    disabled={!newTaskTitle.trim() || !newTaskSubject.trim()}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    size="sm"
                  >
                    Add Task
                  </Button>
                  <Button
                    onClick={() => {
                      setIsAddingTask(false)
                      setNewTaskTitle("")
                      setNewTaskSubject("")
                      setNewTaskPriority("medium")
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {tasks
              .filter((task) => task.dueDate === selectedDate)
              .map((task) => (
                <div
                  key={task.id}
                  className={`
                    p-4 rounded-xl border ${task.completed ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700" : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"} 
                    flex items-start gap-3 hover:shadow-md transition-shadow
                  `}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-full p-0 h-8 w-8 min-w-[2rem] flex-shrink-0 ${
                      task.completed
                        ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => handleToggleTask(task.id)}
                  >
                    <CheckCircle className="h-5 w-5" />
                  </Button>

                  <div className="flex-1">
                    <h4
                      className={`font-medium ${task.completed ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-800 dark:text-gray-200"}`}
                    >
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {task.subject}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          task.priority === "high"
                            ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                            : task.priority === "medium"
                              ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
                              : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                        }`}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}

            {tasks.filter((task) => task.dueDate === selectedDate).length === 0 && (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">No tasks scheduled for this day</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
