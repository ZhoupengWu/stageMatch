from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base

class SoftSkill(Base):
    __tablename__ = 'user_soft_skills'

    user_id = Column(String, ForeignKey('users.googleId'), primary_key=True)
    label = Column(String, primary_key=True)
    icon = Column(String, nullable=False)     

    user = relationship("User", back_populates="soft_skills")