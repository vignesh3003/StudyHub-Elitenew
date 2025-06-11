import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from "firebase/firestore"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const flashcardsRef = collection(db, "flashcards")
    const q = query(flashcardsRef, where("userId", "==", userId), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)
    const flashcards = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({ flashcards })
  } catch (error) {
    console.error("Error fetching flashcards:", error)
    return NextResponse.json({ error: "Failed to fetch flashcards" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, front, back, subject, difficulty, tags } = body

    if (!userId || !front || !back) {
      return NextResponse.json({ error: "User ID, front, and back are required" }, { status: 400 })
    }

    const flashcardsRef = collection(db, "flashcards")
    const newFlashcard = {
      userId,
      front,
      back,
      subject: subject || "general",
      difficulty: difficulty || "medium",
      tags: tags || [],
      reviewCount: 0,
      lastReviewed: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const docRef = await addDoc(flashcardsRef, newFlashcard)

    return NextResponse.json({
      id: docRef.id,
      ...newFlashcard,
    })
  } catch (error) {
    console.error("Error creating flashcard:", error)
    return NextResponse.json({ error: "Failed to create flashcard" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "Flashcard ID is required" }, { status: 400 })
    }

    const flashcardRef = doc(db, "flashcards", id)
    await updateDoc(flashcardRef, {
      ...updateData,
      updatedAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating flashcard:", error)
    return NextResponse.json({ error: "Failed to update flashcard" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Flashcard ID is required" }, { status: 400 })
    }

    const flashcardRef = doc(db, "flashcards", id)
    await deleteDoc(flashcardRef)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting flashcard:", error)
    return NextResponse.json({ error: "Failed to delete flashcard" }, { status: 500 })
  }
}
