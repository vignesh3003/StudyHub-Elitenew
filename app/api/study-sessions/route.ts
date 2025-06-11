import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, getDocs, addDoc, updateDoc, doc, query, where, orderBy } from "firebase/firestore"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const sessionsRef = collection(db, "studySessions")
    const q = query(sessionsRef, where("userId", "==", userId), orderBy("startTime", "desc"))

    const querySnapshot = await getDocs(q)
    const sessions = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error("Error fetching study sessions:", error)
    return NextResponse.json({ error: "Failed to fetch study sessions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, subject, duration, type, completed } = body

    if (!userId || !subject || !duration) {
      return NextResponse.json({ error: "User ID, subject, and duration are required" }, { status: 400 })
    }

    const sessionsRef = collection(db, "studySessions")
    const newSession = {
      userId,
      subject,
      duration, // in minutes
      type: type || "study", // study, break, pomodoro
      completed: completed || false,
      startTime: new Date(),
      endTime: completed ? new Date() : null,
      createdAt: new Date(),
    }

    const docRef = await addDoc(sessionsRef, newSession)

    return NextResponse.json({
      id: docRef.id,
      ...newSession,
    })
  } catch (error) {
    console.error("Error creating study session:", error)
    return NextResponse.json({ error: "Failed to create study session" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    const sessionRef = doc(db, "studySessions", id)
    await updateDoc(sessionRef, {
      ...updateData,
      updatedAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating study session:", error)
    return NextResponse.json({ error: "Failed to update study session" }, { status: 500 })
  }
}
