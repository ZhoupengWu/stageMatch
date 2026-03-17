# =====================================
#  PER ORA NON UTILIZZATO, DA RIVEDERE
# =====================================

from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from .user import Base  

class UserPreferences(Base):
    __tablename__ = 'user_preferences'

    # ForeignKey references googleId from User model
    user_id = Column(String, ForeignKey('users.googleId'), primary_key=True, nullable=False)
    color_mode = Column(String, default='light')  # Default color mode

    # Relationship to the User model (string reference)
    user = relationship('User', back_populates='preferences', uselist=False)

    # PER ORA NON UTILIZZATO, DA RIVEDERE