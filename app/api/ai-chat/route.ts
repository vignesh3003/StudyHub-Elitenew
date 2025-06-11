import { type NextRequest, NextResponse } from "next/server"
import { Buffer } from "buffer"

// Use environment variable for API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export async function POST(request: NextRequest) {
  console.log("🚀 AI Chat API Route called!")
  console.log("Headers:", Object.fromEntries(request.headers.entries()))
  console.log("GEMINI_API_KEY exists:", !!GEMINI_API_KEY)

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

      data = {
        message: message || "Please analyze this image and provide study notes",
        context: context ? JSON.parse(context) : {},
      }

      const file = formData.get("image") as File
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

    const { message, context, messages, isStudyPlanRequest } = data

    if (!message && !imageData && !messages) {
      return NextResponse.json(
        {
          success: false,
          error: "Message, messages, or image is required",
        },
        { status: 400, headers },
      )
    }

    console.log("✅ Processing request with Gemini...")

    // Check if the user is asking for a study plan
    const isStudyPlan =
      isStudyPlanRequest ||
      (message &&
        (message.toLowerCase().includes("study plan") ||
          message.toLowerCase().includes("create plan") ||
          message.toLowerCase().includes("schedule") ||
          message.toLowerCase().includes("plan my study")))

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
    } else if (isStudyPlan) {
      // Study plan generation prompt
      const userMessage = message || (messages && messages[messages.length - 1]?.content) || ""

      prompt = `You are an expert study planner. Create a detailed, actionable study plan based on the student's request.

STUDENT CONTEXT:
- Total tasks: ${context?.tasks || 0}
- Completed tasks: ${context?.completedTasks || 0}
- Study hours: ${context?.studyHours || 0}
- Subjects: ${context?.subjects?.join(", ") || "General"}
- Recent grades: ${context?.grades?.map((g: any) => `${g.subject}: ${g.percentage}%`).join(", ") || "None"}

Student's request: ${userMessage}

Create a comprehensive study plan using this EXACT JSON format:

\`\`\`json
{
  "studyPlan": {
    "title": "[Study Plan Title]",
    "description": "[Brief description of the plan]",
    "duration": "[e.g., 2 weeks, 1 month]",
    "totalHours": "[estimated total study hours]",
    "tasks": [
      {
        "title": "[Task title]",
        "description": "[Detailed description]",
        "subject": "[Subject name]",
        "priority": "high|medium|low",
        "startDate": "YYYY-MM-DD",
        "endDate": "YYYY-MM-DD",
        "estimatedHours": "[hours needed]",
        "tags": ["tag1", "tag2"]
      }
    ],
    "tips": [
      "[Study tip 1]",
      "[Study tip 2]",
      "[Study tip 3]"
    ]
  }
}
\`\`\`

Make sure to:
1. Break down the study goal into specific, actionable tasks
2. Set realistic start and end dates for each task
3. Assign appropriate priorities
4. Include relevant subjects and tags
5. Provide practical study tips

The plan should be comprehensive and immediately actionable.`

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
    } else {
      // Regular chat prompt
      const userMessage = message || (messages && messages[messages.length - 1]?.content) || ""

      prompt = `You are a helpful AI study assistant. Here's the student's current progress:
- Total tasks: ${context?.tasks || 0}
- Completed tasks: ${context?.completedTasks || 0}
- Study hours: ${context?.studyHours || 0}
- Subjects: ${context?.subjects?.join(", ") || "None"}
- Recent grades: ${context?.grades?.map((g: any) => `${g.subject}: ${g.percentage}%`).join(", ") || "None"}

Student's question: ${userMessage}

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

    // Call Gemini API
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

    // Try to extract study plan JSON if it's a study plan request
    let studyPlan = null
    let formattedResponse = generatedText

    if (isStudyPlan) {
      try {
        const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/)
        if (jsonMatch) {
          studyPlan = JSON.parse(jsonMatch[1])

          // Format the study plan as readable text
          if (studyPlan?.studyPlan) {
            const plan = studyPlan.studyPlan
            formattedResponse = `# 📚 ${plan.title || "Your Study Plan"}

## 📋 Overview
${plan.description || "Personalized study plan created for your goals"}

**Duration:** ${plan.duration || "Flexible timeline"}
**Estimated Total Hours:** ${plan.totalHours || "As needed"}

## 🎯 Study Tasks

${
  plan.tasks
    ?.map(
      (task: any, index: number) => `
### ${index + 1}. ${task.title}
**Subject:** ${task.subject}
**Priority:** ${task.priority?.toUpperCase()}
**Timeline:** ${task.startDate} to ${task.endDate}
**Estimated Hours:** ${task.estimatedHours}

${task.description}

**Tags:** ${task.tags?.join(", ") || "General"}
`,
    )
    .join("\n") || "No specific tasks defined"
}

## 💡 Study Tips
${plan.tips?.map((tip: string, index: number) => `${index + 1}. ${tip}`).join("\n") || "Stay consistent and focused!"}

## 🎉 Next Steps
1. Review this plan and adjust as needed
2. Add these tasks to your task manager
3. Set up reminders for important deadlines
4. Track your progress regularly

Good luck with your studies! 🚀`
          }
        }
      } catch (error) {
        console.log("Could not parse study plan JSON, returning as regular text")
      }
    }

    console.log(`🎉 Returning AI response`)

    return NextResponse.json(
      {
        success: true,
        response: formattedResponse,
        hasImage: !!imageData,
        studyPlan: studyPlan,
        isStudyPlan: isStudyPlan,
      },
      { headers },
    )
  } catch (error: any) {
    console.error("💥 Detailed API Error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })

    return NextResponse.json(
      {
        success: false,
        error: `API Error: ${error.message}`,
        details: error.stack,
      },
      { status: 500, headers },
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
