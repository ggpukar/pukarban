import React, { useState } from 'react';
import { Upload, Download, FileText, ArrowRight } from 'lucide-react';

const DocumentConverter: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState('pdf');
  const [converting, setConverting] = useState(false);

  const supportedFormats = [
    { value: 'pdf', label: 'PDF' },
    { value: 'docx', label: 'Word Document' },
    { value: 'txt', label: 'Text File' },
    { value: 'html', label: 'HTML' },
    { value: 'rtf', label: 'Rich Text Format' },
    { value: 'odt', label: 'OpenDocument Text' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) return;
    
    setConverting(true);
    // Simulate conversion process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setConverting(false);
    
    // In a real app, this would handle the actual conversion
    alert('Conversion complete! (This is a demo)');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-500" />
          Document Converter
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* File Upload */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Upload Document
              </h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.docx,.txt,.html,.rtf,.odt"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <Upload className="w-12 h-12 text-gray-400" />
                  <p className="text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF, DOCX, TXT, HTML, RTF, ODT
                  </p>
                </label>
              </div>
              
              {selectedFile && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Selected: {selectedFile.name}
                  </p>
                  <p className="text-xs text-blue-600">
                    Size: {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Convert To
              </h3>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {supportedFormats.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Conversion Process */}
          <div className="space-y-6">
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
                <ArrowRight className="w-8 h-8 text-gray-400" />
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Download className="w-8 h-8 text-green-500" />
                </div>
              </div>
            </div>

            <button
              onClick={handleConvert}
              disabled={!selectedFile || converting}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {converting ? 'Converting...' : 'Convert Document'}
            </button>

            {converting && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentConverter;