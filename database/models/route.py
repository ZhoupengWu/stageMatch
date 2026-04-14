from sqlalchemy import Column, String, ForeignKey, Integer
from sqlalchemy.orm import relationship
from .base import Base

class UserRoute(Base):
    __tablename__ = "user_routes"

    id = Column(Integer, primary_key=True, autoincrement=True)

    user_id = Column(String, ForeignKey("users.googleId"), nullable=False)

    start_address = Column(String, nullable=False)
    end_address = Column(String, nullable=False)
    mode = Column(String, nullable=False) 

    user = relationship("User", back_populates="routes")