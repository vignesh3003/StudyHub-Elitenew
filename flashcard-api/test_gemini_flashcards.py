import requests
import json

def test_gemini_flashcards():
    """
    Test the Gemini-powered flashcard generation
    """
    base_url = "http://localhost:5000"
    
    # Test with the same example that was failing
    test_case = {
        "question": "What is the sum of 2+2?",
        "answer": "The sum is 4",
        "subject": "Mathematics",
        "difficulty": "easy"
    }
    
    print("Testing with Gemini API:")
    print(f"Original Question: {test_case['question']}")
    print(f"Original Answer: {test_case['answer']}")
    print(f"Subject: {test_case['subject']}")
    print(f"Difficulty: {test_case['difficulty']}")
    print("\n" + "="*50)
    
    try:
        response = requests.post(
            f"{base_url}/generate-flashcards",
            json=test_case,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                print(f"✅ Generated {data['count']} PROPER flashcards with Gemini!")
                
                for i, card in enumerate(data['flashcards'], 1):
                    print(f"\n📚 Flashcard {i}:")
                    print(f"   Q: {card['question']}")
                    print(f"   A: {card['answer']}")
            else:
                print(f"❌ Error: {data.get('error')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    test_gemini_flashcards()
