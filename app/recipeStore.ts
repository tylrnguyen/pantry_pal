export type RecipeRow = Record<string, string> & { id: string };

let _recipes: RecipeRow[] = [];
let _explanation = "";

export function setSearchResults(recipes: RecipeRow[], explanation: string) {
  _recipes = recipes;
  _explanation = explanation;
}

export function getSearchResults() {
  return { recipes: _recipes, explanation: _explanation };
}

export function getRecipeById(id: string): RecipeRow | undefined {
  return _recipes.find((r) => r.id === id);
}
