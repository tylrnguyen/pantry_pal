import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { mockRecipes } from "../data";
import { styles } from "../styles/recipe.styles";

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
