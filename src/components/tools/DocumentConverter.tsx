import React, { useState } from 'react';
import { Upload, Download, FileText, ArrowRight, AlertCircle } from 'lucide-react';

const DocumentConverter: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState('pdf');
  const [converting, setConverting] = useState(false);
  const [convertedFile, setConvertedFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supportedFormats = [
    { value: 'pdf', label: 'PDF', mimeType: 'application/pdf' },
    { value: 'docx', label: 'Word Document', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { value: 'txt', label: 'Text File', mimeType: 'text/plain' },
    { value: 'html', label: 'HTML', mimeType: 'text/html' },
    { value: 'rtf', label: 'Rich Text Format', mimeType: 'application/rtf' },
    { value: 'csv', label: 'CSV', mimeType: 'text/csv' },
    { value: 'json', label: 'JSON', mimeType: 'application/json' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setConvertedFile(null);
    }
  };

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const convertTextToFormat = async (text: string, format: string, originalFilename: string): Promise<Blob> => {
    const baseFilename = originalFilename.replace(/\.[^/.]+$/, "");
    
    switch (format) {
      case 'pdf':
        // Create a simple PDF-like structure (this is a basic implementation)
        const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length ${text.length + 50}
>>
stream
BT
/F1 12 Tf
50 750 Td
(${text.replace(/\n/g, ') Tj T* (')}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000173 00000 n 
0000000301 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${400 + text.length}
%%EOF`;
        return new Blob([pdfContent], { type: 'application/pdf' });

      case 'docx':
        // Create a basic DOCX structure (simplified)
        const docxContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>${text}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;
        return new Blob([docxContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

      case 'html':
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${baseFilename}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        pre { white-space: pre-wrap; }
    </style>
</head>
<body>
    <h1>${baseFilename}</h1>
    <pre>${text}</pre>
</body>
</html>`;
        return new Blob([htmlContent], { type: 'text/html' });

      case 'rtf':
        const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
\\f0\\fs24 ${text.replace(/\n/g, '\\par ')}}`;
        return new Blob([rtfContent], { type: 'application/rtf' });

      case 'csv':
        // Convert text to CSV format (simple line-by-line)
        const csvContent = text.split('\n').map(line => `"${line.replace(/"/g, '""')}"`).join('\n');
        return new Blob([csvContent], { type: 'text/csv' });

      case 'json':
        const jsonContent = JSON.stringify({
          filename: baseFilename,
          content: text,
          lines: text.split('\n'),
          convertedAt: new Date().toISOString()
        }, null, 2);
        return new Blob([jsonContent], { type: 'application/json' });

      case 'txt':
      default:
        return new Blob([text], { type: 'text/plain' });
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const handleConvert = async () => {
    if (!selectedFile) return;
    
    setConverting(true);
    setError(null);
    
    try {
      const fileExtension = getFileExtension(selectedFile.name);
      let text: string;

      // Read file content based on type
      if (selectedFile.type.startsWith('text/') || 
          ['txt', 'csv', 'json', 'html', 'rtf'].includes(fileExtension)) {
        text = await readFileAsText(selectedFile);
      } else if (selectedFile.type === 'application/pdf') {
        // For PDF files, we'd need a PDF parser library
        // For now, show an error message
        throw new Error('PDF parsing requires additional libraries. Please upload a text-based file.');
      } else if (selectedFile.type.includes('word') || fileExtension === 'docx') {
        // For DOCX files, we'd need a DOCX parser library
        throw new Error('DOCX parsing requires additional libraries. Please upload a text-based file.');
      } else {
        // Try to read as text anyway
        text = await readFileAsText(selectedFile);
      }

      // Convert to target format
      const convertedBlob = await convertTextToFormat(text, targetFormat, selectedFile.name);
      const url = URL.createObjectURL(convertedBlob);
      setConvertedFile(url);

    } catch (error) {
      console.error('Conversion error:', error);
      setError(error instanceof Error ? error.message : 'Conversion failed');
    } finally {
      setConverting(false);
    }
  };

  const downloadFile = () => {
    if (!convertedFile || !selectedFile) return;
    
    const link = document.createElement('a');
    link.href = convertedFile;
    const baseFilename = selectedFile.name.replace(/\.[^/.]+$/, "");
    link.download = `${baseFilename}.${targetFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetConverter = () => {
    setSelectedFile(null);
    setConvertedFile(null);
    setError(null);
    if (convertedFile) {
      URL.revokeObjectURL(convertedFile);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-500" />
          Document Converter
        </h2>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

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
                  accept=".pdf,.docx,.txt,.html,.rtf,.csv,.json"
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
                    Supported: TXT, CSV, JSON, HTML, RTF
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
                  <p className="text-xs text-blue-600">
                    Type: {selectedFile.type || 'Unknown'}
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

            <div className="space-y-4">
              <button
                onClick={handleConvert}
                disabled={!selectedFile || converting}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {converting ? 'Converting...' : 'Convert Document'}
              </button>

              {convertedFile && (
                <button
                  onClick={downloadFile}
                  className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Converted File
                </button>
              )}

              <button
                onClick={resetConverter}
                className="w-full bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                Reset
              </button>
            </div>

            {converting && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            )}
          </div>
        </div>

        {/* Supported Conversions Info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Supported Conversions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-600 mb-2">Input Formats:</h4>
              <ul className="text-gray-500 space-y-1">
                <li>• Plain Text (.txt)</li>
                <li>• CSV Files (.csv)</li>
                <li>• JSON Files (.json)</li>
                <li>• HTML Files (.html)</li>
                <li>• RTF Files (.rtf)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-600 mb-2">Output Formats:</h4>
              <ul className="text-gray-500 space-y-1">
                <li>• PDF (Basic)</li>
                <li>• Word Document (Basic)</li>
                <li>• Plain Text</li>
                <li>• HTML</li>
                <li>• RTF</li>
                <li>• CSV</li>
                <li>• JSON</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Note: This is a basic converter. For advanced PDF and DOCX processing, consider using dedicated libraries or services.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocumentConverter;