/**
 * Re-export the RecipeRow type from the recipe store.
 * This file previously contained mock data — all recipe data now comes
 * from the PantryPal backend (SnowLeopard + GPT-4o).
 */
export type { RecipeRow as Recipe } from "./recipeStore";
