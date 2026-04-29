import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../lib/axios';
import { FileText, Loader2, Trash2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HistoryPage() {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/history');
      setScans(response.data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteScan = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/history/${id}`);
      setScans(scans.filter(s => s.id !== id));
    } catch (err) {
      console.error("Failed to delete scan", err);
    }
  };

  return (
    <Layout title="Scan History">
      <div className="max-w-5xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : scans.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-outline-variant/30">
            <FileText className="w-12 h-12 mx-auto text-on-surface/30 mb-4" />
            <h3 className="text-lg font-medium text-on-surface/80">No scans yet</h3>
            <p className="text-on-surface/60 mb-6">Upload a document to see your history here.</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-primary hover:underline font-medium"
            >
              Start scanning
            </button>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low border-b border-outline-variant/30">
                <tr>
                  <th className="px-6 py-4 font-medium text-on-surface/70">File Name</th>
                  <th className="px-6 py-4 font-medium text-on-surface/70">Date</th>
                  <th className="px-6 py-4 font-medium text-on-surface/70">Confidence</th>
                  <th className="px-6 py-4 font-medium text-on-surface/70 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {scans.map((scan) => (
                  <tr 
                    key={scan.id} 
                    className="hover:bg-surface-container/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/result/${scan.id}`, { state: { scanData: scan } })}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="font-medium">{scan.file_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface/70">
                      {new Date(scan.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${scan.confidence_score > 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {scan.confidence_score.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          className="p-2 text-on-surface/60 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                          title="View Result"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => deleteScan(scan.id, e)}
                          className="p-2 text-on-surface/60 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Scan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
