from sqlalchemy.orm import Session
from . import models, schemas, auth

# --- USER OPERATIONS ---
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- PROJECT OPERATIONS ---

def create_project(db: Session, project: schemas.ProjectCreate, user_id: int):
    db_project = models.Project(**project.model_dump(), user_id=user_id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def get_user_projects(db: Session, user_id: int):
    return db.query(models.Project).filter(models.Project.user_id == user_id).all()

def get_project(db: Session, project_id: int):
    return db.query(models.Project).filter(models.Project.id == project_id).first()

def delete_project(db: Session, project_id: int):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if project:
        db.delete(project)
        db.commit()
    return project