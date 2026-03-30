// @ts-nocheck
import { ArrowLeft, Flame, Users } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router";
import { mockRecipes } from "../data";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { SafetyBadge, TagBadge } from "./ui-parts";

export function ResultsScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-[393px] bg-white min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-6 pt-14 pb-4 border-b border-gray-100">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-gray-600 mb-2">
            <ArrowLeft size={20} />
            <span className="text-sm">Back</span>
          </button>
          <p className="text-sm text-gray-900">
            Dinner &bull; Dairy-free &bull; High protein
          </p>
        </div>

        {/* Recipe list */}
        <div className="px-5 py-5 space-y-5">
          {mockRecipes.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => navigate(`/recipe/${recipe.id}`)}
              className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="w-full h-44 overflow-hidden">
                <ImageWithFallback
                  src={recipe.image}
                  alt={recipe.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 space-y-3">
                {/* Name */}
                <h3 className="text-gray-900">{recipe.name}</h3>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  <TagBadge label={recipe.cuisineType} color="blue" />
                  <TagBadge label={recipe.mealType} color="purple" />
                  {recipe.healthLabels.map((h) => (
                    <TagBadge key={h} label={h} color="emerald" />
                  ))}
                </div>

                {/* Nutrition row */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Flame size={14} className="text-orange-400" />
                    {recipe.calories} kcal
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} className="text-gray-400" />
                    Serves {recipe.servings}
                  </span>
                </div>

                {/* Safety */}
                <div className="flex items-center gap-2 flex-wrap">
                  <SafetyBadge status={recipe.safety} />
                  {recipe.cautions.length > 0 && (
                    <span className="text-xs text-red-600">
                      Contains: {recipe.cautions.join(", ")}
                    </span>
                  )}
                </div>

                {/* Explanation */}
                <p className="text-xs text-gray-500">{recipe.explanation}</p>

                {/* Substitutions */}
                {recipe.substitutions && recipe.substitutions.length > 0 && (
                  <div className="text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
                    {recipe.substitutions.map((s, i) => (
                      <span key={i}>
                        Replace {s.from} &rarr; {s.to}
                        {i < recipe.substitutions!.length - 1 && " | "}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
