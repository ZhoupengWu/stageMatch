from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import Column, String, LargeBinary
from .base import Base

class User(Base):
    __tablename__ = "users"

    googleId = Column(String, primary_key=True)  # Google ID
    name = Column(String)
    email = Column(String, unique=True)
    picture = Column(LargeBinary)

    preferences = relationship(
        "UserPreferences",
        back_populates="user",
        uselist=False,          # relazione uno a uno
        cascade="all, delete-orphan"
    )