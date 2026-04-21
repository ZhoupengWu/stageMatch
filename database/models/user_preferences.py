from sqlalchemy.orm import relationship
from sqlalchemy import Column, String, ForeignKey
from .base import Base

class UserPreferences(Base):
    __tablename__ = 'user_preferences'

    user_id = Column(String, ForeignKey('users.googleId'), primary_key=True, nullable=False)
    color_mode = Column(String, default='light')

    user = relationship('User', back_populates='preferences', uselist=False)