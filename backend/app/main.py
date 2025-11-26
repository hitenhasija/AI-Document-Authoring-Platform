from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from fastapi.middleware.cors import CORSMiddleware

from . import models, schemas, crud, auth, database, llm_service, export_service

# Create tables in the database
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (simplest for development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AUTH ROUTES ---
@app.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = crud.get_user_by_email(db, form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# --- PROJECT ROUTES ---
@app.post("/projects/", response_model=schemas.Project)
def create_project(
    project: schemas.ProjectCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return crud.create_project(db=db, project=project, user_id=current_user.id)

@app.get("/projects/", response_model=List[schemas.Project])
def read_projects(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return crud.get_user_projects(db=db, user_id=current_user.id)

# --- SECTION & AI ROUTES ---
@app.post("/projects/{project_id}/sections", response_model=schemas.Section)
def create_section(
    project_id: int,
    section: schemas.SectionCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # 1. Check if project exists
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # 2. Generate Content using AI
    generated_text = llm_service.generate_section_content(
        topic=project.description,
        heading=section.heading,
        doc_type=project.doc_type
    )
    
    # 3. Save to DB
    db_section = models.DocumentSection(
        project_id=project_id,
        heading=section.heading,
        content=generated_text,
        order_index=section.order_index
    )
    db.add(db_section)
    db.commit()
    db.refresh(db_section)
    return db_section

@app.put("/sections/{section_id}/refine", response_model=schemas.Section)
def refine_section(
    section_id: int,
    instruction: str, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    section = db.query(models.DocumentSection).filter(models.DocumentSection.id == section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    # 1. Call AI to refine
    new_content = llm_service.refine_content(section.content, instruction)
    
    # 2. Update History
    history_entry = {
        "original": section.content,
        "instruction": instruction,
        "refined": new_content
    }
    
    current_history = list(section.refinement_history) if section.refinement_history else []
    current_history.append(history_entry)
    
    section.content = new_content
    section.refinement_history = current_history
    db.commit()
    db.refresh(section)
    return section

# --- EXPORT ROUTES ---
@app.get("/projects/{project_id}/export")
def export_project(
    project_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    sections = db.query(models.DocumentSection).filter(models.DocumentSection.project_id == project_id).all()

    if project.doc_type == "docx":
        file_stream = export_service.create_word_doc(project.title, sections)
        filename = f"{project.title}.docx"
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    else:
        file_stream = export_service.create_ppt_presentation(project.title, sections)
        filename = f"{project.title}.pptx"
        media_type = "application/vnd.openxmlformats-officedocument.presentationml.presentation"

    return StreamingResponse(
        file_stream, 
        media_type=media_type, 
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.get("/")
def read_root():
    return {"message": "AI Document Platform is running!"}


@app.get("/projects/{project_id}", response_model=schemas.Project)
def read_project(
    project_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@app.delete("/projects/{project_id}")
def delete_project_endpoint(
    project_id: int, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    crud.delete_project(db, project_id)
    return {"message": "Project deleted successfully"}


@app.post("/generate-outline")
def get_outline_suggestions(request: schemas.OutlineRequest):
    suggestions = llm_service.generate_outline_suggestions(request.topic, request.doc_type)
    return {"outline": suggestions}