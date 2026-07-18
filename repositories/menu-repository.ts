import { mockBranch, mockMenu, mockRestaurant, mockTables } from "@/data/mock-menu";
import type { MenuItem, MenuPageData } from "@/types/domain";

export interface MenuRepository {
  getMenuPageData(restaurantSlug: string, tableCode: string): Promise<MenuPageData | null>;
  getMenuItem(restaurantSlug: string, itemId: string): Promise<MenuItem | null>;
}

export class MockMenuRepository implements MenuRepository {
  async getMenuPageData(restaurantSlug: string, tableCode: string): Promise<MenuPageData | null> {
    if (restaurantSlug !== mockRestaurant.slug) {
      return null;
    }

    const normalizedTableCode = tableCode.toUpperCase();
    const matchedTable = mockTables.find((table) => table.code === normalizedTableCode && table.active !== false);
    if (!matchedTable) {
      return null;
    }

    const table = {
      ...matchedTable,
      code: normalizedTableCode,
      number: normalizedTableCode.replace(/^T/i, "") || matchedTable.number,
    };

    return {
      restaurant: mockRestaurant,
      branch: mockBranch,
      table,
      session: {
        id: `session_${mockRestaurant.slug}_${normalizedTableCode}`,
        restaurantId: mockRestaurant.id,
        branchId: mockBranch.id,
        tableId: table.id,
        tableCode: normalizedTableCode,
        startedAt: new Date().toISOString(),
        activeMenuId: mockMenu.id,
      },
      menu: mockMenu,
    };
  }

  async getMenuItem(restaurantSlug: string, itemId: string): Promise<MenuItem | null> {
    if (restaurantSlug !== mockRestaurant.slug) {
      return null;
    }

    return mockMenu.items.find((item) => item.id === itemId) ?? null;
  }
}

export const menuRepository = new MockMenuRepository();
