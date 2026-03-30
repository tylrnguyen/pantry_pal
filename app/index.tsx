import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { mockRecipes, type Recipe } from "./data";

const ALLERGIES = ["Dairy", "Nuts", "Gluten", "Egg", "Soy", "Shellfish", "Sesame"];
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const GOALS = ["High-Protein", "Low-Calorie", "Vegan", "Keto", "Gluten-Free"];

function scoreRecipe(recipe: Recipe): number {
  let score = 0;
  if (recipe.safety === "safe") score += 3;
  if (recipe.safety === "swap") score += 2;
  if (recipe.trending) score += 1;
  return score;
}

export default function IndexScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedMeal, setSelectedMeal] = useState("Dinner");
  const [selectedGoal, setSelectedGoal] = useState("High-Protein");
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(["Dairy", "Nuts"]);

  const recommended = useMemo(() => {
    return [...mockRecipes]
      .filter((recipe) => (selectedMeal ? recipe.mealType === selectedMeal : true))
      .filter((recipe) => {
        if (!selectedGoal) return true;
        return recipe.healthLabels.some((label) =>
          label.toLowerCase().includes(selectedGoal.toLowerCase())
        );
      })
      .filter((recipe) => {
        if (!query.trim()) return true;
        const haystack = `${recipe.name} ${recipe.cuisineType} ${recipe.healthLabels.join(" ")}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      })
      .sort((a, b) => scoreRecipe(b) - scoreRecipe(a))
      .slice(0, 8);
  }, [query, selectedGoal, selectedMeal]);

  const toggleAllergy = (allergy: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((item) => item !== allergy) : [...prev, allergy]
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.brandRow}>
          <View style={styles.logoBubble}>
            <Ionicons name="shield-checkmark" size={18} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.title}>SafeBite</Text>
            <Text style={styles.subtitle}>AI allergy-safe recipes</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search meals or cuisine"
          value={query}
          onChangeText={setQuery}
          placeholderTextColor="#9ca3af"
        />
      </View>

      <Text style={styles.sectionLabel}>Allergies to avoid</Text>
      <View style={styles.chipWrap}>
        {ALLERGIES.map((allergy) => {
          const selected = selectedAllergies.includes(allergy);
          return (
            <Pressable
              key={allergy}
              onPress={() => toggleAllergy(allergy)}
              style={[styles.chip, selected && styles.chipDangerSelected]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{allergy}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>Meal type</Text>
      <View style={styles.chipWrap}>
        {MEAL_TYPES.map((meal) => {
          const selected = selectedMeal === meal;
          return (
            <Pressable
              key={meal}
              onPress={() => setSelectedMeal(selected ? "" : meal)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{meal}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>Dietary goal</Text>
      <View style={styles.chipWrap}>
        {GOALS.map((goal) => {
          const selected = selectedGoal === goal;
          return (
            <Pressable
              key={goal}
              onPress={() => setSelectedGoal(selected ? "" : goal)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{goal}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() =>
          router.push({
            pathname: "/results",
            params: {
              q: query,
              meal: selectedMeal,
              goal: selectedGoal,
              allergies: selectedAllergies.join(","),
            },
          })
        }
        style={styles.cta}
      >
        <Text style={styles.ctaText}>Find Safe Recipes</Text>
        <Ionicons name="arrow-forward" size={18} color="#ffffff" />
      </Pressable>

      <Text style={styles.recommendLabel}>Recommended for you</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowList}>
        {recommended.map((recipe) => (
          <Pressable
            key={recipe.id}
            style={styles.card}
            onPress={() => router.push(`/recipe/${recipe.id}`)}
          >
            <Image source={{ uri: recipe.image }} style={styles.cardImage} contentFit="cover" />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {recipe.name}
              </Text>
              <Text style={styles.cardMeta}>{recipe.calories} kcal</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  headerRow: {
    marginBottom: 2,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoBubble: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#059669",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  searchWrap: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 14,
    paddingHorizontal: 12,
    minHeight: 48,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  sectionLabel: {
    marginTop: 6,
    fontSize: 12,
    letterSpacing: 0.5,
    color: "#6b7280",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipSelected: {
    backgroundColor: "#059669",
    borderColor: "#059669",
  },
  chipDangerSelected: {
    backgroundColor: "#dc2626",
    borderColor: "#dc2626",
  },
  chipText: {
    color: "#374151",
    fontWeight: "500",
    fontSize: 13,
  },
  chipTextSelected: {
    color: "#ffffff",
  },
  cta: {
    marginTop: 6,
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: "#059669",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
  recommendLabel: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  rowList: {
    paddingVertical: 6,
    gap: 12,
  },
  card: {
    width: 160,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardImage: {
    width: "100%",
    height: 96,
  },
  cardBody: {
    padding: 10,
    gap: 6,
  },
  cardTitle: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "600",
    minHeight: 32,
  },
  cardMeta: {
    color: "#6b7280",
    fontSize: 12,
  },
});
