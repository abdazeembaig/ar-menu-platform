import { getText } from "@/lib/i18n";
import type { Branch, Locale, Restaurant, Table } from "@/types/domain";

interface TableContextProps {
  restaurant: Restaurant;
  branch: Branch;
  table: Table;
  locale: Locale;
  tableLabel: string;
}

export function TableContext({ restaurant, branch, table, locale, tableLabel }: TableContextProps) {
  return (
    <p className="text-sm font-extrabold text-muted">
      {getText(restaurant.name, locale)} · {getText(branch.name, locale)} · {tableLabel} {table.number}
    </p>
  );
}
