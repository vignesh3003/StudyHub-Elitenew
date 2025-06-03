from flask import request, jsonify
import google.generativeai as genai
import json
from datetime import datetime, timedelta
import re
from typing import List, Dict

def add_enhanced_ai_routes(app, text_model):
    """Add enhanced AI-powered endpoints to the Flask app"""
    
    @app.route('/generate-study-plan', methods=['POST'])
    def generate_study_plan():
        """Generate a personalized study plan using Gemini AI"""
        try:
            data = request.get_json()
            
            subjects = data.get('subjects', [])
            available_hours = data.get('availableHours', 10)
            exam_date = data.get('examDate', '')
            current_level = data.get('currentLevel', 'intermediate')
            goals = data.get('goals', [])
            
            prompt = f"""
You are an expert academic advisor creating a personalized study plan.

STUDENT PROFILE:
- Subjects: {', '.join(subjects)}
- Available study hours per week: {available_hours}
- Current level: {current_level}
- Exam date: {exam_date if exam_date else 'Not specified'}
- Goals: {', '.join(goals)}

Create a comprehensive 4-week study plan that includes:

1. WEEKLY BREAKDOWN: Distribute {available_hours} hours across subjects
2. DAILY SCHEDULE: Specific tasks for each day
3. STUDY TECHNIQUES: Best methods for each subject
4. MILESTONES: Weekly goals and checkpoints
5. REVIEW SESSIONS: Spaced repetition schedule
6. EXAM PREPARATION: Final week strategy (if exam date provided)

Make the plan:
- Realistic and achievable for {current_level} level
- Balanced across all subjects
- Progressive in difficulty
- Include breaks and review time
- Adaptable to different learning styles

Format as JSON:
{{
  "total_weeks": 4,
  "weekly_hours": {available_hours},
  "subjects_focus": {{"subject": "percentage_of_time"}},
  "weekly_plans": [
    {{
      "week": 1,
      "theme": "Foundation Building",
      "daily_schedule": [
        {{
          "day": "Monday",
          "tasks": ["specific task 1", "specific task 2"],
          "time_slots": ["9:00-10:30", "14:00-15:30"],
          "subjects": ["Math", "Science"],
          "techniques": ["Active reading", "Practice problems"]
        }}
      ],
      "goals": ["Weekly goal 1", "Weekly goal 2"],
      "review_topics": ["Topic to review"]
    }}
  ],
  "study_techniques": {{
    "subject_name": ["technique1", "technique2"]
  }},
  "tips": ["Personalized tip 1", "Personalized tip 2"]
}}

Create a PRACTICAL and ACTIONABLE study plan!
"""

            response = text_model.generate_content(prompt)
            content = response.text.strip()
            
            # Parse the response
            try:
                # Clean and extract JSON
                start_idx = content.find('{')
                end_idx = content.rfind('}') + 1
                
                if start_idx != -1 and end_idx != -1:
                    json_str = content[start_idx:end_idx]
                    study_plan = json.loads(json_str)
                else:
                    study_plan = json.loads(content)
                
                return jsonify({
                    "success": True,
                    "study_plan": study_plan,
                    "message": "Personalized study plan generated successfully!"
                })
                
            except json.JSONDecodeError:
                # Fallback study plan
                fallback_plan = generate_fallback_study_plan(subjects, available_hours, current_level)
                return jsonify({
                    "success": True,
                    "study_plan": fallback_plan,
                    "message": "Study plan generated with fallback method"
                })
                
        except Exception as e:
            print(f"Error generating study plan: {e}")
            return jsonify({
                "success": False,
                "error": "Failed to generate study plan"
            }), 500

    @app.route('/get-study-tips', methods=['POST'])
    def get_personalized_tips():
        """Get personalized study tips using Gemini AI"""
        try:
            data = request.get_json()
            
            study_habits = data.get('studyHabits', [])
            challenges = data.get('challenges', [])
            subjects = data.get('subjects', [])
            learning_style = data.get('learningStyle', 'visual')
            
            prompt = f"""
You are an expert learning coach providing personalized study advice.

STUDENT PROFILE:
- Current study habits: {', '.join(study_habits)}
- Main challenges: {', '.join(challenges)}
- Subjects: {', '.join(subjects)}
- Learning style: {learning_style}

Provide 8 personalized study tips that address their specific challenges and leverage their learning style.

Each tip should:
1. Be specific and actionable
2. Address their challenges
3. Match their learning style
4. Be relevant to their subjects
5. Include practical implementation steps

Format as JSON array:
[
  {{
    "title": "Specific tip title",
    "description": "Detailed explanation with actionable steps",
    "category": "memory|focus|organization|motivation",
    "difficulty": "beginner|intermediate|advanced",
    "implementation": ["Step 1", "Step 2", "Step 3"],
    "subjects_applicable": ["Math", "Science"],
    "time_required": "5-10 minutes daily"
  }}
]

Make tips PRACTICAL and PERSONALIZED to their profile!
"""

            response = text_model.generate_content(prompt)
            content = response.text.strip()
            
            try:
                # Parse JSON response
                start_idx = content.find('[')
                end_idx = content.rfind(']') + 1
                
                if start_idx != -1 and end_idx != -1:
                    json_str = content[start_idx:end_idx]
                    tips = json.loads(json_str)
                else:
                    tips = json.loads(content)
                
                return jsonify({
                    "success": True,
                    "tips": tips,
                    "message": f"Generated {len(tips)} personalized study tips!"
                })
                
            except json.JSONDecodeError:
                # Fallback tips
                fallback_tips = generate_fallback_tips(learning_style, subjects)
                return jsonify({
                    "success": True,
                    "tips": fallback_tips,
                    "message": "Study tips generated with fallback method"
                })
                
        except Exception as e:
            print(f"Error generating study tips: {e}")
            return jsonify({
                "success": False,
                "error": "Failed to generate study tips"
            }), 500

    @app.route('/analyze-progress', methods=['POST'])
    def analyze_study_progress():
        """Analyze study progress and provide insights using Gemini AI"""
        try:
            data = request.get_json()
            
            completed_tasks = data.get('completedTasks', 0)
            total_tasks = data.get('totalTasks', 1)
            study_hours = data.get('studyHours', 0)
            grades = data.get('grades', [])
            timeframe = data.get('timeframe', 'week')
            
            # Calculate metrics
            completion_rate = (completed_tasks / total_tasks) * 100 if total_tasks > 0 else 0
            avg_grade = sum(g['grade']/g['maxGrade'] for g in grades) / len(grades) * 100 if grades else 0
            
            prompt = f"""
You are an expert academic performance analyst providing insights on student progress.

PERFORMANCE DATA ({timeframe}):
- Task completion rate: {completion_rate:.1f}% ({completed_tasks}/{total_tasks})
- Total study hours: {study_hours}
- Average grade: {avg_grade:.1f}%
- Subjects and grades: {grades}

Analyze this data and provide:

1. PERFORMANCE ASSESSMENT: Overall performance evaluation
2. STRENGTHS: What the student is doing well
3. AREAS FOR IMPROVEMENT: Specific areas needing attention
4. ACTIONABLE RECOMMENDATIONS: Concrete steps to improve
5. GOAL SETTING: Realistic targets for next {timeframe}
6. STUDY STRATEGY ADJUSTMENTS: How to optimize study approach

Format as JSON:
{{
  "overall_score": 85,
  "performance_level": "Good|Excellent|Needs Improvement",
  "strengths": ["Strength 1", "Strength 2"],
  "areas_for_improvement": ["Area 1", "Area 2"],
  "recommendations": [
    {{
      "category": "Time Management|Study Techniques|Goal Setting",
      "action": "Specific action to take",
      "expected_impact": "What this will achieve",
      "timeline": "When to implement"
    }}
  ],
  "next_goals": [
    {{
      "goal": "Specific goal",
      "target_value": "Measurable target",
      "deadline": "When to achieve"
    }}
  ],
  "insights": ["Key insight 1", "Key insight 2"],
  "motivation_message": "Encouraging message based on progress"
}}

Provide ACTIONABLE and ENCOURAGING analysis!
"""

            response = text_model.generate_content(prompt)
            content = response.text.strip()
            
            try:
                # Parse JSON response
                start_idx = content.find('{')
                end_idx = content.rfind('}') + 1
                
                if start_idx != -1 and end_idx != -1:
                    json_str = content[start_idx:end_idx]
                    analysis = json.loads(json_str)
                else:
                    analysis = json.loads(content)
                
                return jsonify({
                    "success": True,
                    "analysis": analysis,
                    "message": "Progress analysis completed successfully!"
                })
                
            except json.JSONDecodeError:
                # Fallback analysis
                fallback_analysis = generate_fallback_analysis(completion_rate, study_hours, avg_grade)
                return jsonify({
                    "success": True,
                    "analysis": fallback_analysis,
                    "message": "Progress analysis completed with fallback method"
                })
                
        except Exception as e:
            print(f"Error analyzing progress: {e}")
            return jsonify({
                "success": False,
                "error": "Failed to analyze progress"
            }), 500

# Add fallback mechanism for when the AI model fails
def generate_study_plan(subjects: List[str], availableHours: int, examDate: str = None, currentLevel: str = "intermediate", goals: List[str] = None):
    """Generate study plan with fallback."""
    # This function is not directly used as a route, but called from within the route.
    return generate_fallback_study_plan(subjects, availableHours, currentLevel)

# Add a more robust fallback mechanism for generating flashcards
def _generate_smart_fallback_flashcards(question: str, answer: str, subject: str, difficulty: str) -> List[Dict[str, str]]:
    """Generate intelligent fallback flashcards when the AI model fails"""
    
    # Extract key terms from the question and answer
    combined_text = f"{question} {answer}"
    words = re.findall(r'\b[a-zA-Z]{4,}\b', combined_text.lower())
    important_words = [w for w in words if w not in ['what', 'how', 'why', 'when', 'where', 'this', 'that', 'there', 'their', 'which']]
    
    # Get the top 3 most important words
    key_terms = important_words[:3] if len(important_words) >= 3 else important_words
    
    # Create flashcards based on the subject and key terms
    flashcards = []
    
    # Add a definition card
    flashcards.append({
        "question": f"What is the definition of {key_terms[0] if key_terms else subject}?",
        "answer": f"The {key_terms[0] if key_terms else subject} refers to {answer[:100]}..."
    })
    
    # Add an example card
    flashcards.append({
        "question": f"Give an example of {key_terms[1] if len(key_terms) > 1 else subject}.",
        "answer": f"An example would be {answer[:100]}..."
    })
    
    # Add an application card
    flashcards.append({
        "question": f"How is {key_terms[2] if len(key_terms) > 2 else subject} applied in real-world scenarios?",
        "answer": f"In real-world applications, {answer[:100]}..."
    })
    
    # Add a comparison card
    flashcards.append({
        "question": f"Compare and contrast {key_terms[0] if key_terms else subject} with related concepts.",
        "answer": f"When comparing {key_terms[0] if key_terms else subject} with related concepts, key differences include {answer[:100]}..."
    })
    
    # Add an analysis card
    flashcards.append({
        "question": f"Analyze the importance of {key_terms[1] if len(key_terms) > 1 else subject} in {subject}.",
        "answer": f"The importance of {key_terms[1] if len(key_terms) > 1 else subject} in {subject} can be analyzed through {answer[:100]}..."
    })
    
    return flashcards

def generate_fallback_study_plan(subjects, hours, level):
    """Generate a basic study plan when AI fails"""
    hours_per_subject = hours // len(subjects) if subjects else 2
    
    return {
        "total_weeks": 4,
        "weekly_hours": hours,
        "subjects_focus": {subject: f"{100//len(subjects)}%" for subject in subjects},
        "weekly_plans": [
            {
                "week": i + 1,
                "theme": f"Week {i + 1} Focus",
                "daily_schedule": [
                    {
                        "day": "Monday",
                        "tasks": [f"Study {subjects[0] if subjects else 'main subject'}", "Review notes"],
                        "time_slots": ["9:00-10:30", "14:00-15:30"],
                        "subjects": subjects[:2] if len(subjects) >= 2 else subjects,
                        "techniques": ["Active reading", "Practice problems"]
                    }
                ],
                "goals": [f"Complete week {i + 1} objectives", "Review previous material"],
                "review_topics": ["Previous week topics"]
            } for i in range(4)
        ],
        "study_techniques": {subject: ["Reading", "Practice", "Review"] for subject in subjects},
        "tips": ["Stay consistent", "Take regular breaks", "Review regularly"]
    }

def generate_fallback_tips(learning_style, subjects):
    """Generate basic tips when AI fails"""
    return [
        {
            "title": f"Optimize for {learning_style} learning",
            "description": f"Use {learning_style}-based techniques for better retention",
            "category": "memory",
            "difficulty": "beginner",
            "implementation": ["Identify your style", "Apply techniques", "Practice regularly"],
            "subjects_applicable": subjects,
            "time_required": "10-15 minutes daily"
        },
        {
            "title": "Active recall practice",
            "description": "Test yourself regularly without looking at notes",
            "category": "memory",
            "difficulty": "intermediate",
            "implementation": ["Close your books", "Write what you remember", "Check accuracy"],
            "subjects_applicable": subjects,
            "time_required": "15-20 minutes per session"
        }
    ]

def generate_fallback_analysis(completion_rate, study_hours, avg_grade):
    """Generate basic analysis when AI fails"""
    if completion_rate >= 80:
        performance_level = "Excellent"
    elif completion_rate >= 60:
        performance_level = "Good"
    else:
        performance_level = "Needs Improvement"
    
    return {
        "overall_score": int(completion_rate),
        "performance_level": performance_level,
        "strengths": ["Task completion", "Study consistency"],
        "areas_for_improvement": ["Time management", "Study efficiency"],
        "recommendations": [
            {
                "category": "Time Management",
                "action": "Create a detailed study schedule",
                "expected_impact": "Better organization and productivity",
                "timeline": "This week"
            }
        ],
        "next_goals": [
            {
                "goal": "Improve completion rate",
                "target_value": "90%",
                "deadline": "Next week"
            }
        ],
        "insights": ["Consistency is key", "Small improvements lead to big results"],
        "motivation_message": "You're making great progress! Keep up the good work."
    }
