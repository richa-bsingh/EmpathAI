import json
import re
from datetime import datetime
from typing import List, Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from app.agents import (
    emotion_chain, behaviour_chain, intelligence_chain,
    e_reflector, b_reflector, i_reflector,
    mood_chain, merge_chain
)
from app.logging_config import get_logger

load_dotenv()
logger = get_logger(__name__, level="DEBUG")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://localhost:3000"],
    allow_methods=["*"], allow_headers=["*"]
)

class Message(BaseModel):
    role: Literal["user","ai"]
    content: str

class SupportRequest(BaseModel):
    message: str
    history: List[Message] = []

class SupportResponse(BaseModel):
    emotion: str
    behaviour: str
    intelligence: str
    final_response: str

def validate_safety(text: str) -> bool:
    banned = [r"\bkill yourself\b", r"\bsuicide\b", r"\bharm yourself\b"]
    return not any(re.search(p, text, re.IGNORECASE) for p in banned)

def flag_content(text: str) -> List[str]:
    patterns = [r"\byou must\b", r"\byou should\b"]
    return [pat for pat in patterns if re.search(pat, text, re.IGNORECASE)]

@app.post("/support", response_model=SupportResponse)
async def support(req: SupportRequest):
    # 1) Reconstruct history
    history = "\n".join(
        f"{'User' if m.role=='user' else 'AI'}: {m.content}"
        for m in req.history
    )
    user_input = req.message
    logger.info(f"📝 New message: {user_input}\nHistory:\n{history}")

    # 2) Build context rules for intelligence agent
    hour = datetime.now().hour
    context_rules = (
        "Late night: only recommend quiet, indoor activities."
        if hour < 6 or hour >= 22 else "No special time restrictions."
    )

    try:
        # 3) Mood inference
        mood_json = mood_chain.run({"history": history, "user_input": user_input})
        mood_data = json.loads(mood_json)
        e_conf = float(mood_data["e_conf"])
        b_conf = float(mood_data["b_conf"])
        i_conf = float(mood_data["i_conf"])
        logger.debug(f"📊 Mood confidences: {mood_data}")

        # 4) Core agents
        e_raw = emotion_chain.run({"history": history, "user_input": user_input})
        b_raw = behaviour_chain.run({"history": history, "user_input": user_input})
        i_raw = intelligence_chain.run({
            "history": history, "user_input": user_input, "context": context_rules
        })

        # 5) Reflections
        e_ref = e_reflector.run({"insight": e_raw})
        b_ref = b_reflector.run({"insight": b_raw})
        i_ref = i_reflector.run({"insight": i_raw})

        # 6) Final merge weighted by mood confidences
        final = merge_chain.run({
            "history":     history,
            "user_input":  user_input,
            "e_insight":   e_ref,
            "b_insight":   b_ref,
            "i_insight":   i_ref,
            "e_conf":      e_conf,
            "b_conf":      b_conf,
            "i_conf":      i_conf
        })
        logger.info(f"✨ Final merged: {final}")

        # 7) Safety & flags
        if not validate_safety(final):
            raise HTTPException(500, detail="Safety policy violation")
        flags = flag_content(final)
        if flags:
            logger.warning(f"⚠️ Content flags: {flags}")

        return {
            "emotion":       e_ref,
            "behaviour":     b_ref,
            "intelligence":  i_ref,
            "final_response": final
        }

    except Exception as e:
        logger.error("❌ /support error", exc_info=e)
        raise HTTPException(500, detail=str(e))