import requests
import json
import time

def test_flashcard_api():
    """
    Test the flashcard API with various inputs
    """
    base_url = "http://localhost:5000"
    
    # Test health endpoint
    print("Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health")
        print(f"Health check: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"Health check failed: {e}")
        return
    
    # Test flashcard generation with different subjects
    test_cases = [
        {
            "question": "What is photosynthesis?",
            "answer": "Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce glucose and oxygen through chlorophyll.",
            "subject": "Biology",
            "difficulty": "medium"
        },
        {
            "question": "What is the quadratic formula?",
            "answer": "The quadratic formula is x = (-b ± √(b²-4ac)) / 2a, used to solve quadratic equations of the form ax² + bx + c = 0.",
            "subject": "Mathematics",
            "difficulty": "hard"
        },
        {
            "question": "What caused World War I?",
            "answer": "World War I was caused by a complex mix of factors including militarism, alliances, imperialism, and nationalism, triggered by the assassination of Archduke Franz Ferdinand.",
            "subject": "History",
            "difficulty": "medium"
        },
        {
            "question": "What is gravity?",
            "answer": "Gravity is a fundamental force of attraction between objects with mass, described by Newton's law of universal gravitation and Einstein's general relativity.",
            "subject": "Physics",
            "difficulty": "easy"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n--- Test Case {i}: {test_case['subject']} ---")
        print(f"Original Question: {test_case['question']}")
        print(f"Original Answer: {test_case['answer']}")
        print(f"Difficulty: {test_case['difficulty']}")
        
        try:
            response = requests.post(
                f"{base_url}/generate-flashcards",
                json=test_case,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data['success']:
                    print(f"✅ Generated {data['count']} flashcards successfully!")
                    
                    for j, card in enumerate(data['flashcards'], 1):
                        print(f"\n  Flashcard {j}:")
                        print(f"    Q: {card['question']}")
                        print(f"    A: {card['answer']}")
                else:
                    print(f"❌ API returned error: {data.get('error', 'Unknown error')}")
            else:
                print(f"❌ HTTP Error {response.status_code}: {response.text}")
                
        except Exception as e:
            print(f"❌ Request failed: {e}")
        
        # Add delay between requests
        time.sleep(2)
    
    print("\n🎉 API testing completed!")

if __name__ == "__main__":
    test_flashcard_api()
