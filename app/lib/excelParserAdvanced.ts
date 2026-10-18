import * as XLSX from 'xlsx';

export interface AdvancedParsedExcel {
  sheetNames: string[];
  headers: string[];
  data: Record<string, any>[];
  headerRowIndex: number;
}

export async function parseExcelAdvanced(
  file: File,
  sheetName?: string,
  headerKeyword?: string,
  stopOnEmptyColumn?: string // <--- NEW: Column name to watch for empty values
): Promise<AdvancedParsedExcel> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetNames = workbook.SheetNames;

  const targetSheetName = sheetName || sheetNames[0];
  const worksheet = workbook.Sheets[targetSheetName];

  if (!worksheet) {
    throw new Error(`Sheet "${targetSheetName}" not found.`);
  }

  // 1. Convert worksheet into a 2D array of rows
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: ''
  });

  let headerRowIndex = -1;

  // 2. Scan rows to find the headers
  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];

    if (headerKeyword) {
      const found = row.some(cell =>
        String(cell).toLowerCase().includes(headerKeyword.toLowerCase())
      );
      if (found) {
        headerRowIndex = i;
        break;
      }
    } else {
      const filledCount = row.filter(cell => cell !== '' && cell != null).length;
      if (filledCount >= 2) {
        headerRowIndex = i;
        break;
      }
    }
  }

  if (headerRowIndex === -1) {
    throw new Error('Could not automatically find a valid header row in the spreadsheet.');
  }

  // 3. Extract and clean headers
  const headerCols = rawRows[headerRowIndex]
    .map((cell, index) => ({ name: String(cell).trim(), index }))
    .filter((col) => col.name);

  const headers = headerCols.map((col) => col.name);

  const stopColumnIndex = stopOnEmptyColumn
    ? (headerCols.find((col) => col.name === stopOnEmptyColumn)?.index ?? -1)
    : -1;

  // 4. Slice all rows below the header row
  const dataRows = rawRows.slice(headerRowIndex + 1);
  const data: Record<string, any>[] = [];

  // 5. Map row cells using the original index
  for (const row of dataRows) {
    if (stopColumnIndex !== -1) {
      const cellValue = row[stopColumnIndex];
      if (cellValue === undefined || cellValue === null || String(cellValue).trim() === '') {
        break;
      }
    }

    // Skip entirely blank rows
    if (row.every((cell) => cell === '' || cell == null)) {
      continue;
    }

    // Map row cells using the original index
    const obj: Record<string, any> = {};
    for (const { name, index } of headerCols) {
      const value = row[index];
      obj[name] = value instanceof Date ? value.toISOString() : (value ?? '');
    }

    data.push(obj);
  }
  console.log(data);

  return {
    sheetNames,
    headers,
    data,
    headerRowIndex
  };
}