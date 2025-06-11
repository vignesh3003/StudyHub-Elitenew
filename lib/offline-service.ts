"use client"

import { openDB, type DBSchema, type IDBPDatabase } from "idb"

interface StudyHubDB extends DBSchema {
  tasks: {
    key: string
    value: {
      id: string
      title: string
      description: string
      completed: boolean
      priority: "low" | "medium" | "high"
      dueDate: string
      category: string
      createdAt: string
      updatedAt: string
      synced: boolean
    }
  }
  flashcards: {
    key: string
    value: {
      id: string
      front: string
      back: string
      category: string
      difficulty: "easy" | "medium" | "hard"
      lastReviewed: string
      nextReview: string
      reviewCount: number
      createdAt: string
      updatedAt: string
      synced: boolean
    }
  }
  notes: {
    key: string
    value: {
      id: string
      title: string
      content: string
      category: string
      tags: string[]
      createdAt: string
      updatedAt: string
      synced: boolean
    }
  }
  studySessions: {
    key: string
    value: {
      id: string
      duration: number
      subject: string
      type: "pomodoro" | "regular"
      startTime: string
      endTime: string
      synced: boolean
    }
  }
  syncQueue: {
    key: string
    value: {
      id: string
      action: "create" | "update" | "delete"
      table: "tasks" | "flashcards" | "notes" | "studySessions"
      data: any
      timestamp: string
    }
  }
}

class OfflineService {
  private db: IDBPDatabase<StudyHubDB> | null = null
  private isOnline = true
  private syncInProgress = false

  async init() {
    try {
      this.db = await openDB<StudyHubDB>("StudyHubDB", 1, {
        upgrade(db) {
          // Create object stores
          if (!db.objectStoreNames.contains("tasks")) {
            db.createObjectStore("tasks", { keyPath: "id" })
          }
          if (!db.objectStoreNames.contains("flashcards")) {
            db.createObjectStore("flashcards", { keyPath: "id" })
          }
          if (!db.objectStoreNames.contains("notes")) {
            db.createObjectStore("notes", { keyPath: "id" })
          }
          if (!db.objectStoreNames.contains("studySessions")) {
            db.createObjectStore("studySessions", { keyPath: "id" })
          }
          if (!db.objectStoreNames.contains("syncQueue")) {
            db.createObjectStore("syncQueue", { keyPath: "id" })
          }
        },
      })

      // Set up online/offline event listeners
      window.addEventListener("online", this.handleOnline.bind(this))
      window.addEventListener("offline", this.handleOffline.bind(this))

      // Check initial online status
      this.isOnline = navigator.onLine

      console.log("OfflineService initialized")
    } catch (error) {
      console.error("Failed to initialize OfflineService:", error)
    }
  }

  private handleOnline() {
    this.isOnline = true
    console.log("App is online - starting sync")
    this.syncData()
  }

  private handleOffline() {
    this.isOnline = false
    console.log("App is offline - data will be cached locally")
  }

  // Generic CRUD operations for offline storage
  async create<T extends keyof StudyHubDB>(table: T, data: StudyHubDB[T]["value"]): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    try {
      // Add to local storage
      await this.db.add(table, data)

      // Add to sync queue if offline or sync fails
      if (!this.isOnline) {
        await this.addToSyncQueue("create", table, data)
      } else {
        // Try to sync immediately
        try {
          await this.syncItemToServer("create", table, data)
          // Mark as synced
          await this.db.put(table, { ...data, synced: true })
        } catch (error) {
          console.error("Failed to sync to server:", error)
          await this.addToSyncQueue("create", table, data)
        }
      }
    } catch (error) {
      console.error(`Failed to create ${table} item:`, error)
      throw error
    }
  }

  async read<T extends keyof StudyHubDB>(
    table: T,
    id?: string,
  ): Promise<StudyHubDB[T]["value"][] | StudyHubDB[T]["value"] | null> {
    if (!this.db) throw new Error("Database not initialized")

    try {
      if (id) {
        return (await this.db.get(table, id)) || null
      } else {
        return await this.db.getAll(table)
      }
    } catch (error) {
      console.error(`Failed to read ${table}:`, error)
      throw error
    }
  }

  async update<T extends keyof StudyHubDB>(table: T, data: StudyHubDB[T]["value"]): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    try {
      // Update in local storage
      await this.db.put(table, { ...data, synced: false })

      // Add to sync queue if offline or sync fails
      if (!this.isOnline) {
        await this.addToSyncQueue("update", table, data)
      } else {
        // Try to sync immediately
        try {
          await this.syncItemToServer("update", table, data)
          // Mark as synced
          await this.db.put(table, { ...data, synced: true })
        } catch (error) {
          console.error("Failed to sync to server:", error)
          await this.addToSyncQueue("update", table, data)
        }
      }
    } catch (error) {
      console.error(`Failed to update ${table} item:`, error)
      throw error
    }
  }

  async delete<T extends keyof StudyHubDB>(table: T, id: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    try {
      // Delete from local storage
      await this.db.delete(table, id)

      // Add to sync queue if offline or sync fails
      if (!this.isOnline) {
        await this.addToSyncQueue("delete", table, { id })
      } else {
        // Try to sync immediately
        try {
          await this.syncItemToServer("delete", table, { id })
        } catch (error) {
          console.error("Failed to sync to server:", error)
          await this.addToSyncQueue("delete", table, { id })
        }
      }
    } catch (error) {
      console.error(`Failed to delete ${table} item:`, error)
      throw error
    }
  }

  private async addToSyncQueue(
    action: "create" | "update" | "delete",
    table: keyof StudyHubDB,
    data: any,
  ): Promise<void> {
    if (!this.db) return

    const queueItem = {
      id: `${action}_${table}_${data.id || Date.now()}_${Math.random()}`,
      action,
      table,
      data,
      timestamp: new Date().toISOString(),
    }

    await this.db.add("syncQueue", queueItem)
  }

  private async syncItemToServer(
    action: "create" | "update" | "delete",
    table: keyof StudyHubDB,
    data: any,
  ): Promise<void> {
    // This would be replaced with actual API calls to your backend
    const endpoint = this.getApiEndpoint(table)

    switch (action) {
      case "create":
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        break
      case "update":
        await fetch(`${endpoint}/${data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        break
      case "delete":
        await fetch(`${endpoint}/${data.id}`, {
          method: "DELETE",
        })
        break
    }
  }

  private getApiEndpoint(table: keyof StudyHubDB): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api"

    switch (table) {
      case "tasks":
        return `${baseUrl}/tasks`
      case "flashcards":
        return `${baseUrl}/flashcards`
      case "notes":
        return `${baseUrl}/notes`
      case "studySessions":
        return `${baseUrl}/study-sessions`
      default:
        throw new Error(`Unknown table: ${table}`)
    }
  }

  async syncData(): Promise<void> {
    if (!this.db || this.syncInProgress || !this.isOnline) return

    this.syncInProgress = true

    try {
      console.log("Starting data sync...")

      // Get all items in sync queue
      const syncQueue = await this.db.getAll("syncQueue")

      for (const queueItem of syncQueue) {
        try {
          await this.syncItemToServer(queueItem.action, queueItem.table, queueItem.data)

          // Remove from sync queue after successful sync
          await this.db.delete("syncQueue", queueItem.id)

          // Mark original item as synced if it still exists
          if (queueItem.action !== "delete") {
            const existingItem = await this.db.get(queueItem.table, queueItem.data.id)
            if (existingItem) {
              await this.db.put(queueItem.table, { ...existingItem, synced: true })
            }
          }

          console.log(`Synced ${queueItem.action} ${queueItem.table} ${queueItem.data.id}`)
        } catch (error) {
          console.error(`Failed to sync ${queueItem.action} ${queueItem.table}:`, error)
          // Keep item in queue for retry
        }
      }

      console.log("Data sync completed")
    } catch (error) {
      console.error("Sync failed:", error)
    } finally {
      this.syncInProgress = false
    }
  }

  // Get sync status
  async getSyncStatus(): Promise<{
    isOnline: boolean
    pendingSync: number
    lastSync: string | null
  }> {
    if (!this.db) {
      return { isOnline: false, pendingSync: 0, lastSync: null }
    }

    const syncQueue = await this.db.getAll("syncQueue")

    return {
      isOnline: this.isOnline,
      pendingSync: syncQueue.length,
      lastSync: localStorage.getItem("lastSyncTime"),
    }
  }

  // Force sync
  async forcSync(): Promise<void> {
    if (this.isOnline) {
      await this.syncData()
      localStorage.setItem("lastSyncTime", new Date().toISOString())
    }
  }

  // Clear all offline data
  async clearOfflineData(): Promise<void> {
    if (!this.db) return

    const stores: (keyof StudyHubDB)[] = ["tasks", "flashcards", "notes", "studySessions", "syncQueue"]

    for (const store of stores) {
      await this.db.clear(store)
    }

    console.log("Offline data cleared")
  }

  // Export data for backup
  async exportData(): Promise<any> {
    if (!this.db) return null

    const data: any = {}
    const stores: (keyof StudyHubDB)[] = ["tasks", "flashcards", "notes", "studySessions"]

    for (const store of stores) {
      data[store] = await this.db.getAll(store)
    }

    return {
      ...data,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    }
  }

  // Import data from backup
  async importData(data: any): Promise<void> {
    if (!this.db) return

    const stores: (keyof StudyHubDB)[] = ["tasks", "flashcards", "notes", "studySessions"]

    for (const store of stores) {
      if (data[store] && Array.isArray(data[store])) {
        // Clear existing data
        await this.db.clear(store)

        // Import new data
        for (const item of data[store]) {
          await this.db.add(store, { ...item, synced: false })
        }
      }
    }

    console.log("Data imported successfully")
  }
}

export const offlineService = new OfflineService()

// Initialize the service when the module is loaded
if (typeof window !== "undefined") {
  offlineService.init()
}
