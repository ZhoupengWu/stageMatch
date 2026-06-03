from sqlalchemy import Column, String
from .base import Base

class AccessCode(Base):
    __tablename__ = "access_code"

    email = Column(String, primary_key=True)
    code = Column(String)