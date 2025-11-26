from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    projects = relationship("Project", back_populates="owner")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    doc_type = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="projects")
    sections = relationship("DocumentSection", back_populates="project", cascade="all, delete-orphan")

class DocumentSection(Base):
    __tablename__ = "document_sections"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    heading = Column(String)
    content = Column(Text)
    order_index = Column(Integer)
    refinement_history = Column(JSON, default=list)
    user_notes = Column(Text, nullable=True)
    project = relationship("Project", back_populates="sections")