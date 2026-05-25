from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from src.core.config import settings

engine = create_engine(settings.sqlalchemy_database_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """Dependency do FastAPI — fornece sessão e garante fechamento."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
