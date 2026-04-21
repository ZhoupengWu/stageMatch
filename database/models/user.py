import re
from sqlalchemy.orm import relationship, validates
from sqlalchemy import Column, String, Date
from .base import Base
from datetime import date

CF_REGEX = r"(?i)^[A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]$"

class User(Base):
    __tablename__ = "users"

    googleId = Column(String, primary_key=True)
    name = Column(String)
    surname = Column(String)
    email = Column(String, unique=True)
    data_nascita = Column(Date)
    sesso = Column(String)
    comune_nascita = Column(String)
    codice_fiscale = Column(String, unique=True)
    telefono = Column(String)
    indirizzo_studio = Column(String)
    indirizzo = Column(String)
    picture = Column(String)

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
    def validateCodiceFiscale(self, key, value):
        if not value:
            raise ValueError("Codice fiscale richiesto")

        value = value.upper()

        if not re.match(CF_REGEX, value):
            raise ValueError("Codice fiscale non valido")

        return value

    @validates("data_nascita")
    def validateDataNascita(self, key, value):
        if isinstance(value, str):
            try:
                return date.fromisoformat(value)
            except ValueError:
                raise ValueError("Data di nascita non valida")

        return value