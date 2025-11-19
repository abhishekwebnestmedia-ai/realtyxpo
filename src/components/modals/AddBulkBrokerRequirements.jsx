import React, { useState, useRef } from "react";
import { X, Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import * as XLSX from 'xlsx';
import api from "../../api/api";

const AddBulkBrokerRequirements = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileHeaders, setFileHeaders] = useState([]);
  const [showHeaderPreview, setShowHeaderPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const resetState = () => {
    setSelectedFile(null);
    setUploadStatus(null);
    setErrorMessage("");
    setUploadProgress(0);
    setIsDragOver(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const validateFile = (file) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Please select a valid Excel file (.xlsx, .xls) or CSV file.");
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File size must be less than 10MB.");
      return false;
    }
    return true;
  };

  // Extract headers for preview (CSV or Excel)
  const extractHeaders = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (file.type === 'text/csv') {
            const firstLine = e.target.result.split('\n')[0];
            const headers = firstLine.split(',').map(h => h.replace(/"/g, '').trim());
            resolve(headers);
          } else {
            const workbook = XLSX.read(e.target.result, { type: 'binary' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const range = XLSX.utils.decode_range(sheet['!ref']);
            const headers = [];
            for (let C = range.s.c; C <= range.e.c; ++C) {
              const cell = sheet[XLSX.utils.encode_cell({ r: 0, c: C })];
              if (cell && cell.v) headers.push(cell.v);
            }
            resolve(headers);
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject('Failed to read file');
      if (file.type === 'text/csv') reader.readAsText(file);
      else reader.readAsBinaryString(file);
    });
  };

  const handleFileSelection = (file) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      setUploadStatus(null);
      setErrorMessage("");
      // try extract headers for preview
      extractHeaders(file)
        .then((h) => setFileHeaders(h))
        .catch(() => setFileHeaders([]));
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); const files = e.dataTransfer.files; if (files && files.length > 0) handleFileSelection(files[0]); };
  const handleFileSelect = (e) => { const file = e.target.files[0]; if (file) handleFileSelection(file); };

  const convertFileToJson = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          if (file.type === 'text/csv') {
            const lines = content.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
            const records = lines.slice(1).map(line => {
              const values = line.split(',').map(v => v.replace(/"/g, '').trim());
              const record = {};
              headers.forEach((header, index) => { record[header] = values[index] || ''; });
              return record;
            });
            resolve(records);
          } else {
            // Parse Excel files using xlsx library
            const workbook = XLSX.read(content, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (jsonData.length < 2) {
              throw new Error("Excel file must have at least a header row and one data row.");
            }
            
            const headers = jsonData[0];
            const records = jsonData.slice(1).map(row => {
              const record = {};
              headers.forEach((header, index) => {
                record[header] = row[index] || '';
              });
              return record;
            });
            resolve(records);
          }
        } catch (parseError) {
          console.error('File parsing error:', parseError);
          reject(new Error("Failed to parse file. Please check the format."));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file."));
      
      if (file.type === 'text/csv') {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) { setErrorMessage("Please select a file first."); return; }
    setIsUploading(true); setUploadProgress(0); setErrorMessage("");

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => { if (prev >= 90) { clearInterval(progressInterval); return 90; } return prev + 10; });
      }, 200);

      const records = await convertFileToJson(selectedFile);
      if (!records || records.length === 0) throw new Error("No valid broker records found in the file.");

      // Example required fields - adjust if backend expects different keys
      const requiredFields = ['brokerName', 'contactNumber', 'requirement'];
      for (const record of records) {
        for (const field of requiredFields) {
          if (!record[field]) {
            throw new Error(`Missing required field "${field}" in one or more broker records.`);
          }
        }
      }

      clearInterval(progressInterval);
      setUploadProgress(95);

      await api.post('/broker/bulk-upload', { records });

      setUploadProgress(100);
      queryClient.invalidateQueries({ queryKey: ['brokers'] });
      setUploadStatus('success');
      setTimeout(() => { handleClose(); }, 1500);
    } catch (error) {
      console.error('Bulk broker upload failed:', error);
      setUploadStatus('error');
      setErrorMessage(error.response?.data?.message || error.message || "Failed to upload brokers. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-6 relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Upload Bulk Broker Requirements</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600" disabled={isUploading}><X size={24} /></button>
        </div>

        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {!selectedFile ? (
              <>
                <FileSpreadsheet size={48} className={`mx-auto mb-4 transition-colors ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
                <h2 className={`text-lg font-semibold transition-colors ${isDragOver ? 'text-blue-600' : 'text-gray-900'}`}>{isDragOver ? 'Drop your file here' : 'Choose a file or drag & drop it here'}</h2>
                <p className="text-gray-600 mb-4">Select your Excel or CSV file with broker requirement data</p>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileSelect} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className=" text-[#334DE5] border border-[#334DE5] px-4 py-2 rounded-md transition-colors inline-flex items-center gap-2" disabled={isUploading}><Upload size={16} /> Browse File</button>
                <button
                  type="button"
                  onClick={() => {
                    if (!fileHeaders || fileHeaders.length === 0) {
                      // show a suggested template for broker requirements
                      setFileHeaders([
                          'brokerName',
                          'companyName',
                          'contactNumber',
                          'email',
                          'requirement',
                          'date',
                          'remarks'
                        ]);
                    }
                    setShowHeaderPreview(true);
                  }}
                  className="ml-2 px-3 py-2 border rounded-md text-sm"
                >
                  Preview Headers
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <FileSpreadsheet size={32} className="mx-auto text-green-600" />
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                {!isUploading && (<button onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-sm text-red-600 hover:text-red-700">Remove file</button>)}
              </div>
            )}
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span>Uploading...</span><span>{uploadProgress}%</span></div>
              <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${uploadProgress}%` }} /></div>
            </div>
          )}

          {/* Header preview */}
          {showHeaderPreview && fileHeaders.length > 0 && (
            <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Eye size={16} className="text-blue-600" />
                <span className="text-sm font-semibold text-gray-800">Header Preview ({fileHeaders.length} columns)</span>
                <button type="button" onClick={() => setShowHeaderPreview(false)} className="ml-auto text-sm text-gray-500 hover:text-gray-700">Close</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {fileHeaders.map((h, i) => (
                  <span key={i} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md border border-blue-200">{h}</span>
                ))}
              </div>
            </div>
          )}

          {uploadStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full" /> <span className="text-green-800 text-sm">Brokers uploaded successfully! Closing...</span></div>
          )}

          {uploadStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2"><AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" /><span className="text-red-800 text-sm">{errorMessage}</span></div>
          )}

          {errorMessage && uploadStatus !== 'error' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2"><AlertCircle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" /><span className="text-amber-800 text-sm">{errorMessage}</span></div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={handleClose} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200" disabled={isUploading}>Cancel</button>
          <button onClick={handleUpload} disabled={!selectedFile || isUploading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed">{isUploading ? 'Uploading...' : 'Upload Brokers'}</button>
        </div>
      </div>
    </div>
  );
};

export default AddBulkBrokerRequirements;
