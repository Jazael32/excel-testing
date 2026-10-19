// components/dataset/DatasetGrid.tsx
'use client';

import { ExcelDataGrid } from '../tables/ExcelDataGrid';
import { useDataset } from './DatasetProvider';

export function DatasetGrid() {
  const { headers, data, currentId, editCell, deleteRows } = useDataset();

  if (data.length === 0) return null;

  return (
    <ExcelDataGrid
      key={currentId ?? 'new'}
      headers={headers}
      data={data}
      onCellEdit={editCell}
      onDeleteRows={deleteRows}
    />
  );
}