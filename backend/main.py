from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.modules.egg.api.egg_routes import router as egg_router

app = FastAPI(title="Discus AI System")

# CORS (needed for React Native / frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# FIX: NO prefix here
app.include_router(egg_router)

@app.get("/")
def root():
    return {"message": "Discus AI Backend Running"}