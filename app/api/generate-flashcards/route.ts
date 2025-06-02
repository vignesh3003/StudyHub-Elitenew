import { type NextRequest, NextResponse } from "next/server"

// Use environment variable for API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export async function POST(request: NextRequest) {
  console.log("🚀 API Route called!")

  try {
    // Handle CORS
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }

    // Check if API key is available
    if (!GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY not found in environment variables")
      return NextResponse.json(
        {
          success: false,
          error: "API key not configured. Please set GEMINI_API_KEY in environment variables.",
        },
        { status: 500, headers },
      )
    }

    // Parse request data
    let data
    try {
      data = await request.json()
      console.log("📝 Received data:", data)
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError)
      return NextResponse.json({ success: false, error: "Invalid JSON in request" }, { status: 400, headers })
    }

    const { question, answer, subject, difficulty } = data

    if (!question || !answer || !subject) {
      console.log("❌ Missing fields:", { question: !!question, answer: !!answer, subject: !!subject })
      return NextResponse.json(
        { success: false, error: "Missing required fields: question, answer, and subject" },
        { status: 400, headers },
      )
    }

    console.log("✅ All fields present, calling Gemini...")

    // Create the prompt
    const prompt = `Create 5 educational flashcards based on this example:

Original Question: ${question}
Original Answer: ${answer}
Subject: ${subject}
Difficulty: ${difficulty}

Create 5 NEW flashcards that help students learn more about this ${subject} topic.
Each flashcard should have a clear question and detailed answer.

Return ONLY a JSON array in this exact format:
[
  {"question": "What is...", "answer": "The answer is..."},
  {"question": "How does...", "answer": "It works by..."},
  {"question": "Why is...", "answer": "Because..."},
  {"question": "When should...", "answer": "You should..."},
  {"question": "Where can...", "answer": "It can be found..."}
]`

    console.log("🤖 Calling Gemini API...")

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      },
    )

    console.log("📡 Gemini response status:", geminiResponse.status)

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error("❌ Gemini API error:", errorText)
      throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`)
    }

    const geminiResult = await geminiResponse.json()
    console.log("📊 Gemini result received")

    // Extract text from Gemini response
    const generatedText = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text || ""
    console.log("📝 Generated text length:", generatedText.length)

    if (!generatedText) {
      throw new Error("No content generated from Gemini")
    }

    // Parse JSON from response
    let flashcards = []
    try {
      const cleanText = generatedText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim()

      const startIndex = cleanText.indexOf("[")
      const endIndex = cleanText.lastIndexOf("]") + 1

      if (startIndex !== -1 && endIndex > startIndex) {
        const jsonStr = cleanText.substring(startIndex, endIndex)
        flashcards = JSON.parse(jsonStr)
        console.log("✅ Parsed flashcards:", flashcards.length)
      } else {
        console.log("❌ No JSON array found in response")
      }
    } catch (parseError) {
      console.warn("⚠️ JSON parsing failed:", parseError)
    }

    // Validate and clean flashcards
    const validCards = flashcards
      .filter((card: any) => card && typeof card === "object" && card.question && card.answer)
      .map((card: any) => ({
        question: String(card.question).trim(),
        answer: String(card.answer).trim(),
      }))

    console.log("✅ Valid cards:", validCards.length)

    // If no valid cards, create fallback
    if (validCards.length === 0) {
      console.log("🔄 Using fallback flashcards")
      validCards.push(
        {
          question: `What is the main concept in this ${subject} topic?`,
          answer: `The main concept relates to ${answer.substring(0, 100)}...`,
        },
        {
          question: `How is this ${subject} concept applied?`,
          answer: `This concept is applied in various ways within ${subject}.`,
        },
        {
          question: `Why is this important in ${subject}?`,
          answer: `This is important because it helps understand ${subject} fundamentals.`,
        },
        {
          question: `What are the key features of this ${subject} topic?`,
          answer: `Key features include several important aspects of ${subject}.`,
        },
        {
          question: `How does this relate to other ${subject} concepts?`,
          answer: `This connects to other ${subject} topics through shared principles.`,
        },
      )
    }

    console.log(`🎉 Returning ${validCards.length} flashcards`)

    return NextResponse.json(
      {
        success: true,
        flashcards: validCards,
        count: validCards.length,
        message: `Generated ${validCards.length} flashcards using Gemini AI!`,
      },
      { headers },
    )
  } catch (error) {
    console.error("💥 API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate flashcards",
        details: error instanceof Error ? error.stack : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Flashcard API is running",
    timestamp: new Date().toISOString(),
    hasApiKey: !!GEMINI_API_KEY,
  })
}
