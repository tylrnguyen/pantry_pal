import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { analyzeImage, findRecipes } from "./api";
import { type RecipeRow, setSearchResults } from "./recipeStore";

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    q?: string;
    meal?: string;
    goal?: string;
    allergies?: string;
    imageUri?: string;
  }>();

  const [recipes, setRecipes] = useState<RecipeRow[]>([]);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Searching for recipes…");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        let ingredients = "";

        if (params.imageUri) {
          setStatus("Analyzing your ingredients…");
          const analysis = await analyzeImage(params.imageUri);
          if (cancelled) return;
          ingredients = analysis.ingredients;
        }

        setStatus("Finding matching recipes…");
        const allergies = (params.allergies ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        const result = await findRecipes({
          ingredients,
          query: params.q ?? "",
          allergies,
          mealType: params.meal ?? "",
          goal: params.goal ?? "",
        });
        if (cancelled) return;

        setRecipes(result.recipes);
        setExplanation(result.explanation);
        setSearchResults(result.recipes, result.explanation);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Something went wrong");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params.imageUri, params.q, params.meal, params.goal, params.allergies]);

  const meal = params.meal ?? "";
  const goal = params.goal ?? "";

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

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>{status}</Text>
        </View>
      ) : error ? (
        <View style={styles.emptyState}>
          <Ionicons name="cloud-offline-outline" size={28} color="#ef4444" />
          <Text style={styles.emptyTitle}>Something went wrong</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
        </View>
      ) : recipes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={28} color="#9ca3af" />
          <Text style={styles.emptyTitle}>No recipes found</Text>
          <Text style={styles.emptySubtitle}>
            Try broadening your filters or adding more ingredients.
          </Text>
        </View>
      ) : (
        <>
          {explanation ? (
            <View style={styles.explanationBanner}>
              <Ionicons name="sparkles" size={16} color="#059669" />
              <Text style={styles.explanationText}>{explanation}</Text>
            </View>
          ) : null}

          {recipes.map((recipe) => {
            const name = recipe.recipe_name ?? recipe.name ?? "Untitled Recipe";
            return (
              <Pressable
                key={recipe.id}
                onPress={() => router.push(`/recipe/${recipe.id}`)}
                style={styles.card}
              >
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{name}</Text>
                  {recipe.source ? (
                    <Text style={styles.metaText}>Source: {recipe.source}</Text>
                  ) : null}
                  {recipe.url ? (
                    <Text style={styles.linkText} numberOfLines={1}>
                      {recipe.url}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </>
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
  loadingState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    gap: 16,
  },
  loadingText: {
    color: "#6b7280",
    fontSize: 15,
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
    textAlign: "center",
    paddingHorizontal: 20,
  },
  explanationBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#ecfdf5",
    borderRadius: 12,
    padding: 12,
  },
  explanationText: {
    color: "#065f46",
    flex: 1,
    lineHeight: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  cardBody: {
    padding: 14,
    gap: 6,
  },
  cardTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "700",
  },
  metaText: {
    color: "#6b7280",
    fontSize: 13,
  },
  linkText: {
    color: "#2563eb",
    fontSize: 13,
  },
});
