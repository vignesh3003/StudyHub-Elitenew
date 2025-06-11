import { gamificationService } from "./gamification-service"

export interface StudyEfficiencyReport {
  overallScore: number
  weeklyTrend: "improving" | "stable" | "declining"
  insights: Array<{
    type: "success" | "warning" | "improvement" | "info"
    title: string
    description: string
    recommendation: string
    priority: "high" | "medium" | "low"
    icon: string
  }>
  strengths: string[]
  focusAreas: string[]
  recommendations: string[]
  predictedGoals: Array<{
    title: string
    probability: number
    timeframe: string
    actions: string[]
  }>
  learningPatterns: {
    bestStudyTime: string
    averageSessionLength: number
    mostProductiveDay: string
    preferredSubjects: string[]
    focusScore: number
  }
  socialMetrics: {
    collaborationScore: number
    helpfulness: number
    communityEngagement: number
  }
}

export interface StudyInsights {
  overallScore: number
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  focusAreas: string[]
  motivationalMessage: string
}

class AIAnalyticsService {
  generateStudyEfficiencyReport(data: {
    tasks: any[]
    studySessions: any[]
    studyHours: number
    completionRate: number
    streakDays: number
    subjects: any[]
    aiUsage: any
  }): StudyEfficiencyReport {
    const { tasks, studySessions, studyHours, completionRate, streakDays, subjects, aiUsage } = data

    // Calculate overall score
    const overallScore = Math.min(
      100,
      Math.round(
        completionRate * 0.3 +
          Math.min(studyHours * 2, 40) * 0.25 +
          Math.min(streakDays * 2, 30) * 0.2 +
          Math.min(subjects.length * 5, 25) * 0.15 +
          Math.min(aiUsage.totalQueries, 20) * 0.1,
      ),
    )

    // Determine weekly trend
    const weeklyTrend = this.calculateWeeklyTrend(studySessions, completionRate)

    // Generate insights
    const insights = this.generateInsights(data, overallScore)

    // Analyze strengths and focus areas
    const { strengths, focusAreas } = this.analyzeStrengthsAndFocusAreas(data)

    // Generate recommendations
    const recommendations = this.generateRecommendations(data, insights)

    // Predict goals
    const predictedGoals = this.generatePredictedGoals(data)

    // Analyze learning patterns
    const learningPatterns = this.analyzeLearningPatterns(studySessions, subjects)

    // Calculate social metrics
    const socialMetrics = this.calculateSocialMetrics(data)

    return {
      overallScore,
      weeklyTrend,
      insights,
      strengths,
      focusAreas,
      recommendations,
      predictedGoals,
      learningPatterns,
      socialMetrics,
    }
  }

  private calculateWeeklyTrend(studySessions: any[], completionRate: number): "improving" | "stable" | "declining" {
    if (studySessions.length === 0) return "stable"

    // Simple trend calculation based on recent activity
    const recentSessions = studySessions.slice(0, 7).length
    const olderSessions = studySessions.slice(7, 14).length

    if (recentSessions > olderSessions && completionRate > 70) return "improving"
    if (recentSessions < olderSessions || completionRate < 50) return "declining"
    return "stable"
  }

  private generateInsights(data: any, overallScore: number) {
    const insights = []
    const { tasks, studyHours, streakDays, completionRate, aiUsage } = data

    // Study time insights
    if (studyHours > 20) {
      insights.push({
        type: "success" as const,
        title: "Excellent Study Dedication",
        description: `You've logged ${studyHours.toFixed(1)} hours of focused study time.`,
        recommendation: "Keep maintaining this excellent pace and consider teaching others!",
        priority: "low" as const,
        icon: "🏆",
      })
    } else if (studyHours < 5) {
      insights.push({
        type: "improvement" as const,
        title: "Increase Study Time",
        description: "Your study hours are below the recommended weekly target.",
        recommendation: "Try to aim for at least 1-2 hours of focused study daily.",
        priority: "high" as const,
        icon: "⏰",
      })
    }

    // Task completion insights
    if (completionRate > 80) {
      insights.push({
        type: "success" as const,
        title: "Task Completion Champion",
        description: `Outstanding ${completionRate.toFixed(0)}% task completion rate!`,
        recommendation: "You're excelling at task management. Consider mentoring others!",
        priority: "low" as const,
        icon: "✅",
      })
    } else if (completionRate < 50) {
      insights.push({
        type: "warning" as const,
        title: "Task Completion Needs Attention",
        description: "Your task completion rate could be improved.",
        recommendation: "Break large tasks into smaller chunks and set daily completion goals.",
        priority: "high" as const,
        icon: "⚠️",
      })
    }

    // Streak insights
    if (streakDays > 7) {
      insights.push({
        type: "success" as const,
        title: "Consistency Master",
        description: `Amazing ${streakDays}-day study streak!`,
        recommendation: "Your consistency is paying off. Keep this momentum going!",
        priority: "low" as const,
        icon: "🔥",
      })
    } else if (streakDays === 0) {
      insights.push({
        type: "improvement" as const,
        title: "Build Your Streak",
        description: "Starting a study streak can boost your motivation.",
        recommendation: "Commit to just 15 minutes of study today to start your streak.",
        priority: "medium" as const,
        icon: "🎯",
      })
    }

    // AI usage insights
    if (aiUsage.totalQueries > 10) {
      insights.push({
        type: "success" as const,
        title: "AI Power User",
        description: "You're effectively leveraging AI tools for learning.",
        recommendation: "Explore advanced AI features like PDF summarization and study plans.",
        priority: "low" as const,
        icon: "🤖",
      })
    } else if (aiUsage.totalQueries < 3) {
      insights.push({
        type: "info" as const,
        title: "Explore AI Features",
        description: "You haven't fully explored our AI-powered study tools.",
        recommendation: "Try the flashcard generator and study assistant for enhanced learning.",
        priority: "medium" as const,
        icon: "✨",
      })
    }

    // Overall performance insight
    if (overallScore > 80) {
      insights.push({
        type: "success" as const,
        title: "Outstanding Performance",
        description: "You're in the top tier of StudyHub users!",
        recommendation: "Consider sharing your study strategies with the community.",
        priority: "low" as const,
        icon: "🌟",
      })
    } else if (overallScore < 40) {
      insights.push({
        type: "improvement" as const,
        title: "Room for Growth",
        description: "There's significant potential to improve your study efficiency.",
        recommendation: "Focus on building consistent daily habits and using the Pomodoro timer.",
        priority: "high" as const,
        icon: "📈",
      })
    }

    return insights.slice(0, 6) // Return top 6 insights
  }

  private analyzeStrengthsAndFocusAreas(data: any) {
    const { studyHours, completionRate, streakDays, subjects, aiUsage } = data
    const strengths = []
    const focusAreas = []

    // Analyze strengths
    if (completionRate > 75) strengths.push("Excellent task completion")
    if (studyHours > 15) strengths.push("Strong time commitment")
    if (streakDays > 5) strengths.push("Consistent daily habits")
    if (subjects.length > 3) strengths.push("Diverse subject engagement")
    if (aiUsage.totalQueries > 8) strengths.push("Effective AI tool usage")

    // Analyze focus areas
    if (completionRate < 60) focusAreas.push("Task completion efficiency")
    if (studyHours < 8) focusAreas.push("Study time consistency")
    if (streakDays < 3) focusAreas.push("Daily habit formation")
    if (subjects.length < 2) focusAreas.push("Subject diversity")
    if (aiUsage.totalQueries < 5) focusAreas.push("AI tool exploration")

    return {
      strengths: strengths.length > 0 ? strengths : ["Building foundation skills", "Getting started with learning"],
      focusAreas: focusAreas.length > 0 ? focusAreas : ["Continue current progress"],
    }
  }

  private generateRecommendations(data: any, insights: any[]) {
    const recommendations = []
    const { studyHours, completionRate, streakDays } = data

    // Priority recommendations based on data
    if (completionRate < 60) {
      recommendations.push("Use the Eisenhower Matrix to prioritize tasks by urgency and importance")
      recommendations.push("Break large tasks into 25-minute Pomodoro sessions")
    }

    if (studyHours < 10) {
      recommendations.push("Schedule specific study blocks in your calendar")
      recommendations.push("Start with 2-hour daily study sessions and gradually increase")
    }

    if (streakDays < 7) {
      recommendations.push("Set a daily minimum study goal (even 15 minutes counts)")
      recommendations.push("Use habit stacking: study right after an existing habit")
    }

    // General recommendations
    recommendations.push("Review your progress weekly and adjust strategies")
    recommendations.push("Join study rooms to learn from peers and stay motivated")
    recommendations.push("Use active recall techniques instead of passive reading")

    return recommendations.slice(0, 5)
  }

  private generatePredictedGoals(data: any) {
    const { studyHours, completionRate, streakDays } = data
    const goals = []

    // Predict achievable goals based on current performance
    if (completionRate > 70) {
      goals.push({
        title: "Achieve 90% Task Completion",
        probability: 85,
        timeframe: "2 weeks",
        actions: ["Maintain current pace", "Use time-blocking for better focus"],
      })
    } else {
      goals.push({
        title: "Reach 70% Task Completion",
        probability: 75,
        timeframe: "3 weeks",
        actions: ["Break tasks into smaller chunks", "Set daily completion targets"],
      })
    }

    if (studyHours > 10) {
      goals.push({
        title: "Complete 50 Study Hours",
        probability: 80,
        timeframe: "1 month",
        actions: ["Maintain current study schedule", "Track progress daily"],
      })
    } else {
      goals.push({
        title: "Establish 20 Hours/Week Routine",
        probability: 70,
        timeframe: "2 weeks",
        actions: ["Schedule 3-hour daily blocks", "Use Pomodoro technique"],
      })
    }

    if (streakDays < 7) {
      goals.push({
        title: "Build 14-Day Study Streak",
        probability: 65,
        timeframe: "2 weeks",
        actions: ["Study minimum 15 minutes daily", "Set phone reminders"],
      })
    }

    return goals.slice(0, 3)
  }

  private analyzeLearningPatterns(studySessions: any[], subjects: any[]) {
    // Analyze when user studies most
    const hourCounts: { [key: number]: number } = {}
    const dayCounts: { [key: string]: number } = {}

    studySessions.forEach((session) => {
      const date = session.startTime?.toDate?.() || new Date(session.startTime)
      const hour = date.getHours()
      const day = date.toLocaleDateString("en-US", { weekday: "long" })

      hourCounts[hour] = (hourCounts[hour] || 0) + 1
      dayCounts[day] = (dayCounts[day] || 0) + 1
    })

    // Find best study hour
    let bestHour = 9 // Default to 9am
    let maxCount = 0
    for (const [hour, count] of Object.entries(hourCounts)) {
      if (count > maxCount) {
        maxCount = count
        bestHour = Number.parseInt(hour)
      }
    }

    // Find most productive day
    let mostProductiveDay = "Monday" // Default
    maxCount = 0
    for (const [day, count] of Object.entries(dayCounts)) {
      if (count > maxCount) {
        maxCount = count
        mostProductiveDay = day
      }
    }

    const avgSessionLength =
      studySessions.length > 0 ? studySessions.reduce((acc, s) => acc + (s.duration || 0), 0) / studySessions.length : 0

    return {
      bestStudyTime: `${bestHour}:00`,
      averageSessionLength: Math.round(avgSessionLength),
      mostProductiveDay,
      preferredSubjects: subjects.slice(0, 3).map((s) => s.name),
      focusScore: Math.min(100, Math.round((avgSessionLength / 25) * 100)),
    }
  }

  private calculateSocialMetrics(data: any) {
    // Mock social metrics - in real app, this would come from actual social interactions
    return {
      collaborationScore: Math.floor(Math.random() * 40) + 60, // 60-100
      helpfulness: Math.floor(Math.random() * 30) + 70, // 70-100
      communityEngagement: Math.floor(Math.random() * 50) + 50, // 50-100
    }
  }

  async generateInsights(userId: string, tasks: any[], studyHours: number): Promise<StudyInsights> {
    try {
      const userStats = await gamificationService.getUserStats(userId)
      const completedTasks = tasks.filter((task) => task.completed).length
      const totalTasks = tasks.length
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
      const streak = userStats.streak || 0
      const level = userStats.level || 1

      const overallScore = Math.min(
        100,
        Math.round(
          completionRate * 0.4 +
            Math.min(studyHours * 2, 50) * 0.3 +
            Math.min(streak * 3, 30) * 0.2 +
            Math.min(level * 2, 20) * 0.1,
        ),
      )

      const insights = this.analyzePerformance({
        completionRate,
        studyHours,
        streak,
        level,
        totalTasks,
        completedTasks,
        overallScore,
      })

      return insights
    } catch (error) {
      console.error("Error generating insights:", error)
      return this.getDefaultInsights()
    }
  }

  private analyzePerformance(metrics: {
    completionRate: number
    studyHours: number
    streak: number
    level: number
    totalTasks: number
    completedTasks: number
    overallScore: number
  }): StudyInsights {
    const { completionRate, studyHours, streak, level, totalTasks, overallScore } = metrics

    const strengths: string[] = []
    const weaknesses: string[] = []
    const recommendations: string[] = []
    const focusAreas: string[] = []

    if (completionRate >= 80) {
      strengths.push("Excellent task completion rate")
    } else if (completionRate >= 60) {
      strengths.push("Good task management")
    } else if (completionRate < 40) {
      weaknesses.push("Low task completion rate")
      recommendations.push("Break large tasks into smaller, manageable chunks")
      focusAreas.push("Task Management")
    }

    if (studyHours >= 20) {
      strengths.push("Dedicated study time commitment")
    } else if (studyHours >= 10) {
      strengths.push("Consistent study habits")
    } else if (studyHours < 5) {
      weaknesses.push("Limited study time")
      recommendations.push("Try the Pomodoro technique to build consistent study habits")
      focusAreas.push("Study Consistency")
    }

    if (streak >= 7) {
      strengths.push("Outstanding study streak")
    } else if (streak >= 3) {
      strengths.push("Building good momentum")
    } else if (streak === 0) {
      weaknesses.push("No current study streak")
      recommendations.push("Start with just 15 minutes of study today to begin your streak")
      focusAreas.push("Daily Consistency")
    }

    if (level >= 5) {
      strengths.push("Strong learning progression")
    } else if (level >= 3) {
      strengths.push("Steady advancement")
    }

    if (totalTasks === 0) {
      recommendations.push("Create your first task to start organizing your studies")
      focusAreas.push("Getting Started")
    }

    if (recommendations.length === 0) {
      recommendations.push("Keep up the great work! Consider exploring AI features to enhance your learning")
    }

    const motivationalMessage = this.generateMotivationalMessage(overallScore, strengths.length)

    return {
      overallScore,
      strengths: strengths.length > 0 ? strengths : ["You're just getting started - every expert was once a beginner!"],
      weaknesses: weaknesses.length > 0 ? weaknesses : [],
      recommendations,
      focusAreas: focusAreas.length > 0 ? focusAreas : ["Exploration"],
      motivationalMessage,
    }
  }

  private generateMotivationalMessage(score: number, strengthCount: number): string {
    if (score >= 80) {
      return "🌟 You're absolutely crushing it! Your dedication is truly inspiring."
    } else if (score >= 60) {
      return "🚀 Great progress! You're building excellent study habits."
    } else if (score >= 40) {
      return "💪 You're on the right track! Small consistent steps lead to big achievements."
    } else if (strengthCount > 0) {
      return "🌱 Every journey begins with a single step. You're already showing promise!"
    } else {
      return "✨ Welcome to your learning journey! The best time to start is now."
    }
  }

  private getDefaultInsights(): StudyInsights {
    return {
      overallScore: 0,
      strengths: ["You're just getting started!"],
      weaknesses: [],
      recommendations: [
        "Create your first task to begin organizing your studies",
        "Try a 25-minute Pomodoro session to build focus",
        "Explore the AI features to enhance your learning",
      ],
      focusAreas: ["Getting Started"],
      motivationalMessage: "✨ Welcome to StudyHub Elite! Your learning adventure begins now.",
    }
  }

  async getStudyEfficiencyTips(completionRate: number, studyHours: number): Promise<string[]> {
    const tips: string[] = []

    if (completionRate < 60) {
      tips.push("Break large tasks into smaller, 25-minute focused sessions")
      tips.push("Use the priority matrix to focus on important and urgent tasks first")
      tips.push("Set specific, measurable goals for each study session")
    }

    if (studyHours < 3) {
      tips.push("Start with just 15 minutes of focused study daily")
      tips.push("Use the Pomodoro timer to maintain concentration")
      tips.push("Find your peak energy hours and schedule important tasks then")
    }

    tips.push("Review and adjust your study methods weekly")
    tips.push("Use active recall techniques instead of passive reading")
    tips.push("Take regular breaks to maintain mental freshness")

    return tips
  }
}

export const aiAnalyticsService = new AIAnalyticsService()
export type { StudyInsights as AIInsight }
