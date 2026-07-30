from dotenv import load_dotenv
import os

load_dotenv()


class Settings:
    APP_NAME = os.getenv("APP_NAME")
    APP_VERSION = os.getenv("APP_VERSION")

    HOST = os.getenv("HOST")
    PORT = int(os.getenv("PORT"))

    DATABASE_URL = os.getenv("DATABASE_URL")

    # AI configuration
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL = os.getenv(
        "OPENAI_MODEL",
        "gpt-5-mini"
    )


settings = Settings()