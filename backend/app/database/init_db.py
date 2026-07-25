from app.database.base import Base
from app.database.connection import engine

# Import all models
from app.models.integration import Integration


def init_db():
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
    print("Database tables created successfully!")