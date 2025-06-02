import google.generativeai as genai
import json

# Your API key
GEMINI_API_KEY = "AIzaSyBvv8cunb_5wTyBcW7RqOhmCNq2eiWmrZo"

def test_gemini_directly():
    """Test Gemini API directly"""
    try:
        print("🔑 Testing Gemini API key...")
        genai.configure(api_key=GEMINI_API_KEY)
        
        model = genai.GenerativeModel('gemini-pro')
        
        prompt = """
Create 3 simple flashcards about basic math. Return ONLY JSON:
[
  {"question": "What is 2+2?", "answer": "4"},
  {"question": "What is 5*3?", "answer": "15"},
  {"question": "What is 10-7?", "answer": "3"}
]
"""
        
        response = model.generate_content(prompt)
        content = response.text.strip()
        
        print("✅ Raw AI Response:")
        print(content)
        
        # Try to parse JSON
        start = content.find('[')
        end = content.rfind(']') + 1
        
        if start != -1 and end > start:
            json_str = content[start:end]
            flashcards = json.loads(json_str)
            
            print("\n🎉 SUCCESS! Generated flashcards:")
            for i, card in enumerate(flashcards, 1):
                print(f"{i}. Q: {card['question']}")
                print(f"   A: {card['answer']}")
            
            return True
        else:
            print("❌ Could not find JSON in response")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_gemini_directly()
