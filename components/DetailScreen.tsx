// @ts-nocheck
import { AlertTriangle, ArrowLeft, Flame, RefreshCw, Sparkles, Users } from "lucide-react";
import React from "react";
import { useNavigate, useParams } from "react-router";
import { mockRecipes } from "../data";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { SafetyBadge, TagBadge } from "./ui-parts";

const styles = {
  page: "min-h-screen bg-gray-50 flex justify-center",
  container: "w-full max-w-[393px] bg-white min-h-screen pb-10",
  heroImageWrap: "relative w-full h-56",
  heroImage: "w-full h-full object-cover",
  backButton: "absolute top-12 left-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm",
  backIcon: "text-gray-700",
  content: "px-6 pt-5 space-y-6",
  titleBlock: "space-y-3",
  title: "text-gray-900",
  tagsWrap: "flex flex-wrap gap-1.5 mt-2",
  nutritionRow: "flex gap-6",
  nutritionItem: "flex items-center gap-2 text-sm text-gray-700",
  calorieIcon: "text-orange-400",
  peopleIcon: "text-gray-400",
  ingredientList: "space-y-2",
  ingredientItem: "text-sm text-gray-600 flex items-start gap-2",
  ingredientBullet: "w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0",
  cautionBox: "flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-xl p-3",
  cautionIcon: "mt-0.5 shrink-0",
  safeText: "text-sm text-emerald-600",
  substitutionsList: "space-y-2",
  substitutionItem: "flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-xl px-3 py-2.5",
  substitutionIcon: "shrink-0",
  explanationBox: "flex items-start gap-2 text-sm text-gray-600 bg-emerald-50 rounded-xl p-3",
  explanationIcon: "text-emerald-500 mt-0.5 shrink-0",
  missingRecipe: "p-8 text-center text-gray-500",
  section: "space-y-2.5",
  sectionTitle: "text-sm text-gray-400 uppercase tracking-wider",
};

export function DetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const recipe = mockRecipes.find((r) => r.id === id);

  if (!recipe) return <div className={styles.missingRecipe}>Recipe not found</div>;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Image */}
        <div className={styles.heroImageWrap}>
          <ImageWithFallback
            src={recipe.image}
            alt={recipe.name}
            className={styles.heroImage}
          />
          <button
            onClick={() => navigate("/results")}
            className={styles.backButton}
          >
            <ArrowLeft size={18} className={styles.backIcon} />
          </button>
        </div>

        <div className={styles.content}>
          {/* Title + safety */}
          <div className={styles.titleBlock}>
            <h2 className={styles.title}>{recipe.name}</h2>
            <SafetyBadge status={recipe.safety} />
            <div className={styles.tagsWrap}>
              <TagBadge label={recipe.cuisineType} color="blue" />
              <TagBadge label={recipe.mealType} color="purple" />
              {recipe.healthLabels.map((h) => (
                <TagBadge key={h} label={h} color="emerald" />
              ))}
            </div>
          </div>

          {/* Nutrition */}
          <Section title="Nutrition">
            <div className={styles.nutritionRow}>
              <div className={styles.nutritionItem}>
                <Flame size={16} className={styles.calorieIcon} />
                {recipe.calories} kcal
              </div>
              <div className={styles.nutritionItem}>
                <Users size={16} className={styles.peopleIcon} />
                Serves {recipe.servings}
              </div>
            </div>
          </Section>

          {/* Ingredients */}
          <Section title="Ingredients">
            <ul className={styles.ingredientList}>
              {recipe.ingredientLines.map((line, i) => (
                <li key={i} className={styles.ingredientItem}>
                  <span className={styles.ingredientBullet} />
                  {line}
                </li>
              ))}
            </ul>
          </Section>

          {/* Allergen Info */}
          <Section title="Allergen Info">
            {recipe.cautions.length > 0 ? (
              <div className={styles.cautionBox}>
                <AlertTriangle size={16} className={styles.cautionIcon} />
                <span>Contains: {recipe.cautions.join(", ")}</span>
              </div>
            ) : (
              <p className={styles.safeText}>No allergen warnings for this recipe.</p>
            )}
          </Section>

          {/* Substitutions */}
          {recipe.substitutions && recipe.substitutions.length > 0 && (
            <Section title="Substitutions">
              <div className={styles.substitutionsList}>
                {recipe.substitutions.map((s, i) => (
                  <div key={i} className={styles.substitutionItem}>
                    <RefreshCw size={14} className={styles.substitutionIcon} />
                    <span>
                      {s.from} &rarr; {s.to}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Why this fits */}
          <Section title="Why this fits">
            <div className={styles.explanationBox}>
              <Sparkles size={16} className={styles.explanationIcon} />
              <span>{recipe.explanation}</span>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.section}>
      <h4 className={styles.sectionTitle}>{title}</h4>
      {children}
    </div>
  );
}
