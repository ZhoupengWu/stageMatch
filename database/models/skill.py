from sqlalchemy import Column, String, ForeignKey, CheckConstraint, SmallInteger
from sqlalchemy.orm import relationship
from .base import Base

class Skill(Base):
    __tablename__ = 'user_skills'

    user_id = Column(String, ForeignKey('users.googleId'))
    nome = Column(String, primary_key=True)
    livello = Column(SmallInteger, nullable=False) 

    user = relationship("User", back_populates="skills")

    __table_args__ = (
        CheckConstraint(
            "livello IN (1, 2, 3)",  # 1=base 2=intermedio 3=avanzato
            name="check_livello_valido"
        ),
    )