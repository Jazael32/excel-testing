'use client';

import { ExcelDataGrid } from '../components/tables/ExcelDataGrid';
import { useDatasetWorkspace } from '../hooks/useDatasetWorkspace';

export default function UploadPage() {
  const {
    headers,
    data,
    currentId,
    saved,
    loading,
    error,
    onFileChange,
    openDataset,
    removeDataset,
  } = useDatasetWorkspace();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Upload & Map Spreadsheet</h1>

      <input
        type="file"
        accept=".xlsx, .xls, .csv"
        onChange={onFileChange}
        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
      />

      {loading && <p className="text-sm text-slate-500 animate-pulse">Processing file...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Saved tables */}
      {saved.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Saved tables
          </h2>
          <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200">
            {saved.map((item) => (
              <li
                key={item.id}
                className={`flex items-center justify-between px-4 py-2 text-sm ${item.id === currentId ? 'bg-violet-50' : ''
                  }`}
              >
                <button
                  onClick={() => openDataset(item.id)}
                  className="text-left hover:underline"
                >
                  {item.name}
                  <span className="ml-3 text-xs text-slate-400">
                    {new Date(item.updatedAt).toLocaleString()}
                  </span>
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this saved table?')) removeDataset(item.id);
                  }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Render Headless Data Grid once data is parsed */}
      {data.length > 0 && (
        <ExcelDataGrid key={currentId ?? 'new'} headers={headers} data={data} />
      )}
    </div>
  );
}