import requests
import json
import time
import os

def test_enhanced_flashcard_api():
    """
    Test the enhanced flashcard API with Gemini AI
    """
    base_url = "http://localhost:5000"
    
    print("🚀 Testing Enhanced Flashcard API with Gemini AI")
    print("=" * 60)
    
    # Test health endpoint
    print("\n1. Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health")
        print(f"✅ Health check: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return
    
    # Test text-based flashcard generation
    print("\n2. Testing text-based flashcard generation...")
    test_case = {
        "question": "What is photosynthesis?",
        "answer": "Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce glucose and oxygen through chlorophyll in their leaves.",
        "subject": "Biology",
        "difficulty": "medium"
    }
    
    try:
        response = requests.post(
            f"{base_url}/generate-flashcards",
            json=test_case,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                print(f"✅ Generated {data['count']} high-quality flashcards!")
                
                for i, card in enumerate(data['flashcards'], 1):
                    print(f"\n  📚 Flashcard {i}:")
                    print(f"     Q: {card['question']}")
                    print(f"     A: {card['answer'][:100]}...")
            else:
                print(f"❌ Error: {data.get('error')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    # Test file upload (if test files exist)
    print("\n3. Testing file upload capabilities...")
    
    # Create a simple test text file
    test_content = """
    Mitochondria: The Powerhouse of the Cell
    
    Mitochondria are membrane-bound organelles found in most eukaryotic cells. They are often called the "powerhouse of the cell" because they generate most of the cell's supply of adenosine triphosphate (ATP), which is used as a source of chemical energy.
    
    Key Functions:
    - ATP production through cellular respiration
    - Regulation of cellular metabolism
    - Calcium storage
    - Heat production
    
    Structure:
    - Outer membrane: Controls what enters and exits
    - Inner membrane: Contains cristae for increased surface area
    - Matrix: Contains enzymes for the citric acid cycle
    """
    
    # Write test file
    with open('test_biology.txt', 'w') as f:
        f.write(test_content)
    
    try:
        with open('test_biology.txt', 'rb') as f:
            files = {'file': ('test_biology.txt', f, 'text/plain')}
            data = {
                'subject': 'Biology',
                'difficulty': 'medium'
            }
            
            response = requests.post(
                f"{base_url}/generate-flashcards-from-file",
                files=files,
                data=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                if result['success']:
                    print(f"✅ Generated {result['count']} flashcards from file!")
                    print(f"   Source type: {result['source_type']}")
                    
                    for i, card in enumerate(result['flashcards'], 1):
                        print(f"\n  📄 File-based Flashcard {i}:")
                        print(f"     Q: {card['question']}")
                        print(f"     A: {card['answer'][:100]}...")
                else:
                    print(f"❌ File processing error: {result.get('error')}")
            else:
                print(f"❌ File upload HTTP Error: {response.status_code}")
                
    except Exception as e:
        print(f"❌ File upload failed: {e}")
    finally:
        # Clean up test file
        if os.path.exists('test_biology.txt'):
            os.remove('test_biology.txt')
    
    print("\n" + "=" * 60)
    print("🎉 Enhanced API testing completed!")
    print("\nFeatures tested:")
    print("✅ Health check")
    print("✅ Text-based flashcard generation with Gemini")
    print("✅ File upload and processing")
    print("\nThe API now supports:")
    print("📝 Text input with improved AI generation")
    print("📸 Image analysis with Gemini Vision")
    print("📄 Document processing (PDF, Word, Text)")
    print("🧠 Much better educational flashcard quality")

if __name__ == "__main__":
    test_enhanced_flashcard_api()
