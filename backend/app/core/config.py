from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Hire Lens Backend"
    environment: str = "development"
    openai_api_key: str | None = None
    google_api_key: str

    database_url: str = "postgresql://postgres:postgres@localhost:5432/hirelens"
    secret_key: str = "change-this-to-a-random-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_premium_price_id: str = ""

    redis_url: str = "redis://localhost:6379/0"

    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="forbid"
    )


settings = Settings()
