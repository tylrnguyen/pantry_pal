import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const ALLERGIES = ["Dairy", "Nuts", "Gluten", "Egg", "Soy", "Shellfish", "Sesame"];
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const GOALS = ["High-Protein", "Low-Calorie", "Vegan", "Keto", "Gluten-Free"];

export default function IndexScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pickedImage, setPickedImage] = useState<string | null>(null);
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState("Dinner");
  const [selectedGoal, setSelectedGoal] = useState("High-Protein");
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(["Dairy", "Nuts"]);

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

  const handleSearch = () => {
    router.push({
      pathname: "/results",
      params: {
        q: query,
        meal: selectedMeal,
        goal: selectedGoal,
        allergies: selectedAllergies.join(","),
        ...(pickedImage ? { imageUri: pickedImage } : {}),
      },
    });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.brandRow}>
          <View style={styles.logoBubble}>
            <Ionicons name="shield-checkmark" size={18} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.title}>PantryPal</Text>
            <Text style={styles.subtitle}>AI allergy-safe recipes</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search meals or ingredients"
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
            <Ionicons name="close-circle" size={20} color="#ef4444" />
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

      <Pressable onPress={handleSearch} style={styles.cta}>
        <Text style={styles.ctaText}>Find Safe Recipes</Text>
        <Ionicons name="arrow-forward" size={18} color="#ffffff" />
      </Pressable>

      {pickedImage ? (
        <View style={styles.hintBox}>
          <Ionicons name="camera-outline" size={16} color="#059669" />
          <Text style={styles.hintText}>
            Your photo will be analyzed by AI to detect ingredients
          </Text>
        </View>
      ) : (
        <View style={styles.hintBox}>
          <Ionicons name="bulb-outline" size={16} color="#6b7280" />
          <Text style={styles.hintText}>
            Snap a photo of your pantry or fridge to find recipes based on what you have
          </Text>
        </View>
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
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  previewWrap: {
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    position: "relative",
    backgroundColor: "#ffffff",
  },
  previewImage: {
    width: "100%",
    height: 170,
  },
  clearPreviewBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#ffffff",
    borderRadius: 999,
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
  hintBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  hintText: {
    color: "#6b7280",
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
});
