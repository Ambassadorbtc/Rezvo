import { useState } from 'react';
import ToolLayout from './ToolLayout';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Copy, Check, FileText, Code, Table, FileJson } from 'lucide-react';

const CONVERTERS = [
  { id: 'html', label: 'HTML to Markdown', icon: Code, placeholder: '<h1>Hello</h1>\n<p>World</p>' },
  { id: 'json', label: 'JSON to Markdown', icon: FileJson, placeholder: '{"name": "John", "age": 30}' },
  { id: 'csv', label: 'CSV to Markdown Table', icon: Table, placeholder: 'Name,Email,Phone\nJohn,john@test.com,123456' },
  { id: 'text', label: 'Clean Text to Markdown', icon: FileText, placeholder: 'Paste any messy text here...' },
];

function htmlToMd(html) {
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function jsonToMd(json) {
  try {
    const obj = JSON.parse(json);
    const lines = ['# JSON Data\n'];
    const render = (o, depth = 0) => {
      const indent = '  '.repeat(depth);
      if (Array.isArray(o)) {
        o.forEach((item, i) => { lines.push(`${indent}- **Item ${i + 1}**`); render(item, depth + 1); });
      } else if (typeof o === 'object' && o !== null) {
        Object.entries(o).forEach(([k, v]) => {
          if (typeof v === 'object') { lines.push(`${indent}- **${k}**:`); render(v, depth + 1); }
          else lines.push(`${indent}- **${k}**: ${v}`);
        });
      } else { lines.push(`${indent}${o}`); }
    };
    render(obj);
    return lines.join('\n');
  } catch { return '**Error**: Invalid JSON input'; }
}

function csvToMd(csv) {
  const rows = csv.trim().split('\n').map(r => r.split(',').map(c => c.trim()));
  if (rows.length < 1) return 'No data';
  const header = `| ${rows[0].join(' | ')} |`;
  const sep = `| ${rows[0].map(() => '---').join(' | ')} |`;
  const body = rows.slice(1).map(r => `| ${r.join(' | ')} |`).join('\n');
  return `${header}\n${sep}\n${body}`;
}

function cleanText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, '  ')
    .replace(/ {2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export default function MarkdownTool() {
  const [active, setActive] = useState('html');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const conv = CONVERTERS.find(c => c.id === active);

  const convert = () => {
    if (!input.trim()) return;
    let result = '';
    switch (active) {
      case 'html': result = htmlToMd(input); break;
      case 'json': result = jsonToMd(input); break;
      case 'csv': result = csvToMd(input); break;
      case 'text': result = cleanText(input); break;
      default: result = input;
    }
    setOutput(result);
  };

  const copy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const download = () => {
    const blob = new Blob([output], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'converted.md'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout title="Anything to Markdown" subtitle="Convert HTML, JSON, CSV and text to clean Markdown.">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
        {/* Converter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CONVERTERS.map(c => (
            <button key={c.id} onClick={() => { setActive(c.id); setOutput(''); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${active === c.id ? 'bg-teal-500 text-white' : 'bg-cream text-navy-600 hover:bg-teal-50'}`}>
              <c.icon className="w-4 h-4" /> {c.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-navy-700 mb-1.5 block">Input</label>
            <Textarea placeholder={conv?.placeholder} value={input} onChange={e => setInput(e.target.value)} className="bg-cream border-gray-200 rounded-xl resize-none h-60 font-mono text-sm" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-navy-700">Markdown Output</label>
              {output && (
                <div className="flex gap-2">
                  <Button onClick={copy} variant="ghost" size="sm" className="h-7 text-xs gap-1">
                    {copied ? <Check className="w-3 h-3 text-teal-500" /> : <Copy className="w-3 h-3" />} {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button onClick={download} variant="ghost" size="sm" className="h-7 text-xs">Download .md</Button>
                </div>
              )}
            </div>
            <pre className="bg-navy-900 text-teal-300 p-4 rounded-xl text-sm font-mono h-60 overflow-auto whitespace-pre-wrap">{output || 'Output will appear here...'}</pre>
          </div>
        </div>
        <Button onClick={convert} className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-11 px-8 font-bold mt-4">Convert to Markdown</Button>
      </div>
    </ToolLayout>
  );
}
