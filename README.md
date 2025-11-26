# 🌊 Ocean AI – AI-Assisted Document Authoring Platform

Ocean AI is a full-stack AI-powered platform that enables users to generate, refine, and export high-quality **Word (.docx)** and **PowerPoint (.pptx)** documents using **Google Gemini**.  
It showcases an end-to-end AI workflow—from generating structured outlines to producing export-ready business documents.

## 🚀 Features

### 🔐 Authentication  
- Secure signup & login using **JWT**  
- Password hashing using **Bcrypt**

### 📂 Project Workspace  
- Create, view, update, and delete document projects  
- Choose between **Word Report** or **PowerPoint Presentation**

### 🤖 AI Content Generation  
- Generate context-aware content for any section or slide  
- AI-powered refinement: rewrite, shorten, expand, bulletize, improve tone

### ✨ Interactive Editing  
- Highlight text and ask AI for custom rewrites  
- Save notes for each section  
- Like/Dislike feedback stored in DB

### 📄 Multi-Format Export  
- **Word (.docx)** with clean formatting  
- **PowerPoint (.pptx)** with auto-fit text logic

### 🌟 Bonus Features  
- AI-Suggested document outlines  
- Modern UI using Tailwind + shadcn  
- Fast workflow with Axios + FastAPI

## 🛠️ Tech Stack

### Backend  
- FastAPI  
- SQLite + SQLAlchemy  
- Google Gemini Pro  
- python-docx & python-pptx  
- JWT (python-jose)  
- Passlib (Bcrypt)

### Frontend  
- React (Vite) + TypeScript  
- Tailwind CSS + shadcn/ui  
- Axios

## ⚙️ Installation & Setup

### Prerequisites  
- Python 3.8+  
- Node.js & npm  
- Google Gemini API Key

## Backend Setup

```bash
cd backend
```

### Create Virtual Environment (Windows)

```bash
python -m venv venv
.env\Scripts\activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Environment Variables  
Create `.env` in project root:

```
GEMINI_API_KEY=your_actual_api_key_here
```

### Start Backend

```bash
python -m uvicorn backend.app.main:app --reload
```

Runs at: http://127.0.0.1:8000

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend at: http://localhost:8080

## 📖 Usage Guide

1. Sign up or log in  
2. Create a project  
3. Generate & refine content  
4. Export as `.docx` or `.pptx`

## 📂 Project Structure

```
ai-doc-platform/
├── backend/
│   ├── app/
│   ├── requirements.txt
├── frontend/
│   ├── src/
└── .gitignore
```

## 🧭 Roadmap

- PDF export  
- Image generation for slides  
- Collaboration features  
- Templates

## 🛡️ License  
MIT License

## ⭐ Support  
Give the project a ⭐ on GitHub!
