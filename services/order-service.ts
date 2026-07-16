import { orderRepository } from "@/repositories/order-repository";
import type { Order } from "@/types/domain";

export async function getLatestOrder(sessionId: string, tableCode: string): Promise<Order> {
  return orderRepository.getLatestOrder(sessionId, tableCode);
}
