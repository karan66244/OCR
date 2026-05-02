import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { useState, useEffect, useRef } from 'react';
import { Download, ArrowLeft, Copy, Check, FileText, FileJson, Loader2, FileSpreadsheet } from 'lucide-react';
import { api } from '../lib/axios';

interface ScanData {
  id: string;
  file_name: string;
  extracted_text: string;
  edited_text?: string;
  confidence_score: number;
}

export default function ResultPage() {
  const { state } = useLocation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const exportFileInputRef = useRef<HTMLInputElement>(null);
  const locationState = state as { scanData?: ScanData; originalFile?: File; tableText?: string } | null;
  
  const [scanData, setScanData] = useState<ScanData | null>(locationState?.scanData || null);
  const [loading, setLoading] = useState<boolean>(!state?.scanData);
  const [error, setError] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(locationState?.originalFile || null);
  const [pendingTableAction, setPendingTableAction] = useState<'xlsx' | 'text' | null>(null);

  useEffect(() => {
    if (scanData) {
      const nextText = locationState?.tableText || scanData.extracted_text;
      setText(nextText);
      setLoading(false);
    }
  }, [scanData]);

  useEffect(() => {
    if (!scanData && id) {
      const fetchScanData = async () => {
        try {
          setLoading(true);
          setError('');
          const response = await api.get(`/history/${id}`);
          setScanData(response.data);
        } catch (err: any) {
          console.error('Error fetching scan:', err);
          setError(err.response?.data?.detail || 'Failed to load scan');
          setLoading(false);
        }
      };
      fetchScanData();
    }
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setIsEdited(true);
  };

  const handleSaveEdit = async () => {
    if (!scanData) return;
    setIsSaving(true);
    try {
      await api.put(`/ocr/scan/${scanData.id}`, {
        edited_text: text
      });
      setIsEdited(false);
      alert('Text saved successfully!');
    } catch (error) {
      console.error('Error saving text:', error);
      alert('Failed to save text');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'txt') => {
    if (!scanData) return;
    setIsExporting(format);
    try {
      const response = await api.get(
        `/ocr/export/${scanData.id}/${format}`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      
      const baseFilename = scanData.file_name.split('.')[0];
      link.download = `${baseFilename}_extracted.${format}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error);
      alert(`Failed to export to ${format.toUpperCase()}`);
    } finally {
      setIsExporting(null);
    }
  };

  const exportTableToXlsx = async (file: File) => {
    setIsExporting('xlsx');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(
        '/ocr/export-table',
        formData,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;

      const baseFilename = file.name.split('.')[0];
      link.download = `${baseFilename}_tables.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting table to XLSX:', error);
      alert('Failed to export table to XLSX');
    } finally {
      setIsExporting(null);
    }
  };

  const extractTableText = async (file: File) => {
    setIsExporting('table-text');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/ocr/extract-table-text', formData);
      setText(response.data?.table_text || '');
      setIsEdited(true);
    } catch (error) {
      console.error('Error extracting table text:', error);
      alert('Failed to extract table text');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportTable = async () => {
    if (originalFile) {
      await exportTableToXlsx(originalFile);
      return;
    }

    setPendingTableAction('xlsx');
    exportFileInputRef.current?.click();
  };

  const handleExtractTableText = async () => {
    if (originalFile) {
      await extractTableText(originalFile);
      return;
    }

    setPendingTableAction('text');
    exportFileInputRef.current?.click();
  };

  const handleTableFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    e.target.value = '';

    if (!file) {
      setPendingTableAction(null);
      return;
    }

    setOriginalFile(file);

    if (pendingTableAction === 'xlsx') {
      setPendingTableAction(null);
      await exportTableToXlsx(file);
      return;
    }

    if (pendingTableAction === 'text') {
      setPendingTableAction(null);
      await extractTableText(file);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Layout title="Loading Result">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-on-surface/60">Loading scan result...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error or not found state
  if (error || !scanData) {
    return (
      <Layout title="Error">
        <div className="max-w-2xl mx-auto mt-10">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-red-800 font-semibold mb-2">Unable to Load Scan</h2>
            <p className="text-red-700 mb-4">{error || 'Scan not found'}</p>
            <button 
              onClick={() => navigate('/history')} 
              className="text-primary hover:underline font-medium"
            >
              Go back to History
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Scan Result">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-on-surface/60 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to scanner
        </button>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm flex flex-col h-[80vh]">
          {/* Header */}
          <div className="p-4 border-b border-outline-variant/30 bg-surface-container-low shrink-0">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="font-semibold text-lg">{scanData.file_name}</h2>
                <p className="text-sm text-on-surface/60">
                  Confidence: <span className={scanData.confidence_score > 80 ? 'text-green-600 font-semibold' : 'text-yellow-600 font-semibold'}>
                    {scanData.confidence_score.toFixed(1)}%
                  </span>
                </p>
              </div>
              {isEdited && (
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="px-3 py-1.5 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Edits'}
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <input
                ref={exportFileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleTableFileSelect}
              />

              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border border-outline-variant/50 hover:bg-surface-container transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>

              <button 
                onClick={handleExportTable}
                disabled={isExporting === 'xlsx'}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border border-outline-variant/50 hover:bg-surface-container transition-colors disabled:opacity-50"
              >
                <FileSpreadsheet className="w-4 h-4" />
                {isExporting === 'xlsx' ? 'Exporting...' : 'XLSX (Table)'}
              </button>

              <button 
                onClick={handleExtractTableText}
                disabled={isExporting === 'table-text'}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border border-outline-variant/50 hover:bg-surface-container transition-colors disabled:opacity-50"
              >
                <FileSpreadsheet className="w-4 h-4" />
                {isExporting === 'table-text' ? 'Extracting...' : 'Extract Table (TSV)'}
              </button>

              <button 
                onClick={() => handleExport('txt')}
                disabled={isExporting === 'txt'}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border border-outline-variant/50 hover:bg-surface-container transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isExporting === 'txt' ? 'Exporting...' : 'TXT'}
              </button>

              <button 
                onClick={() => handleExport('docx')}
                disabled={isExporting === 'docx'}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border border-outline-variant/50 hover:bg-surface-container transition-colors disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                {isExporting === 'docx' ? 'Exporting...' : 'DOCX'}
              </button>

              <button 
                onClick={() => handleExport('pdf')}
                disabled={isExporting === 'pdf'}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border border-outline-variant/50 hover:bg-surface-container transition-colors disabled:opacity-50"
              >
                <FileJson className="w-4 h-4" />
                {isExporting === 'pdf' ? 'Exporting...' : 'PDF'}
              </button>
            </div>
          </div>

          {/* Text Editor - Simple Textarea */}
          <div className="flex-1 overflow-hidden bg-white">
            <textarea
              className="w-full h-full p-4 resize-none focus:outline-none font-mono text-sm border-none"
              value={text}
              onChange={handleTextChange}
              placeholder="Extracted text will appear here..."
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
