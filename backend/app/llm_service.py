import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load API key from .env file
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("No GEMINI_API_KEY found in .env file")

genai.configure(api_key=API_KEY)

model = genai.GenerativeModel('gemini-2.5-pro')

def generate_section_content(topic: str, heading: str, doc_type: str) -> str:
    """
    Generates content with specific formatting rules based on the document type.
    Uses extensive prompt engineering to ensure high-quality, format-specific output.
    """
    
    if doc_type == "pptx":
        prompt = (
            f"ACT AS: An expert presentation designer and communication strategist for Fortune 500 companies.\n"
            f"TASK: Write the content for a single PowerPoint slide.\n"
            f"CONTEXT: The overall presentation topic is '{topic}'. The specific title of this slide is '{heading}'.\n\n"
            f"DESIGN CONSTRAINTS (MUST FOLLOW):\n"
            f"1. FORMAT: Provide exactly 4 to 5 bullet points. Do NOT write paragraphs. Do NOT write an introduction or conclusion.\n"
            f"2. LENGTH: Each bullet point must be EXTREMELY concise (maximum 15 words per bullet). Brevity is key for slides.\n"
            f"3. STYLE: Use active voice. Be punchy and impactful. Use strong verbs.\n"
            f"4. CONTENT: Focus on the most critical information relevant to the header. Avoid fluff.\n"
            f"5. HISTORY/TIMELINES: If the slide title implies a history, timeline, or sequence of events (e.g., 'History of AI', 'Evolution', years like '1990-2000'), YOU MUST START EACH BULLET WITH A SPECIFIC YEAR OR DATE (e.g., '1956: Dartmouth Workshop...').\n"
            f"6. MARKDOWN: You may use **bold** for key terms, but do not use other markdown formatting like headers (#).\n"
            f"7. OUTPUT: Return ONLY the bullet points.\n\n"
            f"GENERATE SLIDE CONTENT NOW:"
        )
    else:
        prompt = (
            f"ACT AS: A senior technical writer and subject matter expert.\n"
            f"TASK: Write a detailed section for a professional business report or academic paper.\n"
            f"CONTEXT: The document topic is '{topic}'. The section heading is '{heading}'.\n\n"
            f"WRITING GUIDELINES:\n"
            f"1. DEPTH: Provide a comprehensive analysis of the specific heading. Do not be superficial.\n"
            f"2. STRUCTURE: Write 3-4 well-structured paragraphs. You may use a bulleted list within the text if it helps clarity, but the main format should be prose.\n"
            f"3. TONE: Formal, objective, and professional. Avoid slang or casual language.\n"
            f"4. LENGTH: Aim for approximately 250-350 words. Ensure the content is substantial.\n"
            f"5. FORMATTING: Use **bold** for key concepts or terminology. Use standard paragraphs.\n"
            f"6. COHESION: Ensure the text flows logically and directly addresses the heading.\n\n"
            f"WRITE SECTION CONTENT NOW:"
        )
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating content: {str(e)}"

def refine_content(current_content: str, instruction: str) -> str:
    """
    Refines existing content based on user instructions using an expert editor persona.
    """
    prompt = (
        f"ACT AS: An expert editor.\n"
        f"TASK: Rewrite the following text based STRICTLY on the user's instruction.\n\n"
        f"ORIGINAL TEXT:\n{current_content}\n\n"
        f"USER INSTRUCTION: {instruction}\n\n"
        f"GUIDELINES:\n"
        f"1. If the instruction asks to shorten, be aggressive in cutting words.\n"
        f"2. If the instruction asks for formatting (bullets, list), apply it strictly.\n"
        f"3. Maintain the original factual accuracy unless told to change the content.\n"
        f"4. Return ONLY the rewritten text, no conversational filler.\n\n"
        f"REWRITTEN TEXT:"
    )
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error refining content: {str(e)}"

def generate_outline_suggestions(topic: str, doc_type: str):
    """
    Generates a structured outline using a simple, reliable prompt.
    """
    item_type = "Slide Titles" if doc_type == "pptx" else "Section Headers"
    
    prompt = (
        f"Generate a structured outline for a {doc_type} about '{topic}'. "
        f"Provide a list of 5 key {item_type}. "
        f"Return ONLY the list items separated by newlines. "
        f"Do NOT use numbering (1., 2.) or bullets (*, -). Just the raw titles."
    )
    
    try:
        response = model.generate_content(prompt)
        lines = response.text.split('\n')
        clean_lines = []
        for line in lines:
            # Remove common list markers if the AI ignored instructions
            cleaned = line.lstrip("1234567890.-*• ")
            if cleaned.strip():
                clean_lines.append(cleaned.strip())
                
        return clean_lines
    except Exception as e:
        print(f"Outline Generation Error: {e}") # Log to terminal for debugging
        return []