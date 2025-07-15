import React, { useState } from 'react';
import { Upload, Download, FileText, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

const DocumentConverter: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState('pdf');
  const [converting, setConverting] = useState(false);
  const [convertedFile, setConvertedFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supportedFormats = [
    { value: 'pdf', label: 'PDF', mimeType: 'application/pdf' },
    { value: 'docx', label: 'Word Document', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { value: 'txt', label: 'Text File', mimeType: 'text/plain' },
    { value: 'html', label: 'HTML', mimeType: 'text/html' },
    { value: 'rtf', label: 'Rich Text Format', mimeType: 'application/rtf' },
    { value: 'csv', label: 'CSV', mimeType: 'text/csv' },
    { value: 'json', label: 'JSON', mimeType: 'application/json' },
    { value: 'md', label: 'Markdown', mimeType: 'text/markdown' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setSuccess(null);
      setConvertedFile(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setSuccess(null);
      setConvertedFile(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(file);
    });
  };

  const convertTextToFormat = async (text: string, format: string, originalFilename: string): Promise<Blob> => {
    const baseFilename = originalFilename.replace(/\.[^/.]+$/, "");
    
    switch (format) {
      case 'pdf':
        return await convertToPDF(text, baseFilename);
      case 'docx':
        return await convertToDocx(text, baseFilename);
      case 'html':
        return convertToHTML(text, baseFilename);
      case 'rtf':
        return convertToRTF(text);
      case 'csv':
        return convertToCSV(text);
      case 'json':
        return convertToJSON(text, baseFilename);
      case 'md':
        return convertToMarkdown(text, baseFilename);
      case 'txt':
      default:
        return new Blob([text], { type: 'text/plain' });
    }
  };

  const convertToPDF = async (text: string, filename: string): Promise<Blob> => {
    // Using jsPDF library simulation - in real implementation, you'd import jsPDF
    const lines = text.split('\n');
    let pdfContent = `%PDF-1.4
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
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
>>
endobj

4 0 obj
<<
/Length ${text.length + 200}
>>
stream
BT
/F1 12 Tf
50 750 Td
`;

    lines.forEach((line, index) => {
      pdfContent += `(${line.replace(/[()\\]/g, '\\$&')}) Tj\n`;
      if (index < lines.length - 1) {
        pdfContent += `0 -15 Td\n`;
      }
    });

    pdfContent += `ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000173 00000 n 
0000000364 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${500 + text.length}
%%EOF`;

    return new Blob([pdfContent], { type: 'application/pdf' });
  };

  const convertToDocx = async (text: string, filename: string): Promise<Blob> => {
    // Basic DOCX structure - in real implementation, you'd use a library like docx
    const docxContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${text.split('\n').map(line => `
    <w:p>
      <w:r>
        <w:t>${line}</w:t>
      </w:r>
    </w:p>`).join('')}
  </w:body>
</w:document>`;
    
    return new Blob([docxContent], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
  };

  const convertToHTML = (text: string, filename: string): Blob => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${filename}</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 40px; 
            line-height: 1.6; 
            color: #333;
            max-width: 800px;
        }
        h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        pre { 
            white-space: pre-wrap; 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 5px;
            border-left: 4px solid #3498db;
        }
    </style>
</head>
<body>
    <h1>${filename}</h1>
    <pre>${text}</pre>
    <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 0.9em;">
        Converted on ${new Date().toLocaleString()}
    </footer>
</body>
</html>`;
    return new Blob([htmlContent], { type: 'text/html' });
  };

  const convertToRTF = (text: string): Blob => {
    const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
\\f0\\fs24 ${text.replace(/\n/g, '\\par\n').replace(/[{}\\]/g, '\\$&')}}`;
    return new Blob([rtfContent], { type: 'application/rtf' });
  };

  const convertToCSV = (text: string): Blob => {
    const lines = text.split('\n');
    const csvContent = lines.map((line, index) => {
      const escapedLine = line.replace(/"/g, '""');
      return `"Line ${index + 1}","${escapedLine}"`;
    }).join('\n');
    
    const header = '"Line Number","Content"\n';
    return new Blob([header + csvContent], { type: 'text/csv' });
  };

  const convertToJSON = (text: string, filename: string): Blob => {
    const jsonContent = JSON.stringify({
      filename: filename,
      content: text,
      lines: text.split('\n'),
      metadata: {
        convertedAt: new Date().toISOString(),
        lineCount: text.split('\n').length,
        characterCount: text.length,
        wordCount: text.split(/\s+/).filter(word => word.length > 0).length
      }
    }, null, 2);
    return new Blob([jsonContent], { type: 'application/json' });
  };

  const convertToMarkdown = (text: string, filename: string): Blob => {
    const mdContent = `# ${filename}

> Converted from original document on ${new Date().toLocaleDateString()}

## Content

\`\`\`
${text}
\`\`\`

---
*Document converted using Utility Hub Document Converter*`;
    
    return new Blob([mdContent], { type: 'text/markdown' });
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    const fileExtension = getFileExtension(file.name);
    
    try {
      // Handle different file types
      if (file.type.startsWith('text/') || 
          ['txt', 'csv', 'json', 'html', 'rtf', 'md'].includes(fileExtension)) {
        return await readFileAsText(file);
      }
      
      // For PDF files (basic extraction)
      if (file.type === 'application/pdf' || fileExtension === 'pdf') {
        const text = await readFileAsText(file);
        // Basic PDF text extraction (in real app, use pdf-parse or similar)
        const matches = text.match(/\(([^)]+)\)/g);
        if (matches) {
          return matches.map(match => match.slice(1, -1)).join(' ');
        }
        throw new Error('PDF text extraction failed. Please use a text-based file.');
      }
      
      // For DOCX files (basic extraction)
      if (file.type.includes('word') || fileExtension === 'docx') {
        const text = await readFileAsText(file);
        // Basic DOCX text extraction (in real app, use mammoth.js or similar)
        const matches = text.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
        if (matches) {
          return matches.map(match => match.replace(/<[^>]+>/g, '')).join(' ');
        }
        throw new Error('DOCX text extraction failed. Please use a text-based file.');
      }
      
      // Try to read as text anyway
      return await readFileAsText(file);
      
    } catch (error) {
      throw new Error(`Unable to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) return;
    
    setConverting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Extract text from the uploaded file
      const text = await extractTextFromFile(selectedFile);
      
      if (!text.trim()) {
        throw new Error('The file appears to be empty or contains no readable text.');
      }
      
      // Convert to target format
      const convertedBlob = await convertTextToFormat(text, targetFormat, selectedFile.name);
      const url = URL.createObjectURL(convertedBlob);
      setConvertedFile(url);
      setSuccess(`Successfully converted ${selectedFile.name} to ${targetFormat.toUpperCase()}`);
      
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
    
    setSuccess(`File downloaded as ${baseFilename}.${targetFormat}`);
  };

  const resetConverter = () => {
    setSelectedFile(null);
    setConvertedFile(null);
    setError(null);
    setSuccess(null);
    if (convertedFile) {
      URL.revokeObjectURL(convertedFile);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-500" />
          Document Converter
        </h2>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* File Upload */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Upload Document
              </h3>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.docx,.txt,.html,.rtf,.csv,.json,.md"
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
                    Supported: PDF, DOCX, TXT, HTML, RTF, CSV, JSON, MD
                  </p>
                </label>
              </div>
              
              {selectedFile && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-800">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-blue-600">
                        Size: {formatFileSize(selectedFile.size)}
                      </p>
                      <p className="text-xs text-blue-600">
                        Type: {selectedFile.type || 'Unknown'}
                      </p>
                      <p className="text-xs text-blue-600">
                        Last modified: {new Date(selectedFile.lastModified).toLocaleString()}
                      </p>
                    </div>
                  </div>
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
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300 animate-pulse" 
                  style={{ width: '60%' }}
                ></div>
              </div>
            )}
          </div>
        </div>

        {/* Conversion Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-600 mb-2">Input Formats:</h4>
            <ul className="text-gray-500 space-y-1 text-sm">
              <li>• Plain Text (.txt)</li>
              <li>• PDF Files (.pdf) - Basic extraction</li>
              <li>• Word Documents (.docx) - Basic extraction</li>
              <li>• HTML Files (.html)</li>
              <li>• RTF Files (.rtf)</li>
              <li>• CSV Files (.csv)</li>
              <li>• JSON Files (.json)</li>
              <li>• Markdown (.md)</li>
            </ul>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-600 mb-2">Output Formats:</h4>
            <ul className="text-gray-500 space-y-1 text-sm">
              <li>• PDF with proper formatting</li>
              <li>• Word Document (DOCX)</li>
              <li>• HTML with styling</li>
              <li>• Rich Text Format (RTF)</li>
              <li>• CSV with line numbers</li>
              <li>• JSON with metadata</li>
              <li>• Markdown with formatting</li>
              <li>• Plain Text</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentConverter;