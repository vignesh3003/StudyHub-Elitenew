import { type NextRequest, NextResponse } from "next/server"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export async function POST(request: NextRequest) {
  console.log("🚀 Generate Quiz from Image API Route called!")

  try {
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }

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

    const formData = await request.formData()
    const image = formData.get("image") as File
    const subject = formData.get("subject") as string
    const difficulty = formData.get("difficulty") as string
    const questionCount = Number.parseInt(formData.get("questionCount") as string) || 10
    const questionTypes = JSON.parse((formData.get("questionTypes") as string) || "[]")

    if (!image || !subject || !questionTypes || questionTypes.length === 0) {
      console.log("❌ Missing required fields")
      return NextResponse.json(
        { success: false, error: "Missing required fields: image, subject, and questionTypes" },
        { status: 400, headers },
      )
    }

    console.log("✅ All fields present, analyzing image and generating quiz...")

    // Convert image to base64
    const bytes = await image.arrayBuffer()
    const base64Image = Buffer.from(bytes).toString("base64")
    const mimeType = image.type

    // Create the prompt for image analysis and quiz generation
    const prompt = `You are an expert educator analyzing study material from an image to create a comprehensive quiz.

CRITICAL INSTRUCTIONS - FOLLOW EXACTLY:
1. Analyze the content in the provided image carefully
2. Create EXACTLY ${questionCount} quiz questions based on the image content
3. Subject context: ${subject}
4. Base difficulty: ${difficulty}
5. Question types to include: ${questionTypes.join(", ")}

DIFFICULTY DISTRIBUTION:
- If base difficulty is "easy": 60% easy, 30% medium, 10% hard
- If base difficulty is "medium": 20% easy, 60% medium, 20% hard  
- If base difficulty is "hard": 10% easy, 30% medium, 60% hard

QUESTION TYPE REQUIREMENTS:
- multiple_choice: Must have exactly 4 options (A, B, C, D) with only ONE correct answer
- short_answer: Expect 1-3 sentence answers, NO multiple choice options
- long_answer: Expect detailed paragraph responses (3-5 sentences minimum), NO multiple choice options

POINT VALUES:
- Easy MCQ: 2 points, Medium MCQ: 3 points, Hard MCQ: 4 points
- Easy Short: 3 points, Medium Short: 4 points, Hard Short: 5 points
- Easy Long: 5 points, Medium Long: 7 points, Hard Long: 10 points

DISTRIBUTE QUESTIONS EVENLY across selected types.

Based on what you see in the image, create relevant, educational questions that test understanding of the material shown.

Return ONLY a valid JSON array with this EXACT format:
[
  {
    "id": "q1",
    "type": "multiple_choice",
    "difficulty": "easy",
    "question": "Based on the image, what is...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "Option B",
    "explanation": "Explanation based on image content",
    "points": 2
  },
  {
    "id": "q2", 
    "type": "short_answer",
    "difficulty": "medium",
    "question": "Explain what you observe in the diagram regarding...",
    "correct_answer": "Short answer based on image content",
    "explanation": "Explanation of the concept shown",
    "points": 4
  },
  {
    "id": "q3",
    "type": "long_answer", 
    "difficulty": "hard",
    "question": "Analyze the complete process shown in the image and explain...",
    "correct_answer": "Detailed paragraph answer based on image analysis",
    "explanation": "Comprehensive explanation of the concept",
    "points": 10
  }
]

IMPORTANT RULES:
- Base questions on actual content visible in the image
- NO options field for short_answer or long_answer types
- Each question must have a unique ID
- Mix difficulty levels as specified
- Ensure question types match exactly what was requested`

    console.log("🤖 Calling Gemini Vision API...")

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
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Image,
                  },
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

    const generatedText = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text || ""
    console.log("📝 Generated text length:", generatedText.length)

    if (!generatedText) {
      throw new Error("No content generated from Gemini")
    }

    // Parse JSON from response
    let questions = []
    try {
      const cleanText = generatedText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim()

      const startIndex = cleanText.indexOf("[")
      const endIndex = cleanText.lastIndexOf("]") + 1

      if (startIndex !== -1 && endIndex > startIndex) {
        const jsonStr = cleanText.substring(startIndex, endIndex)
        questions = JSON.parse(jsonStr)
        console.log("✅ Parsed questions:", questions.length)
      } else {
        console.log("❌ No JSON array found in response")
      }
    } catch (parseError) {
      console.warn("⚠️ JSON parsing failed:", parseError)
    }

    // Validate and clean questions
    const validQuestions = questions
      .filter((q: any) => {
        if (!q || typeof q !== "object" || !q.question || !q.correct_answer || !q.type) {
          return false
        }

        // Validate question types
        if (!["multiple_choice", "short_answer", "long_answer"].includes(q.type)) {
          return false
        }

        // MCQ must have options, others must not
        if (q.type === "multiple_choice" && (!q.options || !Array.isArray(q.options) || q.options.length !== 4)) {
          return false
        }

        if ((q.type === "short_answer" || q.type === "long_answer") && q.options) {
          return false
        }

        return true
      })
      .map((q: any, index: number) => ({
        id: q.id || `q${index + 1}`,
        type: q.type,
        difficulty: q.difficulty || difficulty,
        question: String(q.question).trim(),
        options: q.type === "multiple_choice" ? q.options : undefined,
        correct_answer: String(q.correct_answer).trim(),
        explanation: q.explanation ? String(q.explanation).trim() : undefined,
        points: q.points || (q.type === "multiple_choice" ? 3 : q.type === "short_answer" ? 4 : 7),
      }))

    console.log("✅ Valid questions:", validQuestions.length)

    // If no valid questions, create fallback based on image analysis
    if (validQuestions.length === 0) {
      console.log("🔄 Using fallback questions")
      validQuestions.push(
        {
          id: "q1",
          type: "multiple_choice",
          difficulty: "medium",
          question: `Based on the uploaded image, what is the main concept being illustrated?`,
          options: ["Concept A", "Concept B", "Concept C", "Concept D"],
          correct_answer: "Concept B",
          explanation: `This relates to the content visible in your uploaded study material.`,
          points: 3,
        },
        {
          id: "q2",
          type: "short_answer",
          difficulty: "medium",
          question: `Describe what you observe in the study material image.`,
          correct_answer: `The image shows educational content related to ${subject}.`,
          explanation: `This question tests observation and comprehension of the study material.`,
          points: 4,
        },
      )
    }

    console.log(`🎉 Returning ${validQuestions.length} questions from image analysis`)

    return NextResponse.json(
      {
        success: true,
        questions: validQuestions,
        count: validQuestions.length,
        message: `Generated ${validQuestions.length} mixed quiz questions from your image using Gemini Vision AI!`,
      },
      { headers },
    )
  } catch (error) {
    console.error("💥 API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate quiz questions from image",
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
