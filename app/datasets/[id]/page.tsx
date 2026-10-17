// app/datasets/[id]/page.tsx
import { notFound } from "next/navigation";
import { getDataset } from "@/app/actions/datasets";
import { ExcelDataGrid } from "@/app/components/tables/ExcelDataGrid";

export default async function DatasetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = Number(id);
  if (Number.isNaN(numericId)) notFound();

  const dataset = await getDataset(numericId);
  if (!dataset) notFound();

  return (
    <ExcelDataGrid
      headers={dataset.columns as string[]}
      data={dataset.rows as Record<string, any>[]}
    />
  );
}