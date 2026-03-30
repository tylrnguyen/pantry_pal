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
    "Please return all recipes from the database that include most of these ingredients, not neccessarily all "
    "and that satisfy the requirements above."
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

    #response = llm.invoke([message])
    #return response.content
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


import click

@click.command()
@click.argument("image", type=click.Path(exists=True), default="images/pantry1.jpg")
@click.option(
    "--requirements",
    default="",
    help="Dietary or recipe requirements, e.g. 'gluten free, low carb, vegetarian'",
)
def main(image, requirements):
    """Find recipes from an image of ingredients."""
    ingredients = analyze_ingredients(image)
    click.echo(f"Detected ingredients:\n{ingredients}")

    recipes = find_recipes(ingredients, requirements=requirements or "None specified")

    click.echo("\nRecipes:")
    for schema in recipes.data:
        if schema.rows:
            for row in schema.rows:
                click.echo(f"{row['recipe_name']} ({row['source']}) — {row['url']}")
        else:
            click.echo("No matching recipes found.")
            click.echo(f"\n{schema.querySummary.get('non_technical_explanation', '')}")


if __name__ == "__main__":
    main()
