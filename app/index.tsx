import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { mockRecipes, type Recipe } from "./data";
import { styles } from "./styles/index.styles";
import { COLORS } from "./styles/theme";

const BACKEND_URL = "http://10.239.181.127:3000";

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
  const [pickedImage, setPickedImage] = useState<string | null>(null);
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState("Dinner");
  const [selectedGoal, setSelectedGoal] = useState("High-Protein");
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(["Dairy", "Nuts"]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeIngredients = async () => {
    if (!pickedImage) {
      Alert.alert("No image", "Please upload a pantry image first.");
      return;
    }

    const requirementsParts = [];
    if (selectedAllergies.length) requirementsParts.push(`No ${selectedAllergies.join(", ")}`);
    if (selectedMeal) requirementsParts.push(`Meal type: ${selectedMeal}`);
    if (selectedGoal) requirementsParts.push(selectedGoal);
    const requirements = requirementsParts.join(", ");

    const formData = new FormData();
    formData.append("image", { uri: pickedImage, type: "image/jpeg", name: "pantry.jpg" } as any);
    formData.append("requirements", requirements);
    formData.append("allergies", selectedAllergies.join(","));
    formData.append("meal", selectedMeal);
    formData.append("goal", selectedGoal);

    setIsAnalyzing(true);
    try {
      const response = await fetch(`${BACKEND_URL}/analyze-ingredients`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed");
      router.push({ pathname: "/results", params: { result: data.result } });
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

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

  const pickFromLibrary = async () => {
    setIsPickingImage(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission needed", "Please allow photo library access to upload an image.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setPickedImage(result.assets[0].uri);
      }
    } finally {
      setIsPickingImage(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.brandRow}>
          <View style={styles.logoBubble}>
            <Ionicons name="shield-checkmark" size={18} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.title}>Pantry Pal</Text>
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
        <Pressable
          onPress={pickFromLibrary}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Upload ingredient image"
        >
          {isPickingImage ? (
            <ActivityIndicator size="small" color="#374151" />
          ) : (
            <Ionicons name="image-outline" size={18} color="#374151" />
          )}
        </Pressable>
      </View>

      {pickedImage ? (
        <View style={styles.previewWrap}>
          <Image source={{ uri: pickedImage }} style={styles.previewImage} contentFit="cover" />
          <Pressable
            onPress={() => setPickedImage(null)}
            style={styles.clearPreviewBtn}
            accessibilityRole="button"
            accessibilityLabel="Remove uploaded image"
          >
            <Ionicons name="close-circle" size={20} color={COLORS.previewDanger} />
          </Pressable>
        </View>
      ) : null}

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
        onPress={analyzeIngredients}
        disabled={isAnalyzing}
        style={[styles.cta, isAnalyzing && { opacity: 0.6 }]}
      >
        {isAnalyzing ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={styles.ctaText}>Find Safe Recipes</Text>
            <Ionicons name="arrow-forward" size={18} color="#ffffff" />
          </View>
        )}
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
