import { notFound } from "next/navigation";
import { CheckoutPage } from "@/components/checkout/checkout-page";
import { getMenuPageData } from "@/services/menu-service";
import { getTableStaticParams } from "@/lib/static-params";

export function generateStaticParams() {
  return getTableStaticParams();
}

interface CheckoutRouteProps {
  params: Promise<{
    restaurantSlug: string;
    tableCode: string;
  }>;
}

export default async function CheckoutRoute({ params }: CheckoutRouteProps) {
  const { restaurantSlug, tableCode } = await params;
  const data = await getMenuPageData(restaurantSlug, tableCode);

  if (!data) {
    notFound();
  }

  return <CheckoutPage data={data} />;
}
