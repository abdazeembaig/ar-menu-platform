import { mockItems, mockRestaurant, mockTables } from "@/data/mock-menu";

export function getTableStaticParams() {
  return mockTables
    .filter((table) => table.active !== false)
    .map((table) => ({ restaurantSlug: mockRestaurant.slug, tableCode: table.code }));
}

export function getItemStaticParams() {
  return getTableStaticParams().flatMap(({ restaurantSlug, tableCode }) =>
    mockItems.map((item) => ({ restaurantSlug, tableCode, itemId: item.id })),
  );
}

export function getDemoOrderStaticParams() {
  return getTableStaticParams().map(({ restaurantSlug, tableCode }) => ({
    restaurantSlug,
    tableCode,
    orderId: "demo-order",
  }));
}
