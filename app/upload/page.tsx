'use client';

import { useState } from 'react';
import { parseExcelAdvanced } from '../lib/excelParserAdvanced';

export default function ExcelUploadPage() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [headerName, setHeaderName] = useState<string>('');
  const [file, setFile] = useState<File>();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFile(file);
  }

  const handleFileSubmit = async () => {
    if (file) {
      setFileName(file.name);
      setLoading(true);

      try {
        // Call our handler function
        const result = await parseExcelAdvanced(file, '', headerName, headerName);

        setHeaders(result.headers);
        setData(result.data);
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Failed to parse the Excel file. Please check the format.');
      } finally {
        setLoading(false);
      }
    }
    return
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload Spreadsheet</h1>

      {/* File Input */}
      <input
        type="file"
        accept=".xlsx, .xls, .csv"
        onChange={handleFileUpload}
        className="mb-6 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
      />

      <input
        type="text"
        onChange={(e) => setHeaderName(e.target.value)}
        className='bg-white text-black font-bold'
        placeholder='Table Header Name'
      />

      {
        file ?
          <button onClick={handleFileSubmit}>
            Renderizar archivo
          </button>
          :
          ''
      }


      {loading && <p>Parsing spreadsheet...</p>}

      {/* Dynamic Table Preview */}
      {data.length > 0 && (
        <div className="overflow-x-auto border rounded-lg shadow-sm">
          <p className="p-4 bg-slate-50 font-medium border-b">Previewing: {fileName} ({data.length} rows)</p>
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                {headers.map((header) => (
                  <th key={header} className="px-4 py-3 font-semibold text-slate-700">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {data.slice(0, 10).map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-slate-50">
                  {headers.map((header) => (
                    <td key={header} className="px-4 py-3 text-slate-600">
                      {row[header]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {data.length > 10 && (
            <div className="p-3 text-xs text-slate-400 text-center bg-slate-50"><p>Showing first 10 rows of {data.length}</p></div>
          )}
        </div>
      )}
    </div>
  );
}