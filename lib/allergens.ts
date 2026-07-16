import type { Locale } from "@/types/domain";

const allergenNames: Record<string, { en: string; ar: string }> = {
  Eggs: { en: "Eggs", ar: "بيض" },
  Gluten: { en: "Gluten", ar: "غلوتين" },
  Dairy: { en: "Dairy", ar: "ألبان" },
  Sesame: { en: "Sesame", ar: "سمسم" },
  Nuts: { en: "Nuts", ar: "مكسرات" },
  Fish: { en: "Fish", ar: "سمك" },
};

export function getAllergenName(allergen: string, locale: Locale) {
  return allergenNames[allergen]?.[locale] ?? allergen;
}
