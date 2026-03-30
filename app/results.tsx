import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import {
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { mockRecipes, type Recipe } from "./data";
import { styles } from "./styles/results.styles";

function matchesGoal(recipe: Recipe, goal: string): boolean {
  if (!goal) return true;
  return recipe.healthLabels.some((label) => label.toLowerCase().includes(goal.toLowerCase()));
}

function isSafeForAllergies(recipe: Recipe, allergies: string[]): boolean {
  if (allergies.length === 0) return true;
  const lowered = allergies.map((item) => item.toLowerCase());
  return !recipe.cautions.some((caution) => lowered.includes(caution.toLowerCase()));
}

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string; meal?: string; goal?: string; allergies?: string }>();

  const query = params.q?.toString() ?? "";
  const meal = params.meal?.toString() ?? "";
  const goal = params.goal?.toString() ?? "";
  const allergies = (params.allergies?.toString() ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const results = useMemo(() => {
    return mockRecipes
      .filter((recipe) => (meal ? recipe.mealType === meal : true))
      .filter((recipe) => matchesGoal(recipe, goal))
      .filter((recipe) => {
        if (!query.trim()) return true;
        const haystack = `${recipe.name} ${recipe.cuisineType} ${recipe.healthLabels.join(" ")}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      })
      .sort((a, b) => {
        const safeA = isSafeForAllergies(a, allergies);
        const safeB = isSafeForAllergies(b, allergies);
        if (safeA === safeB) return a.calories - b.calories;
        return safeA ? -1 : 1;
      });
  }, [allergies, goal, meal, query]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={16} color="#374151" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.summaryText}>
          {meal || "Any meal"} | {goal || "Any goal"}
        </Text>
      </View>

      {results.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={28} color="#9ca3af" />
          <Text style={styles.emptyTitle}>No recipes found</Text>
          <Text style={styles.emptySubtitle}>Try broadening your filters or search keywords.</Text>
        </View>
      ) : (
        results.map((recipe) => {
          const safe = isSafeForAllergies(recipe, allergies);
          return (
            <Pressable
              key={recipe.id}
              onPress={() => router.push(`/recipe/${recipe.id}`)}
              style={styles.card}
            >
              <Image source={{ uri: recipe.image }} style={styles.cardImage} contentFit="cover" />
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
