from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    class Config:
        from_attributes = True

class SectionBase(BaseModel):
    heading: str
    content: str
    order_index: int

class SectionCreate(SectionBase):
    pass

class Section(SectionBase):
    id: int
    project_id: int
    refinement_history: List[Any] = [] 
    user_notes: Optional[str] = None

    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    title: str
    description: str 
    doc_type: str 

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    created_at: datetime
    
    user_id: int
    
    sections: List[Section] = []

    class Config:
        from_attributes = True


class OutlineRequest(BaseModel):
    topic: str
    doc_type: str