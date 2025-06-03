import google.generativeai as genai

# Test the API key
GEMINI_API_KEY = "AIzaSyBvv8cunb_5wTyBcW7RqOhmCNq2eiWmrZo"

try:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-pro')
    
    response = model.generate_content("Say hello and confirm you're working!")
    print("✅ API Key works!")
    print("Response:", response.text)
    
except Exception as e:
    print("❌ API Key test failed:", e)
