import { useState } from 'react';
import ToolLayout from './ToolLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Check, X, ExternalLink, Loader2 } from 'lucide-react';
import api from '../../lib/api';

export default function MetaTagTool() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const check = async () => {
    if (!url.trim()) return;
    setLoading(true); setError(''); setData(null);
    try {
      const res = await api.post('/tools/meta-tags', { url });
      setData(res.data);
    } catch (e) { setError(e.response?.data?.detail || 'Failed to fetch'); }
    finally { setLoading(false); }
  };

  const Score = ({ ok, label }) => (
    <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
      {ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />} {label}
    </div>
  );

  return (
    <ToolLayout title="Meta Tag Checker" subtitle="Check title, description, OG tags and headings for any URL.">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Input placeholder="Enter URL (e.g. example.com)" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()} className="flex-1 bg-cream border-gray-200 rounded-xl h-12" data-testid="meta-url" />
          <Button onClick={check} disabled={loading} className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-12 px-8 font-bold" data-testid="meta-check">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check Tags'}
          </Button>
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {data && (
          <div className="space-y-6 anim-fade-up">
            <div className="grid sm:grid-cols-2 gap-3">
              <Score ok={data.title_length > 0 && data.title_length <= 70} label={`Title (${data.title_length} chars) — ${data.title_length > 70 ? 'Too long' : data.title_length === 0 ? 'Missing!' : 'Good'}`} />
              <Score ok={data.desc_length > 0 && data.desc_length <= 160} label={`Description (${data.desc_length} chars) — ${data.desc_length > 160 ? 'Too long' : data.desc_length === 0 ? 'Missing!' : 'Good'}`} />
              <Score ok={data.h1_tags?.length === 1} label={`H1 tags: ${data.h1_tags?.length || 0} — ${data.h1_tags?.length === 1 ? 'Perfect' : 'Should be exactly 1'}`} />
              <Score ok={data.imgs_without_alt === 0} label={`Images without alt: ${data.imgs_without_alt} of ${data.img_count}`} />
              <Score ok={!!data.canonical} label={data.canonical ? 'Canonical URL set' : 'No canonical URL'} />
              <Score ok={Object.keys(data.og_tags || {}).length > 0} label={`OG tags: ${Object.keys(data.og_tags || {}).length} found`} />
            </div>
            <div className="bg-cream rounded-2xl p-5">
              <h3 className="font-display font-bold text-navy-900 mb-3">Title</h3>
              <p className="text-navy-700 text-sm">{data.title || <span className="text-red-400">Missing</span>}</p>
            </div>
            <div className="bg-cream rounded-2xl p-5">
              <h3 className="font-display font-bold text-navy-900 mb-3">Meta Description</h3>
              <p className="text-navy-700 text-sm">{data.description || <span className="text-red-400">Missing</span>}</p>
            </div>
            {Object.keys(data.og_tags || {}).length > 0 && (
              <div className="bg-cream rounded-2xl p-5">
                <h3 className="font-display font-bold text-navy-900 mb-3">Open Graph Tags</h3>
                {Object.entries(data.og_tags).map(([k, v]) => (
                  <div key={k} className="flex gap-2 text-sm py-1"><span className="text-navy-400 font-mono">{k}:</span><span className="text-navy-700 truncate">{v}</span></div>
                ))}
              </div>
            )}
            <p className="text-navy-400 text-xs">Word count: {data.word_count} | H2 tags: {data.h2_tags?.length || 0}</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
