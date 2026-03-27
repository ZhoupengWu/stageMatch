import re
from sqlalchemy.orm import relationship, validates
from sqlalchemy import Column, String, LargeBinary, Date
from .base import Base

CF_REGEX = r"^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$"

class User(Base):
    __tablename__ = "users"

    googleId = Column(String, primary_key=True)
    codice_fiscale = Column(String, unique=True)
    nome = Column(String)
    cognome = Column(String)
    data_nascita = Column(Date)
    comune_nascita = Column(String)
    telefono = Column(String)
    email = Column(String, unique=True)
    immagine = Column(LargeBinary)

    preferences = relationship(
        "UserPreferences",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    @validates("codice_fiscale")
    def validate_codice_fiscale(self, value):
        if value and not re.match(CF_REGEX, value):
            raise ValueError("codice fiscale non valido")
        return value