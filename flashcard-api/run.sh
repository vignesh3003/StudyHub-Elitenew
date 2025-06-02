#!/bin/bash
echo "🚀 Starting AI Flashcard API..."
echo "📍 Make sure you're in the flashcard-api directory"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

# Install requirements
echo "📦 Installing requirements..."
pip3 install flask flask-cors google-generativeai pillow pypdf2 python-docx

# Start the API
echo "🌐 Starting API server on http://localhost:5000"
python3 app.py
