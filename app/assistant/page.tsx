"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { taskService } from "@/lib/task-service"
import AIStudyAssistant from "@/components/ai-study-assistant"
import { Loader2 } from "lucide-react"

export default function AssistantPage() {
  const [user, loading] = useAuthState(auth)
  const { toast } = useToast()
  const [tasks, setTasks] = useState<any[]>([])
  const [studyHours, setStudyHours] = useState(0)
  const [grades, setGrades] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.uid) return

      try {
        setIsLoading(true)

        // Load tasks
        const userTasks = await taskService.getTasks(user.uid)
        setTasks(userTasks)

        // For now, we'll use mock data for study hours and grades
        // In a real app, you would fetch this from your database
        setStudyHours(Math.floor(Math.random() * 10) + 1) // Random hours between 1-10
        setGrades([
          { subject: "Mathematics", grade: 85, maxGrade: 100 },
          { subject: "Science", grade: 92, maxGrade: 100 },
          { subject: "History", grade: 78, maxGrade: 100 },
        ])

        setIsLoading(false)
      } catch (error) {
        console.error("Error loading user data:", error)
        toast({
          title: "Error",
          description: "Failed to load your data. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    if (user) {
      loadUserData()
    } else if (!loading) {
      setIsLoading(false)
    }
  }, [user, loading, toast])

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your assistant...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="py-12">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
              <p className="text-gray-600">Please sign in to access the AI Assistant.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <AIStudyAssistant tasks={tasks} studyHours={studyHours} grades={grades} setTasks={setTasks} />
    </div>
  )
}
