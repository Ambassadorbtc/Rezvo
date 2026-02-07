import { useState } from 'react';
import ToolLayout from './ToolLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Loader2, Check, X } from 'lucide-react';
import api from '../../lib/api';

export default function RobotsTxtTool() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const check = async () => {
    if (!domain.trim()) return;
    setLoading(true); setError(''); setData(null);
    try { const res = await api.post('/tools/robots-txt', { domain }); setData(res.data); }
    catch (e) { setError(e.response?.data?.detail || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <ToolLayout title="Robots.txt Checker" subtitle="Fetch and analyze any website's robots.txt file.">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Input placeholder="Enter domain (e.g. example.com)" value={domain} onChange={e => setDomain(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()} className="flex-1 bg-cream border-gray-200 rounded-xl h-12" data-testid="robots-domain" />
          <Button onClick={check} disabled={loading} className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-12 px-8 font-bold">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check'}
          </Button>
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {data && (
          <div className="space-y-6 anim-fade-up">
            <div className={`p-4 rounded-xl flex items-center gap-2 text-sm ${data.found ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
              {data.found ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />} {data.found ? 'robots.txt found' : 'robots.txt not found'}
            </div>
            {data.found && (
              <>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="bg-[#E8F5F3] rounded-2xl p-4 text-center"><p className="font-display text-2xl font-bold text-teal-600">{data.line_count}</p><p className="text-xs text-navy-500">Lines</p></div>
                  <div className="bg-[#EDE9FE] rounded-2xl p-4 text-center"><p className="font-display text-2xl font-bold text-purple-600">{data.disallowed_paths?.length || 0}</p><p className="text-xs text-navy-500">Disallowed paths</p></div>
                  <div className="bg-[#DBEAFE] rounded-2xl p-4 text-center"><p className="font-display text-2xl font-bold text-blue-600">{data.sitemaps?.length || 0}</p><p className="text-xs text-navy-500">Sitemaps listed</p></div>
                </div>
                {data.sitemaps?.length > 0 && (
                  <div><h3 className="font-display font-bold text-navy-900 mb-2">Sitemaps Found</h3>
                    {data.sitemaps.map((s, i) => <a key={i} href={s} target="_blank" rel="noopener noreferrer" className="block text-teal-600 text-sm hover:underline truncate">{s}</a>)}
                  </div>
                )}
                <div><h3 className="font-display font-bold text-navy-900 mb-2">Raw Content</h3>
                  <pre className="bg-navy-900 text-teal-300 p-5 rounded-2xl text-xs leading-relaxed overflow-x-auto font-mono max-h-80 overflow-y-auto">{data.content}</pre>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
