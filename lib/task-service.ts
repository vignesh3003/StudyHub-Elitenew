import { db } from "@/lib/firebase"
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore"

export interface Task {
  id: string
  title: string
  description?: string
  subject: string
  priority: "low" | "medium" | "high"
  dueDate: string
  completed: boolean
  createdAt: any
  updatedAt: any
  userId: string
  tags?: string[] // Optional tags property
}

class TaskService {
  private readonly COLLECTION_NAME = "tasks"

  // Add a new task
  async addTask(userId: string, taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "userId">): Promise<string> {
    try {
      const tasksRef = collection(db, this.COLLECTION_NAME)

      // Create a clean task object without undefined fields
      const cleanTaskData: any = {
        title: taskData.title,
        subject: taskData.subject,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
        completed: taskData.completed,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      // Only add optional fields if they exist and have values
      if (taskData.description && taskData.description.trim()) {
        cleanTaskData.description = taskData.description.trim()
      }

      if (taskData.tags && taskData.tags.length > 0) {
        cleanTaskData.tags = taskData.tags
      }

      const docRef = await addDoc(tasksRef, cleanTaskData)
      return docRef.id
    } catch (error) {
      console.error("Error adding task:", error)
      throw error
    }
  }

  // Update a task
  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    try {
      const taskRef = doc(db, this.COLLECTION_NAME, taskId)
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error updating task:", error)
      throw error
    }
  }

  // Delete a task
  async deleteTask(taskId: string): Promise<void> {
    try {
      const taskRef = doc(db, this.COLLECTION_NAME, taskId)
      await deleteDoc(taskRef)
    } catch (error) {
      console.error("Error deleting task:", error)
      throw error
    }
  }

  // Get all tasks for a user (simple query)
  async getTasks(userId: string): Promise<Task[]> {
    try {
      const tasksRef = collection(db, this.COLLECTION_NAME)
      const q = query(tasksRef, where("userId", "==", userId))
      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[]
    } catch (error) {
      console.error("Error getting tasks:", error)
      return []
    }
  }

  // Subscribe to real-time task updates
  subscribeToTasks(userId: string, callback: (tasks: Task[]) => void): Unsubscribe {
    try {
      const tasksRef = collection(db, this.COLLECTION_NAME)
      const q = query(tasksRef, where("userId", "==", userId))

      return onSnapshot(
        q,
        (querySnapshot) => {
          const tasks = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Task[]

          // Sort tasks locally to avoid index requirements
          tasks.sort((a, b) => {
            // Sort by completion status first, then by due date
            if (a.completed !== b.completed) {
              return a.completed ? 1 : -1
            }
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          })

          callback(tasks)
        },
        (error) => {
          console.error("Error in task subscription:", error)
          callback([])
        },
      )
    } catch (error) {
      console.error("Error subscribing to tasks:", error)
      return () => {}
    }
  }

  // Mark task as completed
  async completeTask(taskId: string): Promise<void> {
    await this.updateTask(taskId, { completed: true })
  }

  // Mark task as incomplete
  async uncompleteTask(taskId: string): Promise<void> {
    await this.updateTask(taskId, { completed: false })
  }

  // Add this method after the uncompleteTask method
  async toggleTaskCompletion(userId: string, taskId: string, completed: boolean): Promise<void> {
    try {
      await this.updateTask(taskId, { completed })
    } catch (error) {
      console.error("Error toggling task completion:", error)
      throw error
    }
  }
}

export const taskService = new TaskService()
