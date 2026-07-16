import type { MenuItem, ModifierGroup, ModifierOption } from "@/types/domain";

export function defaultModifiersForItem(item: MenuItem): ModifierOption[] {
  return item.modifierGroups.flatMap((group) => {
    const defaults = group.options.filter((option) => option.available && option.default);
    if (defaults.length) {
      return group.selectionType === "single" ? defaults.slice(0, 1) : defaults.slice(0, group.maxSelections);
    }

    if (group.required && group.minSelections > 0) {
      return group.options.filter((option) => option.available).slice(0, group.minSelections);
    }

    return [];
  });
}

export function validateModifierSelections(item: MenuItem, selected: ModifierOption[]) {
  const errors: string[] = [];

  for (const group of item.modifierGroups) {
    const groupSelected = selected.filter((option) => group.options.some((groupOption) => groupOption.id === option.id));
    const availableSelected = groupSelected.filter((option) => option.available);

    if (availableSelected.length < group.minSelections) {
      errors.push(`${group.id}:min`);
    }

    if (availableSelected.length > group.maxSelections) {
      errors.push(`${group.id}:max`);
    }

    if (group.selectionType === "single" && availableSelected.length > 1) {
      errors.push(`${group.id}:single`);
    }
  }

  return errors;
}

export function toggleModifierOption(
  group: ModifierGroup,
  selected: ModifierOption[],
  option: ModifierOption,
): ModifierOption[] {
  if (!option.available) {
    return selected;
  }

  const groupOptionIds = new Set(group.options.map((groupOption) => groupOption.id));
  const outsideGroup = selected.filter((selectedOption) => !groupOptionIds.has(selectedOption.id));
  const insideGroup = selected.filter((selectedOption) => groupOptionIds.has(selectedOption.id));

  if (group.selectionType === "single") {
    return insideGroup.some((selectedOption) => selectedOption.id === option.id)
      ? outsideGroup
      : [...outsideGroup, option];
  }

  if (insideGroup.some((selectedOption) => selectedOption.id === option.id)) {
    return [...outsideGroup, ...insideGroup.filter((selectedOption) => selectedOption.id !== option.id)];
  }

  if (insideGroup.length >= group.maxSelections) {
    return [...outsideGroup, ...insideGroup.slice(1), option];
  }

  return [...outsideGroup, ...insideGroup, option];
}
