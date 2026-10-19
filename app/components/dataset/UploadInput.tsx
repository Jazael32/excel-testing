// components/dataset/UploadInput.tsx
'use client';

import { useDataset } from './DatasetProvider';

export function UploadInput() {
  const { onFileChange } = useDataset();
  return (
    <input
      type="file"
      accept=".xlsx, .xls, .csv"
      onChange={onFileChange}
      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
    />
  );
}