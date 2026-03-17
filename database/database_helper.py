from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models.user import Base, User
from sqlalchemy.exc import IntegrityError

# global
Session = None

def init_users_db(connstr: str):
    """Initialize the database engine and session."""
    global Session
    
    engine = create_engine(f"sqlite:///{connstr}", echo=True)
    Session = sessionmaker(bind=engine)  
    
    Base.metadata.create_all(engine)


def get_user_by_id(user_id: str):
    """Return a User object by id."""
    with Session() as session:
        return session.query(User).filter_by(googleId=user_id).first()


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
    """Insert a new user."""
    with Session() as session:
        user = session.query(User).filter_by(googleId=user_data["googleId"]).first()
        if not user:
            user = User(**user_data)
            session.add(user)
            try:
                session.commit() 
            except IntegrityError:
                session.rollback()  
                raise UserAlreadyExistsError(f"User with id {user.googleId} already exists!")
            return user
        else:
            raise UserAlreadyExistsError(f"User with id {user.googleId} already exists!")


def update_user(user_data: dict):
    """Insert a new user or update if already exists."""
    with Session() as session:
        user = session.query(User).filter_by(googleId=user_data["googleId"]).first()
        if user:
            user.name = user_data.get("name", user.name)
            user.email = user_data.get("email", user.email)
            user.picture = user_data.get("picture", user.picture)
        else:
            user = User(**user_data)
            session.add(user)
        session.commit()  
        return user


class UserAlreadyExistsError(Exception):
    """Raised when trying to add a user that already exists."""
    pass