import { notFound } from "next/navigation";
import { ItemDetail } from "@/components/menu/item-detail";
import { getItemStaticParams } from "@/lib/static-params";
import { getMenuItem, getMenuPageData } from "@/services/menu-service";

export function generateStaticParams() {
  return getItemStaticParams();
}

interface ItemPageProps {
  params: Promise<{
    restaurantSlug: string;
    tableCode: string;
    itemId: string;
  }>;
}

export default async function ItemPage({ params }: ItemPageProps) {
  const { restaurantSlug, tableCode, itemId } = await params;
  const [data, item] = await Promise.all([
    getMenuPageData(restaurantSlug, tableCode),
    getMenuItem(restaurantSlug, itemId),
  ]);

  if (!data || !item) {
    notFound();
  }

  return <ItemDetail data={data} item={item} />;
}
