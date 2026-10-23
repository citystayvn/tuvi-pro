import type { Metadata } from "next";
import { PageHeader } from "@/components/AppShell";
import { RegistryTable } from "@/components/RegistryTable";

export const metadata: Metadata = { title: "Danh mục sao" };

export default function RegistryPage() {
  return (
    <div>
      <PageHeader title="Danh mục sao" description="Các sao được hỗ trợ: nhóm sao, ngũ hành, dữ liệu đầu vào và cách an sao." />
      <div className="p-4 md:p-8">
        <RegistryTable />
      </div>
    </div>
  );
}
