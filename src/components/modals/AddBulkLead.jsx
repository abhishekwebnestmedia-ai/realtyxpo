import React, { useState, useRef } from "react";
import { X, Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import * as XLSX from 'xlsx';
import api from "../../api/api";

const AddBulkLead = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', null
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const resetState = () => {
    setSelectedFile(null);
    setUploadStatus(null);
    setErrorMessage("");
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv' // .csv
      ];
      
      if (!validTypes.includes(file.type)) {
        setErrorMessage("Please select a valid Excel file (.xlsx, .xls) or CSV file.");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("File size must be less than 10MB.");
        return;
      }

      setSelectedFile(file);
      setUploadStatus(null);
      setErrorMessage("");
    }
  };

  const convertFileToJson = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          
          if (file.type === 'text/csv') {
            // Parse CSV
            const lines = content.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
            const leads = lines.slice(1).map(line => {
              const values = line.split(',').map(v => v.replace(/"/g, '').trim());
              const lead = {};
              headers.forEach((header, index) => {
                lead[header] = values[index] || '';
              });
              return lead;
            });
            resolve(leads);
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
            const leads = jsonData.slice(1).map(row => {
              const lead = {};
              headers.forEach((header, index) => {
                lead[header] = row[index] || '';
              });
              return lead;
            });
            resolve(leads);
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
    if (!selectedFile) {
      setErrorMessage("Please select a file first.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage("");

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Convert file to JSON
      const leads = await convertFileToJson(selectedFile);
      
      if (!leads || leads.length === 0) {
        throw new Error("No valid leads found in the file.");
      }

      // Validate required fields
      const requiredFields = ['customerName', 'contactNumber'];
      for (const lead of leads) {
        for (const field of requiredFields) {
          if (!lead[field]) {
            throw new Error(`Missing required field "${field}" in one or more leads.`);
          }
        }
      }

      clearInterval(progressInterval);
      setUploadProgress(95);

      // Make API call
      await api.post('/realtleads/bulk-upload', { leads });
      
      setUploadProgress(100);
      
      // Invalidate cache to refresh leads data
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      
      setUploadStatus('success');
      
      // Auto close after success
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      console.error('Bulk upload failed:', error);
      setUploadStatus('error');
      setErrorMessage(
        error.response?.data?.message || 
        error.message || 
        "Failed to upload leads. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Upload Bulk Lead
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isUploading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {!selectedFile ? (
              <>
                <FileSpreadsheet size={48} className="mx-auto text-gray-400 mb-4" />
                <h2 className="text-lg font-semibold">Choose a file or drag & drop it here</h2>
                <p className="text-gray-600 mb-4">
                  Select your Excel or CSV file
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className=" text-[#334DE5] border border-[#334DE5] px-4 py-2 rounded-md transition-colors inline-flex items-center gap-2"
                  disabled={isUploading}
                >
                  <Upload size={16} />
                  Browse File
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <FileSpreadsheet size={32} className="mx-auto text-green-600" />
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {!isUploading && (
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove file
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {uploadStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-800 text-sm">
                Leads uploaded successfully! Closing...
              </span>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-red-800 text-sm">{errorMessage}</span>
            </div>
          )}

          {errorMessage && uploadStatus !== 'error' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <span className="text-amber-800 text-sm">{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? "Uploading..." : "Upload Leads"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBulkLead;