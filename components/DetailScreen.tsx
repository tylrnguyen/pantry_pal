// @ts-nocheck
import { AlertTriangle, ArrowLeft, Flame, RefreshCw, Sparkles, Users } from "lucide-react";
import React from "react";
import { useNavigate, useParams } from "react-router";
import { mockRecipes } from "../data";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { SafetyBadge, TagBadge } from "./ui-parts";

export function DetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const recipe = mockRecipes.find((r) => r.id === id);

  if (!recipe) return <div className="p-8 text-center text-gray-500">Recipe not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-[393px] bg-white min-h-screen pb-10">
        {/* Image */}
        <div className="relative w-full h-56">
          <ImageWithFallback
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => navigate("/results")}
            className="absolute top-12 left-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm"
          >
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
        </div>

        <div className="px-6 pt-5 space-y-6">
          {/* Title + safety */}
          <div className="space-y-3">
            <h2 className="text-gray-900">{recipe.name}</h2>
            <SafetyBadge status={recipe.safety} />
            <div className="flex flex-wrap gap-1.5 mt-2">
              <TagBadge label={recipe.cuisineType} color="blue" />
              <TagBadge label={recipe.mealType} color="purple" />
              {recipe.healthLabels.map((h) => (
                <TagBadge key={h} label={h} color="emerald" />
              ))}
            </div>
          </div>

          {/* Nutrition */}
          <Section title="Nutrition">
            <div className="flex gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Flame size={16} className="text-orange-400" />
                {recipe.calories} kcal
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Users size={16} className="text-gray-400" />
                Serves {recipe.servings}
              </div>
            </div>
          </Section>

          {/* Ingredients */}
          <Section title="Ingredients">
            <ul className="space-y-2">
              {recipe.ingredientLines.map((line, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  {line}
                </li>
              ))}
            </ul>
          </Section>

          {/* Allergen Info */}
          <Section title="Allergen Info">
            {recipe.cautions.length > 0 ? (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-xl p-3">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span>Contains: {recipe.cautions.join(", ")}</span>
              </div>
            ) : (
              <p className="text-sm text-emerald-600">No allergen warnings for this recipe.</p>
            )}
          </Section>

          {/* Substitutions */}
          {recipe.substitutions && recipe.substitutions.length > 0 && (
            <Section title="Substitutions">
              <div className="space-y-2">
                {recipe.substitutions.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-xl px-3 py-2.5">
                    <RefreshCw size={14} className="shrink-0" />
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
            <div className="flex items-start gap-2 text-sm text-gray-600 bg-emerald-50 rounded-xl p-3">
              <Sparkles size={16} className="text-emerald-500 mt-0.5 shrink-0" />
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
    <div className="space-y-2.5">
      <h4 className="text-sm text-gray-400 uppercase tracking-wider">{title}</h4>
      {children}
    </div>
  );
}
