import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { useState, useEffect } from 'react';
import { Download, ArrowLeft, Copy, Check, FileText, FileJson, Loader2 } from 'lucide-react';
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
  
  const [scanData, setScanData] = useState<ScanData | null>(state?.scanData || null);
  const [loading, setLoading] = useState<boolean>(!state?.scanData);
  const [error, setError] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  useEffect(() => {
    if (scanData) {
      setText(scanData.extracted_text);
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
              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border border-outline-variant/50 hover:bg-surface-container transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
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
