// app/datasets/[id]/page.tsx
import { Suspense } from 'react';
import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import { getDataset } from '@/app/actions/datasets';
import { ExcelDataGrid } from '@/app/components/tables/ExcelDataGrid'; // ajusta la ruta a la tuya

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function DatasetContent({ params }: { params: Promise<{ id: string }> }) {
  await connection(); // marca este componente como "por petición"

  const { id } = await params;
  if (!UUID_REGEX.test(id)) notFound();

  const dataset = await getDataset(id);
  if (!dataset) notFound();

  return (
    <ExcelDataGrid
      headers={dataset.columns as string[]}
      data={dataset.rows as Record<string, any>[]}
    />
  );
}

export default function DatasetPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Suspense fallback={<p className="text-sm text-slate-500 animate-pulse">Loading table...</p>}>
        <DatasetContent params={params} />
      </Suspense>
    </div>
  );
}