import { useState } from 'react';
import ToolLayout from './ToolLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Loader2, Check, X, Globe, Shield, Zap, Link2 } from 'lucide-react';
import api from '../../lib/api';

export default function DomainSeoTool() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const check = async () => {
    if (!domain.trim()) return;
    setLoading(true); setError(''); setResults(null);
    const d = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    try {
      const [metaRes, robotsRes, sitemapRes] = await Promise.all([
        api.post('/tools/meta-tags', { url: `https://${d}` }).catch(() => null),
        api.post('/tools/robots-txt', { domain: d }).catch(() => null),
        api.post('/tools/sitemap-find', { domain: d }).catch(() => null),
      ]);
      const meta = metaRes?.data || {};
      const robots = robotsRes?.data || {};
      const sitemap = sitemapRes?.data || {};
      // Score
      let score = 0;
      const checks = [];
      // SSL
      const isHttps = meta.url?.startsWith('https');
      if (isHttps) { score += 15; checks.push({ ok: true, label: 'SSL Certificate (HTTPS)', pts: 15 }); }
      else checks.push({ ok: false, label: 'No SSL Certificate', pts: 0 });
      // Title
      if (meta.title_length > 0 && meta.title_length <= 70) { score += 15; checks.push({ ok: true, label: `Title tag (${meta.title_length} chars)`, pts: 15 }); }
      else checks.push({ ok: false, label: meta.title_length > 70 ? 'Title too long' : 'Missing title tag', pts: 0 });
      // Description
      if (meta.desc_length > 0 && meta.desc_length <= 160) { score += 15; checks.push({ ok: true, label: `Meta description (${meta.desc_length} chars)`, pts: 15 }); }
      else checks.push({ ok: false, label: meta.desc_length > 160 ? 'Description too long' : 'Missing meta description', pts: 0 });
      // H1
      if (meta.h1_tags?.length === 1) { score += 10; checks.push({ ok: true, label: 'Single H1 tag', pts: 10 }); }
      else checks.push({ ok: false, label: `H1 tags: ${meta.h1_tags?.length || 0} (should be 1)`, pts: 0 });
      // OG tags
      if (Object.keys(meta.og_tags || {}).length > 0) { score += 10; checks.push({ ok: true, label: 'Open Graph tags present', pts: 10 }); }
      else checks.push({ ok: false, label: 'No Open Graph tags', pts: 0 });
      // Image alt
      if (meta.imgs_without_alt === 0 && meta.img_count > 0) { score += 10; checks.push({ ok: true, label: 'All images have alt text', pts: 10 }); }
      else if (meta.img_count > 0) checks.push({ ok: false, label: `${meta.imgs_without_alt} images missing alt text`, pts: 0 });
      else { score += 10; checks.push({ ok: true, label: 'No images (N/A)', pts: 10 }); }
      // Robots.txt
      if (robots.found) { score += 10; checks.push({ ok: true, label: 'robots.txt found', pts: 10 }); }
      else checks.push({ ok: false, label: 'No robots.txt', pts: 0 });
      // Sitemap
      const smFound = sitemap.sitemaps_found?.length > 0;
      if (smFound) { score += 15; checks.push({ ok: true, label: `Sitemap found (${sitemap.sitemaps_found.length})`, pts: 15 }); }
      else checks.push({ ok: false, label: 'No sitemap found', pts: 0 });

      setResults({ domain: d, score, checks, meta, wordCount: meta.word_count });
    } catch (e) { setError('Failed to analyze domain'); }
    finally { setLoading(false); }
  };

  const getScoreColor = (s) => s >= 80 ? 'text-emerald-600' : s >= 50 ? 'text-amber-600' : 'text-red-500';
  const getScoreBg = (s) => s >= 80 ? 'bg-emerald-100' : s >= 50 ? 'bg-amber-100' : 'bg-red-100';

  return (
    <ToolLayout title="Domain SEO Checker" subtitle="Get an instant SEO health score for any domain.">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Input placeholder="Enter domain (e.g. example.com)" value={domain} onChange={e => setDomain(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()} className="flex-1 bg-cream border-gray-200 rounded-xl h-12" data-testid="seo-domain" />
          <Button onClick={check} disabled={loading} className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-12 px-8 font-bold" data-testid="seo-check">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze Domain'}
          </Button>
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {loading && <p className="text-navy-400 text-sm">Running SEO checks...</p>}
        {results && (
          <div className="space-y-6 anim-fade-up">
            {/* Score */}
            <div className="text-center py-6">
              <div className={`inline-flex items-center justify-center w-28 h-28 rounded-full ${getScoreBg(results.score)}`}>
                <span className={`font-display text-5xl font-bold ${getScoreColor(results.score)}`}>{results.score}</span>
              </div>
              <p className="text-navy-500 mt-3 font-medium">{results.score >= 80 ? 'Great SEO health!' : results.score >= 50 ? 'Needs improvement' : 'Significant issues found'}</p>
              <p className="text-navy-300 text-sm">{results.domain}</p>
            </div>
            {/* Checks */}
            <div className="space-y-2">
              {results.checks.map((c, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl text-sm ${c.ok ? 'bg-emerald-50' : 'bg-red-50'}`}>
                  {c.ok ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-red-400" />}
                  <span className={c.ok ? 'text-emerald-700' : 'text-red-600'}>{c.label}</span>
                  <span className="ml-auto text-xs font-mono opacity-50">{c.ok ? `+${c.pts}` : '+0'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
