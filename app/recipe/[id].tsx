import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { mockRecipes } from "../data";

export default function RecipeDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id?.toString();
  const recipe = mockRecipes.find((item) => item.id === id);

  if (!recipe) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFound}>Recipe not found</Text>
        <Pressable onPress={() => router.replace("/")} style={styles.backHomeBtn}>
          <Text style={styles.backHomeText}>Go Home</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.heroWrap}>
        <Image source={{ uri: recipe.image }} style={styles.heroImage} contentFit="cover" />
        <Pressable onPress={() => router.back()} style={styles.backPill}>
          <Ionicons name="arrow-back" size={16} color="#111827" />
        </Pressable>
      </View>

      <Text style={styles.title}>{recipe.name}</Text>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="flame" size={14} color="#f97316" />
          <Text style={styles.infoText}>{recipe.calories} kcal</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="people" size={14} color="#6b7280" />
          <Text style={styles.infoText}>Serves {recipe.servings}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tags</Text>
        <View style={styles.tagsWrap}>
          {[recipe.cuisineType, recipe.mealType, ...recipe.healthLabels].map((tag) => (
            <View key={tag} style={styles.tagPill}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ingredients</Text>
        {recipe.ingredientLines.map((line) => (
          <View key={line} style={styles.ingredientRow}>
            <View style={styles.dot} />
            <Text style={styles.ingredientText}>{line}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Allergen info</Text>
        {recipe.cautions.length === 0 ? (
          <Text style={styles.safeText}>No allergen warnings for this recipe.</Text>
        ) : (
          <View style={styles.warningBox}>
            <Ionicons name="alert-circle" size={16} color="#b91c1c" />
            <Text style={styles.warningText}>Contains: {recipe.cautions.join(", ")}</Text>
          </View>
        )}
      </View>

      {recipe.substitutions && recipe.substitutions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Substitutions</Text>
          {recipe.substitutions.map((swap) => (
            <View key={`${swap.from}-${swap.to}`} style={styles.swapRow}>
              <Ionicons name="refresh" size={14} color="#92400e" />
              <Text style={styles.swapText}>
                {swap.from}{" -> "}{swap.to}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why this fits</Text>
        <View style={styles.explanationBox}>
          <Ionicons name="sparkles" size={16} color="#059669" />
          <Text style={styles.explanationText}>{recipe.explanation}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5f7f7",
  },
  content: {
    paddingBottom: 28,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f7f7",
    gap: 12,
  },
  notFound: {
    color: "#374151",
    fontSize: 18,
    fontWeight: "700",
  },
  backHomeBtn: {
    backgroundColor: "#059669",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backHomeText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  heroWrap: {
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: 250,
  },
  backPill: {
    position: "absolute",
    left: 14,
    top: 58,
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  title: {
    marginTop: 16,
    marginHorizontal: 18,
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  infoRow: {
    flexDirection: "row",
    gap: 14,
    marginHorizontal: 18,
    marginTop: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    color: "#4b5563",
    fontWeight: "600",
  },
  section: {
    marginTop: 18,
    marginHorizontal: 18,
    gap: 10,
  },
  sectionTitle: {
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "700",
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagPill: {
    backgroundColor: "#ecfdf5",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    color: "#047857",
    fontSize: 12,
    fontWeight: "600",
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  dot: {
    marginTop: 7,
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#10b981",
  },
  ingredientText: {
    color: "#374151",
    lineHeight: 20,
    flex: 1,
  },
  safeText: {
    color: "#047857",
    fontWeight: "600",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 10,
  },
  warningText: {
    color: "#b91c1c",
    flex: 1,
    lineHeight: 18,
  },
  swapRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fffbeb",
    borderRadius: 10,
    padding: 10,
  },
  swapText: {
    color: "#92400e",
    flex: 1,
    lineHeight: 18,
  },
  explanationBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#ecfdf5",
    borderRadius: 12,
    padding: 10,
  },
  explanationText: {
    color: "#065f46",
    flex: 1,
    lineHeight: 20,
  },
});
