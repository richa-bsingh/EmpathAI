import os
from dotenv import load_dotenv
from langchain.chat_models import ChatOpenAI
from langchain.chains import LLMChain

from app.prompts import (
    emotion_prompt, behaviour_prompt, intelligence_prompt,
    reflection_prompt, mood_prompt, final_merge_prompt
)
from app.logging_config import get_logger

load_dotenv()
API_KEY = os.getenv("OPENAI_API_KEY")
if not API_KEY:
    raise RuntimeError("Missing OPENAI_API_KEY")

logger = get_logger(__name__, level="DEBUG")
llm = ChatOpenAI(openai_api_key=API_KEY, temperature=0.3)

# Core agent chains
emotion_chain      = LLMChain(llm=llm, prompt=emotion_prompt)
behaviour_chain    = LLMChain(llm=llm, prompt=behaviour_prompt)
intelligence_chain = LLMChain(llm=llm, prompt=intelligence_prompt)

# Reflection chains
def make_reflector(agent_name: str) -> LLMChain:
    return LLMChain(llm=llm, prompt=reflection_prompt.partial(agent=agent_name))

e_reflector = make_reflector("Emotional")
b_reflector = make_reflector("Behavioural")
i_reflector = make_reflector("Intellectual")

# Mood chain
mood_chain = LLMChain(llm=llm, prompt=mood_prompt)

# Final merge chain
merge_chain = LLMChain(llm=llm, prompt=final_merge_prompt)