"""
OceanGuard AI - SQLite / SQLAlchemy Database Session Manager
SIH26143 / SamadhanLabs Architecture
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Default to SQLite file database in project root, with /tmp fallback for serverless (Vercel/Lambda)
DB_FILE = os.path.join(os.path.dirname(__file__), "..", "..", "..", "oceanguard.db")
if os.environ.get("VERCEL") or not os.access(os.path.dirname(os.path.abspath(DB_FILE)), os.W_OK):
    DB_FILE = "/tmp/oceanguard.db"

SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.abspath(DB_FILE)}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # Required for SQLite multi-threading
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """FastAPI dependency for database session injection."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
