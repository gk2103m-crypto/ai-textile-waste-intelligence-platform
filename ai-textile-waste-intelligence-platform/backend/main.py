from fastapi import FastAPI

app = FastAPI(
    title="AI Textile Waste Intelligence Platform",
    description="Backend API for AI-powered textile waste management platform",
    version="1.0.0"
)

@app.get("/")
async def root():
    return {"message": "Welcome to the AI Textile Waste Intelligence Platform API"}