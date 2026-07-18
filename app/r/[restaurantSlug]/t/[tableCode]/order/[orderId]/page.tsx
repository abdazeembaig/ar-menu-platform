import { notFound } from "next/navigation";
import { OrderTrackerPage } from "@/components/order/order-tracker-page";
import { getMenuPageData } from "@/services/menu-service";
import { getDemoOrderStaticParams } from "@/lib/static-params";

export function generateStaticParams() {
  return getDemoOrderStaticParams();
}

interface OrderRouteProps {
  params: Promise<{
    restaurantSlug: string;
    tableCode: string;
    orderId: string;
  }>;
}

export default async function OrderRoute({ params }: OrderRouteProps) {
  const { restaurantSlug, tableCode, orderId } = await params;
  const data = await getMenuPageData(restaurantSlug, tableCode);

  if (!data) {
    notFound();
  }

  return <OrderTrackerPage data={data} orderId={orderId} />;
}
