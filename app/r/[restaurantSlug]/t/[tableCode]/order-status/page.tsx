import { notFound } from "next/navigation";
import { OrderStatusPage } from "@/components/order/order-status-page";
import { getMenuPageData } from "@/services/menu-service";
import { getLatestOrder } from "@/services/order-service";
import { getTableStaticParams } from "@/lib/static-params";

export function generateStaticParams() {
  return getTableStaticParams();
}

interface OrderStatusRouteProps {
  params: Promise<{
    restaurantSlug: string;
    tableCode: string;
  }>;
}

export default async function OrderStatusRoute({ params }: OrderStatusRouteProps) {
  const { restaurantSlug, tableCode } = await params;
  const data = await getMenuPageData(restaurantSlug, tableCode);

  if (!data) {
    notFound();
  }

  const order = await getLatestOrder(data.session.id, data.table.code);

  return <OrderStatusPage data={data} order={order} />;
}
