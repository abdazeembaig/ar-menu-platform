import { sessionRepository } from "@/repositories/session-repository";
import type { MenuPageData, TableSession } from "@/types/domain";

export async function getTableSession(
  restaurantSlug: string,
  tableCode: string,
): Promise<TableSession | null> {
  return sessionRepository.getTableSession(restaurantSlug, tableCode);
}

export async function getSessionContext(
  restaurantSlug: string,
  tableCode: string,
): Promise<MenuPageData | null> {
  return sessionRepository.getSessionContext(restaurantSlug, tableCode);
}
