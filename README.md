Ocean AI - AI-Assisted Document Authoring Platform

Ocean AI is a full-stack web application that empowers users to generate, refine, and export professional business documents (Word & PowerPoint) using the power of Generative AI (Google Gemini).

This project was built to demonstrate a complete AI-integrated workflow: from scaffolding a document structure to generating context-aware content and exporting valid .docx and .pptx files.

🚀 Features

Core Functionality

🔐 Secure Authentication: Complete user registration and login system using JWT (JSON Web Tokens).

📂 Project Management: Dashboard to create, view, and delete document projects.

🤖 AI Content Generation: Generates detailed, context-aware content for specific sections or slides using Google's Gemini Pro model.

✨ Interactive Refinement: Users can highlight sections and ask the AI to rewrite, shorten, or format text (e.g., "Make this a bulleted list").

📝 Feedback System: Users can rate AI outputs (Like/Dislike) and leave persistent notes for each section.

📄 Multi-Format Export:

Word (.docx): Generates formatted reports.

PowerPoint (.pptx): Generates presentation slides with auto-fitting text logic to prevent overflow.

Bonus Features

🧠 AI-Suggested Outlines: When creating a project, users can click "AI Suggest Outline" to automatically generate a structured list of sections based on their topic, which the system then scaffolds into the database.

🛠️ Tech Stack

Backend

Framework: FastAPI (Python)

Database: SQLite with SQLAlchemy ORM

AI Model: Google Gemini Pro (google-generativeai)

Document Processing: python-docx and python-pptx

Authentication: python-jose (JWT) and passlib (Bcrypt)

Frontend

Framework: React (Vite)

Language: TypeScript

Styling: Tailwind CSS

UI Components: Shadcn UI (Radix Primitives) + Lucide Icons

HTTP Client: Axios

⚙️ Installation & Setup

Prerequisites

Python 3.8 or higher

Node.js & npm

A Google Cloud API Key for Gemini

1. Backend Setup

Navigate to the backend folder:

cd backend


Create and activate a virtual environment:

# Windows
python -m venv venv
.\venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate


Install Python dependencies:

pip install -r requirements.txt


Environment Configuration:
Create a .env file in the root directory (outside backend/frontend) and add your API key:

GEMINI_API_KEY=your_actual_api_key_here


Start the Backend Server:

# Run from the root folder
python -m uvicorn backend.app.main:app --reload


The backend will run at http://127.0.0.1:8000

2. Frontend Setup

Open a new terminal and navigate to the frontend folder:

cd frontend


Install Node dependencies:

npm install


Start the React Application:

npm run dev


The frontend will run at http://localhost:8080 (or similar port shown in terminal)

📖 Usage Guide

Sign Up: Register a new account on the login screen.

Create Project:

Click "New Project".

Enter a Title (e.g., "Future of AI") and a Topic.

Try the Bonus: Click the purple "AI Suggest Outline" button to auto-generate sections.

Select Format (Word or PowerPoint) and click Create.

Editor Interface:

Select a section from the sidebar.

Click "Generate" to have AI write the initial content.

Use the Refine Bar at the bottom to tweak the text (e.g., "Make it shorter").

Use the Thumbs Up/Down buttons to leave feedback.

Export:

Click the green "Download File" button to get your final document.

📂 Project Structure

ai-doc-platform/
├── backend/
│   ├── app/
│   │   ├── main.py          # API Entry point & CORS
│   │   ├── models.py        # Database Schema (User, Project, Section)
│   │   ├── schemas.py       # Pydantic Data Models
│   │   ├── crud.py          # Database CRUD Operations
│   │   ├── auth.py          # JWT Authentication Logic
│   │   ├── llm_service.py   # Gemini AI Integration & Prompt Engineering
│   │   └── export_service.py# Logic for generating .docx and .pptx files
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/           # Dashboard (Index), Editor, Login
│   │   ├── lib/             # API Configuration (Axios)
│   │   └── components/      # Reusable UI Components
│   └── package.json
└── .gitignore
