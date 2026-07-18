import { notFound } from "next/navigation";
import { MenuExperience } from "@/components/menu/menu-experience";
import { getMenuPageData } from "@/services/menu-service";
import { getTableStaticParams } from "@/lib/static-params";

export function generateStaticParams() {
  return getTableStaticParams();
}

interface MenuPageProps {
  params: Promise<{
    restaurantSlug: string;
    tableCode: string;
  }>;
}

export default async function MenuPage({ params }: MenuPageProps) {
  const { restaurantSlug, tableCode } = await params;
  const data = await getMenuPageData(restaurantSlug, tableCode);

  if (!data) {
    notFound();
  }

  return <MenuExperience data={data} />;
}
