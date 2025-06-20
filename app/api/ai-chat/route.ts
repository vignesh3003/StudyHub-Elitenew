import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type")
    let message: string
    let serviceType = "chat"
    let imageFile: File | null = null

    if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData()
      message = formData.get("message") as string
      serviceType = (formData.get("serviceType") as string) || "chat"
      imageFile = formData.get("image") as File | null
    } else {
      const body = await request.json()
      message = body.message
      serviceType = body.serviceType || "chat"
    }

    console.log("Service Type:", serviceType)
    console.log("Original Message:", message)

    // Apply service-specific prompt engineering
    let enhancedPrompt = message

    if (serviceType === "quiz-generator") {
      enhancedPrompt = `You are a quiz generator. Generate ONLY quiz questions in the exact format requested. Do NOT write essays or explanations.

${message}

IMPORTANT: 
- Generate ONLY multiple choice questions
- Use the exact format: Question X: [text], A) B) C) D), Correct Answer: [letter], Explanation: [brief]
- Do NOT write essays, stories, or long explanations
- Focus ONLY on creating quiz questions`
    } else if (serviceType === "research-assistant") {
      enhancedPrompt = `You are a research assistant. Provide ONLY research information in bullet points and structured format. Do NOT write essays.

${message}

IMPORTANT:
- Provide research data in bullet points
- Include facts, statistics, and sources
- Use structured format with headings
- Do NOT write essays or narratives`
    } else if (serviceType === "study-guide") {
      enhancedPrompt = `You are a study guide generator. Create ONLY structured study materials. Do NOT write essays.

${message}

IMPORTANT:
- Create bullet points and lists
- Include key concepts and definitions
- Provide study tips and memory aids
- Do NOT write essay paragraphs`
    } else if (serviceType === "math-solver") {
      enhancedPrompt = `You are a math problem solver. Provide ONLY step-by-step mathematical solutions. Do NOT write essays.

${message}

IMPORTANT:
- Show step-by-step mathematical work
- Provide clear numerical solutions
- Include relevant formulas
- Do NOT write essays about math`
    } else if (serviceType === "concept-explainer") {
      enhancedPrompt = `You are a concept explainer. Provide ONLY clear explanations in bullet points. Do NOT write essays.

${message}

IMPORTANT:
- Explain concepts in bullet points
- Provide simple definitions and examples
- Use structured format
- Do NOT write essay paragraphs`
    } else if (serviceType === "flashcards") {
      enhancedPrompt = `You are a flashcard generator. Create ONLY flashcard content. Do NOT write essays.

${message}

IMPORTANT:
- Generate flashcard pairs (front/back)
- Keep content concise and focused
- Format as Q&A or term/definition
- Do NOT write essays or long explanations`
    } else if (serviceType === "image-analysis") {
      enhancedPrompt = `You are an image analyzer. Analyze the image and provide structured information. Do NOT write essays.

${message}

IMPORTANT:
- Describe what you see in the image
- Extract text or information if present
- Provide analysis in bullet points
- Do NOT write essays about the image`
    } else if (serviceType === "essay-writer") {
      enhancedPrompt = `You are an essay writer. Write a complete, well-structured essay.

${message}

IMPORTANT:
- Write a full essay with introduction, body, and conclusion
- Include proper paragraphs and transitions
- Provide examples and evidence
- This is the ONLY service that should write essays`
    }

    console.log("Enhanced Prompt:", enhancedPrompt)

    // Continue with Gemini API call using enhancedPrompt...
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    let result
    if (imageFile) {
      const imageBuffer = await imageFile.arrayBuffer()
      const imageBase64 = Buffer.from(imageBuffer).toString("base64")

      result = await model.generateContent([
        enhancedPrompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: imageFile.type,
          },
        },
      ])
    } else {
      result = await model.generateContent(enhancedPrompt)
    }

    const response = result.response
    const text = response.text()

    console.log("AI Response:", text.substring(0, 200) + "...")

    return NextResponse.json({
      success: true,
      response: text,
    })
  } catch (error: any) {
    console.error("AI Chat API Error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
