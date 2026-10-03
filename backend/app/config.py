import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[1]

load_dotenv(BASE_DIR / ".env")

APP_NAME = os.getenv("APP_NAME", "RESQ-OPS")
APP_VERSION = os.getenv("APP_VERSION", "1.0.0")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{BASE_DIR / 'resq_ops.db'}"
)

UPLOAD_DIR = Path(
    os.getenv("UPLOAD_DIR", str(BASE_DIR / "uploads"))
)

MODEL_PATH = Path(
    os.getenv(
        "YOLO_MODEL_PATH",
        str(BASE_DIR / "models" / "yolov8n.pt")
    )
)

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if origin.strip()
]

GOOGLE_ROUTES_API_KEY = os.getenv("GOOGLE_ROUTES_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)