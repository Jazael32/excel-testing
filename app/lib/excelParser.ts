import * as XLSX from 'xlsx';

export interface ParsedExcelData {
  sheetNames: string[];
  headers: string[];
  data: Record<string, any>[];
}

/**
 * Reads an uploaded Excel file and parses a specific sheet into JSON objects,
 * using the table headers as reference keys.
 * 
 * @param file - The File object from an HTML input or drag-and-drop zone
 * @param sheetName - Optional specific sheet name. Defaults to the first sheet.
 */
export async function parseExcelFile(
  file: File,
  sheetName?: string
): Promise<ParsedExcelData> {
  // 1. Read the file as an ArrayBuffer
  const buffer = await file.arrayBuffer();

  // 2. Parse the workbook
  const workbook = XLSX.read(buffer, { type: 'array' });

  // 3. Get all available sheet names (useful if you want a sheet selector dropdown)
  const sheetNames = workbook.SheetNames;
  console.log(sheetName);

  if (sheetNames.length === 0) {
    throw new Error('The uploaded Excel file contains no sheets.');
  }

  // 4. Select the target sheet (default to the first one if not provided)
  const targetSheetName = sheetName || sheetNames[0];
  const worksheet = workbook.Sheets[targetSheetName];

  if (!worksheet) {
    throw new Error(`Sheet "${targetSheetName}" not found in the workbook.`);
  }

  // 5. Convert worksheet to JSON objects using the first row as headers
  // defval: "" ensures empty cells don't get skipped, keeping keys consistent
  const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
    defval: ''
  });

  console.log(rawData);

  // 6. Extract the headers (keys from the first row object)
  let headers: string[] = [];
  if (rawData.length > 0) {
    headers = Object.keys(rawData[0]);
  }

  return {
    sheetNames,
    headers,      // e.g., ['Date', 'Product', 'Revenue', 'Units']
    data: rawData // e.g., [{ Date: '2026-01-01', Product: 'A', Revenue: 100, ... }]
  };
}