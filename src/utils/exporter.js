// Minimal client-side exporter: CSV, Excel (.xls), and PDF without external heavy deps
// For true .xlsx support, consider adding 'xlsx' package later

import { showAlert } from '../services/modalService';

const safeFilename = (name) => name.replace(/[^a-z0-9\-_. ]/gi, '_');

/**
 * Export array of objects to CSV
 * @param {Array} rows - Array of row objects
 * @param {Array} columns - Optional array of column keys to export (default: all keys from first row)
 * @param {String} fileName - Output filename without extension
 */
export function exportToCsv(rows = [], columns = null, fileName = 'export') {
  if (!Array.isArray(rows) || rows.length === 0) {
    showAlert('No data to export');
    return;
  }
  
  const cols = columns || Object.keys(rows[0]);
  const header = cols.join(',') + '\n';
  
  const escapeCell = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    // Escape quotes and wrap in quotes if contains comma/newline/quote
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  
  const body = rows.map(r => cols.map(c => escapeCell(r[c])).join(',')).join('\n');
  const csv = header + body;
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeFilename(fileName)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Export array of objects to Excel (.xlsx) using SheetJS (xlsx package).
 * Falls back to HTML .xls download if SheetJS isn't available.
 * @param {Array} rows - Array of row objects
 * @param {Array} columns - Optional array of column keys
 * @param {String} fileName - Output filename without extension
 */
export async function exportToExcel(rows = [], columns = null, fileName = 'export') {
  if (!Array.isArray(rows) || rows.length === 0) {
    showAlert('No data to export');
    return;
  }

  const cols = columns || Object.keys(rows[0]);

  // Prepare flat objects that follow column order
  const prepared = rows.map((r) => {
    const obj = {};
    cols.forEach((c) => {
      obj[c] = r[c] == null ? '' : r[c];
    });
    return obj;
  });

  try {
    // Use SheetJS to create a real .xlsx file
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(prepared, { header: cols });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeFilename(fileName)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    // fallback to old HTML .xls approach if xlsx not available
    console.warn('xlsx package not available or failed, falling back to .xls HTML export', err);
    const buildCell = (v) => {
      if (v === null || v === undefined) return '';
      return String(v).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;');
    };
    let html = '<table border="1"><thead><tr>';
    html += cols.map(c => `<th>${buildCell(c)}</th>`).join('');
    html += '</tr></thead><tbody>';
    html += rows.map(r => '<tr>' + cols.map(c => `<td>${buildCell(r[c])}</td>`).join('') + '</tr>').join('');
    html += '</tbody></table>';
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeFilename(fileName)}.xls`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
}

/**
 * Export array of objects to ODS (OpenDocument Spreadsheet) using SheetJS if available.
 * Falls back to Excel/.xls if ODS not supported.
 */
export async function exportToOds(rows = [], columns = null, fileName = 'export') {
  if (!Array.isArray(rows) || rows.length === 0) {
    showAlert('No data to export');
    return;
  }

  const cols = columns || Object.keys(rows[0]);
  const prepared = rows.map((r) => {
    const obj = {};
    cols.forEach((c) => {
      obj[c] = r[c] == null ? '' : r[c];
    });
    return obj;
  });

  try {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(prepared, { header: cols });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    // Attempt to write ODS
    const wbout = XLSX.write(wb, { bookType: 'ods', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.oasis.opendocument.spreadsheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeFilename(fileName)}.ods`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.warn('ODS export failed or not supported, falling back to Excel export', err);
    // Fallback to Excel export
    return exportToExcel(rows, columns, fileName);
  }
}

/**
 * Export array of objects to PDF
 * Uses browser print with custom styles
 * @param {Array} rows - Array of row objects
 * @param {Array} columns - Optional array of column keys
 * @param {String} title - Document title
 */
export async function exportToPdf(rows = [], columns = null, title = 'Export', watermark = '') {
  if (!Array.isArray(rows) || rows.length === 0) {
    alert('No data to export');
    return;
  }
  
  const cols = columns || Object.keys(rows[0]);
  
  const buildCell = (v) => {
    if (v === null || v === undefined) return '';
    return String(v).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;');
  };
  
  // If watermark is an SVG file path (endsWith '.svg'), fetch and embed as data URL image
  let watermarkHtml = '';
  try {
    if (watermark && typeof watermark === 'string' && watermark.toLowerCase().endsWith('.svg')) {
      // fetch the SVG from public path and inline it as data URL
      const resp = await fetch(watermark);
      if (resp.ok) {
        const svgText = await resp.text();
        const dataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgText);
        watermarkHtml = `<img src="${dataUrl}" class="watermark-img" alt="watermark" />`;
      } else {
        // fallback to text watermark if fetch failed
        watermarkHtml = `<div class="watermark">${String(watermark).replace(/</g, '&lt;')}</div>`;
      }
    } else if (watermark) {
      // text watermark
      watermarkHtml = `<div class="watermark">${String(watermark).replace(/</g, '&lt;')}</div>`;
    }
  } catch (e) {
    console.warn('Failed to load watermark image, falling back to text if provided', e);
    if (watermark) watermarkHtml = `<div class="watermark">${String(watermark).replace(/</g, '&lt;')}</div>`;
  }

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @media print {
      @page { margin: 0.5cm; }
      body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
    }
    body { font-family: Arial, sans-serif; }
    h1 { text-align: center; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; font-weight: bold; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    /* Watermark styles */
    .watermark { pointer-events: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); color: rgba(0,0,0,0.06); font-size: 72px; font-weight: 700; z-index: 0; white-space: nowrap; }
    .watermark-img { pointer-events: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.9); opacity: 0.08; z-index: 0; max-width: 80%; height: auto; }
    .export-content { position: relative; z-index: 1; }
  </style>
</head>
<body>
  ${watermarkHtml}
  <div class="export-content">
  <h1>${title}</h1>
  <table>
    <thead>
      <tr>${cols.map(c => `<th>${buildCell(c)}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${rows.map(r => '<tr>' + cols.map(c => `<td>${buildCell(r[c])}</td>`).join('') + '</tr>').join('')}
    </tbody>
  </table>
  </div>
</body>
</html>
  `;
  
  // Open in new window and trigger print
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    showAlert('Please allow popups to export PDF');
    return;
  }
  
  printWindow.document.write(html);
  printWindow.document.close();
  
  // Wait for content to load then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      // Close after print dialog (user may cancel, so we wait)
      setTimeout(() => printWindow.close(), 100);
    }, 250);
  };
}

export default { exportToCsv, exportToExcel, exportToPdf };
