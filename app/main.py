import json, re
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
    allow_origins=["*"],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"]
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
    mood_description: str
    final_response: str

def validate_safety(text: str) -> bool:
    banned = [r"\bkill yourself\b", r"\bsuicide\b", r"\bharm yourself\b"]
    return not any(re.search(p, text, re.IGNORECASE) for p in banned)

def flag_content(text: str) -> List[str]:
    patterns = [r"\byou must\b", r"\byou should\b"]
    return [pat for pat in patterns if re.search(pat, text, re.IGNORECASE)]

@app.post("/support", response_model=SupportResponse)
async def support(req: SupportRequest):
    history = "\n".join(
        f"{'User' if m.role=='user' else 'AI'}: {m.content}"
        for m in req.history
    )
    user_input = req.message
    logger.info(f"📝 New message: {user_input}\nHistory:\n{history}")

    # Build time-of-day context
    hour = datetime.now().hour
    context_rules = (
        "Late night: only recommend quiet, indoor activities."
        if hour < 6 or hour >= 22 else "No special time restrictions."
    )

    try:
        # 1) Mood inference
        mood_json = mood_chain.run({"history": history, "user_input": user_input})
        mood_data = json.loads(mood_json)
        tone  = mood_data["tone"]
        description= mood_data["description"]
        e_conf, b_conf, i_conf = (
            float(mood_data["e_conf"]),
            float(mood_data["b_conf"]),
            float(mood_data["i_conf"])
        )
        logger.debug(f"📊 Mood: {tone} (e:{e_conf}, b:{b_conf}, i:{i_conf})")

        # 2) Core agent outputs
        e_raw = emotion_chain.run({"history": history, "user_input": user_input})
        b_raw = behaviour_chain.run({"history": history, "user_input": user_input})
        i_raw = intelligence_chain.run({
            "history": history, "user_input": user_input, "context": context_rules
        })

        # 3) Reflections
        e_ref = e_reflector.run({"insight": e_raw})
        b_ref = b_reflector.run({"insight": b_raw})
        i_ref = i_reflector.run({"insight": i_raw})

        # 4) Final merge with tone & weights
        merge_inputs = {
            "history":     history,
            "user_input":  user_input,
            "tone":        tone,
            "description": description,
            "e_insight":   e_ref,
            "b_insight":   b_ref,
            "i_insight":   i_ref,
            "e_conf":      e_conf,
            "b_conf":      b_conf,
            "i_conf":      i_conf
        }
        
        logger.info(f"🔀 Final merge inputs:")
        logger.info(f"   - History: {history[:200]}{'...' if len(history) > 200 else ''}")
        logger.info(f"   - User input: {user_input}")
        logger.info(f"   - Tone: {tone}")
        logger.info(f"   - Mood description: {description}")
        logger.info(f"   - E insight: {e_ref}")
        logger.info(f"   - B insight: {b_ref}")
        logger.info(f"   - I insight: {i_ref}")
        logger.info(f"   - Weights: e={e_conf:.2f}, b={b_conf:.2f}, i={i_conf:.2f}")
        
        final = merge_chain.run(merge_inputs)
        
        logger.info(f"✨ Final merged response: {final}")
        logger.info(f"📏 Final response length: {len(final)} characters")

        # 5) Safety & flags
        if not validate_safety(final):
            raise HTTPException(500, "Safety policy violation")
        flags = flag_content(final)
        if flags:
            logger.warning(f"⚠️ Content flags: {flags}")

        return {
            "emotion":      e_ref,
            "behaviour":    b_ref,
            "intelligence": i_ref,
            "mood_description": description,
            "final_response": final
        }

    except Exception as e:
        logger.error("❌ /support error", exc_info=e)
        raise HTTPException(500, str(e))