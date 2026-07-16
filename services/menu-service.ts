import { menuRepository } from "@/repositories/menu-repository";
import type { MenuItem, MenuPageData } from "@/types/domain";

export async function getMenuPageData(
  restaurantSlug: string,
  tableCode: string,
): Promise<MenuPageData | null> {
  return menuRepository.getMenuPageData(restaurantSlug, tableCode);
}

export async function getMenuItem(
  restaurantSlug: string,
  itemId: string,
): Promise<MenuItem | null> {
  return menuRepository.getMenuItem(restaurantSlug, itemId);
}
