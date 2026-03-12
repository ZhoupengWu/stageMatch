# import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.user import Base, User  # import User class + Base

DB_CONNECTION_STRING = None
engine = None
Session = None

# Create engine and session


# Create tables if they don’t exist

def init_db(connstr: str):
    DB_CONNECTION_STRING = connstr 
    Base.metadata.create_all(engine)
    engine = create_engine(f"sqlite:///{DB_CONNECTION_STRING}", echo=True)
    Session = sessionmaker(bind=engine)



def get_user_by_id(user_id: str):
    """Return a User object by id."""
    with Session() as session:
        return session.query(User).filter_by(id=user_id).first()

def get_user_column(user_id: str, column: str):
    """Return a single column value of a user by id."""
    with Session() as session:
        user = session.query(User).filter_by(id=user_id).first()
        if not user:
            return None
        if not hasattr(user, column):
            raise ValueError(f"Column '{column}' does not exist in User model")
        return getattr(user, column)

def add_user(user_data: dict):
    """Insert a new user."""
    with Session() as session:
        user = session.query(User).filter_by(id=user_data["id"]).first()
        if not user:
            user = User(**user_data)
            session.add(user)
            session.commit()
            return user
        else:
            raise UserAlreadyExistsError(f"User with id {user.id} already exists!")

def update_user(user_data: dict):
    """Insert a new user or update if already exists."""
    with Session() as session:
        user = session.query(User).filter_by(id=user_data["id"]).first()
        if user:
            # Update
            user.name = user_data.get("name", user.name)
            user.email = user_data.get("email", user.email)
            user.picture = user_data.get("picture", user.picture)
        else:
            # Insert
            user = User(**user_data)
            session.add(user)
        session.commit()
        return user


class UserAlreadyExistsError(Exception):
    """Raised when trying to add a user that already exists."""
    pass
