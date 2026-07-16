import type { BillRequest, CartItem, Order, OrderStatus, ServiceRequest, SubmitOrderInput } from "@/types/domain";

const orderStoragePrefix = "ar-menu-order:";
const waiterCooldownPrefix = "ar-menu-waiter:";
const billRequestPrefix = "ar-menu-bill:";

const timelineStatuses: OrderStatus[] = [
  "submitted",
  "confirmed",
  "preparing",
  "ready",
  "served",
  "bill_requested",
  "closed",
];

export async function submitMockOrder(input: SubmitOrderInput, options?: { fail?: boolean }): Promise<Order> {
  await delay(650);

  if (options?.fail || !input.items.length) {
    throw new Error("mock-order-failed");
  }

  const submittedAt = new Date().toISOString();
  const id = "demo-order";
  const order: Order = {
    id,
    orderNumber: `BC-${new Date().getFullYear()}-1024`,
    sessionId: input.sessionId,
    tableCode: input.tableCode,
    status: "submitted",
    items: input.items.map((item) => ({ ...item, status: "submitted" })),
    subtotal: input.subtotal,
    serviceCharge: input.serviceCharge,
    tax: input.tax,
    total: input.total,
    submittedAt,
    estimatedResponseMinutes: 3,
    estimatedPreparationMinutes: 18,
    restaurantMessage: {
      en: "Awaiting restaurant confirmation. A team member will review the order shortly.",
      ar: "بانتظار تأكيد المطعم. سيراجع أحد أعضاء الفريق الطلب قريباً.",
    },
    timeline: createTimeline(submittedAt, "submitted"),
  };

  window.localStorage.setItem(`${orderStoragePrefix}${input.sessionId}:${id}`, JSON.stringify(order));
  return order;
}

export function getStoredMockOrder(sessionId: string, orderId: string): Order | null {
  const stored = window.localStorage.getItem(`${orderStoragePrefix}${sessionId}:${orderId}`);
  if (!stored) {
    return null;
  }

  try {
    const order = JSON.parse(stored) as Order;
    return {
      ...order,
      status: deriveMockStatus(order.submittedAt),
      timeline: createTimeline(order.submittedAt, deriveMockStatus(order.submittedAt)),
    };
  } catch {
    window.localStorage.removeItem(`${orderStoragePrefix}${sessionId}:${orderId}`);
    return null;
  }
}

export async function submitServiceRequest(
  sessionId: string,
  tableCode: string,
  type: ServiceRequest["type"],
  note?: string,
  options?: { fail?: boolean },
): Promise<ServiceRequest> {
  await delay(450);
  const key = `${waiterCooldownPrefix}${sessionId}`;
  const previous = Number(window.localStorage.getItem(key) ?? "0");
  if (Date.now() - previous < 30_000) {
    throw new Error("duplicate-waiter-request");
  }
  if (options?.fail) {
    throw new Error("waiter-request-failed");
  }

  const request = {
    id: `waiter-${Date.now()}`,
    sessionId,
    tableCode,
    type,
    note,
    createdAt: new Date().toISOString(),
  };
  window.localStorage.setItem(key, String(Date.now()));
  return request;
}

export async function submitBillRequest(
  sessionId: string,
  tableCode: string,
  total: number,
  options?: { fail?: boolean },
): Promise<BillRequest> {
  await delay(450);
  const key = `${billRequestPrefix}${sessionId}`;
  if (window.localStorage.getItem(key)) {
    throw new Error("duplicate-bill-request");
  }
  if (options?.fail) {
    throw new Error("bill-request-failed");
  }

  const request = {
    id: `bill-${Date.now()}`,
    sessionId,
    tableCode,
    total,
    createdAt: new Date().toISOString(),
  };
  window.localStorage.setItem(key, JSON.stringify(request));
  return request;
}

export function validateOrderItems(items: CartItem[]) {
  return items.length > 0 && items.every((item) => item.available && item.quantity > 0);
}

function createTimeline(submittedAt: string, currentStatus: OrderStatus) {
  const currentIndex = timelineStatuses.indexOf(currentStatus);
  const start = new Date(submittedAt).getTime();

  return timelineStatuses.map((status, index) => ({
    status,
    at: new Date(start + index * 5 * 60_000).toISOString(),
    completed: index <= currentIndex,
    label: orderStatusLabel(status),
    description: orderStatusDescription(status),
  }));
}

function deriveMockStatus(submittedAt: string): OrderStatus {
  const elapsedMinutes = Math.floor((Date.now() - new Date(submittedAt).getTime()) / 60_000);
  if (elapsedMinutes >= 28) return "served";
  if (elapsedMinutes >= 22) return "ready";
  if (elapsedMinutes >= 8) return "preparing";
  if (elapsedMinutes >= 3) return "confirmed";
  return "submitted";
}

function orderStatusLabel(status: OrderStatus) {
  const labels: Record<OrderStatus, { en: string; ar: string }> = {
    draft: { en: "Draft", ar: "مسودة" },
    submitted: { en: "Awaiting restaurant confirmation", ar: "بانتظار تأكيد المطعم" },
    confirmed: { en: "Confirmed", ar: "تم التأكيد" },
    preparing: { en: "Preparing", ar: "قيد التحضير" },
    ready: { en: "Ready", ar: "جاهز" },
    served: { en: "Served", ar: "تم التقديم" },
    bill_requested: { en: "Bill requested", ar: "تم طلب الفاتورة" },
    closed: { en: "Closed", ar: "مغلق" },
    rejected: { en: "Rejected", ar: "مرفوض" },
    cancelled: { en: "Cancelled", ar: "ملغي" },
  };
  return labels[status];
}

function orderStatusDescription(status: OrderStatus) {
  const descriptions: Record<OrderStatus, { en: string; ar: string }> = {
    draft: { en: "Your order is still being edited.", ar: "طلبك ما زال قيد التعديل." },
    submitted: { en: "The restaurant has not confirmed this order yet.", ar: "لم يؤكد المطعم هذا الطلب بعد." },
    confirmed: { en: "The restaurant confirmed the order.", ar: "أكد المطعم الطلب." },
    preparing: { en: "The kitchen is preparing your dishes.", ar: "المطبخ يحضر أطباقك الآن." },
    ready: { en: "Your order is ready to serve.", ar: "طلبك جاهز للتقديم." },
    served: { en: "The order was delivered to your table.", ar: "تم تقديم الطلب إلى طاولتك." },
    bill_requested: { en: "A team member will bring the bill.", ar: "سيحضر أحد أعضاء الفريق الفاتورة." },
    closed: { en: "The table session is complete.", ar: "اكتملت جلسة الطاولة." },
    rejected: { en: "The restaurant could not accept this order.", ar: "لم يتمكن المطعم من قبول هذا الطلب." },
    cancelled: { en: "This order was cancelled.", ar: "تم إلغاء هذا الطلب." },
  };
  return descriptions[status];
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
