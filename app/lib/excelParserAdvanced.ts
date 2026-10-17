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
  const headers = rawRows[headerRowIndex]
    .map(cell => String(cell).trim())
    .filter(Boolean);

  // Find the index of the column you want to monitor (if specified)
  const stopColumnIndex = stopOnEmptyColumn ? headers.indexOf(stopOnEmptyColumn) : -1;

  // 4. Slice all rows below the header row
  const dataRows = rawRows.slice(headerRowIndex + 1);
  const data: Record<string, any>[] = [];

  // 5. Map rows and apply the "stop on empty column" rule
  for (const row of dataRows) {
    // If a stop column was provided, check if its value is empty/null/undefined
    if (stopColumnIndex !== -1) {
      const cellValue = row[stopColumnIndex];
      // If the cell is empty, blank string, or undefined, STOP completely
      if (cellValue === undefined || cellValue === null || String(cellValue).trim() === '') {
        break;
      }
    }

    // Skip entirely blank rows if no stop column triggered yet
    if (row.every(cell => cell === '' || cell == null)) {
      continue;
    }

    // Map row cells to header keys
    const obj: Record<string, any> = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] !== undefined ? row[index] : '';
    });

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