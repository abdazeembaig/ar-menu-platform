import type { Order, OrderStatus } from "@/types/domain";

export interface OrderRepository {
  getLatestOrder(sessionId: string, tableCode: string): Promise<Order>;
}

const timelineStatuses: OrderStatus[] = [
  "submitted",
  "confirmed",
  "preparing",
  "ready",
  "served",
  "bill_requested",
  "closed",
];

export class MockOrderRepository implements OrderRepository {
  async getLatestOrder(sessionId: string, tableCode: string): Promise<Order> {
    const now = new Date();
    const timeline = timelineStatuses.map((status, index) => {
      const at = new Date(now.getTime() - (timelineStatuses.length - index) * 6 * 60_000);
      const completed = index <= 2;

      return {
        status,
        at: at.toISOString(),
        completed,
        label: orderStatusLabel(status),
        description: orderStatusDescription(status),
      };
    });

    return {
      id: `order_${sessionId}`,
      sessionId,
      tableCode,
      status: "preparing",
      items: [],
      subtotal: 0,
      serviceCharge: 0,
      tax: 0,
      total: 0,
      timeline,
    };
  }
}

function orderStatusLabel(status: OrderStatus) {
  const labels: Record<OrderStatus, { en: string; ar: string }> = {
    draft: { en: "Draft", ar: "مسودة" },
    submitted: { en: "Submitted", ar: "تم الإرسال" },
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
    submitted: { en: "The kitchen received your request.", ar: "استلم المطبخ طلبك." },
    confirmed: { en: "A team member confirmed the order.", ar: "أكد أحد أعضاء الفريق الطلب." },
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

export const orderRepository = new MockOrderRepository();
