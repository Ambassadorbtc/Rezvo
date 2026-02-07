import { useState } from 'react';
import ToolLayout from './ToolLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Loader2, ExternalLink, Copy, Check } from 'lucide-react';
import api from '../../lib/api';

export default function UrlExtractorTool() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const extract = async () => {
    if (!url.trim()) return;
    setLoading(true); setError(''); setData(null);
    try { const res = await api.post('/tools/extract-links', { url }); setData(res.data); }
    catch (e) { setError(e.response?.data?.detail || 'Failed'); }
    finally { setLoading(false); }
  };

  const copyAll = () => {
    if (!data) return;
    navigator.clipboard.writeText(data.links.map(l => l.url).join('\n'));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout title="Website URL Extractor" subtitle="Extract all visible links from any webpage.">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Input placeholder="Enter URL (e.g. example.com)" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && extract()} className="flex-1 bg-cream border-gray-200 rounded-xl h-12" />
          <Button onClick={extract} disabled={loading} className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-12 px-8 font-bold">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Extract Links'}
          </Button>
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {data && (
          <div className="anim-fade-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-4">
                <div className="bg-[#E8F5F3] rounded-xl px-4 py-2 text-center"><span className="font-display font-bold text-teal-600">{data.total}</span><span className="text-xs text-navy-500 ml-1.5">total</span></div>
                <div className="bg-[#DBEAFE] rounded-xl px-4 py-2 text-center"><span className="font-display font-bold text-blue-600">{data.links.filter(l => !l.external).length}</span><span className="text-xs text-navy-500 ml-1.5">internal</span></div>
                <div className="bg-[#FEF3E2] rounded-xl px-4 py-2 text-center"><span className="font-display font-bold text-amber-600">{data.links.filter(l => l.external).length}</span><span className="text-xs text-navy-500 ml-1.5">external</span></div>
              </div>
              <Button onClick={copyAll} variant="outline" size="sm" className="rounded-lg gap-1.5 text-xs">
                {copied ? <Check className="w-3.5 h-3.5 text-teal-500" /> : <Copy className="w-3.5 h-3.5" />} {copied ? 'Copied!' : 'Copy All'}
              </Button>
            </div>
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
              {data.links.map((link, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-cream transition-colors text-sm group">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${link.external ? 'bg-amber-400' : 'bg-teal-400'}`} />
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-navy-700 hover:text-teal-600 truncate flex-1 transition-colors">{link.url}</a>
                  {link.text && <span className="text-navy-300 text-xs truncate max-w-[150px] hidden sm:block">{link.text}</span>}
                  <ExternalLink className="w-3.5 h-3.5 text-navy-300 opacity-0 group-hover:opacity-100 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
