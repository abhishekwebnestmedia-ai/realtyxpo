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
    console.warn('No data to export');
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
    console.warn('No data to export');
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
    console.warn('No data to export');
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
 * Downloads PDF directly without print dialog
 * @param {Array} rows - Array of row objects
 * @param {Array} columns - Optional array of column keys
 * @param {String} title - Document title
 */
export async function exportToPdf(rows = [], columns = null, title = 'Export', watermark = '') {
  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn('No data to export');
    return;
  }
  
  try {
    // Use jsPDF for direct PDF download
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    const cols = columns || Object.keys(rows[0]);
    
    // Add title
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
    
    // Load watermark image if provided
    let watermarkImage = null;
    if (watermark && typeof watermark === 'string') {
      try {
        const resp = await fetch(watermark);
        if (resp.ok) {
          const blob = await resp.blob();
          const reader = new FileReader();
          watermarkImage = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
          });
        }
      } catch (e) {
        console.warn('Failed to load watermark:', e);
      }
    }
    
    // Prepare table data
    const tableData = rows.map(row => cols.map(col => {
      const val = row[col];
      return val == null ? '' : String(val);
    }));
    
    // Add table with watermark on each page
    doc.autoTable({
      head: [cols],
      body: tableData,
      startY: 25,
      theme: 'grid',
      styles: { 
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      margin: { top: 25, right: 10, bottom: 10, left: 10 },
      didDrawPage: function(data) {
        // Add watermark on each page behind content
        if (watermarkImage) {
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          
          // Set opacity for watermark
          doc.saveGraphicsState();
          doc.setGState(new doc.GState({ opacity: 0.15 }));
          
          // Center watermark on page
          const imgWidth = pageWidth * 0.6;
          const imgHeight = pageHeight * 0.6;
          const x = (pageWidth - imgWidth) / 2;
          const y = (pageHeight - imgHeight) / 2;
          
          doc.addImage(watermarkImage, 'PNG', x, y, imgWidth, imgHeight);
          
          // Restore opacity
          doc.restoreGraphicsState();
        }
      }
    });
    
    // Download PDF
    const fileName = `${title.replace(/[^a-z0-9\-_. ]/gi, '_')}.pdf`;
    doc.save(fileName);
    
  } catch (err) {
    console.error('PDF generation failed, falling back to print method', err);
    // Fallback to old print method if jsPDF fails
    fallbackPrintPdf(rows, columns, title, watermark);
  }
}

// Fallback print method
async function fallbackPrintPdf(rows = [], columns = null, title = 'Export', watermark = '') {
  const cols = columns || Object.keys(rows[0]);
  
  const buildCell = (v) => {
    if (v === null || v === undefined) return '';
    return String(v).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;');
  };
  
  let watermarkHtml = '';
  try {
    if (watermark && typeof watermark === 'string' && watermark.toLowerCase().endsWith('.svg')) {
      const resp = await fetch(watermark);
      if (resp.ok) {
        const svgText = await resp.text();
        const dataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgText);
        watermarkHtml = `<img src="${dataUrl}" class="watermark-img" alt="watermark" />`;
      } else {
        watermarkHtml = `<div class="watermark">${String(watermark).replace(/</g, '&lt;')}</div>`;
      }
    } else if (watermark) {
      watermarkHtml = `<div class="watermark">${String(watermark).replace(/</g, '&lt;')}</div>`;
    }
  } catch (e) {
    console.warn('Failed to load watermark image', e);
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
    tr:nth-child(even) { background-color: #fafafa; }
    .watermark { pointer-events: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); color: rgba(0,0,0,0.1); font-size: 72px; font-weight: 700; z-index: 0; white-space: nowrap; }
    .watermark-img { pointer-events: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.9); opacity: 0.15; z-index: 0; max-width: 80%; height: auto; }
    .export-content { position: relative; z-index: 1; background-color: transparent; }
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
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.warn('Please allow popups to export PDF');
    return;
  }
  
  printWindow.document.write(html);
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.print();
  }, 100);
}

export default { exportToCsv, exportToExcel, exportToPdf };
