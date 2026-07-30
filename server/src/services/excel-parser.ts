import ExcelJS from 'exceljs';
import { parse as csvParse } from 'csv-parse';
import { createReadStream } from 'fs';
import path from 'path';

export interface ValidationWarning {
  type: 'empty_cell' | 'duplicate_row' | 'missing_column';
  message: string;
  row?: number;
  column?: string;
}

export interface ParsedExcel {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  warnings: ValidationWarning[];
}

/**
 * Parse an Excel or CSV file using streaming for memory efficiency.
 * Returns headers from the first row + all data rows as key-value records.
 */
export async function parseExcelFile(filePath: string): Promise<ParsedExcel> {
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.csv') {
    return parseCsvFile(filePath);
  }
  
  return parseXlsxFile(filePath);
}

/**
 * Parse .xlsx/.xls using ExcelJS streaming reader for memory efficiency.
 */
async function parseXlsxFile(filePath: string): Promise<ParsedExcel> {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.readFile(filePath);
  } catch (error: any) {
    if (error.message && error.message.includes('end of central directory')) {
      throw new Error('Invalid or corrupted file format. Old .xls files are not supported. Please save your file as a standard .xlsx or .csv and try again.');
    }
    throw error;
  }
  
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('No worksheets found in the Excel file.');
  }
  
  const headers: string[] = [];
  const rows: Record<string, string>[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Extract headers from first row
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const value = cellToString(cell.value);
    if (value) {
      headers.push(value);
    }
  });
  
  if (headers.length === 0) {
    throw new Error('No column headers found in the first row.');
  }
  
  // Extract data rows
  const seenRows = new Set<string>();
  
  for (let rowNum = 2; rowNum <= worksheet.rowCount; rowNum++) {
    const row = worksheet.getRow(rowNum);
    const record: Record<string, string> = {};
    let hasData = false;
    
    headers.forEach((header, index) => {
      const cell = row.getCell(index + 1);
      const value = cellToString(cell.value);
      record[header] = value;
      
      if (value) {
        hasData = true;
      } else {
        warnings.push({
          type: 'empty_cell',
          message: `Empty cell in column "${header}" at row ${rowNum}`,
          row: rowNum,
          column: header,
        });
      }
    });
    
    if (!hasData) continue; // Skip completely empty rows
    
    // Check for duplicate rows
    const rowKey = headers.map(h => record[h]).join('|');
    if (seenRows.has(rowKey)) {
      warnings.push({
        type: 'duplicate_row',
        message: `Duplicate row detected at row ${rowNum}`,
        row: rowNum,
      });
    }
    seenRows.add(rowKey);
    
    rows.push(record);
  }
  
  return { headers, rows, totalRows: rows.length, warnings };
}

/**
 * Parse CSV files using csv-parse streaming parser.
 */
async function parseCsvFile(filePath: string): Promise<ParsedExcel> {
  return new Promise((resolve, reject) => {
    const headers: string[] = [];
    const rows: Record<string, string>[] = [];
    const warnings: ValidationWarning[] = [];
    const seenRows = new Set<string>();
    let rowNum = 1;
    
    const parser = csvParse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    
    const stream = createReadStream(filePath);
    
    parser.on('headers', (hdrs: string[]) => {
      headers.push(...hdrs.filter(h => h.trim()));
    });
    
    parser.on('readable', () => {
      let record: Record<string, string>;
      while ((record = parser.read()) !== null) {
        rowNum++;
        
        // Check for empty cells
        for (const header of Object.keys(record)) {
          if (!record[header] || record[header].trim() === '') {
            warnings.push({
              type: 'empty_cell',
              message: `Empty cell in column "${header}" at row ${rowNum}`,
              row: rowNum,
              column: header,
            });
          }
        }
        
        // Check for duplicates
        const rowKey = Object.values(record).join('|');
        if (seenRows.has(rowKey)) {
          warnings.push({
            type: 'duplicate_row',
            message: `Duplicate row detected at row ${rowNum}`,
            row: rowNum,
          });
        }
        seenRows.add(rowKey);
        
        rows.push(record);
      }
    });
    
    parser.on('end', () => {
      if (headers.length === 0 && rows.length > 0) {
        // csv-parse with columns:true auto-extracts headers
        headers.push(...Object.keys(rows[0]));
      }
      resolve({ headers, rows, totalRows: rows.length, warnings });
    });
    
    parser.on('error', reject);
    stream.pipe(parser);
  });
}

/**
 * Validate parsed data against required columns (placeholder bindings).
 */
export function validateForGeneration(
  data: ParsedExcel,
  requiredColumns: string[]
): ValidationWarning[] {
  const additional: ValidationWarning[] = [];
  
  for (const col of requiredColumns) {
    if (!data.headers.includes(col)) {
      additional.push({
        type: 'missing_column',
        message: `Required column "${col}" not found in Excel headers`,
        column: col,
      });
    }
  }
  
  return [...data.warnings, ...additional];
}

/**
 * Convert ExcelJS cell value to a plain string.
 */
function cellToString(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return String(value);
  if (value instanceof Date) return value.toISOString().split('T')[0];
  if (typeof value === 'object' && 'text' in value) return String((value as any).text);
  if (typeof value === 'object' && 'result' in value) return String((value as any).result);
  return String(value);
}
