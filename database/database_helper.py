from datetime import datetime

from tracemalloc import start

from sqlalchemy import create_engine, delete
from sqlalchemy.orm import sessionmaker, selectinload
from sqlalchemy.inspection import inspect
from .models.base import Base
from .models.user import User
from .models.company import Company
from .models.user_preferences import UserPreferences
from .models.skill import Skill
from .models.soft_skill import SoftSkill
from .models.route import UserRoute
from .models.privacy_consent import PrivacyConsent
from .models.access_code import AccessCode

# global
Session = None

def initDB(connstr: str):
    """Initialize the database engine and session."""
    global Session

    engine = create_engine(f"sqlite:///{connstr}", echo=True)
    Session = sessionmaker(bind=engine)

    Base.metadata.create_all(engine)

def getUserById(user_id: str):
    with Session() as session:
        return (
            session.query(User)
            .options(
                selectinload(User.preferences),
                selectinload(User.skills),
                selectinload(User.soft_skills),
                selectinload(User.routes)
            )
            .filter_by(googleId=user_id)
            .first()
        )

def existUser(google_id: str) -> bool:
    """
        Check if the user exists
    """
    with Session() as session:
        return session.get(User, google_id) is not None

def existCompany(google_id: str) -> bool:
    """
        Check if the company exists by googleId
    """
    with Session() as session:
        return session.query(Company).filter_by(googleId=google_id).first() is not None

def getCompanyByGoogleId(google_id: str):
    with Session() as session:
        return session.query(Company).filter_by(googleId=google_id).first()

def addCompany(company_data: dict):
    with Session() as session:
        company = Company(**company_data)
        session.add(company)
        session.commit()

def addAccessCode(access_code_data: dict):
    with Session() as session:
        ac_data = AccessCode(**access_code_data)
        session.add(ac_data)
        session.commit()

def getAccessCode(ac_email: str):
    with Session() as session:
        ac_data = session.query(AccessCode).filter_by(email=ac_email)
        return ac_data.code

def deleteAccessCode(email: str):
    with Session() as session:
        data = delete(AccessCode).where(AccessCode.email == email)
        session.execute(data)
        session.commit()

def getUserColumn(user_id: str, column: str):
    """Return a single column value of a user by id."""
    with Session() as session:
        user = session.query(User).filter_by(googleId=user_id).first()

        if not user:
            return None

        if not hasattr(user, column):
            raise ValueError(f"Column '{column}' does not exist in User model")

        return getattr(user, column)

def addUser(user_data: dict, privacy_consent: dict | None = None):
    with Session() as session:
        existing = session.query(User).filter_by(googleId=user_data["googleId"]).options(
            selectinload(User.preferences)
        ).first()

        if existing:
            raise UserAlreadyExistsError(
                f"User with id {user_data['googleId']} already exists!"
            )

        user = User(**user_data)
        user.preferences = UserPreferences(color_mode="light")

        session.add(user)
        session.flush()

        if privacy_consent:
            session.add(PrivacyConsent(
                user_id=user.googleId,
                privacy_version=privacy_consent["privacy_version"]
            ))

        session.commit()

def updateUser(user_data: dict):
    with Session() as session:
        user = session.query(User).filter_by(googleId=user_data["googleId"]).options(
            selectinload(User.preferences),
            selectinload(User.skills),
            selectinload(User.soft_skills)
        ).first()

        if not user:
            return None

        # Update simple fields
        for field in ["name", "surname", "email", "sesso", "comune_nascita", "codice_fiscale", "telefono", "indirizzo_studio", "classe", "indirizzo", "picture"]:
            if field in user_data:
                setattr(user, field, user_data[field])

        # Update date separately
        if "data_nascita" in user_data:
            try:
                user.data_nascita = datetime.strptime(user_data["data_nascita"], "%Y-%m-%d").date()
            except ValueError:
                pass

        # Ensure preferences exists
        if user.preferences is None:
            user.preferences = UserPreferences(color_mode="light")

        # Preferences
        pref_data = user_data.get("preferences")
        if pref_data:
            for key, value in pref_data.items():
                if hasattr(user.preferences, key):
                    setattr(user.preferences, key, value)

        # Skills
        skills = user_data.get("skills")
        if skills is not None:
            user.skills.clear()

            for skill_item in skills:
                nuova_skill = Skill(
                    name=skill_item["name"],
                    livello=skill_item["livello"]
                )
                user.skills.append(nuova_skill)

        # SoftSkills
        sskills = user_data.get("soft_skills")
        if sskills is not None:
            user.soft_skills.clear()

            for skill_item in sskills:
                nuova_skill = SoftSkill(
                    label=skill_item["label"],
                    icon=skill_item["icon"]
                )
                user.soft_skills.append(nuova_skill)

        # Commit changes
        session.add(user)
        session.commit()

def getUserPreferences(user_id: str):
    with Session() as session:
        user = (
            session.query(User)
            .options(selectinload(User.preferences))
            .filter_by(googleId=user_id)
            .first()
        )

        if not user:
            return None

        return user.preferences

def updateUserPreferences(user_id: str, color_mode: str):
    with Session() as session:
        user = session.query(User).filter_by(googleId=user_id).first()

        if not user:
            return None

        if user.preferences is None:
            user.preferences = UserPreferences(color_mode=color_mode)
        else:
            user.preferences.color_mode = color_mode

        session.commit()

        return user.preferences

def addUserRoute(user_id: str, route_data: dict):
    with Session() as session:
        user = session.query(User).filter_by(googleId=user_id).first()

        if not user:
            return None

        route = UserRoute(
            start_address=route_data["startaddress"],
            end_address=route_data["endaddress"],
            mode=route_data["routemode"]
        )

        if not any(
            r.start_address == route.start_address and
            r.end_address == route.end_address and
            r.mode == route.mode
            for r in user.routes
        ):
            user.routes.append(route)

        if len(user.routes) > 25:
            user.routes = user.routes[:25]

        session.commit()

        return route

def modelToDict(obj, include_relationships=True):
    result = {}

    mapper = inspect(obj)

    # Columns
    for column in mapper.mapper.column_attrs:
        result[column.key] = getattr(obj, column.key)

    # Relationships
    if include_relationships:
        for rel in mapper.mapper.relationships:
            value = getattr(obj, rel.key)

            if value is None:
                result[rel.key] = None
            elif rel.uselist:
                result[rel.key] = [modelToDict(item, False) for item in value]
            else:
                result[rel.key] = modelToDict(value, False)

    return result

class UserAlreadyExistsError(Exception):
    """Raised when trying to add a user that already exists."""

    pass
