"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  Clock,
  Trash2,
  Plus,
  Calendar,
  BookOpen,
  AlertTriangle,
  MoreVertical,
  Edit,
  Tag,
  Target,
  Activity,
  CheckSquare,
  CalendarRange,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { taskService } from "@/lib/task-service"
import { gamificationService } from "@/lib/gamification-service"

interface Task {
  id: string
  title: string
  subject: string
  priority: "low" | "medium" | "high"
  completed: boolean
  dueDate: string
  description?: string
  tags?: string[]
  userId: string
  createdAt: any
  startDate: string
  endDate: string
}

interface EnhancedTaskManagerProps {
  user: any
}

export default function EnhancedTaskManager({ user }: EnhancedTaskManagerProps) {
  const [activeTab, setActiveTab] = useState<"all" | "today" | "upcoming" | "completed">("all")
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const today = new Date().toISOString().split("T")[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]

  // Subscribe to real-time task updates
  useEffect(() => {
    if (!user?.uid) return

    setIsLoading(true)
    const unsubscribe = taskService.subscribeToTasks(user.uid, (updatedTasks) => {
      setTasks(updatedTasks)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [user?.uid, toast])

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "all") return true
    if (activeTab === "today") return task.dueDate === today
    if (activeTab === "upcoming") return task.dueDate > today && !task.completed
    if (activeTab === "completed") return task.completed
    return true
  })

  const handleAddTask = async (newTaskData: Omit<Task, "id" | "userId" | "completed" | "createdAt">) => {
    try {
      if (!user?.uid) {
        toast({
          title: "Error",
          description: "You must be logged in to add tasks.",
          variant: "destructive",
        })
        return
      }

      // Create a clean task object, removing undefined fields
      const taskToAdd: any = {
        title: newTaskData.title,
        subject: newTaskData.subject,
        priority: newTaskData.priority,
        dueDate: newTaskData.dueDate,
        completed: false,
        startDate: newTaskData.startDate,
        endDate: newTaskData.endDate,
      }

      // Only add optional fields if they have values
      if (newTaskData.description && newTaskData.description.trim()) {
        taskToAdd.description = newTaskData.description.trim()
      }

      if (newTaskData.tags && newTaskData.tags.length > 0) {
        taskToAdd.tags = newTaskData.tags
      }

      await taskService.addTask(user.uid, taskToAdd)

      // Record task creation for gamification
      console.log("🎯 Recording task creation for gamification")
      await gamificationService.recordTaskCreated(user.uid)

      toast({
        title: "Task Added",
        description: "Your task has been successfully added!",
      })
      setIsAddingTask(false)
    } catch (error) {
      console.error("Error adding task:", error)
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleToggleTask = async (taskId: string, currentCompleted: boolean) => {
    try {
      await taskService.toggleTaskCompletion(user.uid, taskId, !currentCompleted)

      const task = tasks.find((t) => t.id === taskId)
      if (task) {
        if (!currentCompleted) {
          // Task is being completed
          console.log("🎯 Recording task completion for gamification")
          await gamificationService.recordTaskCompleted(user.uid)
        }
        toast({
          title: !currentCompleted ? "Task Completed! 🎉" : "Task Marked Incomplete",
          description: !currentCompleted
            ? `"${task.title}" completed! You earned XP!`
            : `"${task.title}" marked as incomplete`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const task = tasks.find((t) => t.id === taskId)
      await taskService.deleteTask(taskId)

      if (task) {
        toast({
          title: "Task Deleted",
          description: `"${task.title}" has been deleted.`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      const { id, userId, createdAt, ...updateData } = updatedTask
      await taskService.updateTask(id, updateData)

      toast({
        title: "Task Updated",
        description: `"${updatedTask.title}" has been updated.`,
      })
      setEditingTask(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getDueDateStatus = (dueDate: string) => {
    if (dueDate === today) return "Today"
    if (dueDate === tomorrow) return "Tomorrow"
    if (dueDate < today) return "Overdue"
    if (dueDate <= nextWeek) return "This Week"
    return new Date(dueDate).toLocaleDateString()
  }

  const getDueDateColor = (dueDate: string) => {
    if (dueDate < today) return "text-red-600"
    if (dueDate === today) return "text-orange-600"
    if (dueDate === tomorrow) return "text-yellow-600"
    return "text-blue-600"
  }

  // Analytics calculations
  const completionRate = tasks.length > 0 ? (tasks.filter((t) => t.completed).length / tasks.length) * 100 : 0
  const overdueTasks = tasks.filter((t) => !t.completed && t.dueDate < today).length
  const todayTasks = tasks.filter((t) => t.dueDate === today).length
  const completedToday = tasks.filter((t) => t.completed && t.dueDate === today).length

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">Please sign in to manage tasks.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <CheckSquare className="h-8 w-8 animate-pulse text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Task Management Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
          <Button
            onClick={() => setIsAddingTask(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" /> Add New Task
          </Button>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg rounded-2xl p-1">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl py-2 px-4 font-medium"
              >
                All Tasks
              </TabsTrigger>
              <TabsTrigger
                value="today"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-xl py-2 px-4 font-medium"
              >
                Today
              </TabsTrigger>
              <TabsTrigger
                value="upcoming"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white rounded-xl py-2 px-4 font-medium"
              >
                Upcoming
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-500 data-[state=active]:text-white rounded-xl py-2 px-4 font-medium"
              >
                Completed
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Task List Card */}
      <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
              <CheckSquare className="h-6 w-6 text-white" />
            </div>
            Tasks
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1">
              {filteredTasks.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-100 rounded-full p-6 inline-block mb-6">
                <CheckCircle className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-600 mb-3">No tasks found</h3>
              <p className="text-gray-500 text-lg mb-8">
                {activeTab === "completed"
                  ? "You haven't completed any tasks yet."
                  : activeTab === "today"
                    ? "No tasks due today."
                    : activeTab === "upcoming"
                      ? "No upcoming tasks."
                      : "Add your first task to get started!"}
              </p>
              <Button
                onClick={() => setIsAddingTask(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 text-lg shadow-xl"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Your First Task
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task, index) => (
                <div
                  key={task.id}
                  className={`border-2 rounded-2xl p-4 sm:p-6 bg-white/90 backdrop-blur-sm ${
                    task.completed ? "opacity-70 border-green-200" : "border-gray-200"
                  } hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
                  <div className="flex items-start gap-3 sm:gap-4 relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`rounded-full p-0 h-8 w-8 min-w-[2rem] ${
                        task.completed
                          ? "bg-green-100 text-green-600 hover:bg-green-200"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                      onClick={() => handleToggleTask(task.id, task.completed)}
                    >
                      <CheckCircle className="h-5 w-5" />
                    </Button>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <h3
                          className={`font-semibold text-base sm:text-lg ${task.completed ? "line-through text-gray-500" : "text-gray-800"}`}
                        >
                          {task.title}
                        </h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl"
                          >
                            <DropdownMenuItem
                              onClick={() => setEditingTask(task)}
                              className="hover:bg-blue-50 cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteTask(task.id)}
                              className="hover:bg-red-50 text-red-600 cursor-pointer"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-3 bg-gray-50/80 p-2 sm:p-3 rounded-xl">
                          {task.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <div className="flex items-center text-xs sm:text-sm text-gray-500 bg-blue-50/80 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full">
                          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          {task.subject}
                        </div>
                        <div
                          className={`flex items-center text-xs sm:text-sm ${getDueDateColor(task.dueDate)} bg-white/80 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border`}
                        >
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Due: {getDueDateStatus(task.dueDate)}
                        </div>
                        <div className="flex items-center text-xs sm:text-sm text-gray-500 bg-green-50/80 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full">
                          <CalendarRange className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="whitespace-nowrap">
                            Start: {new Date(task.startDate).toLocaleDateString()} | End:{" "}
                            {new Date(task.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs sm:text-sm font-medium ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority === "high" && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {task.priority}
                        </Badge>
                        {task.tags?.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="bg-purple-50 text-purple-700 border-purple-200 text-xs sm:text-sm font-medium"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Completion Rate */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/50 hover:shadow-xl transition-all duration-300">
          <CardHeader className="relative pb-3">
            <CardTitle className="text-lg flex items-center gap-3 text-emerald-700">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                <Target className="h-5 w-5 text-white" />
              </div>
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-baseline gap-2 mb-3">
              <p className="text-4xl font-bold text-emerald-600">{Math.round(completionRate)}</p>
              <p className="text-emerald-500 text-xl">%</p>
            </div>
            <p className="text-emerald-600/70 text-sm">
              {tasks.filter((t) => t.completed).length} of {tasks.length} tasks
            </p>
          </CardContent>
        </Card>

        {/* Today's Progress */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 hover:shadow-xl transition-all duration-300">
          <CardHeader className="relative pb-3">
            <CardTitle className="text-lg flex items-center gap-3 text-blue-700">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              Today's Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-baseline gap-2 mb-3">
              <p className="text-4xl font-bold text-blue-600">{completedToday}</p>
              <p className="text-blue-500 text-xl">/ {todayTasks}</p>
            </div>
            <p className="text-blue-600/70 text-sm">
              {todayTasks > 0 ? `${Math.round((completedToday / todayTasks) * 100)}% complete` : "No tasks today"}
            </p>
          </CardContent>
        </Card>

        {/* Overdue Tasks */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-pink-50 border-red-200/50 hover:shadow-xl transition-all duration-300">
          <CardHeader className="relative pb-3">
            <CardTitle className="text-lg flex items-center gap-3 text-red-700">
              <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-baseline gap-2 mb-3">
              <p className="text-4xl font-bold text-red-600">{overdueTasks}</p>
              <p className="text-red-500 text-xl">tasks</p>
            </div>
            <p className="text-red-600/70 text-sm">{overdueTasks === 0 ? "Great job!" : "Need attention"}</p>
          </CardContent>
        </Card>

        {/* Total Tasks */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200/50 hover:shadow-xl transition-all duration-300">
          <CardHeader className="relative pb-3">
            <CardTitle className="text-lg flex items-center gap-3 text-purple-700">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl shadow-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              Total Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-baseline gap-2 mb-3">
              <p className="text-4xl font-bold text-purple-600">{tasks.length}</p>
              <p className="text-purple-500 text-xl">tasks</p>
            </div>
            <p className="text-purple-600/70 text-sm">{tasks.length === 0 ? "Start adding tasks!" : "Keep it up!"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
        <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                <Plus className="h-6 w-6 text-white" />
              </div>
              Add New Task
            </DialogTitle>
          </DialogHeader>
          <TaskForm onSubmit={handleAddTask} onCancel={() => setIsAddingTask(false)} submitLabel="Add Task" />
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                <Edit className="h-6 w-6 text-white" />
              </div>
              Edit Task
            </DialogTitle>
          </DialogHeader>
          {editingTask && (
            <TaskForm
              initialData={editingTask}
              onSubmit={handleUpdateTask}
              onCancel={() => setEditingTask(null)}
              submitLabel="Update Task"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Task Form Component
interface TaskFormProps {
  initialData?: Task
  onSubmit: (task: any) => void
  onCancel: () => void
  submitLabel: string
}

function TaskForm({ initialData, onSubmit, onCancel, submitLabel }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    subject: initialData?.subject || "",
    priority: initialData?.priority || "medium",
    dueDate: initialData?.dueDate || "",
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    description: initialData?.description || "",
    tags: initialData?.tags?.join(", ") || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const taskData = {
      ...formData,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
    }

    if (initialData) {
      onSubmit({ ...initialData, ...taskData })
    } else {
      onSubmit(taskData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Task Title *</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter task title..."
            required
            className="bg-white/80 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
          <Input
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="e.g., Mathematics, History..."
            required
            className="bg-white/80 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
            <SelectTrigger className="bg-white/80 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
            className="bg-white/80 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
            className="bg-white/80 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
            className="bg-white/80 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags (optional)</label>
          <Input
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="homework, exam, project (comma-separated)"
            className="bg-white/80 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Add any additional details..."
            rows={3}
            className="bg-white/80 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl"
        >
          {submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  )
}
