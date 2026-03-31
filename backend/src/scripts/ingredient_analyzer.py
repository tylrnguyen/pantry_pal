"""
Ingredient Analyzer - Uses GPT-4o to extract ingredients from an image, then queries
the SnowLeopard recipe database with those ingredients plus user dietary requirements.
"""

import base64
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI
from snowleopard import SnowLeopardClient

import asyncio

load_dotenv()

# Sent to GPT-4o with the image — returns only the ingredient list.
AGENT_PROMPT = (
    "Analyze this image and identify all visible ingredients. "
    "For each ingredient, provide the quantity if it can be determined from the image. "
    "Return your answer as a plain list, one ingredient per line, in the format:\n"
    "- <ingredient>: <quantity> (or 'quantity unknown' if not visible)\n\n"
    "Only list ingredients — no additional commentary."
)

# Sent to SnowLeopard. {ingredients} and {requirements} are filled in at runtime.
SNOWLEOPARD_PROMPT = (
    "I have the following ingredients available:\n"
    "{ingredients}\n\n"
    "Dietary and recipe requirements:\n"
    "{requirements}\n\n"
    "Return ALL columns for the top 10 recipes whose ingredients best match the list above. "
    "Order results by match score descending and apply LIMIT 10 in the query."
)


def load_image_as_base64(image_path: str) -> tuple[str, str]:
    """Load an image file and return (base64_data, media_type)."""
    path = Path(image_path)
    suffix = path.suffix.lower()
    media_type_map = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
    }
    media_type = media_type_map.get(suffix, "image/jpeg")
    with open(path, "rb") as f:
        data = base64.b64encode(f.read()).decode("utf-8")
    return data, media_type


def analyze_ingredients(image_path: str) -> str:
    """Send image to GPT-4o and return a string listing detected ingredients."""
    image_data, media_type = load_image_as_base64(image_path)
    llm = ChatOpenAI(model="gpt-4o", api_key=os.getenv("OPENAI_API_KEY"))

    message = HumanMessage(
        content=[
            {
                "type": "image_url",
                "image_url": {"url": f"data:{media_type};base64,{image_data}"},
            },
            {"type": "text", "text": AGENT_PROMPT},
        ]
    )

#    response = llm.invoke([message])
#    return response.content
    return '''- Rice: quantity unknown
            - Linguine: quantity unknown
            - Cashews: quantity unknown
            - Barley: quantity unknown
            - Potatoes: quantity unknown
            - Whole Wheat Flour: quantity unknown
            - All-Purpose Flour: quantity unknown
            - Oats: quantity unknown
            - Onions: quantity unknown
            - Pumpkin Seeds: quantity unknown
            - Sliced Almonds: quantity unknown
            - Maple Syrup: quantity unknown
            - Honey: quantity unknown
            - Kosher Salt: quantity unknown
            - Peanut Butter: quantity unknown
            - Mustard: quantity unknown
            - Mayonnaise: quantity unknown
            - Red Pepper Flakes: quantity unknown
            - Hot Sauce: quantity unknown
            - Canned Beans: quantity unknown
            - Canned Tomatoes: quantity unknown
            - Garlic: quantity unknown
            - Olive Oil: quantity unknown
            - Vinegar: quantity unknown
            - Soy Sauce: quantity unknown'''


import asyncio
import os

async def find_recipes(ingredients: str, requirements: str) -> list:
    """Query multiple SnowLeopard datafiles concurrently and return a list of responses."""
    
    query = SNOWLEOPARD_PROMPT.format(
        ingredients=ingredients,
        requirements=requirements,
    )

    client = SnowLeopardClient(api_key=os.getenv("SNOWLEOPARD_API_KEY"))

    # Identify IDs from .env
    ids_to_query = [
        os.getenv(key) for key in ["SNOWLEOPARD_DATAFILE_ID1", "SNOWLEOPARD_DATAFILE_ID2"]
        if os.getenv(key)
    ]

    sys.stderr.write(f"DEBUG: Found Datafile IDs: {ids_to_query}\n")

    # Fallback
    if not ids_to_query and os.getenv("SNOWLEOPARD_DATAFILE_ID"):
        ids_to_query.append(os.getenv("SNOWLEOPARD_DATAFILE_ID"))

    sys.stderr.write(f"DEBUG: Launching {len(ids_to_query)} concurrent queries...\n")

    # Fire off requests concurrently
    # Using to_thread because most SDK retrieve methods are blocking (sync)
    tasks = [
        asyncio.to_thread(client.retrieve, datafile_id=df_id, user_query=query)
        for df_id in ids_to_query
    ]
    
    # This returns a list of result objects: [Response1, Response2, ...]
    responses = await asyncio.gather(*tasks)
    return responses

import json
import click


def safe_json_list(value) -> list:
    """Parse a JSON array string, returning [] on any failure."""
    if not value:
        return []
    if isinstance(value, list):
        return value
    try:
        parsed = json.loads(value)
        return parsed if isinstance(parsed, list) else []
    except (json.JSONDecodeError, TypeError):
        return []


def compute_score(row: dict, allergies: list[str], meal: str, goal: str, match_count: int) -> int:
    """Score 0-100 based on how well the recipe matches the user's requirements."""
    score = 0

    # Safety: no caution overlaps with user allergies (+35)
    cautions = safe_json_list(row.get("cautions"))
    allergy_lower = [a.lower() for a in allergies]
    if not any(c.lower() in allergy_lower for c in cautions):
        score += 35

    # Dietary goal match in health_labels or diet_labels (+30)
    if goal:
        all_labels = [l.lower() for l in safe_json_list(row.get("health_labels")) + safe_json_list(row.get("diet_labels"))]
        if any(goal.lower() in l for l in all_labels):
            score += 30

    # Meal type match (+20)
    if meal:
        meal_types = safe_json_list(row.get("meal_type"))
        if any(meal.lower() in m.lower() for m in meal_types):
            score += 20

    # Ingredient match count (+15, scaled: 15 points at match_count >= 5)
    score += min(15, (match_count or 0) * 3)

    return score


@click.command()
@click.argument("image", type=click.Path(exists=True), default="images/pantry1.jpg")
@click.option("--requirements", default="", help="Free-text dietary/recipe requirements.")
@click.option("--allergies", default="", help="Comma-separated allergies e.g. 'Dairy,Nuts'.")
@click.option("--meal", default="", help="Meal type e.g. 'Dinner'.")
@click.option("--goal", default="", help="Dietary goal e.g. 'Gluten-Free'.")
def main(image, requirements, allergies, meal, goal):
    """Find recipes from an image of ingredients."""
    allergy_list = [a.strip() for a in allergies.split(",") if a.strip()]

    ingredients = analyze_ingredients(image)
    results_list = asyncio.run(find_recipes(ingredients, requirements=requirements or "None specified"))

    rows = []

    # 2. Iterate through each response in the list
    for recipes in results_list:
        # 3. Iterate through schemas in this specific response
        for schema in recipes.data:
            for row in schema.rows:
                # recipe_name is required — skip rows without it
                name = row.get("recipe_name") or ""
                if not name:
                    continue

                match_count = row.get("match_count") or 0
                rows.append({
                    "name": name,
                    "source": row.get("source") or "",
                    "url": row.get("url") or "",
                    "image_url": row.get("image_url") or "",
                    "servings": row.get("servings") or None,
                    "calories": row.get("calories") or None,
                    "match_count": match_count,
                    "diet_labels": safe_json_list(row.get("diet_labels")),
                    "health_labels": safe_json_list(row.get("health_labels")),
                    "cautions": safe_json_list(row.get("cautions")),
                    "cuisine_type": safe_json_list(row.get("cuisine_type")),
                    "meal_type": safe_json_list(row.get("meal_type")),
                    "dish_type": safe_json_list(row.get("dish_type")),
                    "ingredient_lines": safe_json_list(row.get("ingredient_lines")),
                    "score": compute_score(row, allergy_list, meal, goal, match_count),
                })

    rows.sort(key=lambda r: r["score"], reverse=True)

    output = {
        "ingredients": ingredients,
        "recipes": rows,
    }
    click.echo(json.dumps(output))


if __name__ == "__main__":
    main()
