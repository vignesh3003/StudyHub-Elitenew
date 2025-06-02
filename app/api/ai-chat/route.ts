import { type NextRequest, NextResponse } from "next/server"

// Use environment variable for API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export async function POST(request: NextRequest) {
  console.log("🚀 AI Chat API Route called!")

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

    // Check if request is multipart (file upload) or JSON
    const contentType = request.headers.get("content-type") || ""
    let data: any = {}
    let imageData: string | null = null

    if (contentType.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await request.formData()
      const message = formData.get("message") as string
      const context = formData.get("context") as string
      const file = formData.get("image") as File

      data = {
        message: message || "Please analyze this image and provide study notes",
        context: context ? JSON.parse(context) : {},
      }

      if (file && file.size > 0) {
        // Convert file to base64
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        imageData = buffer.toString("base64")
        console.log("📸 Image uploaded, size:", file.size, "bytes")
      }
    } else {
      // Handle regular JSON request
      data = await request.json()
      console.log("📝 Received data:", data)
    }

    const { message, context } = data

    if (!message && !imageData) {
      return NextResponse.json(
        {
          success: false,
          error: "Message or image is required",
        },
        { status: 400, headers },
      )
    }

    console.log("✅ Processing request with Gemini...")

    // Create different prompts based on whether we have an image or not
    let prompt: string
    let requestBody: any

    if (imageData) {
      // Image analysis prompt
      prompt = `You are an expert educator and study assistant analyzing educational content from an uploaded image.

STUDENT CONTEXT:
- Total tasks: ${context?.tasks || 0}
- Completed tasks: ${context?.completedTasks || 0}
- Study hours: ${context?.studyHours || 0}
- Subjects: ${context?.subjects?.join(", ") || "General"}

INSTRUCTIONS:
Analyze the uploaded image and provide a well-structured response using this EXACT format:

## 📚 Content Overview
[2-3 sentence summary of what this material covers]

## 🎯 Key Concepts
• [Main concept 1]
• [Main concept 2]
• [Main concept 3]

## 📖 Important Definitions
• **[Term 1]**: [Clear, simple definition]
• **[Term 2]**: [Clear, simple definition]
• **[Term 3]**: [Clear, simple definition]

## 🧮 Formulas & Equations
• [Formula 1]: [Explanation]
• [Formula 2]: [Explanation]

## 💡 Study Tips
• [Tip 1 for remembering this content]
• [Tip 2 for understanding concepts]
• [Tip 3 for exam preparation]

## 🎯 Exam Focus
• [What's most likely to be tested]
• [Key areas to focus on]
• [Common question types]

Student's request: ${message}

Use clear headings, bullet points, and emojis as shown above. Keep explanations simple and student-friendly.`

      requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageData,
                },
              },
            ],
          },
        ],
      }
    } else {
      // Text-only prompt (existing functionality)
      prompt = `You are a helpful AI study assistant. Here's the student's current progress:
- Total tasks: ${context?.tasks || 0}
- Completed tasks: ${context?.completedTasks || 0}
- Study hours: ${context?.studyHours || 0}
- Subjects: ${context?.subjects?.join(", ") || "None"}
- Recent grades: ${context?.grades?.map((g: any) => `${g.subject}: ${g.percentage}%`).join(", ") || "None"}

Student's question: ${message}

Please provide helpful, encouraging, and practical study advice. Keep your response concise but informative (2-3 paragraphs max). Focus on actionable tips and motivation.`

      requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }
    }

    console.log("🤖 Calling Gemini API...")

    // Call Gemini API with vision support
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
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

    console.log(`🎉 Returning AI response`)

    return NextResponse.json(
      {
        success: true,
        response: generatedText,
        hasImage: !!imageData,
      },
      { headers },
    )
  } catch (error: any) {
    console.error("💥 API Error:", error)

    const fallbackResponse = imageData
      ? `I'm having trouble analyzing the image right now. Here are some general study tips for image-based content:

📚 **When studying from images/pages**:
- Take clear, well-lit photos of your materials
- Focus on key diagrams, formulas, and highlighted text
- Create your own summary notes from the visual content
- Practice redrawing important diagrams from memory

🎯 **For better image analysis**:
- Ensure text is clearly visible and not blurry
- Include the full context (complete sentences/paragraphs)
- Upload images of individual topics rather than entire pages

Please try uploading the image again or ask me specific questions about your study material!`
      : `I'm having trouble connecting right now, but here are some general study tips:

📚 **Study Techniques**: Try the Pomodoro technique (25 min study, 5 min break), active recall (test yourself without notes), and spaced repetition.

🎯 **Stay Organized**: Break large tasks into smaller chunks, use a study schedule, and prioritize based on deadlines and difficulty.

💪 **Stay Motivated**: Set small, achievable goals, reward yourself for progress, and remember that consistency beats perfection!

Feel free to ask me again - I'll try to help with more specific advice!`

    return NextResponse.json(
      {
        success: true,
        response: fallbackResponse,
      },
      { status: 200 },
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
    message: "AI Chat API is running",
    timestamp: new Date().toISOString(),
    hasApiKey: !!GEMINI_API_KEY,
  })
}
