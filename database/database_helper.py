from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, selectinload
from .models.base import Base
from .models.user import User
from .models.user_preferences import UserPreferences
from sqlalchemy.exc import IntegrityError
from sqlalchemy.inspection import inspect
from datetime import datetime

# global
Session = None


def init_db(connstr: str):
    """Initialize the database engine and session."""
    global Session

    engine = create_engine(f"sqlite:///{connstr}", echo=True)
    Session = sessionmaker(bind=engine)

    Base.metadata.create_all(engine)


def get_user_by_id(user_id: str):
    """Return a User object by id."""
    with Session() as session:
        return (
            session.query(User)
            .options(selectinload(User.preferences))
            .filter_by(googleId=user_id)
            .first()
        )


def get_user_column(user_id: str, column: str):
    """Return a single column value of a user by id."""
    with Session() as session:
        user = session.query(User).filter_by(googleId=user_id).first()
        if not user:
            return None
        if not hasattr(user, column):
            raise ValueError(f"Column '{column}' does not exist in User model")
        return getattr(user, column)


def add_user(user_data: dict):
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
        session.commit()
        return user


def update_user(user_data: dict):
    with Session() as session:
        # Load user and eager-load preferences
        user = session.query(User).filter_by(googleId=user_data["googleId"]).options(
            selectinload(User.preferences)
        ).first()

        if not user:
            return None

        # Update simple fields
        for field in ["nome", "cognome", "codice_fiscale", "comune_nascita", "telefono", "email", "immagine"]:
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

        # Update preferences fields if provided
        pref_data = user_data.get("preferences")
        if pref_data:
            for key, value in pref_data.items():
                if hasattr(user.preferences, key):
                    setattr(user.preferences, key, value)

        # Commit changes
        session.add(user)
        session.commit()

        # Convert to dict while session is open
        return model_to_dict(user, include_relationships=True)


def get_user_preferences(user_id: str):
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


def update_user_preferences(user_id: str, color_mode: str):
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


def model_to_dict(obj, include_relationships=True):
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
                result[rel.key] = [model_to_dict(item, False) for item in value]
            else:
                result[rel.key] = model_to_dict(value, False)

    return result


class UserAlreadyExistsError(Exception):
    """Raised when trying to add a user that already exists."""

    pass
