import { useState } from 'react';
import ToolLayout from './ToolLayout';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Copy, Check } from 'lucide-react';

export default function KeywordDensityTool() {
  const [text, setText] = useState('');
  const [results, setResults] = useState(null);
  const [copied, setCopied] = useState(false);

  const analyze = () => {
    if (!text.trim()) return;
    const clean = text.toLowerCase().replace(/[^a-z0-9\s'-]/g, ' ');
    const words = clean.split(/\s+/).filter(w => w.length > 2);
    const totalWords = words.length;
    const stopWords = new Set(['the','and','for','are','but','not','you','all','can','her','was','one','our','out','its','has','his','how','who','did','get','let','say','she','too','use','way','may','had','new','now','old','see','own','put','any','set','few','big','two','got','off','try','ran','end','far','ask','run','why','men','read','need','much','come','over','such','take','just','into','like','some','than','them','very','make','will','also','been','from','each','have','this','that','with','they','what','been','were','when','which','would','about','after','could','every','first','great','their','these','those','three','under','where','while','being','other','still','think','there','through','should','before','between','another','because','without','against','through','however','between','already','company','another','provide','service','through','business','through','include','special','support','through','website','contact','system','during','always','number','change']);
    const freq = {};
    words.forEach(w => {
      if (!stopWords.has(w)) freq[w] = (freq[w] || 0) + 1;
    });
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 25);
    // Also do 2-word phrases
    const phrases = {};
    for (let i = 0; i < words.length - 1; i++) {
      const p = `${words[i]} ${words[i + 1]}`;
      if (!stopWords.has(words[i]) || !stopWords.has(words[i + 1])) {
        phrases[p] = (phrases[p] || 0) + 1;
      }
    }
    const sortedPhrases = Object.entries(phrases).filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1]).slice(0, 15);

    setResults({ totalWords, keywords: sorted, phrases: sortedPhrases });
  };

  const exportCSV = () => {
    if (!results) return;
    const rows = [['Keyword', 'Count', 'Density %'], ...results.keywords.map(([w, c]) => [w, c, ((c / results.totalWords) * 100).toFixed(2)])];
    const csv = rows.map(r => r.join(',')).join('\n');
    navigator.clipboard.writeText(csv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout title="Keyword Density Analyzer" subtitle="Paste any text to find the most used words and phrases.">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
        <div className="mb-6">
          <label className="text-sm font-medium text-navy-700 mb-1.5 block">Paste your text</label>
          <Textarea
            placeholder="Paste your website content, blog post, or any text here..."
            value={text}
            onChange={e => setText(e.target.value)}
            className="bg-cream border-gray-200 rounded-xl resize-none h-40"
            data-testid="kd-input"
          />
          <p className="text-xs text-navy-300 mt-1.5">{text.split(/\s+/).filter(Boolean).length} words</p>
        </div>

        <Button onClick={analyze} className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl px-8 h-11 font-bold w-full sm:w-auto" data-testid="kd-analyze-btn">
          Analyze Keywords
        </Button>

        {results && (
          <div className="mt-8 anim-fade-up">
            <div className="flex items-center justify-between mb-4">
              <p className="text-navy-500 text-sm font-medium">Total words analyzed: <span className="text-navy-900 font-bold">{results.totalWords}</span></p>
              <Button onClick={exportCSV} variant="outline" size="sm" className="rounded-lg border-gray-200 gap-1.5 text-xs">
                {copied ? <Check className="w-3.5 h-3.5 text-teal-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy CSV'}
              </Button>
            </div>

            {/* Keywords table */}
            <div className="bg-cream rounded-2xl overflow-hidden mb-6">
              <div className="grid grid-cols-12 gap-2 p-3 text-xs font-bold text-navy-500 uppercase tracking-wider border-b border-gray-200">
                <div className="col-span-1">#</div>
                <div className="col-span-5">Keyword</div>
                <div className="col-span-3 text-center">Count</div>
                <div className="col-span-3 text-right">Density</div>
              </div>
              {results.keywords.map(([word, count], i) => {
                const density = ((count / results.totalWords) * 100).toFixed(2);
                return (
                  <div key={word} className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-teal-50/50 transition-colors text-sm anim-fade-up" style={{animationDelay: `${i * 0.03}s`}}>
                    <div className="col-span-1 text-navy-300 font-mono text-xs">{i + 1}</div>
                    <div className="col-span-5 font-medium text-navy-900">{word}</div>
                    <div className="col-span-3 text-center text-navy-600">{count}</div>
                    <div className="col-span-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 rounded-full transition-all" style={{width: `${Math.min(parseFloat(density) * 10, 100)}%`}} />
                        </div>
                        <span className="text-navy-600 font-mono text-xs w-12 text-right">{density}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Phrases */}
            {results.phrases.length > 0 && (
              <>
                <h3 className="font-display font-bold text-navy-900 mb-3">Two-Word Phrases</h3>
                <div className="flex flex-wrap gap-2">
                  {results.phrases.map(([phrase, count]) => (
                    <span key={phrase} className="bg-[#EDE9FE] text-purple-700 px-3 py-1.5 rounded-full text-sm font-medium">
                      {phrase} <span className="text-purple-400 ml-1">×{count}</span>
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
