from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String

from .base import Base

class PrivacyConsent(Base):
    __tablename__ = "privacy_consents"

    user_id = Column(String, ForeignKey("users.googleId"), primary_key=True)
    privacy_version = Column(String, nullable=False)
    accepted_at = Column(DateTime, default=datetime.utcnow, nullable=False)