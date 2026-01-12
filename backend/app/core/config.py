from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "Hire Lens Backend"
    environment: str = "development"
    openai_api_key: str | None = None
    google_api_key: str

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="forbid"
    )

settings = Settings()
