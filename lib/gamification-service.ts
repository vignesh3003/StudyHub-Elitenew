import { db } from "@/lib/firebase"
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  arrayUnion,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore"

export interface UserStats {
  xp: number
  level: number
  streak: number
  lastActive: Timestamp | null
  studyHours: number
  tasksCompleted: number
  flashcardsCreated: number
  badges: string[]
  achievements: Achievement[]
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  progress?: number
  maxProgress?: number
  date?: string
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
  xpReward: number
  category: "study" | "tasks" | "social" | "ai" | "streak" | "special"
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
}

class GamificationService {
  private readonly XP_PER_LEVEL = 1000
  private achievementCallbacks: ((achievement: Achievement) => void)[] = []

  // Subscribe to achievement notifications
  onAchievementUnlocked(callback: (achievement: Achievement) => void) {
    this.achievementCallbacks.push(callback)
    return () => {
      this.achievementCallbacks = this.achievementCallbacks.filter((cb) => cb !== callback)
    }
  }

  private notifyAchievementUnlocked(achievement: Achievement) {
    this.achievementCallbacks.forEach((callback) => callback(achievement))
  }

  // Initialize user stats if they don't exist
  async initUserStats(userId: string): Promise<UserStats> {
    const initialStats: UserStats = {
      xp: 50, // Welcome bonus
      level: 1,
      streak: 0,
      lastActive: null,
      studyHours: 0,
      tasksCompleted: 0,
      flashcardsCreated: 0,
      badges: [],
      achievements: [
        // COMMON ACHIEVEMENTS (Easy to get, low XP)
        {
          id: "first-steps",
          name: "⭐ First Steps",
          description: "Log in to StudyHub Elite for the first time",
          icon: "⭐",
          earned: true,
          date: new Date().toLocaleDateString(),
          rarity: "common" as const,
          xpReward: 50,
          category: "special" as const,
        },
        {
          id: "first-task",
          name: "📝 Task Creator",
          description: "Create your very first task",
          icon: "📝",
          earned: false,
          progress: 0,
          maxProgress: 1,
          rarity: "common" as const,
          xpReward: 25,
          category: "tasks" as const,
        },
        {
          id: "early-bird",
          name: "🌅 Early Bird",
          description: "Complete a task before 9 AM",
          icon: "🌅",
          earned: false,
          rarity: "common" as const,
          xpReward: 30,
          category: "tasks" as const,
        },
        {
          id: "first-study",
          name: "📖 Study Starter",
          description: "Complete your first study session",
          icon: "📖",
          earned: false,
          progress: 0,
          maxProgress: 1,
          rarity: "common" as const,
          xpReward: 40,
          category: "study" as const,
        },
        {
          id: "quick-learner",
          name: "⚡ Quick Learner",
          description: "Create your first flashcard",
          icon: "⚡",
          earned: false,
          progress: 0,
          maxProgress: 1,
          rarity: "common" as const,
          xpReward: 35,
          category: "ai" as const,
        },

        // UNCOMMON ACHIEVEMENTS (Moderate effort, decent XP)
        {
          id: "study-novice",
          name: "📚 Study Novice",
          description: "Complete 5 study sessions",
          icon: "📚",
          earned: false,
          progress: 0,
          maxProgress: 5,
          rarity: "uncommon" as const,
          xpReward: 100,
          category: "study" as const,
        },
        {
          id: "week-warrior",
          name: "⚔️ Week Warrior",
          description: "Study for 7 days in a row",
          icon: "⚔️",
          earned: false,
          progress: 0,
          maxProgress: 7,
          rarity: "uncommon" as const,
          xpReward: 150,
          category: "streak" as const,
        },
        {
          id: "task-crusher",
          name: "💪 Task Crusher",
          description: "Complete 10 tasks in a single day",
          icon: "💪",
          earned: false,
          progress: 0,
          maxProgress: 10,
          rarity: "uncommon" as const,
          xpReward: 120,
          category: "tasks" as const,
        },
        {
          id: "focused-mind",
          name: "🎯 Focused Mind",
          description: "Study for 2 hours straight",
          icon: "🎯",
          earned: false,
          rarity: "uncommon" as const,
          xpReward: 130,
          category: "study" as const,
        },
        {
          id: "flashcard-fan",
          name: "🃏 Flashcard Fan",
          description: "Create 10 flashcards",
          icon: "🃏",
          earned: false,
          progress: 0,
          maxProgress: 10,
          rarity: "uncommon" as const,
          xpReward: 110,
          category: "ai" as const,
        },

        // RARE ACHIEVEMENTS (Good effort required, high XP)
        {
          id: "task-master",
          name: "🏆 Task Master",
          description: "Complete 50 tasks",
          icon: "🏆",
          earned: false,
          progress: 0,
          maxProgress: 50,
          rarity: "rare" as const,
          xpReward: 300,
          category: "tasks" as const,
        },
        {
          id: "flashcard-creator",
          name: "🎴 Flashcard Creator",
          description: "Create 25 flashcards",
          icon: "🎴",
          earned: false,
          progress: 0,
          maxProgress: 25,
          rarity: "rare" as const,
          xpReward: 250,
          category: "ai" as const,
        },
        {
          id: "focus-master",
          name: "🧠 Focus Master",
          description: "Study for 3 hours without a break",
          icon: "🧠",
          earned: false,
          rarity: "rare" as const,
          xpReward: 400,
          category: "study" as const,
        },
        {
          id: "consistency-builder",
          name: "🔄 Consistency Builder",
          description: "Study for 14 days in a row",
          icon: "🔄",
          earned: false,
          progress: 0,
          maxProgress: 14,
          rarity: "rare" as const,
          xpReward: 350,
          category: "streak" as const,
        },
        {
          id: "productivity-pro",
          name: "⚡ Productivity Pro",
          description: "Complete 100 tasks",
          icon: "⚡",
          earned: false,
          progress: 0,
          maxProgress: 100,
          rarity: "rare" as const,
          xpReward: 450,
          category: "tasks" as const,
        },

        // EPIC ACHIEVEMENTS (Significant dedication, very high XP)
        {
          id: "streak-warrior",
          name: "🔥 Streak Warrior",
          description: "Study for 30 days in a row",
          icon: "🔥",
          earned: false,
          progress: 0,
          maxProgress: 30,
          rarity: "epic" as const,
          xpReward: 750,
          category: "streak" as const,
        },
        {
          id: "ai-explorer",
          name: "🤖 AI Explorer",
          description: "Use all 5 AI features",
          icon: "🤖",
          earned: false,
          progress: 0,
          maxProgress: 5,
          rarity: "epic" as const,
          xpReward: 500,
          category: "ai" as const,
        },
        {
          id: "century-club",
          name: "💯 Century Club",
          description: "Complete 200 tasks",
          icon: "💯",
          earned: false,
          progress: 0,
          maxProgress: 200,
          rarity: "epic" as const,
          xpReward: 800,
          category: "tasks" as const,
        },
        {
          id: "study-machine",
          name: "🚀 Study Machine",
          description: "Study for 50 hours total",
          icon: "🚀",
          earned: false,
          progress: 0,
          maxProgress: 50,
          rarity: "epic" as const,
          xpReward: 700,
          category: "study" as const,
        },
        {
          id: "flashcard-master",
          name: "🎯 Flashcard Master",
          description: "Create 100 flashcards",
          icon: "🎯",
          earned: false,
          progress: 0,
          maxProgress: 100,
          rarity: "epic" as const,
          xpReward: 600,
          category: "ai" as const,
        },

        // LEGENDARY ACHIEVEMENTS (Extreme dedication, massive XP)
        {
          id: "study-marathon",
          name: "🏃‍♂️ Study Marathon",
          description: "Study for 100 hours total",
          icon: "🏃‍♂️",
          earned: false,
          progress: 0,
          maxProgress: 100,
          rarity: "legendary" as const,
          xpReward: 1500,
          category: "study" as const,
        },
        {
          id: "perfectionist",
          name: "💎 Perfectionist",
          description: "Maintain 95% task completion rate with 500+ tasks",
          icon: "💎",
          earned: false,
          progress: 0,
          maxProgress: 500,
          rarity: "legendary" as const,
          xpReward: 2000,
          category: "tasks" as const,
        },
        {
          id: "consistency-king",
          name: "👑 Consistency King",
          description: "Study for 100 days in a row",
          icon: "👑",
          earned: false,
          progress: 0,
          maxProgress: 100,
          rarity: "legendary" as const,
          xpReward: 3000,
          category: "streak" as const,
        },
        {
          id: "knowledge-god",
          name: "⚡ Knowledge God",
          description: "Create 500 flashcards",
          icon: "⚡",
          earned: false,
          progress: 0,
          maxProgress: 500,
          rarity: "legendary" as const,
          xpReward: 2500,
          category: "ai" as const,
        },
        {
          id: "ultimate-scholar",
          name: "🌟 Ultimate Scholar",
          description: "Reach Level 50 and complete 1000 tasks",
          icon: "🌟",
          earned: false,
          progress: 0,
          maxProgress: 1000,
          rarity: "legendary" as const,
          xpReward: 5000,
          category: "special" as const,
        },
      ],
    }

    try {
      const userStatsRef = doc(db, "userStats", userId)
      await setDoc(userStatsRef, {
        ...initialStats,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // Save to localStorage as backup
      localStorage.setItem(`userStats_${userId}`, JSON.stringify(initialStats))
    } catch (error: any) {
      console.warn("Could not save user stats to Firebase:", error.message)
      // Save to localStorage as fallback
      localStorage.setItem(`userStats_${userId}`, JSON.stringify(initialStats))
    }

    return initialStats
  }

  // Get user stats
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      const userStatsRef = doc(db, "userStats", userId)
      const userStatsDoc = await getDoc(userStatsRef)

      if (!userStatsDoc.exists()) {
        return this.initUserStats(userId)
      }

      const data = userStatsDoc.data() as UserStats

      // Always ensure we have the full achievement structure
      if (!data.achievements || data.achievements.length === 0) {
        console.log("Initializing achievements for existing user...")
        const freshStats = await this.initUserStats(userId)

        // Preserve existing stats but use fresh achievements
        const updatedData = {
          ...data,
          achievements: freshStats.achievements,
          updatedAt: serverTimestamp(),
        }

        await updateDoc(userStatsRef, updatedData)
        localStorage.setItem(`userStats_${userId}`, JSON.stringify(updatedData))
        return updatedData
      }

      // Save to localStorage as backup
      localStorage.setItem(`userStats_${userId}`, JSON.stringify(data))
      return data
    } catch (error: any) {
      console.warn("Error fetching user stats, trying localStorage:", error.message)

      // Try to get from localStorage
      const localData = localStorage.getItem(`userStats_${userId}`)
      if (localData) {
        return JSON.parse(localData)
      }

      // Return fresh stats as fallback
      return this.initUserStats(userId)
    }
  }

  // Update streak based on daily login
  async updateStreak(userId: string): Promise<number> {
    try {
      const userStatsRef = doc(db, "userStats", userId)
      const userStatsDoc = await getDoc(userStatsRef)

      if (!userStatsDoc.exists()) {
        await this.initUserStats(userId)
        return 1
      }

      const stats = userStatsDoc.data() as UserStats
      const now = new Date()
      const lastActive = stats.lastActive?.toDate() || null

      let newStreak = stats.streak
      if (lastActive) {
        const lastActiveDate = new Date(lastActive)
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)

        const isToday =
          lastActiveDate.getDate() === now.getDate() &&
          lastActiveDate.getMonth() === now.getMonth() &&
          lastActiveDate.getFullYear() === now.getFullYear()

        const isYesterday =
          lastActiveDate.getDate() === yesterday.getDate() &&
          lastActiveDate.getMonth() === yesterday.getMonth() &&
          lastActiveDate.getFullYear() === yesterday.getFullYear()

        if (isToday) {
          return stats.streak
        } else if (isYesterday) {
          newStreak = stats.streak + 1
        } else {
          newStreak = 1
        }
      } else {
        newStreak = 1
      }

      await updateDoc(userStatsRef, {
        streak: newStreak,
        lastActive: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // Update localStorage
      const updatedStats = { ...stats, streak: newStreak }
      localStorage.setItem(`userStats_${userId}`, JSON.stringify(updatedStats))

      // Check for streak achievements
      if (newStreak >= 7) {
        await this.unlockAchievement(userId, "week-warrior")
      }
      if (newStreak >= 14) {
        await this.unlockAchievement(userId, "consistency-builder")
      }
      if (newStreak >= 30) {
        await this.unlockAchievement(userId, "streak-warrior")
      }
      if (newStreak >= 100) {
        await this.unlockAchievement(userId, "consistency-king")
      }

      return newStreak
    } catch (error: any) {
      console.warn("Error updating streak:", error.message)
      return 1
    }
  }

  // Add XP and check for level up
  async addXP(userId: string, amount: number): Promise<{ newXP: number; newLevel: number; leveledUp: boolean }> {
    try {
      const userStatsRef = doc(db, "userStats", userId)
      const userStatsDoc = await getDoc(userStatsRef)

      if (!userStatsDoc.exists()) {
        await this.initUserStats(userId)
        return { newXP: amount, newLevel: 1, leveledUp: false }
      }

      const stats = userStatsDoc.data() as UserStats
      const currentLevel = stats.level
      const newXP = stats.xp + amount

      const newLevel = Math.floor(newXP / this.XP_PER_LEVEL) + 1
      const leveledUp = newLevel > currentLevel

      await updateDoc(userStatsRef, {
        xp: newXP,
        level: newLevel,
        updatedAt: serverTimestamp(),
      })

      // Update localStorage
      const updatedStats = { ...stats, xp: newXP, level: newLevel }
      localStorage.setItem(`userStats_${userId}`, JSON.stringify(updatedStats))

      return { newXP, newLevel, leveledUp }
    } catch (error: any) {
      console.warn("Error adding XP:", error.message)

      // Fallback to localStorage
      const localData = localStorage.getItem(`userStats_${userId}`)
      if (localData) {
        const stats = JSON.parse(localData)
        const currentLevel = stats.level
        const newXP = stats.xp + amount
        const newLevel = Math.floor(newXP / this.XP_PER_LEVEL) + 1
        const leveledUp = newLevel > currentLevel

        const updatedStats = { ...stats, xp: newXP, level: newLevel }
        localStorage.setItem(`userStats_${userId}`, JSON.stringify(updatedStats))

        return { newXP, newLevel, leveledUp }
      }

      return { newXP: amount, newLevel: 1, leveledUp: false }
    }
  }

  // Record completed task
  async recordTaskCompleted(userId: string): Promise<void> {
    try {
      const userStatsRef = doc(db, "userStats", userId)

      await updateDoc(userStatsRef, {
        tasksCompleted: increment(1),
        updatedAt: serverTimestamp(),
      })

      await this.addXP(userId, 25)

      // Check for task achievements
      const updatedStats = await this.getUserStats(userId)

      if (updatedStats.tasksCompleted >= 1) {
        await this.unlockAchievement(userId, "first-task")
      }
      if (updatedStats.tasksCompleted >= 50) {
        await this.unlockAchievement(userId, "task-master")
      }
      if (updatedStats.tasksCompleted >= 100) {
        await this.unlockAchievement(userId, "productivity-pro")
      }
      if (updatedStats.tasksCompleted >= 200) {
        await this.unlockAchievement(userId, "century-club")
      }
      if (updatedStats.tasksCompleted >= 500) {
        await this.updateAchievementProgress(userId, "perfectionist", updatedStats.tasksCompleted)
      }
      if (updatedStats.tasksCompleted >= 1000) {
        await this.updateAchievementProgress(userId, "ultimate-scholar", updatedStats.tasksCompleted)
      }

      await this.updateAchievementProgress(userId, "task-master", updatedStats.tasksCompleted)
      await this.updateAchievementProgress(userId, "productivity-pro", updatedStats.tasksCompleted)
      await this.updateAchievementProgress(userId, "century-club", updatedStats.tasksCompleted)
    } catch (error: any) {
      console.warn("Error recording task completion:", error.message)

      // Fallback to localStorage
      const localData = localStorage.getItem(`userStats_${userId}`)
      if (localData) {
        const stats = JSON.parse(localData)
        stats.tasksCompleted = (stats.tasksCompleted || 0) + 1
        localStorage.setItem(`userStats_${userId}`, JSON.stringify(stats))
        await this.addXP(userId, 25)
      }
    }
  }

  // Record task creation (different from completion)
  async recordTaskCreated(userId: string): Promise<void> {
    try {
      console.log(`🎯 Recording task creation for user ${userId}`)

      // First ensure user stats exist
      const userStatsRef = doc(db, "userStats", userId)
      const userStatsDoc = await getDoc(userStatsRef)
      if (!userStatsDoc.exists()) {
        console.log("📊 User stats don't exist, initializing...")
        await this.initUserStats(userId)
      }

      await this.addXP(userId, 10) // Small XP for creating a task

      // Check for task creation achievements
      console.log("🏆 Unlocking first-task achievement")
      await this.unlockAchievement(userId, "first-task")

      console.log("✅ Task creation recorded successfully")
    } catch (error: any) {
      console.error("❌ Error recording task creation:", error)
      await this.addXP(userId, 10)
    }
  }

  // Record study session
  async recordStudySession(userId: string, durationMinutes: number): Promise<void> {
    try {
      const userStatsRef = doc(db, "userStats", userId)

      const hours = durationMinutes / 60

      await updateDoc(userStatsRef, {
        studyHours: increment(hours),
        updatedAt: serverTimestamp(),
      })

      const xpEarned = Math.floor(durationMinutes / 5) * 10
      await this.addXP(userId, xpEarned)

      const updatedStats = await this.getUserStats(userId)

      // Check for study achievements
      if (updatedStats.studyHours >= 1) {
        await this.unlockAchievement(userId, "first-study")
      }
      if (updatedStats.studyHours >= 5) {
        await this.unlockAchievement(userId, "study-novice")
      }
      if (updatedStats.studyHours >= 50) {
        await this.unlockAchievement(userId, "study-machine")
      }
      if (updatedStats.studyHours >= 100) {
        await this.unlockAchievement(userId, "study-marathon")
      }
      if (durationMinutes >= 120) {
        // 2 hours
        await this.unlockAchievement(userId, "focused-mind")
      }
      if (durationMinutes >= 180) {
        // 3 hours
        await this.unlockAchievement(userId, "focus-master")
      }

      await this.updateAchievementProgress(userId, "study-novice", Math.floor(updatedStats.studyHours * 2))
      await this.updateAchievementProgress(userId, "study-machine", Math.floor(updatedStats.studyHours))
      await this.updateAchievementProgress(userId, "study-marathon", Math.floor(updatedStats.studyHours))
    } catch (error: any) {
      console.warn("Error recording study session:", error.message)

      // Fallback to localStorage
      const localData = localStorage.getItem(`userStats_${userId}`)
      if (localData) {
        const stats = JSON.parse(localData)
        const hours = durationMinutes / 60
        stats.studyHours = (stats.studyHours || 0) + hours
        localStorage.setItem(`userStats_${userId}`, JSON.stringify(stats))

        const xpEarned = Math.floor(durationMinutes / 5) * 10
        await this.addXP(userId, xpEarned)
      }
    }
  }

  // Record flashcard creation
  async recordFlashcardCreated(userId: string, count = 1): Promise<void> {
    try {
      console.log(`🎯 Recording ${count} flashcards created for user ${userId}`)

      const userStatsRef = doc(db, "userStats", userId)

      // First ensure user stats exist
      const userStatsDoc = await getDoc(userStatsRef)
      if (!userStatsDoc.exists()) {
        console.log("📊 User stats don't exist, initializing...")
        await this.initUserStats(userId)
      }

      await updateDoc(userStatsRef, {
        flashcardsCreated: increment(count),
        updatedAt: serverTimestamp(),
      })

      await this.addXP(userId, 15 * count)

      // Get updated stats to check current flashcard count
      const updatedStats = await this.getUserStats(userId)
      console.log(`📊 Current flashcard count: ${updatedStats.flashcardsCreated}`)

      // Check for flashcard achievements with current count
      if (updatedStats.flashcardsCreated >= 1) {
        console.log("🏆 Unlocking quick-learner achievement")
        await this.unlockAchievement(userId, "quick-learner")
      }
      if (updatedStats.flashcardsCreated >= 10) {
        console.log("🏆 Unlocking flashcard-fan achievement")
        await this.unlockAchievement(userId, "flashcard-fan")
      }
      if (updatedStats.flashcardsCreated >= 25) {
        console.log("🏆 Unlocking flashcard-creator achievement")
        await this.unlockAchievement(userId, "flashcard-creator")
      }
      if (updatedStats.flashcardsCreated >= 100) {
        console.log("🏆 Unlocking flashcard-master achievement")
        await this.unlockAchievement(userId, "flashcard-master")
      }
      if (updatedStats.flashcardsCreated >= 500) {
        console.log("🏆 Unlocking knowledge-god achievement")
        await this.unlockAchievement(userId, "knowledge-god")
      }

      // Update achievement progress for all flashcard achievements
      await this.updateAchievementProgress(userId, "flashcard-fan", updatedStats.flashcardsCreated)
      await this.updateAchievementProgress(userId, "flashcard-creator", updatedStats.flashcardsCreated)
      await this.updateAchievementProgress(userId, "flashcard-master", updatedStats.flashcardsCreated)
      await this.updateAchievementProgress(userId, "knowledge-god", updatedStats.flashcardsCreated)

      console.log("✅ Flashcard achievements updated successfully")
    } catch (error: any) {
      console.error("❌ Error recording flashcard creation:", error)
      console.error("Error details:", error.message)

      // Fallback to localStorage
      const localData = localStorage.getItem(`userStats_${userId}`)
      if (localData) {
        const stats = JSON.parse(localData)
        stats.flashcardsCreated = (stats.flashcardsCreated || 0) + count
        localStorage.setItem(`userStats_${userId}`, JSON.stringify(stats))
        await this.addXP(userId, 15 * count)
        console.log("📱 Updated flashcard count in localStorage:", stats.flashcardsCreated)
      }
    }
  }

  // Record AI feature usage
  async recordAIFeatureUsed(userId: string, featureId: string): Promise<void> {
    try {
      const userStatsRef = doc(db, "userStats", userId)
      const userAIFeaturesRef = doc(db, "userAIFeatures", userId)

      await this.addXP(userId, 20)

      const userAIFeaturesDoc = await getDoc(userAIFeaturesRef)

      if (!userAIFeaturesDoc.exists()) {
        await setDoc(userAIFeaturesRef, {
          features: [featureId],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      } else {
        const data = userAIFeaturesDoc.data()
        if (!data.features.includes(featureId)) {
          await updateDoc(userAIFeaturesRef, {
            features: arrayUnion(featureId),
            updatedAt: serverTimestamp(),
          })
        }
      }

      const updatedDoc = await getDoc(userAIFeaturesRef)
      const uniqueFeatures = updatedDoc.exists() ? updatedDoc.data().features.length : 0

      await this.updateAchievementProgress(userId, "ai-explorer", uniqueFeatures)

      if (uniqueFeatures >= 5) {
        await this.unlockAchievement(userId, "ai-explorer")
      }
    } catch (error: any) {
      console.warn("Error recording AI feature usage:", error.message)
      await this.addXP(userId, 20)
    }
  }

  // Record study room participation
  async recordStudyRoomJoined(userId: string): Promise<void> {
    const userStatsRef = doc(db, "userStats", userId)
    const userSocialRef = doc(db, "userSocial", userId)

    // Add XP for social interaction
    await this.addXP(userId, 30)

    // Record study room participation
    const userSocialDoc = await getDoc(userSocialRef)

    if (!userSocialDoc.exists()) {
      await setDoc(userSocialRef, {
        studyRoomsJoined: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    } else {
      await updateDoc(userSocialRef, {
        studyRoomsJoined: increment(1),
        updatedAt: serverTimestamp(),
      })
    }

    // Check for social achievements
    const updatedDoc = await getDoc(userSocialRef)
    const roomsJoined = updatedDoc.exists() ? updatedDoc.data().studyRoomsJoined : 0

    await this.updateAchievementProgress(userId, "social-butterfly", roomsJoined)

    if (roomsJoined >= 10) {
      await this.unlockAchievement(userId, "social-butterfly")
      await this.awardBadge(userId, "social-butterfly")
    }
  }

  // Award a badge
  async awardBadge(userId: string, badgeId: string): Promise<void> {
    const userStatsRef = doc(db, "userStats", userId)
    const userStatsDoc = await getDoc(userStatsRef)

    if (!userStatsDoc.exists()) {
      await this.initUserStats(userId)
      return
    }

    const stats = userStatsDoc.data() as UserStats

    // Check if badge already awarded
    if (stats.badges.includes(badgeId)) {
      return
    }

    // Award badge
    await updateDoc(userStatsRef, {
      badges: arrayUnion(badgeId),
      updatedAt: serverTimestamp(),
    })

    // Add XP for earning a badge
    await this.addXP(userId, 100)
  }

  // Unlock an achievement
  async unlockAchievement(userId: string, achievementId: string): Promise<void> {
    try {
      const userStatsRef = doc(db, "userStats", userId)
      const userStatsDoc = await getDoc(userStatsRef)

      if (!userStatsDoc.exists()) {
        await this.initUserStats(userId)
        return
      }

      const stats = userStatsDoc.data() as UserStats
      const achievements = stats.achievements || []

      const achievementIndex = achievements.findIndex((a) => a.id === achievementId)
      if (achievementIndex === -1 || achievements[achievementIndex].earned) {
        return
      }

      const updatedAchievements = [...achievements]
      const achievement = updatedAchievements[achievementIndex]
      updatedAchievements[achievementIndex] = {
        ...achievement,
        earned: true,
        date: new Date().toLocaleDateString(),
        progress: achievement.maxProgress || 0,
      }

      await updateDoc(userStatsRef, {
        achievements: updatedAchievements,
        updatedAt: serverTimestamp(),
      })

      // Update localStorage
      const updatedStats = { ...stats, achievements: updatedAchievements }
      localStorage.setItem(`userStats_${userId}`, JSON.stringify(updatedStats))

      await this.addXP(userId, achievement.xpReward)

      // Notify achievement unlocked
      this.notifyAchievementUnlocked(updatedAchievements[achievementIndex])
    } catch (error: any) {
      console.warn("Error unlocking achievement:", error.message)

      // Fallback to localStorage
      const localData = localStorage.getItem(`userStats_${userId}`)
      if (localData) {
        const stats = JSON.parse(localData)
        const achievements = stats.achievements || []
        const achievementIndex = achievements.findIndex((a) => a.id === achievementId)

        if (achievementIndex !== -1 && !achievements[achievementIndex].earned) {
          const achievement = achievements[achievementIndex]
          achievements[achievementIndex] = {
            ...achievement,
            earned: true,
            date: new Date().toLocaleDateString(),
            progress: achievement.maxProgress || 0,
          }

          const updatedStats = { ...stats, achievements }
          localStorage.setItem(`userStats_${userId}`, JSON.stringify(updatedStats))

          await this.addXP(userId, achievement.xpReward)
          this.notifyAchievementUnlocked(achievements[achievementIndex])
        }
      }
    }
  }

  // Update achievement progress
  async updateAchievementProgress(userId: string, achievementId: string, progress: number): Promise<void> {
    try {
      const userStatsRef = doc(db, "userStats", userId)
      const userStatsDoc = await getDoc(userStatsRef)

      if (!userStatsDoc.exists()) {
        await this.initUserStats(userId)
        return
      }

      const stats = userStatsDoc.data() as UserStats
      const achievements = stats.achievements || []

      const achievementIndex = achievements.findIndex((a) => a.id === achievementId)
      if (achievementIndex === -1 || achievements[achievementIndex].earned) {
        return
      }

      const updatedAchievements = [...achievements]
      updatedAchievements[achievementIndex] = {
        ...updatedAchievements[achievementIndex],
        progress: Math.min(progress, updatedAchievements[achievementIndex].maxProgress || 0),
      }

      await updateDoc(userStatsRef, {
        achievements: updatedAchievements,
        updatedAt: serverTimestamp(),
      })

      // Update localStorage
      const updatedStats = { ...stats, achievements: updatedAchievements }
      localStorage.setItem(`userStats_${userId}`, JSON.stringify(updatedStats))
    } catch (error: any) {
      console.warn("Error updating achievement progress:", error.message)

      // Fallback to localStorage
      const localData = localStorage.getItem(`userStats_${userId}`)
      if (localData) {
        const stats = JSON.parse(localData)
        const achievements = stats.achievements || []
        const achievementIndex = achievements.findIndex((a) => a.id === achievementId)

        if (achievementIndex !== -1 && !achievements[achievementIndex].earned) {
          achievements[achievementIndex] = {
            ...achievements[achievementIndex],
            progress: Math.min(progress, achievements[achievementIndex].maxProgress || 0),
          }

          const updatedStats = { ...stats, achievements }
          localStorage.setItem(`userStats_${userId}`, JSON.stringify(updatedStats))
        }
      }
    }
  }

  async toggleTaskCompletion(userId: string, taskId: string, completed: boolean): Promise<void> {
    if (completed) {
      await this.recordTaskCompleted(userId)
    }
  }
}

export const gamificationService = new GamificationService()
