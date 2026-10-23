import type { Metadata } from "next";
import { PageHeader } from "@/components/AppShell";
import { RegistryTable } from "@/components/RegistryTable";

export const metadata: Metadata = { title: "Danh mục sao" };

export default function RegistryPage() {
  return (
    <div>
      <PageHeader title="Star Registry – Danh mục sao" description="Toàn bộ sao được hỗ trợ: quy tắc an sao, dữ liệu đầu vào, nguồn tham chiếu, trạng thái triển khai và mức kiểm chứng." />
      <div className="p-4 md:p-8">
        <RegistryTable />
      </div>
    </div>
  );
}
