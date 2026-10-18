'use client';

import { useEffect, useState } from 'react';
import { parseExcelAdvanced } from '../lib/excelParserAdvanced';
import { ExcelDataGrid } from '../components/tables/ExcelDataGrid';
import {
  saveDataset,
  getDataset,
  listDatasets,
  deleteDataset,
} from '../actions/datasets' // ajusta la ruta según dónde guardaste las actions

type SavedItem = { id: number; name: string; updatedAt: number };

export default function UploadPage() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [saved, setSaved] = useState<SavedItem[]>([]);

  const refreshSaved = async () => {
    try {
      setSaved(await listDatasets());
    } catch (err) {
      console.error('Error loading saved datasets', err);
    }
  };

  useEffect(() => {
    refreshSaved();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      // Call your advanced handler (searching for a header keyword & stopping on empty cells)
      const result = await parseExcelAdvanced(file, undefined, 'C.A.', 'C.A.');

      // La tabla se muestra de inmediato, igual que antes
      setHeaders(result.headers);
      setData(result.data);
      setCurrentId(null);

      // Y se guarda en la base de datos
      try {
        const { id } = await saveDataset(file.name, result.headers, result.data);
        setCurrentId(id);
        await refreshSaved();
      } catch (saveErr) {
        console.error(saveErr);
        alert('The file was parsed, but it could not be saved to the database.');
      }
    } catch (err) {
      console.error(err);
      alert('Error parsing Excel file.');
    } finally {
      setLoading(false);
      e.target.value = ''; // permite volver a subir el mismo archivo
    }
  };

  const handleOpen = async (id: number) => {
    setLoading(true);
    try {
      const dataset = await getDataset(id);
      if (!dataset) {
        alert('Dataset not found.');
        await refreshSaved();
        return;
      }
      setHeaders(dataset.columns as string[]);
      setData(dataset.rows as Record<string, any>[]);
      setCurrentId(dataset.id);
    } catch (err) {
      console.error(err);
      alert('Error loading the saved table.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this saved table?')) return;
    try {
      await deleteDataset(id);
      if (id === currentId) {
        setHeaders([]);
        setData([]);
        setCurrentId(null);
      }
      await refreshSaved();
    } catch (err) {
      console.error(err);
      alert('Error deleting the table.');
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
                  onClick={() => handleOpen(item.id)}
                  className="text-left hover:underline"
                >
                  {item.name}
                  <span className="ml-3 text-xs text-slate-400">
                    {new Date(item.updatedAt).toLocaleString()}
                  </span>
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
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