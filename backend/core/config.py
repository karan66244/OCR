from pydantic_settings import BaseSettings
import os
import json
from pathlib import Path

class Settings(BaseSettings):
    FIREBASE_CREDENTIALS_PATH: str = "./serviceAccountKey.json"
    FIREBASE_CREDENTIALS_JSON: str = ""  # Environment variable with full JSON
    TESSERACT_PATH: str = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

    class Config:
        env_file = ".env"

settings = Settings()

# Handle Firebase credentials from environment variable (for Render/Cloud deployment)
def get_firebase_credentials_path():
    """
    Returns the path to Firebase credentials.
    Prioritizes environment variable, then falls back to file.
    """
    if settings.FIREBASE_CREDENTIALS_JSON:
        # Write environment variable content to a temp file
        creds_path = Path("/tmp/serviceAccountKey.json")
        try:
            creds_data = json.loads(settings.FIREBASE_CREDENTIALS_JSON)
            with open(creds_path, 'w') as f:
                json.dump(creds_data, f)
            return str(creds_path)
        except Exception as e:
            print(f"Error parsing Firebase credentials from env: {e}")
    
    # Fall back to file path
    creds_file = Path(settings.FIREBASE_CREDENTIALS_PATH)
    if creds_file.exists():
        return str(creds_file)
    
    raise FileNotFoundError("Firebase credentials not found. Set FIREBASE_CREDENTIALS_JSON env var or provide serviceAccountKey.json")
