import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { getRecipeById } from "../recipeStore";

const HIDDEN_KEYS = new Set(["id"]);

export default function RecipeDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const recipe = getRecipeById(params.id ?? "");

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

  const name = recipe.recipe_name ?? recipe.name ?? "Untitled Recipe";
  const url = recipe.url;

  const detailEntries = Object.entries(recipe).filter(
    ([key, value]) => !HIDDEN_KEYS.has(key) && value != null && String(value).trim() !== ""
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backPill}>
          <Ionicons name="arrow-back" size={16} color="#111827" />
        </Pressable>
      </View>

      <Text style={styles.title}>{name}</Text>

      {url ? (
        <Pressable onPress={() => Linking.openURL(url)} style={styles.linkRow}>
          <Ionicons name="open-outline" size={16} color="#2563eb" />
          <Text style={styles.linkText} numberOfLines={1}>
            View full recipe
          </Text>
        </Pressable>
      ) : null}

      {detailEntries.map(([key, value]) => {
        const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        return (
          <View key={key} style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <Text style={styles.fieldValue}>{String(value)}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5f7f7",
  },
  content: {
    paddingTop: 12,
    paddingHorizontal: 18,
    paddingBottom: 28,
    gap: 12,
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
  topBar: {
    paddingTop: 48,
  },
  backPill: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  linkText: {
    color: "#2563eb",
    fontWeight: "600",
    fontSize: 15,
  },
  fieldCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 14,
    gap: 4,
  },
  fieldLabel: {
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#6b7280",
    fontSize: 11,
    fontWeight: "700",
  },
  fieldValue: {
    color: "#111827",
    fontSize: 15,
    lineHeight: 22,
  },
});
