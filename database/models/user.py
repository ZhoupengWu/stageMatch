from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, String, DateTime, LargeBinary

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)       # googleId
    name = Column(String)
    email = Column(String, unique=True)
    picture = Column(LargeBinary)