// @ts-nocheck
import {
    ChevronDown,
    ChevronRight,
    Clock,
    Flame,
    ShieldCheck,
    SlidersHorizontal,
    Sparkles,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { mockRecipes, Recipe, recommendationShelves } from "../data";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Chip, InputField, PrimaryButton } from "./ui-parts";

const ALLERGIES = ["Dairy", "Nuts", "Gluten", "Egg", "Soy", "Shellfish", "Sesame"];
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const GOALS = ["High Protein", "Low Calorie", "Vegan", "Keto", "Gluten-Free"];

// Safety dot colors for recommendation cards
const safetyDot: Record<string, string> = {
  safe: "bg-emerald-500",
  swap: "bg-amber-400",
  unsafe: "bg-red-500",
};

const safetyRing: Record<string, string> = {
  safe: "ring-emerald-200",
  swap: "ring-amber-200",
  unsafe: "ring-red-200",
};

function RecommendationCard({
  recipe,
  onClick,
}: {
  recipe: Recipe;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-[148px] rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 text-left hover:shadow-md active:scale-[0.97] transition-all"
    >
      {/* Image */}
      <div className="relative w-full h-[100px] overflow-hidden">
        <ImageWithFallback
          src={recipe.image}
          alt={recipe.name}
          className="w-full h-full object-cover"
        />
        {/* Safety dot badge */}
        <span
          className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ring-2 ring-white ${safetyDot[recipe.safety]}`}
        />
      </div>

      {/* Info */}
      <div className="p-2.5 space-y-1.5">
        <p className="text-gray-900 text-xs leading-snug line-clamp-2">{recipe.name}</p>
        <div className="flex items-center gap-2 text-gray-400">
          <span className="flex items-center gap-0.5 text-[10px]">
            <Flame size={10} className="text-orange-400" />
            {recipe.calories}
          </span>
          {recipe.prepTime && (
            <span className="flex items-center gap-0.5 text-[10px]">
              <Clock size={10} />
              {recipe.prepTime}m
            </span>
          )}
        </div>
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] ring-1 ${safetyRing[recipe.safety]} ${
            recipe.safety === "safe"
              ? "text-emerald-700 bg-emerald-50"
              : recipe.safety === "swap"
              ? "text-amber-700 bg-amber-50"
              : "text-red-700 bg-red-50"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${safetyDot[recipe.safety]}`} />
          {recipe.safety === "safe" ? "Safe" : recipe.safety === "swap" ? "With swap" : "Not safe"}
        </span>
      </div>
    </button>
  );
}

function RecommendationRow({
  shelf,
  onCardClick,
}: {
  shelf: (typeof recommendationShelves)[0];
  onCardClick: (id: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const recipes = shelf.recipeIds
    .map((id) => mockRecipes.find((r) => r.id === id))
    .filter(Boolean) as Recipe[];

  return (
    <div className="space-y-3">
      {/* Row header */}
      <div className="px-6 flex items-end justify-between">
        <div>
          <h3 className="text-gray-900 text-sm">{shelf.title}</h3>
          <p className="text-gray-400 text-xs mt-0.5">{shelf.subtitle}</p>
        </div>
        <button className="flex items-center gap-0.5 text-emerald-600 text-xs">
          See all <ChevronRight size={13} />
        </button>
      </div>

      {/* Horizontal scroll */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-6 pb-1"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {recipes.map((recipe) => (
          <div key={recipe.id} style={{ scrollSnapAlign: "start" }}>
            <RecommendationCard
              recipe={recipe}
              onClick={() => onCardClick(recipe.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SearchScreen() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(["Dairy", "Nuts"]);
  const [selectedMeal, setSelectedMeal] = useState<string>("Dinner");
  const [selectedGoal, setSelectedGoal] = useState<string>("High Protein");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggle = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-[393px] bg-white min-h-screen">
        <div className="overflow-y-auto">
          {/* ── Header ── */}
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 pt-14 pb-4 space-y-4">
            {/* Logo */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-200">
                  <ShieldCheck size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-gray-900" style={{ fontFamily: "Inter, sans-serif" }}>
                    SafeBite
                  </h1>
                  <p className="text-gray-400 text-[11px] -mt-0.5">AI Allergy-Safe Recipes</p>
                </div>
              </div>
              {/* Active allergen pills summary */}
              {selectedAllergies.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-400">Avoiding:</span>
                  <span className="text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                    {selectedAllergies.slice(0, 2).join(", ")}
                    {selectedAllergies.length > 2 && ` +${selectedAllergies.length - 2}`}
                  </span>
                </div>
              )}
            </div>

            {/* Search bar */}
            <InputField
              value={query}
              onChange={setQuery}
              placeholder="e.g. high protein dinner, pasta…"
            />

            {/* Filter toggle row */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFiltersOpen((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm ${
                  filtersOpen
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200"
                }`}
              >
                <SlidersHorizontal size={14} />
                Filters
                {(selectedAllergies.length > 0 || selectedMeal || selectedGoal) && (
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center ${
                      filtersOpen ? "bg-white text-emerald-700" : "bg-emerald-600 text-white"
                    }`}
                  >
                    {(selectedAllergies.length > 0 ? 1 : 0) +
                      (selectedMeal ? 1 : 0) +
                      (selectedGoal ? 1 : 0)}
                  </span>
                )}
                <ChevronDown
                  size={14}
                  className={`transition-transform ${filtersOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Quick active filter chips (read-only summary) */}
              {!filtersOpen && (
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide flex-1">
                  {selectedMeal && (
                    <span className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                      {selectedMeal}
                    </span>
                  )}
                  {selectedGoal && (
                    <span className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {selectedGoal}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Expandable Filters Panel ── */}
          {filtersOpen && (
            <div className="px-6 pt-5 pb-4 space-y-5 bg-gray-50 border-b border-gray-100">
              {/* Allergies */}
              <div className="space-y-2.5">
                <label className="text-xs text-gray-500 uppercase tracking-wider">
                  Allergies to avoid
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALLERGIES.map((a) => (
                    <Chip
                      key={a}
                      label={a}
                      selected={selectedAllergies.includes(a)}
                      onToggle={() => setSelectedAllergies(toggle(selectedAllergies, a))}
                      variant="danger"
                    />
                  ))}
                </div>
              </div>

              {/* Meal Type */}
              <div className="space-y-2.5">
                <label className="text-xs text-gray-500 uppercase tracking-wider">Meal Type</label>
                <div className="flex flex-wrap gap-2">
                  {MEAL_TYPES.map((m) => (
                    <Chip
                      key={m}
                      label={m}
                      selected={selectedMeal === m}
                      onToggle={() => setSelectedMeal(selectedMeal === m ? "" : m)}
                    />
                  ))}
                </div>
              </div>

              {/* Dietary Goal */}
              <div className="space-y-2.5">
                <label className="text-xs text-gray-500 uppercase tracking-wider">
                  Dietary Goal
                </label>
                <div className="flex flex-wrap gap-2">
                  {GOALS.map((g) => (
                    <Chip
                      key={g}
                      label={g}
                      selected={selectedGoal === g}
                      onToggle={() => setSelectedGoal(selectedGoal === g ? "" : g)}
                    />
                  ))}
                </div>
              </div>

              {/* CTA inside filters */}
              <PrimaryButton onClick={() => { setFiltersOpen(false); navigate("/results"); }}>
                Find Safe Recipes
              </PrimaryButton>
            </div>
          )}

          {/* ── Hero Search CTA (when filters closed) ── */}
          {!filtersOpen && (
            <div className="px-6 pt-4 pb-2">
              <PrimaryButton onClick={() => navigate("/results")}>Find Safe Recipes</PrimaryButton>
            </div>
          )}

          {/* ── Recommendations ── */}
          <div className="pt-6 pb-10 space-y-8">
            {/* Section heading */}
            <div className="px-6 flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-500" />
              <h2 className="text-gray-900 text-sm">Recommended for You</h2>
            </div>

            {/* Netflix-style shelves */}
            {recommendationShelves.map((shelf) => (
              <RecommendationRow
                key={shelf.id}
                shelf={shelf}
                onCardClick={(id) => navigate(`/recipe/${id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
