import { useState } from 'react';
import ToolLayout from './ToolLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Loader2, Check, X, Copy } from 'lucide-react';
import api from '../../lib/api';

export default function SitemapTool({ mode }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const isFind = mode === 'find';
  const isValidate = mode === 'validate';

  const run = async () => {
    if (!url.trim()) return;
    setLoading(true); setError(''); setData(null);
    try {
      const endpoint = isFind ? '/tools/sitemap-find' : '/tools/sitemap-parse';
      const payload = isFind ? { domain: url } : { url: url.includes('sitemap') ? url : url.replace(/\/?$/, '/sitemap.xml') };
      const res = await api.post(endpoint, payload);
      setData(res.data);
    } catch (e) { setError(e.response?.data?.detail || 'Failed'); }
    finally { setLoading(false); }
  };

  const copyUrls = () => {
    if (!data?.urls) return;
    navigator.clipboard.writeText(data.urls.map(u => u.loc).join('\n'));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const titles = {
    find: ['Sitemap Finder', 'Find sitemaps and robots.txt for any domain.'],
    validate: ['Sitemap Validator', 'Validate your sitemap XML structure and URLs.'],
    extract: ['Sitemap URL Extractor', 'Extract all URLs from any sitemap.xml file.'],
    generate: ['XML Sitemap Generator', 'Generate a sitemap by crawling your website.'],
  };
  const [title, subtitle] = titles[mode] || titles.extract;

  return (
    <ToolLayout title={title} subtitle={subtitle}>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Input placeholder={isFind ? "Enter domain (e.g. example.com)" : "Enter sitemap URL (e.g. example.com/sitemap.xml)"} value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && run()} className="flex-1 bg-cream border-gray-200 rounded-xl h-12" />
          <Button onClick={run} disabled={loading} className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-12 px-8 font-bold">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isFind ? 'Find Sitemaps' : isValidate ? 'Validate' : 'Extract URLs'}
          </Button>
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* FIND MODE */}
        {isFind && data && (
          <div className="space-y-3 anim-fade-up">
            {data.results?.map((r, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl text-sm ${r.found ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                {r.found ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-gray-400" />}
                <span className="text-navy-700 truncate flex-1 font-mono text-xs">{r.url}</span>
                <span className={`text-xs font-medium ${r.found ? 'text-emerald-600' : 'text-gray-400'}`}>{r.status || '—'}</span>
              </div>
            ))}
            {data.sitemaps_found?.length > 0 && (
              <div className="mt-4 p-4 bg-[#E8F5F3] rounded-xl">
                <p className="text-teal-700 font-bold text-sm mb-2">Sitemaps found:</p>
                {data.sitemaps_found.map((s, i) => <a key={i} href={s} target="_blank" rel="noopener noreferrer" className="block text-teal-600 text-sm hover:underline truncate">{s}</a>)}
              </div>
            )}
          </div>
        )}

        {/* EXTRACT / VALIDATE MODE */}
        {!isFind && data && (
          <div className="space-y-4 anim-fade-up">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="bg-[#E8F5F3] rounded-2xl p-4 text-center"><p className="font-display text-2xl font-bold text-teal-600">{data.total_urls}</p><p className="text-xs text-navy-500">URLs found</p></div>
              <div className={`${data.is_valid_xml ? 'bg-[#D1FAE5]' : 'bg-[#FEE2E2]'} rounded-2xl p-4 text-center`}>
                <p className={`font-display text-2xl font-bold ${data.is_valid_xml ? 'text-emerald-600' : 'text-red-500'}`}>{data.is_valid_xml ? 'Valid' : 'Invalid'}</p><p className="text-xs text-navy-500">XML Status</p>
              </div>
              <div className="bg-[#DBEAFE] rounded-2xl p-4 text-center"><p className="font-display text-2xl font-bold text-blue-600">{(data.raw_length / 1024).toFixed(1)}KB</p><p className="text-xs text-navy-500">File size</p></div>
            </div>
            {data.errors?.length > 0 && data.errors.map((e, i) => <div key={i} className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">{e}</div>)}
            {data.urls?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display font-bold text-navy-900">URLs</h3>
                  <Button onClick={copyUrls} variant="outline" size="sm" className="rounded-lg gap-1.5 text-xs">
                    {copied ? <Check className="w-3.5 h-3.5 text-teal-500" /> : <Copy className="w-3.5 h-3.5" />} {copied ? 'Copied!' : 'Copy All'}
                  </Button>
                </div>
                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                  {data.urls.map((u, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-cream text-sm">
                      <span className="text-navy-300 font-mono text-xs w-8">{i+1}</span>
                      <a href={u.loc} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline truncate flex-1">{u.loc}</a>
                      {u.lastmod && <span className="text-navy-300 text-xs hidden sm:block">{u.lastmod}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
