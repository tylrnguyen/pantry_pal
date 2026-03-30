"""PantryPal Backend — FastAPI server wrapping GPT-4o vision and SnowLeopard recipe retrieval."""

import base64
import os

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI
from pydantic import BaseModel
from snowleopard import SnowLeopardClient

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

AGENT_PROMPT = (
    "Analyze this image and identify all visible ingredients. "
    "For each ingredient, provide the quantity if it can be determined from the image. "
    "Return your answer as a plain list, one ingredient per line, in the format:\n"
    "- <ingredient>: <quantity> (or 'quantity unknown' if not visible)\n\n"
    "Only list ingredients — no additional commentary."
)

SNOWLEOPARD_INGREDIENT_PROMPT = (
    "I have the following ingredients available:\n"
    "{ingredients}\n\n"
    "Dietary and recipe requirements:\n"
    "{requirements}\n\n"
    "Please return all recipes from the database that include most of these ingredients, "
    "not necessarily all, and that satisfy the requirements above."
)

SNOWLEOPARD_BROWSE_PROMPT = "Find {meal_type} recipes{goal_clause}{allergy_clause}."

app = FastAPI(title="PantryPal API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"ok": True, "service": "pantry-pal-backend"}


# ---------------------------------------------------------------------------
# POST /api/analyze-image  —  GPT-4o vision → ingredient list
# ---------------------------------------------------------------------------

@app.post("/api/analyze-image")
async def analyze_image(image: UploadFile = File(...)):
    """Accept an uploaded image, send to GPT-4o, return detected ingredients."""
    try:
        contents = await image.read()
        image_base64 = base64.b64encode(contents).decode("utf-8")
        media_type = image.content_type or "image/jpeg"

        llm = ChatOpenAI(model="gpt-4o", api_key=os.getenv("OPENAI_API_KEY"))
        message = HumanMessage(
            content=[
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:{media_type};base64,{image_base64}"},
                },
                {"type": "text", "text": AGENT_PROMPT},
            ]
        )
        response = llm.invoke([message])
        return {"ingredients": response.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# POST /api/recipes  —  SnowLeopard recipe retrieval
# ---------------------------------------------------------------------------

class RecipeSearchRequest(BaseModel):
    ingredients: str = ""
    query: str = ""
    allergies: list[str] = []
    meal_type: str = ""
    goal: str = ""


@app.post("/api/recipes")
async def find_recipes(body: RecipeSearchRequest):
    """Query SnowLeopard for recipes matching ingredients and dietary preferences."""
    try:
        requirements_parts: list[str] = []
        if body.allergies:
            requirements_parts.append(f"Must avoid these allergens: {', '.join(body.allergies)}")
        if body.meal_type:
            requirements_parts.append(f"Meal type: {body.meal_type}")
        if body.goal:
            requirements_parts.append(f"Dietary goal: {body.goal}")
        if not requirements_parts:
            requirements_parts.append("None specified")

        requirements = ". ".join(requirements_parts)
        has_ingredients = bool(body.ingredients.strip() or body.query.strip())

        if has_ingredients:
            ingredients_text = body.ingredients.strip() or body.query.strip()
            query = SNOWLEOPARD_INGREDIENT_PROMPT.format(
                ingredients=ingredients_text, requirements=requirements,
            )
        else:
            meal = body.meal_type or "any"
            goal_clause = f" that are {body.goal}" if body.goal else ""
            allergy_clause = (
                f" without {', '.join(body.allergies)}" if body.allergies else ""
            )
            query = SNOWLEOPARD_BROWSE_PROMPT.format(
                meal_type=meal, goal_clause=goal_clause, allergy_clause=allergy_clause,
            )

        client = SnowLeopardClient(api_key=os.getenv("SNOWLEOPARD_API_KEY"))
        response = client.retrieve(
            datafile_id=os.getenv("SNOWLEOPARD_DATAFILE_ID"),
            user_query=query,
        )

        if not hasattr(response, "data"):
            detail = getattr(response, "message", None) or str(response)
            raise HTTPException(status_code=502, detail=f"SnowLeopard error: {detail}")

        recipes: list[dict] = []
        explanation = ""

        for schema_idx, schema in enumerate(response.data):
            rows = getattr(schema, "rows", None) or []
            for row_idx, row in enumerate(rows):
                recipes.append({**row, "id": f"{schema_idx}-{row_idx}"})
            summary = getattr(schema, "querySummary", None)
            if summary:
                explanation = summary.get("non_technical_explanation", "")

        return {"recipes": recipes, "explanation": explanation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "3000")))
