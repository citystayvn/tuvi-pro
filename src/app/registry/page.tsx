import type { Metadata } from "next";
import { PageHeader } from "@/components/AppShell";
import { RegistryTable } from "@/components/RegistryTable";

export const metadata: Metadata = { title: "Danh mục sao" };

export default function RegistryPage() {
  return (
    <div>
      <PageHeader title="Danh mục sao" description="Xem và khai báo đặc điểm, ý nghĩa tại từng cung của mọi sao. Nội dung sửa ở đây dùng luôn trên lá số." />
      <div className="p-3 md:p-8">
        <RegistryTable />
      </div>
    </div>
  );
}
