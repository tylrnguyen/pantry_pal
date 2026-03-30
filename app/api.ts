import Constants from "expo-constants";

function getApiUrl(): string {
  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const host = hostUri.split(":")[0];
      return `http://${host}:3000`;
    }
  }
  return "http://localhost:3000";
}

export const API_URL = getApiUrl();

export async function analyzeImage(imageUri: string): Promise<{ ingredients: string }> {
  const formData = new FormData();
  formData.append("image", {
    uri: imageUri,
    type: "image/jpeg",
    name: "photo.jpg",
  } as unknown as Blob);

  const res = await fetch(`${API_URL}/api/analyze-image`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Image analysis failed (${res.status}): ${detail}`);
  }
  return res.json();
}

export interface RecipeSearchParams {
  ingredients?: string;
  query?: string;
  allergies?: string[];
  mealType?: string;
  goal?: string;
}

export async function findRecipes(
  params: RecipeSearchParams
): Promise<{ recipes: Array<Record<string, string> & { id: string }>; explanation: string }> {
  const res = await fetch(`${API_URL}/api/recipes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ingredients: params.ingredients ?? "",
      query: params.query ?? "",
      allergies: params.allergies ?? [],
      meal_type: params.mealType ?? "",
      goal: params.goal ?? "",
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Recipe search failed (${res.status}): ${detail}`);
  }
  return res.json();
}
