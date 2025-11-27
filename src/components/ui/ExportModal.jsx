import React, { useState } from 'react';
import { X, FileText, FileSpreadsheet } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { exportToCsv, exportToExcel, exportToPdf } from '../../utils/exporter';

/**
 * ExportModal - Reusable modal for exporting table data in CSV, Excel, or PDF format
 * @param {Boolean} isOpen - Whether modal is visible
 * @param {Function} onClose - Callback to close modal
 * @param {Array} data - Array of row objects to export
 * @param {String} fileName - Base filename for export (without extension)
 * @param {String} title - Display title for the modal and PDF
 * @param {Array} columns - Optional: specific columns to export (default: all keys from first row)
 */
const ExportModal = ({ 
  isOpen, 
  onClose, 
  data = [], 
  fileName = 'export', 
  title = 'Export Data',
  columns = null,
  // show optional date range selectors and filter by the given field (e.g. 'date')
  showDateRange = false,
  dateField = 'date',
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!isOpen) return null;

  // preview count after optional date filtering
  let previewCount = (data || []).length;
  if (showDateRange && (startDate || endDate)) {
    const startTime = startDate ? new Date(startDate + 'T00:00:00') : null;
    const endTime = endDate ? new Date(endDate + 'T23:59:59.999') : null;
    previewCount = (data || []).filter((row) => {
      const raw = row && row[dateField];
      if (!raw) return false;
      const d = new Date(raw);
      if (isNaN(d)) return false;
      if (startTime && d < startTime) return false;
      if (endTime && d > endTime) return false;
      return true;
    }).length;
  }

  const handleExport = (format) => {
    if (!data || data.length === 0) {
      toast.error('No data available to export');
      return;
    }

    // Apply optional date range filtering if requested
    let sourceData = data;
    if (showDateRange && (startDate || endDate)) {
      const startTime = startDate ? new Date(startDate + 'T00:00:00') : null;
      const endTime = endDate ? new Date(endDate + 'T23:59:59.999') : null;
      sourceData = (data || []).filter((row) => {
        const raw = row && row[dateField];
        if (!raw) return false;
        const d = new Date(raw);
        if (isNaN(d)) return false;
        if (startTime && d < startTime) return false;
        if (endTime && d > endTime) return false;
        return true;
      });
    }

    const exportData = sourceData.map(row => {
      // Create a clean copy of the row, removing internal/unwanted fields
      const cleanRow = { ...row };
      // Remove fields that shouldn't be exported
      delete cleanRow._id;
      delete cleanRow.__v;
      delete cleanRow.deleting;
      delete cleanRow._clientTs;
      // also remove any UI-only date-range fields if present
      delete cleanRow.startDate;
      delete cleanRow.endDate;
      return cleanRow;
    });

    try {
      switch (format) {
        case 'csv':
          exportToCsv(exportData, columns, fileName);
          break;
        case 'excel':
          exportToExcel(exportData, columns, fileName);
          break;
        case 'pdf':
          exportToPdf(exportData, columns, title);
          break;
        default:
          toast.error('Invalid format selected');
          return;
      }
      
      // Close modal after successful export
      setTimeout(() => onClose(), 500);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {showDateRange && (
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border rounded px-2 py-1 w-full text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border rounded px-2 py-1 w-full text-sm"
                />
              </div>
            </div>
          )}

          <p className="text-sm text-gray-600 mb-4">
            Select export format for <strong>{previewCount}</strong> {previewCount === 1 ? 'row' : 'rows'}
          </p>

          {/* Export Format Options */}
          <div className="space-y-3">
            <button
              onClick={() => handleExport('csv')}
              className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition">
                <FileSpreadsheet className="text-green-600" size={24} />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-gray-800">Export as CSV</div>
                <div className="text-sm text-gray-500">Comma-separated values file</div>
              </div>
            </button>

            <button
              onClick={() => handleExport('excel')}
              className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition">
                <FileSpreadsheet className="text-blue-600" size={24} />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-gray-800">Export as Excel</div>
                <div className="text-sm text-gray-500">Microsoft Excel file (.xls)</div>
              </div>
            </button>

            <button
              onClick={() => handleExport('pdf')}
              className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition">
                <FileText className="text-red-600" size={24} />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-gray-800">Export as PDF</div>
                <div className="text-sm text-gray-500">Portable document format</div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
