"""
Ingredient Analyzer - Uses GPT-4o to extract ingredients from an image, then queries
the SnowLeopard recipe database with those ingredients plus user dietary requirements.
"""

import base64
import os
from pathlib import Path

from dotenv import load_dotenv
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI
from snowleopard import SnowLeopardClient

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

    response = llm.invoke([message])
    return response.content


def find_recipes(ingredients: str, requirements: str) -> str:
    """Query SnowLeopard for recipes matching the detected ingredients and user requirements."""
    query = SNOWLEOPARD_PROMPT.format(
        ingredients=ingredients,
        requirements=requirements,
    )

    client = SnowLeopardClient(api_key=os.getenv("SNOWLEOPARD_API_KEY"))
    response = client.retrieve(
        datafile_id=os.getenv("SNOWLEOPARD_DATAFILE_ID"),
        user_query=query,
    )
    return response


import json
import sys
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


SCORING_PROMPT = """You are a recipe scoring assistant. Given a recipe's data and a user's requirements, return a JSON object with:
- "score": integer 0-100 reflecting how well the recipe satisfies the requirements
- "reasons": array of short strings (max 3) explaining only the gaps — why the score isn't 100. If the score is 100, return an empty array.

Be specific and practical. Reference actual recipe data in your reasons (e.g. ingredient names, labels).

User requirements:
- Allergies to avoid: {allergies}
- Meal type: {meal}
- Dietary goal: {goal}
- Free-text requirements: {requirements}

Recipe data:
{recipe_json}

Respond with only valid JSON. Example: {{"score": 75, "reasons": ["Contains dairy which you want to avoid", "Not labeled as gluten-free"]}}"""


def score_recipes_with_llm(
    rows: list[dict],
    allergies: list[str],
    meal: str,
    goal: str,
    requirements: str,
) -> list[dict]:
    """Call GPT-4o once per recipe to score and explain each result."""
    llm = ChatOpenAI(model="gpt-4o", api_key=os.getenv("OPENAI_API_KEY"))

    print(f"\n[scoring] Scoring {len(rows)} recipes with GPT-4o...", file=sys.stderr, flush=True)
    for row in rows:
        recipe_json = json.dumps({
            "name": row["name"],
            "health_labels": row["health_labels"],
            "diet_labels": row["diet_labels"],
            "cautions": row["cautions"],
            "meal_type": row["meal_type"],
            "dish_type": row["dish_type"],
            "cuisine_type": row["cuisine_type"],
            "ingredient_lines": row["ingredient_lines"],
            "calories_per_serving": (
                round(row["calories"] / row["servings"])
                if row.get("calories") and row.get("servings")
                else row.get("calories")
            ),
        })

        prompt = SCORING_PROMPT.format(
            allergies=", ".join(allergies) if allergies else "None",
            meal=meal or "Any",
            goal=goal or "None",
            requirements=requirements or "None",
            recipe_json=recipe_json,
        )

        try:
            response = llm.invoke([HumanMessage(content=prompt)])
            raw = response.content.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
            parsed = json.loads(raw)
            row["score"] = int(parsed.get("score", 50))
            row["score_reasons"] = parsed.get("reasons", [])
        except Exception as e:
            row["score"] = 50
            row["score_reasons"] = ["Score unavailable"]
            print(f"  [score] ERROR for '{row['name']}': {e}", file=sys.stderr, flush=True)

        print(f"  [score] {row['name']}: {row['score']}/100", file=sys.stderr, flush=True)
        for reason in row["score_reasons"]:
            print(f"    - {reason}", file=sys.stderr, flush=True)

    return rows


@click.command()
@click.argument("image", type=click.Path(exists=True), required=False, default=None)
@click.option("--requirements", default="", help="Free-text dietary/recipe requirements.")
@click.option("--allergies", default="", help="Comma-separated allergies e.g. 'Dairy,Nuts'.")
@click.option("--meal", default="", help="Meal type e.g. 'Dinner'.")
@click.option("--goal", default="", help="Dietary goal e.g. 'Gluten-Free'.")
def main(image, requirements, allergies, meal, goal):
    """Find recipes from an image of ingredients, or just from dietary preferences."""
    allergy_list = [a.strip() for a in allergies.split(",") if a.strip()]

    if image:
        ingredients = analyze_ingredients(image)
    else:
        ingredients = "No specific ingredients provided — suggest recipes based on dietary preferences only."
    recipes = find_recipes(ingredients, requirements=requirements or "None specified")

    rows = []
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
                "score": 0,
                "score_reasons": [],
            })

    rows = score_recipes_with_llm(rows, allergy_list, meal, goal, requirements)
    rows.sort(key=lambda r: r["score"], reverse=True)

    output = {
        "ingredients": ingredients,
        "recipes": rows,
    }
    click.echo(json.dumps(output))


if __name__ == "__main__":
    main()
