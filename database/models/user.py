import re
from sqlalchemy.orm import relationship, validates
from sqlalchemy import Column, String, LargeBinary, Date
from .base import Base

CF_REGEX = r"(?i)^[A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]$"

class User(Base):
    __tablename__ = "users"

    googleId = Column(String, primary_key=True)
    codice_fiscale = Column(String, unique=True)
    nome = Column(String)
    cognome = Column(String)
    data_nascita = Column(Date)
    comune_nascita = Column(String)
    indirizzo = Column(String)
    telefono = Column(String)
    email = Column(String, unique=True)
    immagine = Column(LargeBinary)

    preferences = relationship(
        "UserPreferences",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    skills = relationship(
        "Skill",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    soft_skills = relationship(
        "SoftSkill",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    routes = relationship(
        "UserRoute",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="desc(UserRoute.id)"
)
    @validates("codice_fiscale")
    def validateCodiceFiscale(self, value):
        if not value:
            raise ValueError("Codice fiscale richiesto")

        value = value.upper()

        if not re.match(CF_REGEX, value):
            raise ValueError("Codice fiscale non valido")

        return value