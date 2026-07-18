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
  name?: LocalizedString;
  area?: LocalizedString;
  status?: "available" | "occupied" | "order_active" | "bill_requested" | "payment_pending" | "paid" | "cleaning" | "closed";
  active?: boolean;
  qrGeneratedAt?: string;
  qrPrintedAt?: string;
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
  plateSize?: LocalizedString;
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
  required: boolean;
  selectionType: "single" | "multi";
  minSelections: number;
  maxSelections: number;
  options: ModifierOption[];
}

export interface ModifierOption {
  id: string;
  name: LocalizedString;
  priceDelta: number;
  available: boolean;
  default?: boolean;
}

export interface ThreeDAsset {
  id: string;
  enabled?: boolean;
  glbUrl?: string;
  viewerUrl?: string;
  usdzUrl?: string;
  posterUrl?: string;
  posterImageUrl: string;
  attribution?: string;
  scaleHint?: string;
  arScale?: "fixed" | "auto";
  arPlacement?: "floor" | "wall";
  realWorldWidthMeters?: number;
  realWorldHeightMeters?: number;
  status?: "ready" | "processing" | "coming_soon" | "error";
  source?: string;
  scaleCorrection?: string;
}

export interface FeatureFlags {
  threeDEnabled: boolean;
  arEnabled: boolean;
}

export interface Cart {
  restaurantSlug: string;
  sessionId: string;
  tableCode: string;
  items: CartItem[];
  serviceChargeRate: number;
  taxRate: number;
  submittedOrderId?: string;
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
  orderNumber: string;
  sessionId: string;
  tableCode: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  serviceCharge: number;
  tax: number;
  total: number;
  submittedAt: string;
  estimatedResponseMinutes: number;
  estimatedPreparationMinutes?: number;
  restaurantMessage: LocalizedString;
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

export interface SubmitOrderInput {
  sessionId: string;
  tableCode: string;
  items: CartItem[];
  subtotal: number;
  serviceCharge: number;
  tax: number;
  total: number;
  tableNote?: string;
}

export interface ServiceRequest {
  id: string;
  sessionId: string;
  tableCode: string;
  type: "general" | "water" | "cutlery" | "issue";
  note?: string;
  createdAt: string;
}

export interface BillRequest {
  id: string;
  sessionId: string;
  tableCode: string;
  total: number;
  createdAt: string;
}

export type QrTemplateLanguage = "en" | "ar" | "both";
export type QrTemplateUnit = "mm" | "cm";
export type QrTemplateOrientation = "portrait" | "landscape";

export interface QrTemplateSettings {
  id: string;
  restaurantId: string;
  templateName: string;
  logoUrl: string;
  restaurantName: LocalizedString;
  slogan: LocalizedString;
  heading: LocalizedString;
  instructionText: LocalizedString;
  footerText: LocalizedString;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderStyle: "solid" | "dashed" | "double" | "none";
  qrColor: string;
  fontFamily: string;
  language: QrTemplateLanguage;
  orientation: QrTemplateOrientation;
  width: number;
  height: number;
  unit: QrTemplateUnit;
  showMenuFeature: boolean;
  showOrderFeature: boolean;
  showWaiterFeature: boolean;
  showBillFeature: boolean;
  showFeedbackFeature: boolean;
  showOffersFeature: boolean;
  isDefault: boolean;
}
