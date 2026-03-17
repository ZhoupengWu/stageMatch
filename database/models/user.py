from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import Column, String, LargeBinary

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    googleId = Column(String, primary_key=True)  # Google ID
    name = Column(String)
    email = Column(String, unique=True)
    picture = Column(LargeBinary)