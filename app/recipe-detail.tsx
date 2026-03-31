import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function RecipeDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ recipe?: string }>();

  let recipe: any = null;
  try {
    recipe = params.recipe ? JSON.parse(params.recipe as string) : null;
  } catch {
    recipe = null;
  }

  if (!recipe || !recipe.name) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFound}>Recipe not found</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const caloriesPerServing =
    recipe.calories != null && recipe.servings != null && recipe.servings > 0
      ? Math.round(recipe.calories / recipe.servings)
      : recipe.calories != null
      ? Math.round(recipe.calories)
      : null;

  const scoreColor =
    recipe.score >= 80 ? "#059669" : recipe.score >= 50 ? "#d97706" : "#dc2626";

  const dietaryTags = [...(recipe.diet_labels ?? []), ...(recipe.health_labels ?? [])].slice(0, 5);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Hero */}
      <View style={styles.heroWrap}>
        {recipe.image_url ? (
          <Image source={{ uri: recipe.image_url }} style={styles.heroImage} contentFit="cover" />
        ) : (
          <View style={[styles.heroImage, styles.heroFallback]} />
        )}
        <View style={styles.heroOverlay} />
        <Pressable onPress={() => router.back()} style={styles.backPill}>
          <Ionicons name="arrow-back" size={18} color="#111827" />
        </Pressable>
        {recipe.source ? (
          <View style={styles.sourcePill}>
            <Text style={styles.sourcePillText}>{recipe.source}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>

        {/* Title + meta */}
        <Text style={styles.title}>{recipe.name}</Text>
        <View style={styles.metaRow}>
          {caloriesPerServing != null && (
            <View style={styles.metaChip}>
              <Ionicons name="flame-outline" size={13} color="#f97316" />
              <Text style={styles.metaChipText}>{caloriesPerServing} kcal/serving</Text>
            </View>
          )}
          {recipe.servings != null && (
            <View style={styles.metaChip}>
              <Ionicons name="people-outline" size={13} color="#6b7280" />
              <Text style={styles.metaChipText}>Serves {recipe.servings}</Text>
            </View>
          )}
          {recipe.meal_type?.length > 0 && (
            <View style={styles.metaChip}>
              <Ionicons name="time-outline" size={13} color="#6b7280" />
              <Text style={styles.metaChipText}>{recipe.meal_type[0]}</Text>
            </View>
          )}
        </View>

        {/* Score */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreLeft}>
            <Text style={styles.scoreLabel}>Match Score</Text>
            <Text style={[styles.scoreValue, { color: scoreColor }]}>{recipe.score}<Text style={styles.scoreMax}>/100</Text></Text>
          </View>
          <View style={styles.scoreDivider} />
          <View style={styles.scoreRight}>
            {recipe.score === 100 ? (
              <View style={styles.scoreReasonRow}>
                <Ionicons name="checkmark-circle" size={14} color="#059669" />
                <Text style={styles.scoreReasonGood}>Perfectly matches your requirements</Text>
              </View>
            ) : recipe.score_reasons?.length > 0 ? (
              recipe.score_reasons.map((reason: string, i: number) => (
                <View key={i} style={styles.scoreReasonRow}>
                  <Ionicons name="alert-circle-outline" size={14} color={scoreColor} />
                  <Text style={styles.scoreReasonText}>{reason}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.scoreReasonText}>No specific requirements set</Text>
            )}
          </View>
        </View>

        {/* Dietary tags */}
        {dietaryTags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dietary Info</Text>
            <View style={styles.tagsRow}>
              {dietaryTags.map((tag: string) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Allergens */}
        {recipe.cautions?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Allergen Warnings</Text>
            <View style={styles.warningBox}>
              <Ionicons name="alert-circle" size={16} color="#b91c1c" />
              <Text style={styles.warningText}>{recipe.cautions.join(", ")}</Text>
            </View>
          </View>
        )}

        {/* Ingredients */}
        {recipe.ingredient_lines?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <View style={styles.ingredientList}>
              {recipe.ingredient_lines.map((line: string, i: number) => (
                <View key={i} style={styles.ingredientRow}>
                  <View style={styles.dot} />
                  <Text style={styles.ingredientText}>{line}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Directions CTA */}
        <Pressable
          onPress={() => recipe.url && Linking.openURL(recipe.url)}
          style={styles.directionsCta}
        >
          <View style={styles.directionsCtaLeft}>
            <Text style={styles.directionsCtaTitle}>Full Directions</Text>
            <Text style={styles.directionsCtaSubtitle}>View on {recipe.source || "source website"}</Text>
          </View>
          <View style={styles.directionsCtaArrow}>
            <Ionicons name="open-outline" size={18} color="#ffffff" />
          </View>
        </Pressable>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f5f7f7" },
  content: { paddingBottom: 40 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  notFound: { fontSize: 18, fontWeight: "700", color: "#374151" },
  backBtn: { backgroundColor: "#059669", borderRadius: 999, paddingHorizontal: 20, paddingVertical: 10 },
  backBtnText: { color: "#fff", fontWeight: "700" },

  // Hero
  heroWrap: { position: "relative" },
  heroImage: { width: "100%", height: 280 },
  heroFallback: { backgroundColor: "#059669" },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
    height: 280,
  },
  backPill: {
    position: "absolute", top: 56, left: 18,
    width: 38, height: 38, borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center", justifyContent: "center",
  },
  sourcePill: {
    position: "absolute", bottom: 14, right: 14,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5,
  },
  sourcePillText: { color: "#fff", fontSize: 12, fontWeight: "600" },

  // Body
  body: { paddingHorizontal: 18, paddingTop: 20, gap: 20 },
  title: { fontSize: 26, fontWeight: "800", color: "#111827", lineHeight: 32 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metaChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#fff", borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: "#e5e7eb",
  },
  metaChipText: { fontSize: 12, color: "#374151", fontWeight: "500" },

  // Score
  scoreCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  scoreLeft: {
    padding: 16, alignItems: "center", justifyContent: "center",
    minWidth: 90,
  },
  scoreLabel: { fontSize: 11, color: "#9ca3af", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  scoreValue: { fontSize: 32, fontWeight: "800", marginTop: 2 },
  scoreMax: { fontSize: 14, color: "#9ca3af", fontWeight: "500" },
  scoreDivider: { width: 1, backgroundColor: "#e5e7eb" },
  scoreRight: { flex: 1, padding: 14, gap: 8, justifyContent: "center" },
  scoreReasonRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  scoreReasonText: { fontSize: 13, color: "#4b5563", lineHeight: 18, flex: 1 },
  scoreReasonGood: { fontSize: 13, color: "#059669", lineHeight: 18, flex: 1, fontWeight: "600" },

  // Sections
  section: { gap: 10 },
  sectionTitle: {
    fontSize: 11, fontWeight: "700", color: "#9ca3af",
    textTransform: "uppercase", letterSpacing: 0.6,
  },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    backgroundColor: "#ecfdf5", borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  tagText: { color: "#065f46", fontSize: 12, fontWeight: "600" },

  warningBox: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#fef2f2", borderRadius: 12, padding: 12,
  },
  warningText: { color: "#b91c1c", flex: 1, fontSize: 13, lineHeight: 18 },

  ingredientList: {
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 1, borderColor: "#e5e7eb",
    paddingVertical: 4,
  },
  ingredientRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    paddingHorizontal: 14, paddingVertical: 9,
    borderBottomWidth: 1, borderBottomColor: "#f3f4f6",
  },
  dot: { marginTop: 7, width: 5, height: 5, borderRadius: 999, backgroundColor: "#10b981" },
  ingredientText: { flex: 1, color: "#374151", fontSize: 14, lineHeight: 20 },

  // Directions CTA
  directionsCta: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#059669", borderRadius: 16, padding: 18,
  },
  directionsCtaLeft: { gap: 2 },
  directionsCtaTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  directionsCtaSubtitle: { color: "rgba(255,255,255,0.75)", fontSize: 13 },
  directionsCtaArrow: {
    width: 36, height: 36, borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },
});
