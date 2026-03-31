import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { styles } from "./styles/recipe.styles";

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
        <Pressable onPress={() => router.back()} style={styles.backHomeBtn}>
          <Text style={styles.backHomeText}>Go Back</Text>
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

  const allTags = [
    ...recipe.cuisine_type,
    ...recipe.meal_type,
    ...recipe.dish_type,
    ...recipe.diet_labels,
    ...recipe.health_labels,
  ].filter(Boolean);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.heroWrap}>
        {recipe.image_url ? (
          <Image source={{ uri: recipe.image_url }} style={styles.heroImage} contentFit="cover" />
        ) : (
          <View style={[styles.heroImage, { backgroundColor: "#059669" }]} />
        )}
        <Pressable onPress={() => router.back()} style={styles.backPill}>
          <Ionicons name="arrow-back" size={16} color="#111827" />
        </Pressable>
      </View>

      <Text style={styles.title}>{recipe.name}</Text>

      <View style={styles.infoRow}>
        {caloriesPerServing != null && (
          <View style={styles.infoItem}>
            <Ionicons name="flame" size={14} color="#f97316" />
            <Text style={styles.infoText}>{caloriesPerServing} kcal/serving</Text>
          </View>
        )}
        {recipe.servings != null && (
          <View style={styles.infoItem}>
            <Ionicons name="people" size={14} color="#6b7280" />
            <Text style={styles.infoText}>Serves {recipe.servings}</Text>
          </View>
        )}
        {recipe.source ? (
          <View style={styles.infoItem}>
            <Ionicons name="globe-outline" size={14} color="#6b7280" />
            <Text style={styles.infoText}>{recipe.source}</Text>
          </View>
        ) : null}
      </View>

      {allTags.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagsWrap}>
            {allTags.map((tag: string) => (
              <View key={tag} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {recipe.ingredient_lines?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipe.ingredient_lines.map((line: string, i: number) => (
            <View key={i} style={styles.ingredientRow}>
              <View style={styles.dot} />
              <Text style={styles.ingredientText}>{line}</Text>
            </View>
          ))}
        </View>
      )}

      {recipe.cautions?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Allergen info</Text>
          <View style={styles.warningBox}>
            <Ionicons name="alert-circle" size={16} color="#b91c1c" />
            <Text style={styles.warningText}>Contains: {recipe.cautions.join(", ")}</Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Directions</Text>
        <Pressable
          onPress={() => recipe.url && Linking.openURL(recipe.url)}
          style={styles.explanationBox}
        >
          <Ionicons name="open-outline" size={16} color="#059669" />
          <Text style={styles.explanationText}>
            Full directions are available at the source.{"\n"}
            <Text style={{ fontWeight: "700", textDecorationLine: "underline" }}>
              Tap to open {recipe.source || "recipe page"} →
            </Text>
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
