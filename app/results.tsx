import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { mockRecipes, type Recipe } from "./data";

// --- Mock data path helpers ---

function matchesGoal(recipe: Recipe, goal: string): boolean {
  if (!goal) return true;
  return recipe.healthLabels.some((label) => label.toLowerCase().includes(goal.toLowerCase()));
}

function isSafeForAllergies(recipe: Recipe, allergies: string[]): boolean {
  if (allergies.length === 0) return true;
  const lowered = allergies.map((item) => item.toLowerCase());
  return !recipe.cautions.some((caution) => lowered.includes(caution.toLowerCase()));
}

// --- Backend result parser ---

type BackendRecipe = {
  name: string;
  source: string;
  url: string;
  image_url: string;
  servings: number | null;
  calories: number | null;
  match_count: number | null;
  diet_labels: string[];
  health_labels: string[];
  cautions: string[];
  cuisine_type: string[];
  meal_type: string[];
  dish_type: string[];
  ingredient_lines: string[];
  score: number;
};

type BackendResult = { ingredients: string; recipes: BackendRecipe[] };

function safeArray(val: unknown): string[] {
  return Array.isArray(val) ? (val as string[]) : [];
}

function parseBackendResult(raw: string): BackendResult {
  try {
    const parsed = JSON.parse(raw);
    const recipes: BackendRecipe[] = (parsed.recipes ?? []).map((r: any) => ({
      name: r.name ?? "",
      source: r.source ?? "",
      url: r.url ?? "",
      image_url: r.image_url ?? "",
      servings: r.servings ?? null,
      calories: r.calories ?? null,
      match_count: r.match_count ?? null,
      diet_labels: safeArray(r.diet_labels),
      health_labels: safeArray(r.health_labels),
      cautions: safeArray(r.cautions),
      cuisine_type: safeArray(r.cuisine_type),
      meal_type: safeArray(r.meal_type),
      dish_type: safeArray(r.dish_type),
      ingredient_lines: safeArray(r.ingredient_lines),
      score: r.score ?? 0,
    }));
    return { ingredients: parsed.ingredients ?? "", recipes };
  } catch {
    return { ingredients: "", recipes: [] };
  }
}

// --- Screen ---

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    result?: string;
    q?: string;
    meal?: string;
    goal?: string;
    allergies?: string;
  }>();

  const rawResult = params.result?.toString() ?? "";
  const isBackendResult = !!rawResult;

  // Backend path
  const backendResult = useMemo(
    () => (isBackendResult ? parseBackendResult(rawResult) : null),
    [rawResult, isBackendResult]
  );
  const backendRecipes = backendResult?.recipes ?? [];

  // Mock data path
  const query = params.q?.toString() ?? "";
  const meal = params.meal?.toString() ?? "";
  const goal = params.goal?.toString() ?? "";
  const allergies = (params.allergies?.toString() ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const mockResults = useMemo(() => {
    if (isBackendResult) return [];
    return mockRecipes
      .filter((recipe) => (meal ? recipe.mealType === meal : true))
      .filter((recipe) => matchesGoal(recipe, goal))
      .filter((recipe) => {
        if (!query.trim()) return true;
        const haystack =
          `${recipe.name} ${recipe.cuisineType} ${recipe.healthLabels.join(" ")}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      })
      .sort((a, b) => {
        const safeA = isSafeForAllergies(a, allergies);
        const safeB = isSafeForAllergies(b, allergies);
        if (safeA === safeB) return a.calories - b.calories;
        return safeA ? -1 : 1;
      });
  }, [allergies, goal, isBackendResult, meal, query]);

  const isEmpty = isBackendResult ? backendRecipes.length === 0 : mockResults.length === 0;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={16} color="#374151" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.summaryText}>
          {isBackendResult ? `${backendRecipes.length} recipes found` : `${meal || "Any meal"} | ${goal || "Any goal"}`}
        </Text>
      </View>

      {isEmpty ? (
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={28} color="#9ca3af" />
          <Text style={styles.emptyTitle}>No recipes found</Text>
          <Text style={styles.emptySubtitle}>Try broadening your filters or search keywords.</Text>
        </View>
      ) : isBackendResult ? (
        backendRecipes.map((recipe: BackendRecipe, i: number) => {
          const scoreStyle =
            recipe.score >= 70
              ? { badge: styles.scoreBadgeGreen, text: styles.scoreTextGreen }
              : recipe.score >= 40
              ? { badge: styles.scoreBadgeYellow, text: styles.scoreTextYellow }
              : { badge: styles.scoreBadgeRed, text: styles.scoreTextRed };
          const caloriesPerServing =
            recipe.calories != null && recipe.servings != null && recipe.servings > 0
              ? Math.round(recipe.calories / recipe.servings)
              : recipe.calories != null
              ? Math.round(recipe.calories)
              : null;
          const displayedHealthLabels = recipe.health_labels.slice(0, 3);
          const cuisineDisplay = recipe.cuisine_type.length > 0 ? recipe.cuisine_type.join(", ") : null;

          return (
            <Pressable key={i} onPress={() => router.push({ pathname: "/recipe-detail", params: { recipe: JSON.stringify(recipe) } })} style={styles.card}>
              {recipe.image_url ? (
                <Image source={{ uri: recipe.image_url }} style={styles.recipeImage} contentFit="cover" />
              ) : (
                <View style={styles.colorBlock} />
              )}
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{recipe.name}</Text>
                <View style={styles.metaRow}>
                  {recipe.source ? <Text style={styles.metaText}>{recipe.source}</Text> : null}
                  {cuisineDisplay ? <Text style={styles.metaText}>{cuisineDisplay}</Text> : null}
                </View>
                <View style={styles.metaRow}>
                  {caloriesPerServing != null && (
                    <Text style={styles.metaText}>{caloriesPerServing} kcal/serving</Text>
                  )}
                  {recipe.servings != null && (
                    <Text style={styles.metaText}>Serves {recipe.servings}</Text>
                  )}
                </View>
                <View style={[styles.badge, scoreStyle.badge]}>
                  <Text style={scoreStyle.text}>Score: {recipe.score}/100</Text>
                </View>
                {displayedHealthLabels.length > 0 && (
                  <View style={styles.chipRow}>
                    {displayedHealthLabels.map((label) => (
                      <View key={label} style={styles.labelChip}>
                        <Text style={styles.labelChipText}>{label}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {recipe.cautions.length > 0 && (
                  <View style={styles.chipRow}>
                    {recipe.cautions.map((caution) => (
                      <View key={caution} style={styles.cautionChip}>
                        <Text style={styles.cautionChipText}>{caution}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>View Recipe →</Text>
                </View>
              </View>
            </Pressable>
          );
        })
      ) : (
        mockResults.map((recipe) => {
          const safe = isSafeForAllergies(recipe, allergies);
          return (
            <Pressable
              key={recipe.id}
              onPress={() => router.push(`/recipe/${recipe.id}`)}
              style={styles.card}
            >
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{recipe.name}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>{recipe.calories} kcal</Text>
                  <Text style={styles.metaText}>Serves {recipe.servings}</Text>
                </View>
                <View style={[styles.badge, safe ? styles.badgeSafe : styles.badgeWarning]}>
                  <Text style={[styles.badgeText, safe ? styles.badgeSafeText : styles.badgeWarnText]}>
                    {safe ? "Safe for your allergens" : "Needs caution"}
                  </Text>
                </View>
                <Text style={styles.explanation}>{recipe.explanation}</Text>
              </View>
            </Pressable>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5f7f7",
  },
  content: {
    paddingTop: 64,
    paddingHorizontal: 18,
    paddingBottom: 24,
    gap: 12,
  },
  header: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 14,
    gap: 8,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  backText: {
    color: "#4b5563",
    fontWeight: "600",
  },
  summaryText: {
    color: "#111827",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 56,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
  },
  emptySubtitle: {
    color: "#6b7280",
  },
  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  colorBlock: {
    width: "100%",
    height: 8,
    backgroundColor: "#059669",
  },
  recipeImage: {
    width: "100%",
    height: 180,
  },
  cardBody: {
    padding: 14,
    gap: 8,
  },
  cardTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
  },
  metaText: {
    color: "#6b7280",
    fontSize: 13,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#ecfdf5",
  },
  badgeSafe: {
    backgroundColor: "#ecfdf5",
  },
  badgeWarning: {
    backgroundColor: "#fffbeb",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#047857",
  },
  badgeSafeText: {
    color: "#047857",
  },
  badgeWarnText: {
    color: "#b45309",
  },
  explanation: {
    color: "#4b5563",
    lineHeight: 18,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  labelChip: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "#ecfdf5",
  },
  labelChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#047857",
  },
  cautionChip: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "#fffbeb",
  },
  cautionChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#b45309",
  },
  scoreBadgeGreen: {
    backgroundColor: "#ecfdf5",
  },
  scoreBadgeYellow: {
    backgroundColor: "#fffbeb",
  },
  scoreBadgeRed: {
    backgroundColor: "#fef2f2",
  },
  scoreTextGreen: {
    color: "#047857",
    fontWeight: "700",
    fontSize: 12,
  },
  scoreTextYellow: {
    color: "#b45309",
    fontWeight: "700",
    fontSize: 12,
  },
  scoreTextRed: {
    color: "#dc2626",
    fontWeight: "700",
    fontSize: 12,
  },
});
