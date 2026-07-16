import { menuRepository } from "@/repositories/menu-repository";
import type { MenuPageData, TableSession } from "@/types/domain";

export interface SessionRepository {
  getTableSession(restaurantSlug: string, tableCode: string): Promise<TableSession | null>;
  getSessionContext(restaurantSlug: string, tableCode: string): Promise<MenuPageData | null>;
}

export class MockSessionRepository implements SessionRepository {
  async getTableSession(restaurantSlug: string, tableCode: string): Promise<TableSession | null> {
    const context = await menuRepository.getMenuPageData(restaurantSlug, tableCode);
    return context?.session ?? null;
  }

  async getSessionContext(restaurantSlug: string, tableCode: string): Promise<MenuPageData | null> {
    return menuRepository.getMenuPageData(restaurantSlug, tableCode);
  }
}

export const sessionRepository = new MockSessionRepository();
