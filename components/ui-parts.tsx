// @ts-nocheck
import { AlertTriangle, ArrowRight, Search, ShieldAlert, ShieldCheck } from "lucide-react";
import React from "react";

// --- Chip ---
export function Chip({
  label,
  selected,
  onToggle,
  variant = "default",
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
  variant?: "default" | "danger";
}) {
  const selectedStyles =
    variant === "danger"
      ? "bg-red-500 text-white border-red-500 shadow-sm"
      : "bg-emerald-600 text-white border-emerald-600 shadow-sm";

  return (
    <button
      onClick={onToggle}
      className={`px-4 py-2 rounded-full border transition-all ${
        selected
          ? selectedStyles
          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
      }`}
    >
      {label}
    </button>
  );
}

// --- Tag Badge ---
export function TagBadge({ label, color = "gray" }: { label: string; color?: string }) {
  const colors: Record<string, string> = {
    gray: "bg-gray-100 text-gray-600",
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    emerald: "bg-emerald-50 text-emerald-700",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs ${colors[color] || colors.gray}`}>
      {label}
    </span>
  );
}

// --- Safety Badge ---
export function SafetyBadge({ status }: { status: "safe" | "swap" | "unsafe" }) {
  const config = {
    safe: {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: <ShieldCheck size={14} />,
      label: "Safe",
    },
    swap: {
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      icon: <ShieldAlert size={14} />,
      label: "Safe with swaps",
    },
    unsafe: {
      bg: "bg-red-50 text-red-700 border-red-200",
      icon: <AlertTriangle size={14} />,
      label: "Not safe",
    },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${c.bg}`}>
      {c.icon}
      {c.label}
    </span>
  );
}

// --- Input Field ---
export function InputField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all placeholder:text-gray-400"
      />
    </div>
  );
}

// --- Primary Button ---
export function PrimaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full py-4 rounded-2xl bg-emerald-600 text-white flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-lg shadow-emerald-200"
    >
      {children}
      <ArrowRight size={18} />
    </button>
  );
}