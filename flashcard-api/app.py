from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import json
import re
import io
from PIL import Image
import PyPDF2
import docx
from typing import List, Dict
import mimetypes
import traceback

app = Flask(__name__)
CORS(app, origins=["*"])  # Allow all origins for testing

# Your Gemini API key
GEMINI_API_KEY = "AIzaSyBvv8cunb_5wTyBcW7RqOhmCNq2eiWmrZo"

# Configure Gemini
try:
    genai.configure(api_key=GEMINI_API_KEY)
    print("✅ Gemini API configured successfully")
except Exception as e:
    print(f"❌ Failed to configure Gemini API: {e}")

class SimpleFlashcardGenerator:
    def __init__(self):
        try:
            self.model = genai.GenerativeModel('gemini-pro')
            print("✅ Gemini model initialized")
        except Exception as e:
            print(f"❌ Model initialization failed: {e}")
            self.model = None
    
    def generate_flashcards(self, question: str, answer: str, subject: str, difficulty: str) -> List[Dict[str, str]]:
        """Generate flashcards using Gemini"""
        if not self.model:
            return self._fallback_flashcards(question, answer, subject, difficulty)
        
        try:
            prompt = f"""
Create 5 educational flashcards based on this example:

Original Question: {question}
Original Answer: {answer}
Subject: {subject}
Difficulty: {difficulty}

Create 5 NEW flashcards that help students learn more about this {subject} topic.
Each flashcard should have a clear question and detailed answer.

Return ONLY a JSON array in this exact format:
[
  {{"question": "What is...", "answer": "The answer is..."}},
  {{"question": "How does...", "answer": "It works by..."}},
  {{"question": "Why is...", "answer": "Because..."}},
  {{"question": "When should...", "answer": "You should..."}},
  {{"question": "Where can...", "answer": "It can be found..."}}
]
"""
            
            print(f"🚀 Sending prompt to Gemini for {subject}...")
            response = self.model.generate_content(prompt)
            content = response.text.strip()
            print(f"📝 Received response: {content[:200]}...")
            
            # Parse JSON from response
            flashcards = self._extract_json(content)
            
            if flashcards and len(flashcards) > 0:
                print(f"✅ Successfully generated {len(flashcards)} flashcards")
                return flashcards
            else:
                print("⚠️ No valid flashcards found, using fallback")
                return self._fallback_flashcards(question, answer, subject, difficulty)
                
        except Exception as e:
            print(f"❌ Error generating flashcards: {e}")
            print(f"Traceback: {traceback.format_exc()}")
            return self._fallback_flashcards(question, answer, subject, difficulty)
    
    def _extract_json(self, content: str) -> List[Dict[str, str]]:
        """Extract JSON array from response"""
        try:
            # Remove markdown formatting
            content = content.replace('```json', '').replace('```', '').strip()
            
            # Find JSON array
            start = content.find('[')
            end = content.rfind(']') + 1
            
            if start != -1 and end > start:
                json_str = content[start:end]
                flashcards = json.loads(json_str)
                
                # Validate structure
                valid_cards = []
                for card in flashcards:
                    if isinstance(card, dict) and 'question' in card and 'answer' in card:
                        valid_cards.append({
                            'question': str(card['question']).strip(),
                            'answer': str(card['answer']).strip()
                        })
                
                return valid_cards
            
        except Exception as e:
            print(f"JSON parsing error: {e}")
        
        return []
    
    def _fallback_flashcards(self, question: str, answer: str, subject: str, difficulty: str) -> List[Dict[str, str]]:
        """Generate fallback flashcards when AI fails"""
        print("🔄 Using fallback flashcard generation")
        
        # Extract key terms
        key_terms = re.findall(r'\b[A-Za-z]{4,}\b', f"{question} {answer}")
        main_term = key_terms[0] if key_terms else subject
        
        return [
            {
                "question": f"What is the definition of {main_term} in {subject}?",
                "answer": f"{main_term} is an important concept in {subject} that relates to {answer[:100]}..."
            },
            {
                "question": f"How is {main_term} used in {subject}?",
                "answer": f"In {subject}, {main_term} is used for various applications and has practical importance."
            },
            {
                "question": f"What are the key characteristics of {main_term}?",
                "answer": f"The main characteristics of {main_term} include several important features relevant to {subject}."
            },
            {
                "question": f"Why is {main_term} important in {subject}?",
                "answer": f"{main_term} is important because it helps students understand fundamental concepts in {subject}."
            },
            {
                "question": f"How does {main_term} relate to other {subject} concepts?",
                "answer": f"{main_term} connects to other {subject} concepts through shared principles and applications."
            }
        ]

# Initialize generator
generator = SimpleFlashcardGenerator()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Test if Gemini is working
        if generator.model:
            test_response = generator.model.generate_content("Say 'API is working'")
            api_working = "working" in test_response.text.lower()
        else:
            api_working = False
            
        return jsonify({
            "status": "healthy",
            "message": "Flashcard API is running",
            "gemini_configured": bool(GEMINI_API_KEY),
            "model_initialized": generator.model is not None,
            "api_test": "passed" if api_working else "failed"
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Health check failed: {str(e)}"
        }), 500

@app.route('/generate-flashcards', methods=['POST'])
def generate_flashcards():
    """Generate flashcards from text input"""
    try:
        print("📨 Received flashcard generation request")
        
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        # Extract and validate data
        question = data.get('question', '').strip()
        answer = data.get('answer', '').strip()
        subject = data.get('subject', '').strip()
        difficulty = data.get('difficulty', 'medium').strip()
        
        print(f"📝 Request data: Q='{question[:50]}...', A='{answer[:50]}...', Subject='{subject}', Difficulty='{difficulty}'")
        
        if not all([question, answer, subject]):
            return jsonify({
                "success": False, 
                "error": "Missing required fields: question, answer, and subject are required"
            }), 400
        
        # Generate flashcards
        print("🤖 Generating flashcards with AI...")
        flashcards = generator.generate_flashcards(question, answer, subject, difficulty)
        
        if not flashcards:
            return jsonify({
                "success": False,
                "error": "Failed to generate any flashcards"
            }), 500
        
        print(f"✅ Successfully generated {len(flashcards)} flashcards")
        
        return jsonify({
            "success": True,
            "flashcards": flashcards,
            "count": len(flashcards),
            "message": f"Generated {len(flashcards)} flashcards using Gemini AI"
        })
        
    except Exception as e:
        print(f"❌ Error in generate_flashcards: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({
            "success": False,
            "error": f"Server error: {str(e)}"
        }), 500

@app.route('/test-ai', methods=['GET'])
def test_ai():
    """Test endpoint to verify AI is working"""
    try:
        if not generator.model:
            return jsonify({
                "success": False,
                "error": "AI model not initialized"
            }), 500
        
        response = generator.model.generate_content("Generate a simple math flashcard about addition. Return only: {'question': 'What is 2+2?', 'answer': '4'}")
        
        return jsonify({
            "success": True,
            "ai_response": response.text,
            "message": "AI is working correctly"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"AI test failed: {str(e)}"
        }), 500

if __name__ == '__main__':
    print("🚀 Starting Simple Flashcard API...")
    print(f"🔑 API Key: {GEMINI_API_KEY[:10]}...")
    print("🌐 Server starting on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
