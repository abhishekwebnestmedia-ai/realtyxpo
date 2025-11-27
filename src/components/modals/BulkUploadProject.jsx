import React, { useState } from 'react';
import { X, Upload, Download, FileSpreadsheet } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/api';

const BulkUploadProject = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type - accept CSV and Excel formats
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      const allowedExtensions = ['csv', 'xlsx', 'xls', 'xlsm'];
      
      if (!allowedExtensions.includes(fileExtension)) {
        toast.error('Please upload a valid file (.csv, .xlsx, .xls, or .xlsm)');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDownloadTemplate = () => {
    // Create sample Excel data
    const headers = [
      'Category',
      'Construction Status',
      'City Name',
      'Division Name',
      'Sector Name',
      'Project Name',
      'Tower Name',
      'Unit Number',
      'Project Type',
      'Status',
      'Owner Name',
      'Email',
      'Mobile Numbers',
      'Remarks',
      'Assign To'
    ];
    
    const sampleRows = [
      ['Residential', 'ReadyToMove', 'Gurgaon', 'Dwarka Expressway', 'Sector 104', 'M3M Heights', 'Tower A', 'Floor 5, Unit No 501', 'Residential', 'Vacant', 'Rohit Sharma', 'rohit@example.com', '9876543210', 'Owner lives here', 'Dell'],
      ['Residential', 'ReadyToMove', 'Gurgaon', 'Dwarka Expressway', 'Sector 104', 'M3M Heights', 'Tower A', 'Floor 5, Unit No 502', 'Residential', 'Self Occupied', 'Kunal Verma', 'kunal@example.com', '9823567890,9811223344', 'Multiple contacts', 'Dell'],
      ['Commercial', 'ReadyToMove', 'Gurgaon', 'Golf Course Road', 'Sector 53', 'DLF Park Place', 'Tower B', 'Floor 10, Unit No 1001', 'Commercial', 'Rental', 'TechPrime Pvt Ltd', 'admin@techprime.com', '9988776655', 'Corporate tenant', ''],
      ['Residential', 'UnderConstruction', 'Gurgaon', 'Sohna Road', 'Sector 68', 'Tulip Orange', 'Tower C', 'Floor 3, Unit No 305', 'Residential', 'For Sale', 'Alpha Realtech', 'alpha@company.com', '9933111199', 'Under finishing', ''],
    ];

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...sampleRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'project_bulk_upload_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Template downloaded successfully');
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/projects/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Show detailed results
      const { successCount, errorCount, errors } = response.data;
      
      if (errorCount > 0) {
        toast.error(`Upload completed with errors: ${successCount} succeeded, ${errorCount} failed`, { duration: 5000 });
        
        // Show first 3 errors in detail
        if (errors && errors.length > 0) {
          errors.slice(0, 3).forEach((error, index) => {
            setTimeout(() => {
              toast.error(error, { duration: 6000 });
            }, (index + 1) * 500);
          });
          
          if (errors.length > 3) {
            setTimeout(() => {
              toast.error(`...and ${errors.length - 3} more errors. Check console for details.`, { duration: 6000 });
            }, 2000);
            console.error('All upload errors:', errors);
          }
        }
      } else {
        toast.success(`${successCount} projects uploaded successfully!`);
      }
      
      setFile(null);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload projects';
      const errors = error.response?.data?.errors;
      
      toast.error(errorMessage);
      
      if (errors && errors.length > 0) {
        setTimeout(() => {
          toast.error(`First error: ${errors[0]}`, { duration: 6000 });
        }, 500);
        console.error('Upload errors:', errors);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setFile(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Bulk Upload Projects</h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {/* Download Template */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <FileSpreadsheet className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-800 mb-1 text-sm">Download Template</h4>
            <p className="text-xs text-gray-600 mb-3">
              Get the Excel template with sample data
            </p>
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download Template
            </button>
          </div>

          {/* Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div className="text-center">
              <Upload className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-800 mb-1 text-sm">Upload Your File</h4>
              <p className="text-xs text-gray-600 mb-3">
                Select CSV or Excel file (.csv, .xlsx, .xls, .xlsm)
              </p>
              
              <label className="inline-block">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,.xlsm,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />
                <span className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                  <Upload className="h-3.5 w-3.5" />
                  Choose File
                </span>
              </label>

              {file && (
                <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-700">
                    <span className="font-medium">Selected:</span> {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5" />
                Upload Projects
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadProject;
