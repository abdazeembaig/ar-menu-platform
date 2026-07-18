import { QrCodeManagement } from "@/components/admin/qr-code-management";
import { defaultQrTemplate, mockRestaurant, mockTables } from "@/data/mock-menu";

export default function AdminTableQrCodesPage() {
  return (
    <QrCodeManagement
      restaurant={mockRestaurant}
      tables={mockTables}
      defaultTemplate={defaultQrTemplate}
    />
  );
}
