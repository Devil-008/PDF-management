import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

function ToolPage() {
  let { toolName } = useParams();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [mergedPdfUrl, setMergedPdfUrl] = useState('');

  // Capitalize the first letter for display
  const displayToolName = toolName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const handleFileChange = (event) => {
    setSelectedFiles(Array.from(event.target.files));
    setMergedPdfUrl(''); // Reset on new file selection
  };

  const handleMerge = async () => {
    if (selectedFiles.length < 2) {
      alert('Please select at least 2 files to merge.');
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      // Add a loading indicator here if desired
      const response = await fetch('http://localhost:5000/api/merge', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setMergedPdfUrl(url);
      } else {
        alert('Failed to merge PDFs. Please try again.');
      }
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('An error occurred while merging PDFs.');
    }
    // Stop loading indicator here
  };

  const renderToolContent = () => {
    if (toolName === 'merge') {
      return (
        <div className="flex flex-col items-center">
          <p className="text-gray-600 mb-6">Select two or more PDF files to combine into a single document.</p>
          <input 
            type="file" 
            multiple 
            accept=".pdf" 
            onChange={handleFileChange} 
            className="mb-4 p-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
          />
          <button 
            onClick={handleMerge} 
            disabled={selectedFiles.length < 2}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg disabled:bg-gray-400 transition-colors"
          >
            Merge PDFs
          </button>
          {mergedPdfUrl && (
            <div className="mt-6 p-4 bg-green-100 rounded-lg text-center">
              <h4 className="font-bold text-green-800">Merge Successful!</h4>
              <a 
                href={mergedPdfUrl} 
                download={`merged-${Date.now()}.pdf`} 
                className="inline-block mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Download Merged PDF
              </a>
            </div>
          )}
        </div>
      );
    } else if (toolName === 'split') {
      return (
        <SplitPdfTool />
      );
    }

     else if (toolName === 'rotate') {
      return (
        <RotatePdfTool />
      );
    }

    else if (toolName === 'protect') {
      return (
        <ProtectPdfTool />
      );
    }

     else if (toolName === 'unlock') {
      return (
        <UnlockPdfTool />
      );
    }

     else if (toolName === 'watermark') {
      return (
        <WatermarkPdfTool />
      );
    }

     else if (toolName === 'compress') {
      return (
        <CompressPdfTool />
      );
    } else if (toolName === 'word-to-pdf' || toolName === 'pdf-to-word' ||
               toolName === 'excel-to-pdf' || toolName === 'pdf-to-excel' ||
               toolName === 'ppt-to-pdf' || toolName === 'pdf-to-ppt') {
      return (
        <OfficeConversionTool toolName={toolName} />
      );
    }

    return <NotImplementedTool toolName={toolName} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
          {displayToolName} Tool
        </h1>
        {renderToolContent()}
      </div>
    </div>
  );
}

// New component for Not Implemented Tools
function NotImplementedTool({ toolName }) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-gray-600 mb-6">The <strong>{toolName}</strong> tool is currently under development.</p>
      <p className="text-gray-600">Please check back later for updates!</p>
    </div>
  );
}

// New component for Watermark PDF Tool
function WatermarkPdfTool() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkedPdfUrl, setWatermarkedPdfUrl] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setWatermarkedPdfUrl('');
  };

  const handleTextChange = (event) => {
    setWatermarkText(event.target.value);
  };

  const handleWatermark = async () => {
    if (!selectedFile) {
      alert('Please select a PDF file.');
      return;
    }
    if (!watermarkText.trim()) {
      alert('Please enter watermark text.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('text', watermarkText);

    try {
      const response = await fetch('http://localhost:5000/api/watermark', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setWatermarkedPdfUrl(url);
      } else {
        alert('Failed to add watermark. Please try again.');
      }
    } catch (error) {
      console.error('Error adding watermark:', error);
      alert('An error occurred while adding the watermark.');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-gray-600 mb-6">Add a text watermark to your PDF document.</p>
      <input 
        type="file" 
        accept=".pdf" 
        onChange={handleFileChange} 
        className="mb-4 p-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
      />
      <input 
        type="text" 
        placeholder="Enter watermark text" 
        value={watermarkText} 
        onChange={handleTextChange} 
        className="mb-4 p-2 border rounded-lg w-full max-w-md text-center"
      />
      <button 
        onClick={handleWatermark} 
        disabled={!selectedFile || !watermarkText.trim()}
        className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg disabled:bg-gray-400 transition-colors"
      >
        Add Watermark
      </button>
      {watermarkedPdfUrl && (
        <div className="mt-6 p-4 bg-green-100 rounded-lg text-center">
          <h4 className="font-bold text-green-800">Watermark Added!</h4>
          <a 
            href={watermarkedPdfUrl} 
            download={`watermarked-${Date.now()}.pdf`} 
            className="inline-block mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Download Watermarked PDF
          </a>
        </div>
      )}
    </div>
  );
}

// New component for Unlock PDF Tool
function UnlockPdfTool() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [password, setPassword] = useState('');
  const [unlockedPdfUrl, setUnlockedPdfUrl] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUnlockedPdfUrl('');
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleUnlock = async () => {
    if (!selectedFile) {
      alert('Please select a PDF file to unlock.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (password.trim()) {
      formData.append('password', password);
    }

    try {
      const response = await fetch('http://localhost:5000/api/unlock', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setUnlockedPdfUrl(url);
      } else {
        const errorText = await response.text();
        alert(`Failed to unlock PDF: ${errorText}. Please try again.`);
      }
    } catch (error) {
      console.error('Error unlocking PDF:', error);
      alert('An error occurred while unlocking the PDF.');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-gray-600 mb-6">Remove password protection from your PDF document.</p>
      <input 
        type="file" 
        accept=".pdf" 
        onChange={handleFileChange} 
        className="mb-4 p-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
      />
      <input 
        type="password" 
        placeholder="Enter password (if protected)" 
        value={password} 
        onChange={handlePasswordChange} 
        className="mb-4 p-2 border rounded-lg w-full max-w-md text-center"
      />
      <button 
        onClick={handleUnlock} 
        disabled={!selectedFile}
        className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg disabled:bg-gray-400 transition-colors"
      >
        Unlock PDF
      </button>
      {unlockedPdfUrl && (
        <div className="mt-6 p-4 bg-green-100 rounded-lg text-center">
          <h4 className="font-bold text-green-800">Unlock Successful!</h4>
          <a 
            href={unlockedPdfUrl} 
            download={`unlocked-${Date.now()}.pdf`} 
            className="inline-block mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Download Unlocked PDF
          </a>
        </div>
      )}
    </div>
  );
}

// New component for Protect PDF Tool
function ProtectPdfTool() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [password, setPassword] = useState('');
  const [protectedPdfUrl, setProtectedPdfUrl] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setProtectedPdfUrl('');
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleProtect = async () => {
    if (!selectedFile) {
      alert('Please select a PDF file to protect.');
      return;
    }
    if (!password.trim()) {
      alert('Please enter a password.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('password', password);

    try {
      const response = await fetch('http://localhost:5000/api/protect', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setProtectedPdfUrl(url);
      } else {
        alert('Failed to protect PDF. Please try again.');
      }
    } catch (error) {
      console.error('Error protecting PDF:', error);
      alert('An error occurred while protecting the PDF.');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-gray-600 mb-6">Add a password to protect your PDF document.</p>
      <input 
        type="file" 
        accept=".pdf" 
        onChange={handleFileChange} 
        className="mb-4 p-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
      />
      <input 
        type="password" 
        placeholder="Enter password" 
        value={password} 
        onChange={handlePasswordChange} 
        className="mb-4 p-2 border rounded-lg w-full max-w-md text-center"
      />
      <button 
        onClick={handleProtect} 
        disabled={!selectedFile || !password.trim()}
        className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg disabled:bg-gray-400 transition-colors"
      >
        Protect PDF
      </button>
      {protectedPdfUrl && (
        <div className="mt-6 p-4 bg-green-100 rounded-lg text-center">
          <h4 className="font-bold text-green-800">Protection Successful!</h4>
          <a 
            href={protectedPdfUrl} 
            download={`protected-${Date.now()}.pdf`} 
            className="inline-block mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Download Protected PDF
          </a>
        </div>
      )}
    </div>
  );
}

// New component for Rotate PDF Tool
function RotatePdfTool() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [rotationAngle, setRotationAngle] = useState('90');
  const [rotatedPdfUrl, setRotatedPdfUrl] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setRotatedPdfUrl('');
  };

  const handleAngleChange = (event) => {
    setRotationAngle(event.target.value);
  };

  const handleRotate = async () => {
    if (!selectedFile) {
      alert('Please select a PDF file to rotate.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('angle', rotationAngle);

    try {
      const response = await fetch('http://localhost:5000/api/rotate', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setRotatedPdfUrl(url);
      } else {
        alert('Failed to rotate PDF. Please try again.');
      }
    } catch (error) {
      console.error('Error rotating PDF:', error);
      alert('An error occurred while rotating the PDF.');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-gray-600 mb-6">Rotate all pages in your PDF document by 90, 180, or 270 degrees.</p>
      <input 
        type="file" 
        accept=".pdf" 
        onChange={handleFileChange} 
        className="mb-4 p-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
      />
      <select 
        value={rotationAngle} 
        onChange={handleAngleChange} 
        className="mb-4 p-2 border rounded-lg w-full max-w-md text-center"
      >
        <option value="90">90 Degrees</option>
        <option value="180">180 Degrees</option>
        <option value="270">270 Degrees</option>
      </select>
      <button 
        onClick={handleRotate} 
        disabled={!selectedFile}
        className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg disabled:bg-gray-400 transition-colors"
      >
        Rotate PDF
      </button>
      {rotatedPdfUrl && (
        <div className="mt-6 p-4 bg-green-100 rounded-lg text-center">
          <h4 className="font-bold text-green-800">Rotation Successful!</h4>
          <a 
            href={rotatedPdfUrl} 
            download={`rotated-${Date.now()}.pdf`} 
            className="inline-block mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Download Rotated PDF
          </a>
        </div>
      )}
    </div>
  );
}

// New component for Split PDF Tool
function SplitPdfTool() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [pageRanges, setPageRanges] = useState('');
  const [splitPdfUrl, setSplitPdfUrl] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setSplitPdfUrl('');
  };

  const handlePageRangesChange = (event) => {
    setPageRanges(event.target.value);
  };

  const handleSplit = async () => {
    if (!selectedFile) {
      alert('Please select a PDF file to split.');
      return;
    }
    if (!pageRanges.trim()) {
      alert('Please enter the page ranges to split.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('ranges', pageRanges);

    try {
      const response = await fetch('http://localhost:5000/api/split', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setSplitPdfUrl(url);
      } else {
        alert('Failed to split PDF. Please check your page ranges and try again.');
      }
    } catch (error) {
      console.error('Error splitting PDF:', error);
      alert('An error occurred while splitting the PDF.');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-gray-600 mb-6">Extract specific pages from your PDF document.</p>
      <input 
        type="file" 
        accept=".pdf" 
        onChange={handleFileChange} 
        className="mb-4 p-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
      />
      <input 
        type="text" 
        placeholder="e.g., 1-3, 5, 7-9" 
        value={pageRanges} 
        onChange={handlePageRangesChange} 
        className="mb-4 p-2 border rounded-lg w-full max-w-md text-center"
      />
      <button 
        onClick={handleSplit} 
        disabled={!selectedFile || !pageRanges.trim()}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg disabled:bg-gray-400 transition-colors"
      >
        Split PDF
      </button>
      {splitPdfUrl && (
        <div className="mt-6 p-4 bg-green-100 rounded-lg text-center">
          <h4 className="font-bold text-green-800">Split Successful!</h4>
          <a 
            href={splitPdfUrl} 
            download={`split-${Date.now()}.pdf`} 
            className="inline-block mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Download Split PDF
          </a>
        </div>
      )}
    </div>
  );
}

// New component for Compress PDF Tool
function CompressPdfTool() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [compressedPdfUrl, setCompressedPdfUrl] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setCompressedPdfUrl('');
  };

  const handleCompress = async () => {
    if (!selectedFile) {
      alert('Please select a PDF file to compress.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/api/compress', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setCompressedPdfUrl(url);
      } else {
        alert('Failed to compress PDF. Please ensure Ghostscript is installed on the server and try again.');
      }
    } catch (error) {
      console.error('Error compressing PDF:', error);
      alert('An error occurred while compressing the PDF. Please ensure Ghostscript is installed on the server.');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-gray-600 mb-6">Reduce the file size of your PDF document.</p>
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="mb-4 p-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      <button
        onClick={handleCompress}
        disabled={!selectedFile}
        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg disabled:bg-gray-400 transition-colors"
      >
        Compress PDF
      </button>
      {compressedPdfUrl && (
        <div className="mt-6 p-4 bg-green-100 rounded-lg text-center">
          <h4 className="font-bold text-green-800">Compression Successful!</h4>
          <a
            href={compressedPdfUrl}
            download={`compressed-${Date.now()}.pdf`}
            className="inline-block mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Download Compressed PDF
          </a>
        </div>
      )}
    </div>
  );
}

// New component for Office Conversion Tools
function OfficeConversionTool({ toolName }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [convertedFileUrl, setConvertedFileUrl] = useState('');
  const [conversionMessage, setConversionMessage] = useState('');

  const conversionMap = {
    'word-to-pdf': { input: '.doc,.docx', output: 'pdf', description: 'Convert your Word document to PDF.' },
    'pdf-to-word': { input: '.pdf', output: 'docx', description: 'Convert your PDF document to Word.' },
    'excel-to-pdf': { input: '.xls,.xlsx', output: 'pdf', description: 'Convert your Excel spreadsheet to PDF.' },
    'pdf-to-excel': { input: '.pdf', output: 'xlsx', description: 'Convert your PDF document to Excel.' },
    'ppt-to-pdf': { input: '.ppt,.pptx', output: 'pdf', description: 'Convert your PowerPoint presentation to PDF.' },
    'pdf-to-ppt': { input: '.pdf', output: 'pptx', description: 'Convert your PDF document to PowerPoint.' },
  };

  const { input, output, description } = conversionMap[toolName] || {};

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setConvertedFileUrl('');
    setConversionMessage('');
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      alert('Please select a file to convert.');
      return;
    }

    setConversionMessage('Converting...');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('outputFormat', output);

    try {
      const response = await fetch('http://localhost:5000/api/convert-office', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setConvertedFileUrl(url);
        setConversionMessage('Conversion Successful!');
      } else {
        const errorText = await response.text();
        setConversionMessage(`Conversion Failed: ${errorText}. Please ensure LibreOffice is installed on the server.`);
      }
    } catch (error) {
      console.error('Error during conversion:', error);
      setConversionMessage('An error occurred during conversion. Please ensure LibreOffice is installed on the server.');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-gray-600 mb-6">{description}</p>
      <input 
        type="file" 
        accept={input} 
        onChange={handleFileChange} 
        className="mb-4 p-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
      />
      <button 
        onClick={handleConvert} 
        disabled={!selectedFile}
        className="bg-sky-500 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-lg disabled:bg-gray-400 transition-colors"
      >
        Convert
      </button>
      {conversionMessage && <p className="mt-4 text-gray-700">{conversionMessage}</p>}
      {convertedFileUrl && (
        <div className="mt-6 p-4 bg-green-100 rounded-lg text-center">
          <h4 className="font-bold text-green-800">Download your converted file!</h4>
          <a 
            href={convertedFileUrl} 
            download={`converted-${Date.now()}.${output}`} 
            className="inline-block mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Download Converted File
          </a>
        </div>
      )}
    </div>
  );
}

export default ToolPage;