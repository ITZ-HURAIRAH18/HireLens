from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Hire Lens Resume Checker"
    DEBUG: bool = True

    class Config:
        env_file = ".env"


settings = Settings()
