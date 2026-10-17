'use client';

import { useState } from 'react';
import { parseExcelAdvanced } from '../lib/excelParserAdvanced';
import { ExcelDataGrid } from '../components/tables/ExcelDataGrid';

export default function UploadPage() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      // Call your advanced handler (searching for a header keyword & stopping on empty cells)
      const result = await parseExcelAdvanced(file, undefined, 'C.A.', 'C.A.');

      setHeaders(result.headers);
      setData(result.data);
    } catch (err) {
      console.error(err);
      alert('Error parsing Excel file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Upload & Map Spreadsheet</h1>

      <input
        type="file"
        accept=".xlsx, .xls, .csv"
        onChange={handleFileUpload}
        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
      />

      {loading && <p className="text-sm text-slate-500 animate-pulse">Processing file...</p>}

      {/* Render Headless Data Grid once data is parsed */}
      {data.length > 0 && <ExcelDataGrid headers={headers} data={data} />}
    </div>
  );
}