import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle, X, Download, Info, ArrowRight, ArrowDown } from 'lucide-react';

interface CSVUploaderProps {
  onUpload: (data: any[]) => void;
}

interface FieldMapping {
  [key: string]: string; // Maps required field names to CSV column names
}

const REQUIRED_FIELDS = [
  { key: 'routingNumber', label: 'Routing Number', description: '9-digit bank routing number' },
  { key: 'accountNumberLast4', label: 'Account Number Last4', description: 'Last 4 digits of account number' },
  { key: 'accountHolderName', label: 'Account Holder Name', description: 'Full name on the account' },
];

const OPTIONAL_FIELDS = [
  { key: 'tags', label: 'Tags', description: 'Comma-separated risk tags (e.g., "fraud,stacking")' },
  { key: 'notes', label: 'Notes', description: 'Additional context about the account' },
  { key: 'defaultBalance', label: 'Default Balance', description: 'Amount defaulted on (if applicable)' },
];

export function CSVUploader({ onUpload }: CSVUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [showMapping, setShowMapping] = useState(false);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setShowMapping(false);
      setFieldMapping({});
      previewCSV(file);
    }
  };

  const previewCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          setUploadStatus('error');
          setStatusMessage('CSV file must contain at least a header row and one data row');
          return;
        }

        // Parse CSV headers
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        setCsvHeaders(headers);

        // Parse first few rows for preview
        const preview = lines.slice(1, 4).map(line => {
          const values = line.split(',').map(v => v.replace(/"/g, '').trim());
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });

        // Store full CSV data
        const fullData = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.replace(/"/g, '').trim());
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });

        setCsvData(fullData);
        setPreviewData(preview);
        setUploadStatus('idle');
        setShowMapping(true);
        
        // Try to auto-map fields based on common column names
        const autoMapping: FieldMapping = {};
        
        headers.forEach(header => {
          const headerLower = header.toLowerCase().replace(/\s+/g, '');
          
          if (headerLower.includes('routing') || headerLower === 'routingnumber') {
            autoMapping.routingNumber = header;
          }
          else if (headerLower.includes('accountnumber') || headerLower.includes('account') && headerLower.includes('last4')) {
            autoMapping.accountNumberLast4 = header;
          }
          else if (headerLower.includes('accountholder') || headerLower.includes('name')) {
            autoMapping.accountHolderName = header;
          }
          else if (headerLower.includes('tag')) {
            autoMapping.tags = header;
          }
          else if (headerLower.includes('note')) {
            autoMapping.notes = header;
          }
          else if (headerLower.includes('default') && (headerLower.includes('balance') || headerLower.includes('amount'))) {
            autoMapping.defaultBalance = header;
          }
        });
        
        setFieldMapping(autoMapping);
        
      } catch (err) {
        setUploadStatus('error');
        setStatusMessage('Error reading CSV file. Please check the file format.');
        console.error('CSV parsing error:', err);
      }
    };
    reader.readAsText(file);
  };

  const handleFieldMappingChange = (requiredField: string, csvColumn: string) => {
    setFieldMapping(prev => ({
      ...prev,
      [requiredField]: csvColumn
    }));
  };

  const isRequiredFieldsMapped = () => {
    return REQUIRED_FIELDS.every(field => fieldMapping[field.key]);
  };

  const handleUpload = async () => {
    if (!selectedFile || !isRequiredFieldsMapped()) {
      setUploadStatus('error');
      setStatusMessage('Please map all required fields before uploading');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');

    try {
      // Transform data using the field mapping
      const transformedData = csvData.map(row => {
        const transformedRow: any = {};
        
        // Map required fields
        REQUIRED_FIELDS.forEach(field => {
          const csvColumn = fieldMapping[field.key];
          transformedRow[field.label.replace(/\s+/g, '')] = csvColumn ? row[csvColumn] : '';
        });
        
        // Map optional fields
        OPTIONAL_FIELDS.forEach(field => {
          const csvColumn = fieldMapping[field.key];
          if (csvColumn) {
            transformedRow[field.label.replace(/\s+/g, '')] = row[csvColumn];
          }
        });
        
        return transformedRow;
      });
      
      // Filter out rows with missing required fields
      const validData = transformedData.filter(row => 
        row.RoutingNumber && 
        row.AccountNumberLast4 && 
        row.AccountHolderName
      );
      
      if (validData.length === 0) {
        throw new Error('No valid data found after mapping. Please check your field mappings.');
      }
      
      // Save to pending uploads for admin approval
      saveToPendingUploads(validData);
      
      // Reset form
      setSelectedFile(null);
      setPreviewData(null);
      setCsvHeaders([]);
      setCsvData([]);
      setShowMapping(false);
      setFieldMapping({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Show success message
      setUploadStatus('success');
      setStatusMessage(`Successfully submitted ${validData.length} accounts for admin review`);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setUploadStatus('idle');
        setStatusMessage('');
      }, 5000);
      
      // Also call the original onUpload for backward compatibility
      onUpload(validData);
      
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadStatus('error');
      setStatusMessage(err.message || 'Error processing CSV data');
    } finally {
      setIsUploading(false);
    }
  };

  const saveToPendingUploads = (data: any[]) => {
    try {
      // Get existing pending uploads
      const saved = localStorage.getItem('admin_pending_uploads');
      let pendingUploads = [];
      
      if (saved) {
        pendingUploads = JSON.parse(saved);
      }
      
      // Add new upload
      const newUpload = {
        id: 'upload_' + Date.now(),
        uploadDate: new Date().toISOString(),
        companyName: 'Customer Upload', // This would be the actual customer name in production
        fileName: selectedFile?.name || 'upload.csv',
        recordCount: data.length,
        status: 'pending',
        data: data
      };
      
      pendingUploads.push(newUpload);
      
      // Save back to localStorage
      localStorage.setItem('admin_pending_uploads', JSON.stringify(pendingUploads));
      
      console.log('Saved to pending uploads:', newUpload);
      
    } catch (error) {
      console.error('Error saving to pending uploads:', error);
      throw new Error('Failed to save upload for admin review');
    }
  };

  const handleDownloadTemplate = () => {
    const templateContent = `Routing Number,Account Number Last4,Account Holder Name,Tags,Notes,Default Balance
021000021,5678,John Smith,"fraud,stacking","This person attempted fraud with multiple lenders",25000
111000025,1234,Michael Rodriguez,"fraud,fake_deposits","Provided fake bank statements",
121000248,9876,Jane Doe,"associated_account","Secondary account used by John Smith",`;
    
    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'risk_accounts_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Upload className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Bulk Upload</h3>
          <p className="text-gray-600">Submit multiple risk accounts at once via CSV file</p>
        </div>
      </div>

      {/* Status Message */}
      {uploadStatus !== 'idle' && (
        <div className={`mb-6 p-4 rounded-lg border ${
          uploadStatus === 'success' 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center space-x-2">
            {uploadStatus === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <span className={`font-medium ${
              uploadStatus === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {statusMessage}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* File Upload */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              CSV File
            </label>
            <button
              onClick={handleDownloadTemplate}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
            >
              <Download className="h-4 w-4" />
              <span>Download Template</span>
            </button>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-file-input"
              ref={fileInputRef}
            />
            <label
              htmlFor="csv-file-input"
              className="cursor-pointer"
            >
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {selectedFile ? selectedFile.name : 'Choose CSV file'}
              </p>
              <p className="text-sm text-gray-500">
                Click to browse or drag and drop your CSV file here
              </p>
            </label>
          </div>
        </div>

        {/* Field Mapping Section */}
        {showMapping && csvHeaders.length > 0 && (
          <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
            <div className="flex items-center space-x-3 mb-4">
              <ArrowRight className="h-5 w-5 text-blue-600" />
              <h4 className="text-lg font-semibold text-blue-800">Map CSV Columns to Required Fields</h4>
            </div>
            
            <p className="text-sm text-blue-700 mb-4">
              Please map your CSV columns to our required fields. This helps us correctly import your data even if your column names are different.
            </p>
            
            <div className="space-y-4">
              {/* Required Fields */}
              <div>
                <h5 className="font-medium text-blue-800 mb-2">Required Fields</h5>
                <div className="space-y-3">
                  {REQUIRED_FIELDS.map(field => (
                    <div key={field.key} className="flex flex-col md:flex-row md:items-center gap-2">
                      <div className="w-full md:w-1/3">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-700">{field.label}</span>
                          <span className="text-red-500 ml-1">*</span>
                        </div>
                        <p className="text-xs text-gray-500">{field.description}</p>
                      </div>
                      <div className="flex items-center w-full md:w-2/3">
                        <ArrowDown className="h-4 w-4 text-blue-500 md:hidden" />
                        <ArrowRight className="h-4 w-4 text-blue-500 hidden md:block mx-2" />
                        <select
                          value={fieldMapping[field.key] || ''}
                          onChange={(e) => handleFieldMappingChange(field.key, e.target.value)}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">-- Select CSV Column --</option>
                          {csvHeaders.map(header => (
                            <option key={header} value={header}>{header}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Optional Fields */}
              <div>
                <h5 className="font-medium text-blue-800 mb-2">Optional Fields</h5>
                <div className="space-y-3">
                  {OPTIONAL_FIELDS.map(field => (
                    <div key={field.key} className="flex flex-col md:flex-row md:items-center gap-2">
                      <div className="w-full md:w-1/3">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-700">{field.label}</span>
                        </div>
                        <p className="text-xs text-gray-500">{field.description}</p>
                      </div>
                      <div className="flex items-center w-full md:w-2/3">
                        <ArrowDown className="h-4 w-4 text-blue-500 md:hidden" />
                        <ArrowRight className="h-4 w-4 text-blue-500 hidden md:block mx-2" />
                        <select
                          value={fieldMapping[field.key] || ''}
                          onChange={(e) => handleFieldMappingChange(field.key, e.target.value)}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">-- Not Mapped --</option>
                          {csvHeaders.map(header => (
                            <option key={header} value={header}>{header}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Mapping Status */}
            <div className="mt-4 p-3 rounded-lg border bg-white">
              <div className="flex items-center space-x-2">
                {isRequiredFieldsMapped() ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                )}
                <span className={`font-medium ${isRequiredFieldsMapped() ? 'text-green-800' : 'text-yellow-800'}`}>
                  {isRequiredFieldsMapped() 
                    ? 'All required fields are mapped!' 
                    : 'Please map all required fields before uploading'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* CSV Preview */}
        {previewData && previewData.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview (first 3 rows)</h4>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-48">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(previewData[0]).map(header => (
                        <th key={header} className="px-3 py-2 text-left font-medium text-gray-700 border-b">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        {Object.values(row).map((value: any, cellIndex) => (
                          <td key={cellIndex} className="px-3 py-2 text-gray-900">
                            {String(value).substring(0, 30)}
                            {String(value).length > 30 ? '...' : ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Admin Approval Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">Admin Approval Required</p>
              <p className="text-xs text-blue-700 mt-1">
                For data quality and security purposes, all bulk uploads require admin approval before being added to the database. 
                An administrator will review your submission and approve it if it meets our standards.
              </p>
            </div>
          </div>
        </div>

        {/* CSV Format Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-800">CSV Format Requirements</p>
              <p className="text-xs text-gray-700 mt-1">
                Your CSV file should include these columns (column names can vary):
              </p>
              <ul className="text-xs text-gray-700 mt-1 list-disc list-inside space-y-1">
                <li><strong>Routing Number</strong> - 9-digit bank routing number</li>
                <li><strong>Account Number Last4</strong> - Last 4 digits of account number only</li>
                <li><strong>Account Holder Name</strong> - Full name on the account</li>
                <li><strong>Tags</strong> (optional) - Comma-separated tags like "fraud,stacking"</li>
                <li><strong>Notes</strong> (optional) - Additional context about the account</li>
                <li><strong>Default Balance</strong> (optional) - Amount defaulted on (if applicable)</li>
              </ul>
              <p className="text-xs text-gray-700 mt-2">
                <strong>Note:</strong> For compliance, only include the last 4 digits of account numbers.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <div className="flex justify-end">
          <button
            onClick={handleUpload}
            disabled={isUploading || !selectedFile || !isRequiredFieldsMapped()}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Submit for Approval</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}