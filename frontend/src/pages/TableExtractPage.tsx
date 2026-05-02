import { useRef, useState } from 'react';
import { Download, FileSpreadsheet, Loader2, UploadCloud } from 'lucide-react';
import Layout from '../components/Layout';
import { api } from '../lib/axios';

export default function TableExtractPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tableText, setTableText] = useState('');
  const [fileName, setFileName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [excelUrl, setExcelUrl] = useState<string>('');
  const [downloadFilename, setDownloadFilename] = useState<string>('');

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG).');
      return;
    }

    setError('');
    setLoading(true);
    setFileName(file.name);
    setTableText('');
    setExcelUrl('');
    setDownloadFilename('');

    try {
      const tableFormData = new FormData();
      tableFormData.append('file', file);

      const tableTextResponse = await api.post('/ocr/extract-table-text', tableFormData);
      setTableText(tableTextResponse.data?.table_text || '');

      const exportFormData = new FormData();
      exportFormData.append('file', file);

      const exportResponse = await api.post(
        '/ocr/export-table',
        exportFormData,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(exportResponse.data);
      setExcelUrl(url);

      const baseFilename = file.name.split('.')[0];
      setDownloadFilename(`${baseFilename}_tables.xlsx`);

    } catch (err: any) {
      console.error('Error extracting table:', err);
      setError(err.response?.data?.detail || 'Failed to extract table');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!excelUrl) return;
    const link = document.createElement('a');
    link.href = excelUrl;
    link.download = downloadFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Clean up the object URL after some time
    setTimeout(() => window.URL.revokeObjectURL(excelUrl), 100);
  };

  return (
    <Layout title="Table to Excel">
      <div className="max-w-4xl mx-auto space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            {error}
          </div>
        )}

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Image Table to Excel</h2>
              <p className="text-sm text-on-surface/60">Upload a table image to extract TSV and download Excel.</p>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) {
                handleFileSelect(file);
              }
            }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium rounded-md border border-outline-variant/50 hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            {loading ? 'Extracting Table...' : 'Select Table Image'}
          </button>
        </div>

        {(tableText || loading) && (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-semibold">
                Extracted TSV: <span className="font-normal text-on-surface/80">{fileName}</span>
              </h3>
              {excelUrl && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-primary text-on-primary hover:bg-primary/90 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Excel
                </button>
              )}
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <pre className="bg-surface-container p-4 rounded-md text-sm overflow-x-auto">
                {tableText}
              </pre>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
