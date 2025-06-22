import { type NextRequest, NextResponse } from "next/server"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export async function POST(request: NextRequest) {
  console.log("🚀 Generate Quiz API Route called!")

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

    const data = await request.json()
    const { topic, description, subject, difficulty, questionCount, questionTypes } = data

    if (!topic || !subject || !questionTypes || questionTypes.length === 0) {
      console.log("❌ Missing required fields")
      return NextResponse.json(
        { success: false, error: "Missing required fields: topic, subject, and questionTypes" },
        { status: 400, headers },
      )
    }

    console.log("✅ All fields present, generating quiz...")

    // Create the prompt for mixed question types with varied difficulty
    const prompt = `You are an expert educator creating a quiz with STRICT question type requirements.

CRITICAL INSTRUCTIONS - FOLLOW EXACTLY:
1. Create EXACTLY ${questionCount} quiz questions about: ${topic}
2. Subject: ${subject}
3. Question types MUST include ONLY: ${questionTypes.join(", ")}
4. Additional context: ${description || "None provided"}

QUESTION TYPE RULES - ABSOLUTELY CRITICAL:
- If "multiple_choice" is selected: Create questions with exactly 4 options (A, B, C, D)
- If "short_answer" is selected: Create questions expecting 1-3 sentence answers with NO options
- If "long_answer" is selected: Create questions expecting detailed paragraph responses with NO options

DISTRIBUTION:
- Distribute questions EVENLY across the selected types
- If only one type selected, ALL questions must be that type
- If multiple types selected, split evenly

DIFFICULTY LEVELS:
- Easy: 30% of questions (basic recall, simple concepts)
- Medium: 50% of questions (application, analysis)  
- Hard: 20% of questions (synthesis, evaluation)

MANDATORY JSON FORMAT - Return ONLY this structure:
[
  {
    "id": "q1",
    "type": "multiple_choice",
    "difficulty": "easy",
    "question": "What is the chemical formula for water?",
    "options": ["H2O2", "H2O", "HO", "H2O3"],
    "correct_answer": "H2O",
    "explanation": "Water consists of two hydrogen atoms and one oxygen atom.",
    "points": 2
  },
  {
    "id": "q2", 
    "type": "short_answer",
    "difficulty": "medium",
    "question": "Explain the role of chlorophyll in photosynthesis.",
    "correct_answer": "Chlorophyll absorbs light energy and converts it into chemical energy during photosynthesis, enabling plants to produce glucose from carbon dioxide and water.",
    "explanation": "Chlorophyll is the green pigment that captures light energy for the photosynthesis process.",
    "points": 4
  },
  {
    "id": "q3",
    "type": "long_answer",
    "difficulty": "hard", 
    "question": "Describe the complete process of cellular respiration, including all three stages, and explain its importance in living organisms. Discuss how environmental factors affect this process.",
    "correct_answer": "Cellular respiration is a complex metabolic process where cells break down glucose and other organic molecules in the presence of oxygen to produce ATP (energy). The process occurs in three main stages: glycolysis (occurs in cytoplasm, breaks glucose into pyruvate), Krebs cycle (occurs in mitochondria, produces NADH and FADH2), and electron transport chain (occurs in mitochondria, produces most ATP). This process is crucial because it provides the energy needed for all cellular activities, growth, and maintenance of life processes. Environmental factors like temperature, oxygen availability, and pH levels significantly affect the efficiency of cellular respiration.",
    "explanation": "This question tests comprehensive understanding of cellular respiration mechanisms and environmental interactions.",
    "points": 8
  }
]

CRITICAL VALIDATION RULES:
- NEVER add "options" field to short_answer or long_answer questions
- ALWAYS add "options" field to multiple_choice questions
- Each question must match the exact type requested
- Long answer questions must have detailed, comprehensive answers (3-5 sentences minimum)
- Short answer questions must have concise answers (1-3 sentences)
- Question distribution must match the selected types exactly`

    console.log("🤖 Calling Gemini API...")

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

    // Validate and clean questions with better type checking
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

    // If no valid questions, create fallback
    if (validQuestions.length === 0) {
      console.log("🔄 Using fallback questions")
      validQuestions.push(
        {
          id: "q1",
          type: "multiple_choice",
          question: `What is the main concept in ${topic}?`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correct_answer: "Option A",
          explanation: `This relates to the fundamental concepts of ${topic} in ${subject}.`,
          points: 3,
        },
        {
          id: "q2",
          type: "short_answer",
          question: `Briefly explain a key aspect of ${topic}.`,
          correct_answer: `A key aspect involves the main principles of ${topic}.`,
          explanation: `This question tests understanding of ${topic} fundamentals.`,
          points: 4,
        },
      )
    }

    console.log(`🎉 Returning ${validQuestions.length} questions`)

    return NextResponse.json(
      {
        success: true,
        questions: validQuestions,
        count: validQuestions.length,
        message: `Generated ${validQuestions.length} mixed quiz questions using Gemini AI!`,
      },
      { headers },
    )
  } catch (error) {
    console.error("💥 API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate quiz questions",
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
    message: "Quiz Generation API is running",
    timestamp: new Date().toISOString(),
    hasApiKey: !!GEMINI_API_KEY,
  })
}
