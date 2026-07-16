export type Locale = "en" | "ar";

export type LocalizedString = Record<Locale, string>;

export type OrderStatus =
  | "draft"
  | "submitted"
  | "confirmed"
  | "preparing"
  | "ready"
  | "served"
  | "bill_requested"
  | "closed"
  | "rejected"
  | "cancelled";

export interface ThemeTokens {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  radius: string;
  fontFamily: string;
  spacingUnit: string;
}

export interface Restaurant {
  id: string;
  slug: string;
  name: LocalizedString;
  logoUrl: string;
  coverImageUrl: string;
  currency: "LYD";
  theme: ThemeTokens;
  featureFlags: FeatureFlags;
}

export interface Branch {
  id: string;
  restaurantId: string;
  name: LocalizedString;
  address: LocalizedString;
  isOpen: boolean;
  serviceChargeRate: number;
  taxRate: number;
}

export interface Table {
  id: string;
  branchId: string;
  code: string;
  number: string;
}

export interface TableSession {
  id: string;
  restaurantId: string;
  branchId: string;
  tableId: string;
  tableCode: string;
  startedAt: string;
  activeMenuId: string;
}

export interface Menu {
  id: string;
  restaurantId: string;
  branchId: string;
  name: LocalizedString;
  activeFrom: string;
  categories: Category[];
  items: MenuItem[];
}

export interface Category {
  id: string;
  slug: string;
  name: LocalizedString;
  description: LocalizedString;
  sortOrder: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: LocalizedString;
  shortDescription: LocalizedString;
  description: LocalizedString;
  ingredients: LocalizedString[];
  price: number;
  imageUrl: string;
  imageAlt: LocalizedString;
  available: boolean;
  featured: boolean;
  vegetarian: boolean;
  spicyLevel: 0 | 1 | 2 | 3;
  allergens: string[];
  preparationTimeMinutes: number;
  calories?: number;
  portion: LocalizedString;
  has3DModel: boolean;
  hasAR: boolean;
  threeDAsset?: ThreeDAsset;
  variants: ItemVariant[];
  modifierGroups: ModifierGroup[];
}

export interface ItemVariant {
  id: string;
  name: LocalizedString;
  priceDelta: number;
  default?: boolean;
}

export interface ModifierGroup {
  id: string;
  name: LocalizedString;
  minSelections: number;
  maxSelections: number;
  options: ModifierOption[];
}

export interface ModifierOption {
  id: string;
  name: LocalizedString;
  priceDelta: number;
  available: boolean;
}

export interface ThreeDAsset {
  id: string;
  glbUrl?: string;
  usdzUrl?: string;
  posterImageUrl: string;
  attribution?: string;
  scaleHint?: string;
}

export interface FeatureFlags {
  threeDEnabled: boolean;
  arEnabled: boolean;
}

export interface Cart {
  sessionId: string;
  tableCode: string;
  items: CartItem[];
  serviceChargeRate: number;
  taxRate: number;
}

export interface CartItem {
  lineId: string;
  itemId: string;
  name: LocalizedString;
  unitPrice: number;
  quantity: number;
  imageUrl: string;
  variant?: ItemVariant;
  modifiers: ModifierOption[];
  specialInstructions?: string;
  available: boolean;
}

export interface OrderItem extends CartItem {
  status: OrderStatus;
}

export interface Order {
  id: string;
  sessionId: string;
  tableCode: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  serviceCharge: number;
  tax: number;
  total: number;
  timeline: OrderTimelineEvent[];
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  at: string;
  label: LocalizedString;
  description: LocalizedString;
  completed: boolean;
}

export interface MenuPageData {
  restaurant: Restaurant;
  branch: Branch;
  table: Table;
  session: TableSession;
  menu: Menu;
}
