// import React, { useState, useRef } from "react";
// import { X, Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
// import { useQueryClient } from "@tanstack/react-query";
// import * as XLSX from 'xlsx';
// import api from "../../api/api";

// const AddBulkInventry = ({ isOpen, onClose }) => {
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadStatus, setUploadStatus] = useState(null);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [isDragOver, setIsDragOver] = useState(false);
//   const fileInputRef = useRef(null);
//   const queryClient = useQueryClient();

//   const resetState = () => {
//     setSelectedFile(null);
//     setUploadStatus(null);
//     setErrorMessage("");
//     setUploadProgress(0);
//     setIsDragOver(false);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   const handleClose = () => {
//     resetState();
//     onClose();
//   };

//   const validateFile = (file) => {
//     const validTypes = [
//       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//       'application/vnd.ms-excel',
//       'text/csv'
//     ];
    
//     if (!validTypes.includes(file.type)) {
//       setErrorMessage("Please select a valid Excel file (.xlsx, .xls) or CSV file.");
//       return false;
//     }

//     if (file.size > 100 * 1024 * 1024) {
//       setErrorMessage("File size must be less than 100MB.");
//       return false;
//     }

//     return true;
//   };

//   const handleFileSelection = (file) => {
//     if (validateFile(file)) {
//       setSelectedFile(file);
//       setUploadStatus(null);
//       setErrorMessage("");
//     }
//   };

//   const handleDragOver = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragOver(true);
//   };

//   const handleDragLeave = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragOver(false);
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragOver(false);

//     const files = e.dataTransfer.files;
//     if (files && files.length > 0) {
//       const file = files[0];
//       handleFileSelection(file);
//     }
//   };

//   const handleFileSelect = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       handleFileSelection(file);
//     }
//   };

//   const convertFileToJson = (file) => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
      
//       reader.onload = (e) => {
//         try {
//           const content = e.target.result;
          
//           if (file.type === 'text/csv') {
//             const lines = content.split('\n').filter(line => line.trim());
//             const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
//             const records = lines.slice(1).map(line => {
//               const values = line.split(',').map(v => v.replace(/"/g, '').trim());
//               const record = {};
//               headers.forEach((header, index) => {
//                 let value = values[index] || '';
                
//                 const arrayFields = ['typology', 'Project', 'contactNumbers', 'paymentStatus', 'source'];
//                 if (arrayFields.includes(header) && value) {
//                   if (value.includes('[') && value.includes(']')) {
//                     try {
//                       value = JSON.parse(value);
//                     } catch {
//                       value = value.replace(/[[\]"]/g, '').split(';').map(v => v.trim()).filter(v => v);
//                     }
//                   } else {
//                     value = value.split(';').map(v => v.trim()).filter(v => v);
//                   }
//                 }
                
//                 record[header] = value;
//               });
//               return record;
//             });
//             resolve(records);
//           } else {
//             // Parse Excel files using xlsx library
//             const workbook = XLSX.read(content, { type: 'binary' });
//             const sheetName = workbook.SheetNames[0];
//             const worksheet = workbook.Sheets[sheetName];
//             const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
//             if (jsonData.length < 2) {
//               throw new Error("Excel file must have at least a header row and one data row.");
//             }
            
//             const headers = jsonData[0];
//             const records = jsonData.slice(1).map(row => {
//               const record = {};
//               headers.forEach((header, index) => {
//                 let value = row[index] || '';
                
//                 const arrayFields = ['typology', 'Project', 'contactNumbers', 'paymentStatus', 'source'];
//                 if (arrayFields.includes(header) && value) {
//                   if (typeof value === 'string' && value.includes('[') && value.includes(']')) {
//                     try {
//                       value = JSON.parse(value);
//                     } catch {
//                       value = value.replace(/[[\]"]/g, '').split(';').map(v => v.trim()).filter(v => v);
//                     }
//                   } else if (typeof value === 'string') {
//                     value = value.split(';').map(v => v.trim()).filter(v => v);
//                   }
//                 }
                
//                 record[header] = value;
//               });
//               return record;
//             });
//             resolve(records);
//           }
//         } catch (parseError) {
//           console.error('File parsing error:', parseError);
//           reject(new Error("Failed to parse file. Please check the format."));
//         }
//       };
      
//       reader.onerror = () => reject(new Error("Failed to read file."));
      
//       if (file.type === 'text/csv') {
//         reader.readAsText(file);
//       } else {
//         reader.readAsBinaryString(file);
//       }
//     });
//   };

//   const handleUpload = async () => {
//     if (!selectedFile) {
//       setErrorMessage("Please select a file first.");
//       return;
//     }

//     setIsUploading(true);
//     setUploadProgress(0);
//     setErrorMessage("");

//     try {
//       const progressInterval = setInterval(() => {
//         setUploadProgress(prev => {
//           if (prev >= 90) {
//             clearInterval(progressInterval);
//             return 90;
//           }
//           return prev + 10;
//         });
//       }, 200);

//       const records = await convertFileToJson(selectedFile);
      
//       if (!records || records.length === 0) {
//         throw new Error("No valid inventory records found in the file.");
//       }

//       const requiredFields = ['sellerName', 'inventoryType', 'sector'];
//       for (const record of records) {
//         for (const field of requiredFields) {
//           if (!record[field]) {
//             throw new Error(`Missing required field "${field}" in one or more inventory records.`);
//           }
//         }
//       }

//       clearInterval(progressInterval);
//       setUploadProgress(95);

//       await api.post('/inventry/bulk-upload', { records });
      
//       setUploadProgress(100);
      
//       queryClient.invalidateQueries({ queryKey: ["inventory"] });
      
//       setUploadStatus('success');
      
//       setTimeout(() => {
//         handleClose();
//       }, 2000);

//     } catch (error) {
//       console.error('Bulk inventory upload failed:', error);
//       setUploadStatus('error');
//       setErrorMessage(
//         error.response?.data?.message || 
//         error.message || 
//         "Failed to upload inventory. Please try again."
//       );
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-6 relative">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-xl font-semibold text-gray-900">
//             Upload Bulk Inventory
//           </h2>
//           <button
//             onClick={handleClose}
//             className="text-gray-400 hover:text-gray-600 transition-colors"
//             disabled={isUploading}
//           >
//             <X size={24} />
//           </button>
//         </div>

//         <div className="space-y-4">
//           <div 
//             className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
//               isDragOver 
//                 ? 'border-blue-400 bg-blue-50' 
//                 : 'border-gray-300 hover:border-gray-400'
//             }`}
//             onDragOver={handleDragOver}
//             onDragLeave={handleDragLeave}
//             onDrop={handleDrop}
//           >
//             {!selectedFile ? (
//               <>
//                 <FileSpreadsheet 
//                   size={48} 
//                   className={`mx-auto mb-4 transition-colors ${
//                     isDragOver ? 'text-blue-500' : 'text-gray-400'
//                   }`} 
//                 />
//                 <h2 className={`text-lg font-semibold transition-colors ${
//                   isDragOver ? 'text-blue-600' : 'text-gray-900'
//                 }`}>
//                   {isDragOver ? 'Drop your file here' : 'Choose a file or drag & drop it here'}
//                 </h2>
//                 <p className="text-gray-600 mb-4">
//                   Select your Excel or CSV file with inventory data
//                 </p>
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   accept=".xlsx,.xls,.csv"
//                   onChange={handleFileSelect}
//                   className="hidden"
//                 />
//                 <button
//                   onClick={() => fileInputRef.current?.click()}
//                   className=" text-[#334DE5] border border-[#334DE5] px-4 py-2 rounded-md transition-colors inline-flex items-center gap-2"
//                   disabled={isUploading}
//                 >
//                   <Upload size={16} />
//                   Browse File
//                 </button>
//               </>
//             ) : (
//               <div className="space-y-3">
//                 <FileSpreadsheet size={32} className="mx-auto text-green-600" />
//                 <p className="font-medium text-gray-900">{selectedFile.name}</p>
//                 <p className="text-sm text-gray-500">
//                   {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
//                 </p>
//                 {!isUploading && (
//                   <button
//                     onClick={() => {
//                       setSelectedFile(null);
//                       if (fileInputRef.current) fileInputRef.current.value = "";
//                     }}
//                     className="text-sm text-red-600 hover:text-red-700"
//                   >
//                     Remove file
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Progress Bar */}
//           {isUploading && (
//             <div className="space-y-2">
//               <div className="flex justify-between text-sm">
//                 <span>Uploading...</span>
//                 <span>{uploadProgress}%</span>
//               </div>
//               <div className="w-full bg-gray-200 rounded-full h-2">
//                 <div
//                   className="bg-blue-600 h-2 rounded-full transition-all duration-300"
//                   style={{ width: `${uploadProgress}%` }}
//                 ></div>
//               </div>
//             </div>
//           )}

//           {/* Status Messages */}
//           {uploadStatus === 'success' && (
//             <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
//               <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//               <span className="text-green-800 text-sm">
//                 Inventory uploaded successfully! Closing...
//               </span>
//             </div>
//           )}

//           {uploadStatus === 'error' && (
//             <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
//               <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
//               <span className="text-red-800 text-sm">{errorMessage}</span>
//             </div>
//           )}

//           {errorMessage && uploadStatus !== 'error' && (
//             <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
//               <AlertCircle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
//               <span className="text-amber-800 text-sm">{errorMessage}</span>
//             </div>
//           )}
//         </div>

//         <div className="flex gap-3 mt-6">
//           <button
//             onClick={handleClose}
//             className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//             disabled={isUploading}
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleUpload}
//             disabled={!selectedFile || isUploading}
//             className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
//           >
//             {isUploading ? "Uploading..." : "Upload Inventory"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddBulkInventry;


import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  Download,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import api from "../../api/api";

const AddBulkInventry = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  // Download sample Excel template
  const handleDownloadSample = () => {
    const headers = [
      'sellerName',
      'inventoryType',
      'sector',
      'unitNo',
      'towerNo',
      'typology',
      'size',
      'demand',
      'Project',
      'contactNumbers',
      'email',
      'paymentStatus',
      'registryType',
      'requirement',
      'date',
      'capturedBy',
      'assignTo',
      'transferTo',
      'followUpDate',
      'source',
      'loanStatus',
      'remarks',
    ];
    
    const sampleData = [
      headers,
      ['John Doe', 'Residential', 'Sector 50', '101', 'Tower A', '3BHK', '1500 sqft', '1.5 Cr', 'Green Valley', '9876543210', 'john@example.com', 'Paid', 'Registered', 'Looking for buyer', '2025-01-15', 'Admin', 'Sales Team', '', '2025-01-20', 'Website', 'Approved', 'Prime location'],
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    XLSX.writeFile(wb, 'inventory_bulk_upload_sample.xlsx');
  };

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
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];

    if (!validTypes.includes(file.type)) {
      setErrorMessage("Please select a valid Excel (.xlsx, .xls) or CSV file.");
      return false;
    }

    if (file.size > 100 * 1024 * 1024) {
      setErrorMessage("File size must be less than 100MB.");
      return false;
    }

    return true;
  };

  // 🆕 Extract headers
  const extractHeaders = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          if (file.type === "text/csv") {
            const firstLine = e.target.result.split("\n")[0];
            const headers = firstLine
              .split(",")
              .map((h) => h.replace(/"/g, "").trim());
            resolve(headers);
          } else {
            const workbook = XLSX.read(e.target.result, { type: "binary" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const range = XLSX.utils.decode_range(sheet["!ref"]);
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

      reader.onerror = () => reject("Failed to read file.");
      if (file.type === "text/csv") reader.readAsText(file);
      else reader.readAsBinaryString(file);
    });
  };

  const handleFileSelection = async (file) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      setUploadStatus(null);
      setErrorMessage("");
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelection(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) handleFileSelection(files[0]);
  };

  const convertFileToJson = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target.result;
          if (file.type === "text/csv") {
            const lines = content.split("\n").filter((line) => line.trim());
            const headers = lines[0]
              .split(",")
              .map((h) => h.replace(/"/g, "").trim());
            const records = lines.slice(1).map((line) => {
              const values = line
                .split(",")
                .map((v) => v.replace(/"/g, "").trim());
              const record = {};
              headers.forEach((header, i) => (record[header] = values[i] || ""));
              return record;
            });
            resolve(records);
          } else {
            const workbook = XLSX.read(content, { type: "binary" });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            const headers = jsonData[0];
            const records = jsonData.slice(1).map((row) => {
              const record = {};
              headers.forEach((header, i) => (record[header] = row[i] || ""));
              return record;
            });
            resolve(records);
          }
        } catch (err) {
          reject(new Error("Failed to parse file."));
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file."));
      if (file.type === "text/csv") reader.readAsText(file);
      else reader.readAsBinaryString(file);
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
      const interval = setInterval(() => {
        setUploadProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 200);

      const records = await convertFileToJson(selectedFile);
      if (!records.length)
        throw new Error("No valid inventory records found.");

      const requiredFields = ["sellerName", "inventoryType", "sector"];
      for (const record of records) {
        for (const field of requiredFields) {
          if (!record[field])
            throw new Error(`Missing required field "${field}".`);
        }
      }

      clearInterval(interval);
      setUploadProgress(95);

      await api.post("/inventry/bulk-upload", { records });

      setUploadProgress(100);
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setUploadStatus("success");

      setTimeout(() => handleClose(), 2000);
    } catch (err) {
      setUploadStatus("error");
      setErrorMessage(
        err.response?.data?.message ||
          err.message ||
          "Failed to upload inventory. Try again."
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
            Upload Bulk Inventory
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isUploading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Download Sample Template */}
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Need a template?</p>
              <p className="text-xs text-blue-600">Download sample Excel file with correct headers</p>
            </div>
            <button
              type="button"
              onClick={handleDownloadSample}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 inline-flex items-center gap-1"
            >
              <Download size={14} />
              Download Sample
            </button>
          </div>
        </div>

        {/* Upload Section */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragOver
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
              {!selectedFile ? (
            <>
              <FileSpreadsheet
                size={48}
                className={`mx-auto mb-4 ${
                  isDragOver ? "text-blue-500" : "text-gray-400"
                }`}
              />
              <h2
                className={`text-lg font-semibold ${
                  isDragOver ? "text-blue-600" : "text-gray-900"
                }`}
              >
                {isDragOver
                  ? "Drop your file here"
                  : "Choose a file or drag & drop"}
              </h2>
              <p className="text-gray-600 mb-4">
                Select your Excel or CSV file with inventory data
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
                className="text-[#334DE5] border border-[#334DE5] px-4 py-2 rounded-lg inline-flex items-center gap-2 hover:bg-blue-50 transition-colors"
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

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {uploadStatus === "success" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-800 text-sm">
              Inventory uploaded successfully! Closing...
            </span>
          </div>
        )}

        {uploadStatus === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4 flex items-start gap-2">
            <AlertCircle
              size={16}
              className="text-red-500 mt-0.5 flex-shrink-0"
            />
            <span className="text-red-800 text-sm">{errorMessage}</span>
          </div>
        )}

        {errorMessage && uploadStatus !== "error" && !isUploading && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4 flex items-start gap-2">
            <AlertCircle
              size={16}
              className="text-amber-500 mt-0.5 flex-shrink-0"
            />
            <span className="text-amber-800 text-sm">{errorMessage}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
          >
            {isUploading ? "Uploading..." : "Upload Inventory"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBulkInventry;
