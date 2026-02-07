import { useState, useRef, useCallback } from 'react';
import ToolLayout from './ToolLayout';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Copy, Check, Upload, FileText, Code, Table, FileJson, FileCode, X, Download } from 'lucide-react';

const CONVERTERS = [
  { id: 'csv', label: 'CSV to Markdown', icon: Table, accept: '.csv', desc: 'Convert CSV spreadsheets to Markdown tables' },
  { id: 'html', label: 'HTML to Markdown', icon: Code, accept: '.html,.htm', desc: 'Convert HTML pages to clean Markdown' },
  { id: 'json', label: 'JSON to Markdown', icon: FileJson, accept: '.json', desc: 'Convert JSON data to readable Markdown' },
  { id: 'xml', label: 'XML to Markdown', icon: FileCode, accept: '.xml', desc: 'Convert XML documents to Markdown' },
  { id: 'txt', label: 'Text to Markdown', icon: FileText, accept: '.txt,.rtf,.md', desc: 'Clean up plain text into proper Markdown' },
];

function csvToMd(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 1) return 'No data found in CSV.';
  const rows = lines.map(line => {
    const cells = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; }
      else if (char === ',' && !inQuotes) { cells.push(current.trim()); current = ''; }
      else { current += char; }
    }
    cells.push(current.trim());
    return cells;
  });
  if (rows.length === 0) return 'Empty CSV file.';
  const header = `| ${rows[0].join(' | ')} |`;
  const sep = `| ${rows[0].map(() => '---').join(' | ')} |`;
  const body = rows.slice(1).map(r => `| ${r.join(' | ')} |`).join('\n');
  return `${header}\n${sep}\n${body}`;
}

function htmlToMd(html) {
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gis, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gis, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gis, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gis, '#### $1\n\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gis, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gis, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gis, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gis, '*$1*')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gis, '[$2]($1)')
    .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gis, '![$2]($1)')
    .replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gis, '![]($1)')
    .replace(/<li[^>]*>(.*?)<\/li>/gis, '- $1\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<hr\s*\/?>/gi, '\n---\n')
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, '> $1\n')
    .replace(/<code[^>]*>(.*?)<\/code>/gis, '`$1`')
    .replace(/<pre[^>]*>(.*?)<\/pre>/gis, '```\n$1\n```\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gis, '$1\n\n')
    .replace(/<div[^>]*>(.*?)<\/div>/gis, '$1\n')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function jsonToMd(text) {
  try {
    const obj = JSON.parse(text);
    const lines = [];
    const render = (data, depth = 0) => {
      const indent = '  '.repeat(depth);
      if (Array.isArray(data)) {
        data.forEach((item, i) => {
          if (typeof item === 'object' && item !== null) {
            lines.push(`${indent}- **Item ${i + 1}**`);
            render(item, depth + 1);
          } else {
            lines.push(`${indent}- ${item}`);
          }
        });
      } else if (typeof data === 'object' && data !== null) {
        Object.entries(data).forEach(([key, val]) => {
          if (typeof val === 'object' && val !== null) {
            lines.push(`${indent}- **${key}**:`);
            render(val, depth + 1);
          } else {
            lines.push(`${indent}- **${key}**: ${val}`);
          }
        });
      }
    };
    if (Array.isArray(obj) && obj.length > 0 && typeof obj[0] === 'object') {
      const keys = Object.keys(obj[0]);
      lines.push(`| ${keys.join(' | ')} |`);
      lines.push(`| ${keys.map(() => '---').join(' | ')} |`);
      obj.forEach(row => { lines.push(`| ${keys.map(k => row[k] ?? '').join(' | ')} |`); });
    } else {
      render(obj);
    }
    return lines.join('\n');
  } catch (e) { return `**Error**: Could not parse JSON — ${e.message}`; }
}

function xmlToMd(text) {
  const lines = [];
  const clean = text.replace(/<\?xml[^>]*\?>/g, '').replace(/<!--[\s\S]*?-->/g, '');
  const tagRegex = /<(\w+)([^>]*)>([\s\S]*?)<\/\1>/g;
  let match;
  const parse = (content, depth = 0) => {
    const re = /<(\w+)([^>]*)>([\s\S]*?)<\/\1>/g;
    let m;
    while ((m = re.exec(content)) !== null) {
      const tag = m[1];
      const inner = m[3].trim();
      const hasChildren = /<\w+/.test(inner);
      if (hasChildren) {
        lines.push(`${'  '.repeat(depth)}- **${tag}**:`);
        parse(inner, depth + 1);
      } else {
        lines.push(`${'  '.repeat(depth)}- **${tag}**: ${inner}`);
      }
    }
  };
  parse(clean);
  return lines.length > 0 ? lines.join('\n') : 'Could not parse XML structure. Ensure valid XML format.';
}

function cleanText(text) {
  return text.replace(/\r\n/g, '\n').replace(/\t/g, '  ').replace(/ {3,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

export default function MarkdownTool() {
  const [active, setActive] = useState('csv');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef(null);

  const conv = CONVERTERS.find(c => c.id === active);

  const readFile = useCallback((file) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setInput(text);
      convertText(text);
    };
    reader.readAsText(file);
  }, [active]);

  const convertText = (text) => {
    if (!text?.trim()) return;
    let result = '';
    switch (active) {
      case 'csv': result = csvToMd(text); break;
      case 'html': result = htmlToMd(text); break;
      case 'json': result = jsonToMd(text); break;
      case 'xml': result = xmlToMd(text); break;
      case 'txt': result = cleanText(text); break;
      default: result = text;
    }
    setOutput(result);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) readFile(file);
  }, [readFile]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  };

  const clearFile = () => { setFileName(''); setInput(''); setOutput(''); if (fileRef.current) fileRef.current.value = ''; };

  const copyOutput = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const downloadMd = () => {
    const blob = new Blob([output], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName ? fileName.replace(/\.[^.]+$/, '') : 'converted'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout title="Anything to Markdown" subtitle={conv?.desc || 'Convert files to clean Markdown.'}>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
        {/* Converter tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CONVERTERS.map(c => (
            <button key={c.id} onClick={() => { setActive(c.id); clearFile(); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${active === c.id ? 'bg-teal-500 text-white shadow-md' : 'bg-cream text-navy-600 hover:bg-teal-50'}`}
              data-testid={`tab-${c.id}`}>
              <c.icon className="w-4 h-4" /> {c.label}
            </button>
          ))}
        </div>

        {/* Upload zone */}
        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer mb-6 ${
            dragging ? 'border-teal-500 bg-teal-50' : fileName ? 'border-teal-300 bg-teal-50/30' : 'border-gray-200 hover:border-teal-300 hover:bg-cream'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !fileName && fileRef.current?.click()}
          data-testid="upload-zone"
        >
          <input ref={fileRef} type="file" accept={conv?.accept} onChange={handleFileSelect} className="hidden" />

          {fileName ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-teal-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-navy-900 text-sm">{fileName}</p>
                <p className="text-navy-400 text-xs">{(input.length / 1024).toFixed(1)} KB</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); clearFile(); }} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-navy-400 hover:text-red-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Upload className={`w-6 h-6 ${dragging ? 'text-teal-500' : 'text-navy-400'}`} />
              </div>
              <p className="text-navy-700 font-medium mb-1">
                {dragging ? 'Drop your file here' : 'Drag & drop your file here'}
              </p>
              <p className="text-navy-400 text-sm">or <span className="text-teal-600 font-medium">click to browse</span></p>
              <p className="text-navy-300 text-xs mt-2">Supported: {conv?.accept}</p>
            </>
          )}
        </div>

        {/* Or paste text */}
        <div className="relative mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-navy-300 text-xs font-medium uppercase">or paste content</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <Textarea
            placeholder={`Paste your ${conv?.label.split(' to ')[0] || 'content'} here...`}
            value={input}
            onChange={e => setInput(e.target.value)}
            className="bg-cream border-gray-200 rounded-xl resize-none h-32 font-mono text-sm"
            data-testid="paste-input"
          />
        </div>

        <Button onClick={() => convertText(input)} className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-11 px-8 font-bold w-full sm:w-auto" data-testid="convert-btn">
          Convert to Markdown
        </Button>

        {/* Output */}
        {output && (
          <div className="mt-8 anim-fade-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-navy-900">Markdown Output</h3>
              <div className="flex gap-2">
                <Button onClick={copyOutput} variant="outline" size="sm" className="rounded-lg border-gray-200 gap-1.5 text-xs">
                  {copied ? <Check className="w-3.5 h-3.5 text-teal-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button onClick={downloadMd} variant="outline" size="sm" className="rounded-lg border-gray-200 gap-1.5 text-xs">
                  <Download className="w-3.5 h-3.5" /> Download .md
                </Button>
              </div>
            </div>
            <pre className="bg-navy-900 text-teal-300 p-6 rounded-2xl text-sm leading-relaxed overflow-x-auto font-mono max-h-[500px] overflow-y-auto whitespace-pre-wrap" data-testid="md-output">
              {output}
            </pre>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
