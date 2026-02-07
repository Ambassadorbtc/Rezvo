import { useState } from 'react';
import ToolLayout from './ToolLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Loader2, Check, X, AlertTriangle } from 'lucide-react';
import api from '../../lib/api';

export default function BrokenLinkTool() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const check = async () => {
    if (!url.trim()) return;
    setLoading(true); setError(''); setData(null);
    try { const res = await api.post('/tools/check-links', { url }); setData(res.data); }
    catch (e) { setError(e.response?.data?.detail || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <ToolLayout title="Broken Link Checker" subtitle="Find 404 errors and broken links on any webpage.">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Input placeholder="Enter URL (e.g. example.com)" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()} className="flex-1 bg-cream border-gray-200 rounded-xl h-12" />
          <Button onClick={check} disabled={loading} className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-12 px-8 font-bold">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check Links'}
          </Button>
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {loading && <p className="text-navy-400 text-sm">Checking up to 50 links... this may take a moment.</p>}
        {data && (
          <div className="space-y-4 anim-fade-up">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="bg-[#E8F5F3] rounded-2xl p-4 text-center"><p className="font-display text-2xl font-bold text-teal-600">{data.total_checked}</p><p className="text-xs text-navy-500">Links checked</p></div>
              <div className="bg-[#D1FAE5] rounded-2xl p-4 text-center"><p className="font-display text-2xl font-bold text-emerald-600">{data.total_checked - data.broken_count}</p><p className="text-xs text-navy-500">Working</p></div>
              <div className={`${data.broken_count > 0 ? 'bg-[#FEE2E2]' : 'bg-[#D1FAE5]'} rounded-2xl p-4 text-center`}><p className={`font-display text-2xl font-bold ${data.broken_count > 0 ? 'text-red-500' : 'text-emerald-600'}`}>{data.broken_count}</p><p className="text-xs text-navy-500">Broken</p></div>
            </div>
            {data.broken_count > 0 && (
              <div>
                <h3 className="font-display font-bold text-navy-900 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" /> Broken Links</h3>
                {data.results.filter(r => !r.ok).map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 bg-red-50 rounded-lg text-sm mb-1.5">
                    <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span className="text-red-700 truncate flex-1 font-mono text-xs">{r.url}</span>
                    <span className="text-red-400 text-xs font-medium">{r.status || 'Timeout'}</span>
                  </div>
                ))}
              </div>
            )}
            <div>
              <h3 className="font-display font-bold text-navy-900 mb-2">All Links</h3>
              <div className="space-y-1 max-h-[400px] overflow-y-auto">
                {data.results.map((r, i) => (
                  <div key={i} className={`flex items-center gap-2 p-2 rounded-lg text-sm ${r.ok ? 'hover:bg-cream' : 'bg-red-50'}`}>
                    {r.ok ? <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> : <X className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
                    <span className={`truncate flex-1 font-mono text-xs ${r.ok ? 'text-navy-600' : 'text-red-600'}`}>{r.url}</span>
                    <span className={`text-xs ${r.ok ? 'text-emerald-500' : 'text-red-400'}`}>{r.status || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
