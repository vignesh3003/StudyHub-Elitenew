"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
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
  BarChart3,
  PieChart,
  Target,
  Zap,
  Award,
  Activity,
  CheckSquare,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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

interface EnhancedTaskManagerProps {
  tasks: Task[]
  onAddTask: (task: Omit<Task, "id" | "completed">) => void
  onToggleTask: (id: string) => void
  onDeleteTask: (id: string) => void
  onUpdateTask: (task: Task) => void
  onReorderTasks: (tasks: Task[]) => void
}

export default function EnhancedTaskManager({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
  onReorderTasks,
}: EnhancedTaskManagerProps) {
  const [activeTab, setActiveTab] = useState<"all" | "today" | "upcoming" | "completed">("all")
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const today = new Date().toISOString().split("T")[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "all") return true
    if (activeTab === "today") return task.dueDate === today
    if (activeTab === "upcoming") return task.dueDate > today && !task.completed
    if (activeTab === "completed") return task.completed
    return true
  })

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(filteredTasks)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update the full task list with the new order
    const newTaskList = [...tasks]
    tasks.forEach((task, index) => {
      const reorderedIndex = items.findIndex((item) => item.id === task.id)
      if (reorderedIndex !== -1) {
        newTaskList[index] = items[reorderedIndex]
      }
    })

    onReorderTasks(newTaskList)
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

  const subjectStats = tasks.reduce(
    (acc, task) => {
      if (!acc[task.subject]) {
        acc[task.subject] = { total: 0, completed: 0 }
      }
      acc[task.subject].total++
      if (task.completed) acc[task.subject].completed++
      return acc
    },
    {} as Record<string, { total: number; completed: number }>,
  )

  const priorityStats = tasks.reduce(
    (acc, task) => {
      if (!acc[task.priority]) {
        acc[task.priority] = { total: 0, completed: 0 }
      }
      acc[task.priority].total++
      if (task.completed) acc[task.priority].completed++
      return acc
    },
    {} as Record<string, { total: number; completed: number }>,
  )

  return (
    <div className="space-y-8">
      {/* Task Management Section - Moved to top */}
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

      {/* Task List Card - Moved up before analytics */}
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
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="tasks">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {filteredTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
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
                                onClick={() => onToggleTask(task.id)}
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
                                        className="hover:bg-blue-50"
                                      >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => onDeleteTask(task.id)}
                                        className="hover:bg-red-50 text-red-600"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                {task.description && (
                                  <p className="text-sm text-gray-600 mb-3 bg-gray-50/80 p-2 sm:p-3 rounded-xl line-clamp-2 sm:line-clamp-none">
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
                                    {getDueDateStatus(task.dueDate)}
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
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>

      {/* Analytics Dashboard - Moved below task list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Completion Rate */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/50 hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-xl"></div>
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
            <div className="w-full bg-emerald-200/50 rounded-full h-2 mb-2">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            <p className="text-emerald-600/70 text-sm">
              {tasks.filter((t) => t.completed).length} of {tasks.length} tasks
            </p>
          </CardContent>
        </Card>

        {/* Today's Progress */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-xl"></div>
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
            <div className="w-full bg-blue-200/50 rounded-full h-2 mb-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${todayTasks > 0 ? (completedToday / todayTasks) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-blue-600/70 text-sm">
              {todayTasks > 0 ? Math.round((completedToday / todayTasks) * 100) : 0}% completed today
            </p>
          </CardContent>
        </Card>

        {/* Overdue Tasks */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-rose-50 border-red-200/50 hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-rose-500/10"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-400/20 to-rose-400/20 rounded-full blur-xl"></div>
          <CardHeader className="relative pb-3">
            <CardTitle className="text-lg flex items-center gap-3 text-red-700">
              <div className="p-2 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl shadow-lg">
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
            <p className="text-red-600/70 text-sm">
              {overdueTasks === 0 ? "Great job! No overdue tasks" : "Need immediate attention"}
            </p>
          </CardContent>
        </Card>

        {/* Productivity Score */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200/50 hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-violet-400/20 rounded-full blur-xl"></div>
          <CardHeader className="relative pb-3">
            <CardTitle className="text-lg flex items-center gap-3 text-purple-700">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl shadow-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              Productivity
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-baseline gap-2 mb-3">
              <p className="text-4xl font-bold text-purple-600">
                {Math.round((completionRate + (overdueTasks === 0 ? 20 : 0)) / 1.2)}
              </p>
              <p className="text-purple-500 text-xl">%</p>
            </div>
            <div className="flex items-center gap-2">
              {Math.round((completionRate + (overdueTasks === 0 ? 20 : 0)) / 1.2) >= 80 ? (
                <Award className="h-4 w-4 text-purple-500" />
              ) : (
                <Zap className="h-4 w-4 text-purple-500" />
              )}
              <p className="text-purple-600/70 text-sm">
                {Math.round((completionRate + (overdueTasks === 0 ? 20 : 0)) / 1.2) >= 80
                  ? "Excellent!"
                  : "Keep going!"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject & Priority Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Subject Performance */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-3 text-blue-700">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              Subject Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(subjectStats).map(([subject, stats]) => (
                <div key={subject} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-blue-700">{subject}</span>
                    <span className="text-sm text-blue-600">
                      {stats.completed}/{stats.total} ({Math.round((stats.completed / stats.total) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-blue-200/50 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {Object.keys(subjectStats).length === 0 && (
                <p className="text-blue-600/70 text-center py-8">No subjects yet. Add some tasks to see analytics!</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200/50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-3 text-orange-700">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                <PieChart className="h-6 w-6 text-white" />
              </div>
              Priority Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(priorityStats).map(([priority, stats]) => (
                <div key={priority} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          priority === "high" ? "bg-red-500" : priority === "medium" ? "bg-yellow-500" : "bg-green-500"
                        }`}
                      ></div>
                      <span className="font-medium text-orange-700 capitalize">{priority} Priority</span>
                    </div>
                    <span className="text-sm text-orange-600">
                      {stats.completed}/{stats.total} ({Math.round((stats.completed / stats.total) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-orange-200/50 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        priority === "high"
                          ? "bg-gradient-to-r from-red-500 to-rose-500"
                          : priority === "medium"
                            ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                            : "bg-gradient-to-r from-green-500 to-emerald-500"
                      }`}
                      style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {Object.keys(priorityStats).length === 0 && (
                <p className="text-orange-600/70 text-center py-8">No tasks yet. Add some tasks to see analytics!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
        <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Add New Task
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const tags = ((formData.get("tags") as string) || "")
                .split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag !== "")

              onAddTask({
                title: formData.get("title") as string,
                subject: formData.get("subject") as string,
                priority: formData.get("priority") as "low" | "medium" | "high",
                dueDate: formData.get("dueDate") as string,
                description: formData.get("description") as string,
                tags: tags.length > 0 ? tags : undefined,
              })
              setIsAddingTask(false)
            }}
            className="space-y-6"
          >
            <Input
              name="title"
              placeholder="Task title"
              required
              className="h-12 text-lg border-gray-200 focus:border-blue-400 bg-white/80"
            />
            <Textarea
              name="description"
              placeholder="Description (optional)"
              rows={3}
              className="text-lg border-gray-200 focus:border-blue-400 bg-white/80"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="subject"
                placeholder="Subject"
                required
                className="h-12 text-lg border-gray-200 focus:border-blue-400 bg-white/80"
              />
              <Select name="priority" required defaultValue="medium">
                <SelectTrigger className="h-12 text-lg border-gray-200 focus:border-blue-400 bg-white/80">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200/50">
                  <SelectItem value="low">🟢 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🔴 High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <Input
                  name="dueDate"
                  type="date"
                  defaultValue={today}
                  required
                  className="h-12 text-lg border-gray-200 focus:border-blue-400 bg-white/80"
                />
              </div>
              <Input
                name="tags"
                placeholder="Tags (comma separated)"
                className="h-12 text-lg border-gray-200 focus:border-blue-400 bg-white/80"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddingTask(false)}
                className="px-6 py-3 text-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg shadow-xl"
              >
                Add Task
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Edit Task
            </DialogTitle>
          </DialogHeader>
          {editingTask && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const tags = ((formData.get("tags") as string) || "")
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter((tag) => tag !== "")

                onUpdateTask({
                  ...editingTask,
                  title: formData.get("title") as string,
                  subject: formData.get("subject") as string,
                  priority: formData.get("priority") as "low" | "medium" | "high",
                  dueDate: formData.get("dueDate") as string,
                  description: formData.get("description") as string,
                  tags: tags.length > 0 ? tags : undefined,
                })
                setEditingTask(null)
              }}
              className="space-y-6"
            >
              <Input
                name="title"
                placeholder="Task title"
                defaultValue={editingTask.title}
                required
                className="h-12 text-lg border-gray-200 focus:border-blue-400 bg-white/80"
              />
              <Textarea
                name="description"
                placeholder="Description (optional)"
                rows={3}
                defaultValue={editingTask.description || ""}
                className="text-lg border-gray-200 focus:border-blue-400 bg-white/80"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="subject"
                  placeholder="Subject"
                  defaultValue={editingTask.subject}
                  required
                  className="h-12 text-lg border-gray-200 focus:border-blue-400 bg-white/80"
                />
                <Select name="priority" required defaultValue={editingTask.priority}>
                  <SelectTrigger className="h-12 text-lg border-gray-200 focus:border-blue-400 bg-white/80">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200/50">
                    <SelectItem value="low">🟢 Low</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="high">🔴 High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <Input
                    name="dueDate"
                    type="date"
                    defaultValue={editingTask.dueDate}
                    required
                    className="h-12 text-lg border-gray-200 focus:border-blue-400 bg-white/80"
                  />
                </div>
                <Input
                  name="tags"
                  placeholder="Tags (comma separated)"
                  defaultValue={editingTask.tags?.join(", ") || ""}
                  className="h-12 text-lg border-gray-200 focus:border-blue-400 bg-white/80"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingTask(null)}
                  className="px-6 py-3 text-lg"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg shadow-xl"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
