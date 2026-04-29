import firebase_admin
from firebase_admin import credentials, firestore, auth
from core.config import settings, get_firebase_credentials_path
import os

# Initialize Firebase Admin
def init_firebase():
    if not firebase_admin._apps:
        try:
            creds_path = get_firebase_credentials_path()
            cred = credentials.Certificate(creds_path)
            firebase_admin.initialize_app(cred)
        except FileNotFoundError as e:
            print(f"ERROR: {e}")
            print("Using default application credentials (requires GOOGLE_APPLICATION_CREDENTIALS env var)")
            firebase_admin.initialize_app()
    return firestore.client()

db = init_firebase()
