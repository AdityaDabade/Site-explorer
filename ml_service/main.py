import os
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()


def parse_allowed_origins() -> list[str]:
    raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:5000")
    return [item.strip() for item in raw.split(",") if item.strip()]


app = FastAPI(title="TourVision ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=parse_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    place_id: str | None = None
    context: dict[str, Any] = Field(default_factory=dict)


class CostEstimateRequest(BaseModel):
    destinations: list[str] = Field(default_factory=list)
    duration: int = 1
    transport: str = "car"
    members: int | dict[str, int] = 1


class HotelRecommendationRequest(BaseModel):
    location: str | None = None
    lat: float | None = None
    lng: float | None = None
    budget: int | None = None


class PlaceGenerateRequest(BaseModel):
    place: dict[str, Any] = Field(default_factory=dict)


class FoodClassificationRequest(BaseModel):
    text: str | None = None
    image_label: str | None = None


class SemanticSearchRequest(BaseModel):
    query: str
    place_id: str | None = None


class TranslateRequest(BaseModel):
    text: str
    target_language: str


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "ok": True,
        "service": "tourvision-ml",
        "port": int(os.getenv("PORT", "8000")),
    }


@app.post("/recognize")
async def recognize(image: UploadFile = File(...)) -> dict[str, Any]:
    filename = (image.filename or "").lower()
    guessed_name = "Amber Fort"

    if "museum" in filename:
        guessed_name = "City Museum"
    elif "gate" in filename:
        guessed_name = "Gateway of India"
    elif "tomb" in filename:
        guessed_name = "Humayun Tomb"

    return {
        "name": guessed_name,
        "facts": [
            f"{guessed_name} is recognized by the TourVision ML service.",
            "This fallback response keeps frontend and backend wiring testable.",
            "Replace this with your production recognition pipeline when ready.",
        ],
        "confidence": 0.95,
    }


@app.post("/chat")
def chat(payload: ChatRequest) -> dict[str, Any]:
    zone = payload.context.get("zone", "general")
    place_id = payload.place_id or "unknown-place"

    return {
        "reply": f"TourVision ML guide reply for {place_id}: you are in the {zone} zone. {payload.message}",
        "caption": f"Guide ready for {place_id}",
        "tts_audio_url": "",
    }


@app.post("/cost/estimate")
def estimate_cost(payload: CostEstimateRequest) -> dict[str, Any]:
    if isinstance(payload.members, dict):
        member_count = sum(int(value or 0) for value in payload.members.values()) or 1
    else:
        member_count = int(payload.members or 1)

    transport_rate = {
        "car": 1400,
        "train": 1200,
        "bike": 900,
        "bus": 1000,
    }.get(payload.transport, 1100)

    transport_total = transport_rate * max(payload.duration, 1)
    stays_total = 1800 * member_count * max(payload.duration - 1, 1)
    food_total = 500 * member_count * max(payload.duration, 1)
    total = transport_total + stays_total + food_total

    return {
        "total": total,
        "breakdown": {
            "transport": transport_total,
            "stay": stays_total,
            "food": food_total,
        },
    }


@app.post("/places/generate")
def generate_place_content(payload: PlaceGenerateRequest) -> dict[str, Any]:
    place = payload.place or {}
    name = place.get("name") or "this place"
    city = place.get("city") or place.get("location_name") or "the region"

    return {
        "summary": f"{name} is one of TourVision's highlighted destinations in {city}.",
        "description": f"{name} offers a place-aware TourVision guide experience with history, navigation, and storytelling support.",
        "facts": [
            f"{name} is ready for guided narration and immersive discovery.",
            "This response comes from the ML service wiring layer.",
            "Swap this fallback with your production place-content pipeline when ready.",
        ],
        "ar_model_url": place.get("ar_model_url") or "",
    }


@app.post("/recommend/hotels")
def recommend_hotels(payload: HotelRecommendationRequest) -> dict[str, Any]:
    budget = payload.budget or 3000

    return {
        "results": [
            {"name": "Heritage Stay", "price_per_night": budget, "score": 9.2},
            {"name": "Old City Residency", "price_per_night": int(budget * 0.8), "score": 8.9},
            {"name": "Fort View Hotel", "price_per_night": int(budget * 1.1), "score": 8.7},
        ]
    }


@app.post("/classify/food")
def classify_food(payload: FoodClassificationRequest) -> dict[str, Any]:
    text = f"{payload.text or ''} {payload.image_label or ''}".lower()
    category = "veg" if "paneer" in text or "veg" in text else "non-veg"

    return {
        "classification": category,
        "confidence": 0.9,
    }


@app.post("/search/semantic")
def semantic_search(payload: SemanticSearchRequest) -> dict[str, Any]:
    return {
        "results": [
            {
                "title": f"Relevant result for {payload.query}",
                "snippet": "Semantic search wiring is working correctly.",
                "place_id": payload.place_id,
            }
        ]
    }


@app.post("/translate")
def translate(payload: TranslateRequest) -> dict[str, Any]:
    return {
        "translated_text": f"[{payload.target_language}] {payload.text}",
        "target_language": payload.target_language,
    }
