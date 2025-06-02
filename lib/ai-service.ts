interface AIResponse {
  success: boolean
  data?: any
  error?: string
}

interface StudyPlan {
  subject: string
  duration: number
  topics: string[]
  difficulty: "easy" | "medium" | "hard"
  schedule: Array<{
    day: string
    tasks: string[]
    timeSlots: string[]
  }>
}

interface StudyTip {
  title: string
  description: string
  category: "memory" | "focus" | "organization" | "motivation"
  difficulty: "beginner" | "intermediate" | "advanced"
}

class AIService {
  // Use the Next.js API route
  private baseUrl = "/api"

  async generateFlashcards(data: {
    question: string
    answer: string
    subject: string
    difficulty: "easy" | "medium" | "hard"
  }): Promise<AIResponse> {
    try {
      console.log("🚀 Calling Next.js API route...")

      const response = await fetch(`${this.baseUrl}/generate-flashcards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API returned status ${response.status}: ${errorText}`)
      }

      const result = await response.json()

      return {
        success: result.success,
        data: result.flashcards,
        error: result.error,
      }
    } catch (error) {
      console.error("Flashcard generation error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate flashcards",
      }
    }
  }

  async generateFlashcardsFromFile(file: File, subject: string, difficulty: string): Promise<AIResponse> {
    // For now, return a message that this feature is coming soon
    return {
      success: false,
      error: "File upload feature is coming soon. Please use text input for now.",
    }
  }

  async generateFlashcardsFromImage(file: File, subject: string, difficulty: string): Promise<AIResponse> {
    try {
      console.log("🚀 Generating flashcards from image...")

      const formData = new FormData()
      formData.append("image", file)
      formData.append("subject", subject)
      formData.append("difficulty", difficulty)

      const response = await fetch(`${this.baseUrl}/generate-flashcards-from-image`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API returned status ${response.status}: ${errorText}`)
      }

      const result = await response.json()

      return {
        success: result.success,
        data: result.flashcards,
        error: result.error,
      }
    } catch (error) {
      console.error("Image flashcard generation error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate flashcards from image",
      }
    }
  }

  async generateStudyPlan(data: {
    subjects: string[]
    availableHours: number
    examDate?: string
    currentLevel: "beginner" | "intermediate" | "advanced"
    goals: string[]
  }): Promise<AIResponse> {
    // Mock implementation for now
    return {
      success: true,
      data: {
        total_weeks: 4,
        weekly_hours: data.availableHours,
        subjects_focus: data.subjects.reduce(
          (acc, subject) => {
            acc[subject] = `${Math.floor(100 / data.subjects.length)}%`
            return acc
          },
          {} as Record<string, string>,
        ),
        weekly_plans: [
          {
            week: 1,
            theme: "Foundation Building",
            goals: ["Establish study routine", "Cover basic concepts"],
            review_topics: ["Previous knowledge"],
          },
        ],
        study_techniques: data.subjects.reduce(
          (acc, subject) => {
            acc[subject] = ["Active reading", "Practice problems", "Review sessions"]
            return acc
          },
          {} as Record<string, string[]>,
        ),
      },
    }
  }

  async getPersonalizedTips(data: {
    studyHabits: string[]
    challenges: string[]
    subjects: string[]
    learningStyle: "visual" | "auditory" | "kinesthetic" | "reading"
  }): Promise<AIResponse> {
    // Mock implementation for now
    const tips = [
      {
        title: `Optimize for ${data.learningStyle} learning`,
        description: `Use ${data.learningStyle}-based techniques for better retention`,
        category: "memory" as const,
        difficulty: "beginner" as const,
        implementation: ["Identify your style", "Apply techniques", "Practice regularly"],
        subjects_applicable: data.subjects,
        time_required: "10-15 minutes daily",
      },
      {
        title: "Active recall practice",
        description: "Test yourself regularly without looking at notes",
        category: "memory" as const,
        difficulty: "intermediate" as const,
        implementation: ["Close your books", "Write what you remember", "Check accuracy"],
        subjects_applicable: data.subjects,
        time_required: "15-20 minutes per session",
      },
    ]

    return {
      success: true,
      data: tips,
    }
  }

  async analyzeStudyProgress(data: {
    completedTasks: number
    totalTasks: number
    studyHours: number
    grades: Array<{ subject: string; grade: number; maxGrade: number }>
    timeframe: "week" | "month" | "semester"
  }): Promise<AIResponse> {
    const completion_rate = data.totalTasks > 0 ? (data.completedTasks / data.totalTasks) * 100 : 0

    let performance_level = "Needs Improvement"
    if (completion_rate >= 80) performance_level = "Excellent"
    else if (completion_rate >= 60) performance_level = "Good"

    return {
      success: true,
      data: {
        overall_score: Math.round(completion_rate),
        performance_level,
        strengths: ["Task completion", "Study consistency"],
        areas_for_improvement: ["Time management", "Study efficiency"],
        recommendations: [
          {
            category: "Time Management",
            action: "Create a detailed study schedule",
            expected_impact: "Better organization and productivity",
            timeline: "This week",
          },
        ],
        next_goals: [
          {
            goal: "Improve completion rate",
            target_value: "90%",
            deadline: "Next week",
          },
        ],
        insights: ["Consistency is key", "Small improvements lead to big results"],
        motivation_message: "You're making great progress! Keep up the good work.",
      },
    }
  }

  async generateStudyNotesFromImage(
    file: File,
    message?: string,
    context?: {
      tasks: number
      completedTasks: number
      studyHours: number
      subjects: string[]
      grades: Array<{ subject: string; grade: number; maxGrade: number }>
    },
  ): Promise<AIResponse> {
    try {
      console.log("🚀 Analyzing image with AI...")

      const formData = new FormData()
      formData.append("image", file)
      formData.append("message", message || "Please analyze this image and provide study notes")
      if (context) {
        formData.append("context", JSON.stringify(context))
      }

      const response = await fetch(`${this.baseUrl}/ai-chat`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API returned status ${response.status}: ${errorText}`)
      }

      const result = await response.json()

      return {
        success: result.success,
        data: {
          studyNotes: result.response,
          hasImage: result.hasImage,
        },
        error: result.error,
      }
    } catch (error) {
      console.error("Image analysis error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to analyze image",
      }
    }
  }
}

export const aiService = new AIService()
export type { StudyPlan, StudyTip, AIResponse }
