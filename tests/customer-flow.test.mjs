import test from "node:test";
import assert from "node:assert/strict";

const storage = new Map();
global.window = {
  localStorage: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  },
  setTimeout,
};

const { calculateCartTotals } = await import("../lib/cart-math.ts");
const { getDirection, dictionaries } = await import("../lib/i18n.ts");
const { defaultModifiersForItem, toggleModifierOption, validateModifierSelections } = await import("../lib/modifiers.ts");
const { mockItems } = await import("../data/mock-menu.ts");
const { getMenuPageData } = await import("../services/menu-service.ts");
const { submitMockOrder, submitServiceRequest, submitBillRequest } = await import("../services/client-order-service.ts");

test("resolves the valid restaurant and table context", async () => {
  const data = await getMenuPageData("brunch-cafe", "T12");
  assert.equal(data.restaurant.slug, "brunch-cafe");
  assert.equal(data.table.code, "T12");
  assert.equal(data.session.id, "session_brunch-cafe_T12");
});

test("returns invalid QR state for unknown table", async () => {
  const data = await getMenuPageData("brunch-cafe", "T99");
  assert.equal(data, null);
});

test("cart calculations include variant, modifiers, service charge and tax", () => {
  const item = mockItems.find((candidate) => candidate.id === "classic-smash-burger");
  const modifiers = defaultModifiersForItem(item);
  const cart = {
    restaurantSlug: "brunch-cafe",
    sessionId: "session_brunch-cafe_T12",
    tableCode: "T12",
    serviceChargeRate: 0.05,
    taxRate: 0.02,
    items: [{
      lineId: "line",
      itemId: item.id,
      name: item.name,
      unitPrice: item.price,
      quantity: 2,
      imageUrl: item.imageUrl,
      variant: item.variants.find((variant) => variant.default),
      modifiers,
      available: true,
    }],
  };
  const totals = calculateCartTotals(cart);
  assert.equal(totals.itemCount, 2);
  assert.equal(totals.subtotal, 75);
  assert.equal(Number(totals.total.toFixed(2)), 80.25);
});

test("required modifier validation blocks empty required groups", () => {
  const item = mockItems.find((candidate) => candidate.id === "classic-smash-burger");
  assert.ok(validateModifierSelections(item, []).length > 0);
  assert.equal(validateModifierSelections(item, defaultModifiersForItem(item)).length, 0);
});

test("cart-line editing can switch a single-select modifier", () => {
  const item = mockItems.find((candidate) => candidate.id === "classic-smash-burger");
  const group = item.modifierGroups[0];
  const selected = defaultModifiersForItem(item);
  const next = toggleModifierOption(group, selected, group.options[1]);
  assert.equal(next.length, 1);
  assert.equal(next[0].id, group.options[1].id);
});

test("search and filters find spicy vegetarian pasta", () => {
  const result = mockItems.filter((item) => {
    const text = `${item.name.en} ${item.shortDescription.en}`.toLowerCase();
    return text.includes("penne") && item.vegetarian && item.spicyLevel > 0 && !item.allergens.includes("Dairy");
  });
  assert.deepEqual(result.map((item) => item.id), ["arrabbiata-penne"]);
});

test("mock order success and failure", async () => {
  const item = mockItems[0];
  const cartItem = {
    lineId: "line",
    itemId: item.id,
    name: item.name,
    unitPrice: item.price,
    quantity: 1,
    imageUrl: item.imageUrl,
    modifiers: [],
    available: true,
  };
  const order = await submitMockOrder({
    sessionId: "session_brunch-cafe_T12",
    tableCode: "T12",
    items: [cartItem],
    subtotal: 24,
    serviceCharge: 1.2,
    tax: 0.48,
    total: 25.68,
  });
  assert.equal(order.status, "submitted");
  await assert.rejects(() => submitMockOrder({ ...order, items: [] }));
});

test("duplicate waiter and bill requests are prevented", async () => {
  storage.clear();
  await submitServiceRequest("session_brunch-cafe_T12", "T12", "water");
  await assert.rejects(() => submitServiceRequest("session_brunch-cafe_T12", "T12", "water"));

  await submitBillRequest("session_brunch-cafe_T12", "T12", 42);
  await assert.rejects(() => submitBillRequest("session_brunch-cafe_T12", "T12", 42));
});

test("locale switching and RTL output are available", () => {
  assert.equal(getDirection("ar"), "rtl");
  assert.equal(getDirection("en"), "ltr");
  assert.equal(dictionaries.ar.checkout, "مراجعة الطلب");
});
