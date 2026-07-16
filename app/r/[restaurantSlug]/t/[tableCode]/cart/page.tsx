import { notFound } from "next/navigation";
import { CartPage } from "@/components/cart/cart-page";
import { getMenuPageData } from "@/services/menu-service";

interface CartRouteProps {
  params: Promise<{
    restaurantSlug: string;
    tableCode: string;
  }>;
}

export default async function CartRoute({ params }: CartRouteProps) {
  const { restaurantSlug, tableCode } = await params;
  const data = await getMenuPageData(restaurantSlug, tableCode);

  if (!data) {
    notFound();
  }

  return <CartPage data={data} />;
}
