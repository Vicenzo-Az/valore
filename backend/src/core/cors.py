from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import os


def setup_cors(app: FastAPI) -> None:
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # Em produção, adiciona o domínio do Vercel
    frontend_url = os.getenv("FRONTEND_URL")
    if frontend_url:
        origins.append(frontend_url)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
