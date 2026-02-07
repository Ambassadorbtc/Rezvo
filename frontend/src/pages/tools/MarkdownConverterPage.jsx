import { useState, useRef, useCallback } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Copy, Check, Upload, FileText, X, Download, Loader2, Globe } from 'lucide-react';
import SEOHead from '../../components/SEOHead';
import ToolLayout from './ToolLayout';
import api from '../../lib/api';

// Client-side converters
function csvToMd(t){const l=t.trim().split('\n');if(!l.length)return'No data.';const r=l.map(line=>{const c=[];let cur='',q=false;for(const ch of line){if(ch==='"')q=!q;else if(ch===','&&!q){c.push(cur.trim());cur=''}else cur+=ch}c.push(cur.trim());return c});const h=`| ${r[0].join(' | ')} |`;const s=`| ${r[0].map(()=>'---').join(' | ')} |`;return`${h}\n${s}\n${r.slice(1).map(x=>`| ${x.join(' | ')} |`).join('\n')}`}
function htmlToMd(h){return h.replace(/<h1[^>]*>(.*?)<\/h1>/gis,'# $1\n\n').replace(/<h2[^>]*>(.*?)<\/h2>/gis,'## $1\n\n').replace(/<h3[^>]*>(.*?)<\/h3>/gis,'### $1\n\n').replace(/<h4[^>]*>(.*?)<\/h4>/gis,'#### $1\n\n').replace(/<strong[^>]*>(.*?)<\/strong>/gis,'**$1**').replace(/<b[^>]*>(.*?)<\/b>/gis,'**$1**').replace(/<em[^>]*>(.*?)<\/em>/gis,'*$1*').replace(/<i[^>]*>(.*?)<\/i>/gis,'*$1*').replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gis,'[$2]($1)').replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gis,'![$2]($1)').replace(/<li[^>]*>(.*?)<\/li>/gis,'- $1\n').replace(/<br\s*\/?>/gi,'\n').replace(/<hr\s*\/?>/gi,'\n---\n').replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis,'> $1\n').replace(/<code[^>]*>(.*?)<\/code>/gis,'`$1`').replace(/<pre[^>]*>(.*?)<\/pre>/gis,'```\n$1\n```\n').replace(/<p[^>]*>(.*?)<\/p>/gis,'$1\n\n').replace(/<style[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<script[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\n{3,}/g,'\n\n').trim()}
function jsonToMd(t){try{const o=JSON.parse(t);const l=[];if(Array.isArray(o)&&o.length>0&&typeof o[0]==='object'){const k=Object.keys(o[0]);l.push(`| ${k.join(' | ')} |`);l.push(`| ${k.map(()=>'---').join(' | ')} |`);o.forEach(r=>{l.push(`| ${k.map(x=>r[x]??'').join(' | ')} |`)})}else{const render=(d,dp=0)=>{const i='  '.repeat(dp);if(Array.isArray(d))d.forEach((item,idx)=>{if(typeof item==='object'){l.push(`${i}- **Item ${idx+1}**`);render(item,dp+1)}else l.push(`${i}- ${item}`)});else if(typeof d==='object'&&d)Object.entries(d).forEach(([k,v])=>{if(typeof v==='object'){l.push(`${i}- **${k}**:`);render(v,dp+1)}else l.push(`${i}- **${k}**: ${v}`)})};render(o)}return l.join('\n')}catch(e){return`**Error**: ${e.message}`}}
function xmlToMd(t){const l=[];const c=t.replace(/<\?xml[^>]*\?>/g,'').replace(/<!--[\s\S]*?-->/g,'');const parse=(content,d=0)=>{const re=/<(\w+)([^>]*)>([\s\S]*?)<\/\1>/g;let m;while((m=re.exec(content))!==null){const tag=m[1],inner=m[3].trim();if(/<\w+/.test(inner)){l.push(`${'  '.repeat(d)}- **${tag}**:`);parse(inner,d+1)}else l.push(`${'  '.repeat(d)}- **${tag}**: ${inner}`)}};parse(c);return l.length>0?l.join('\n'):'Could not parse XML.'}
function cleanText(t){return t.replace(/\r\n/g,'\n').replace(/\t/g,'  ').replace(/ {3,}/g,' ').replace(/\n{3,}/g,'\n\n').trim()}

// Config for each converter type
const CONFIGS = {
  csv: { title:'Convert CSV to Markdown Table — Free Online Tool | Rezvo', desc:'Free CSV to Markdown converter. Upload a CSV file or paste data to instantly generate a formatted Markdown table. No sign-up required.', h1:'CSV to Markdown Converter', sub:'Upload a CSV file or paste comma-separated data to create a Markdown table.', accept:'.csv', path:'/tools/convert-csv-to-markdown' },
  html: { title:'Convert HTML to Markdown — Free Online Tool | Rezvo', desc:'Free HTML to Markdown converter. Upload HTML files or paste code to get clean Markdown output. Preserves headings, links, images and lists.', h1:'HTML to Markdown Converter', sub:'Upload an HTML file or paste code to convert to clean Markdown.', accept:'.html,.htm', path:'/tools/convert-html-to-markdown' },
  json: { title:'Convert JSON to Markdown — Free Online Tool | Rezvo', desc:'Free JSON to Markdown converter. Upload JSON files or paste data to generate readable Markdown tables and lists. No sign-up needed.', h1:'JSON to Markdown Converter', sub:'Upload a JSON file or paste data to convert to readable Markdown.', accept:'.json', path:'/tools/convert-json-to-markdown' },
  xml: { title:'Convert XML to Markdown — Free Online Tool | Rezvo', desc:'Free XML to Markdown converter. Upload XML files or paste markup to generate structured Markdown. Instant conversion, no login required.', h1:'XML to Markdown Converter', sub:'Upload an XML file or paste markup to convert to Markdown.', accept:'.xml', path:'/tools/convert-xml-to-markdown' },
  text: { title:'Convert Text to Clean Markdown — Free Tool | Rezvo', desc:'Paste any messy text and convert it to clean, properly formatted Markdown. Free online tool, no sign-up required.', h1:'Paste Text to Markdown', sub:'Paste any text to clean it up into proper Markdown formatting.', accept:'.txt,.md', path:'/tools/convert-paste-to-markdown' },
  docx: { title:'Convert Word DOCX to Markdown — Free Online Tool | Rezvo', desc:'Free Word to Markdown converter. Upload .docx files to instantly get clean Markdown output. Preserves headings, bold, italic, links and lists.', h1:'Word (DOCX) to Markdown Converter', sub:'Upload a .docx file to convert it to clean Markdown.', accept:'.docx,.doc', path:'/tools/convert-docx-to-markdown', serverSide:true },
  pdf: { title:'Convert PDF to Markdown — Free Online Tool | Rezvo', desc:'Free PDF to Markdown converter. Upload any PDF file to extract text and convert to Markdown format. No sign-up required.', h1:'PDF to Markdown Converter', sub:'Upload a PDF file to extract its text content as Markdown.', accept:'.pdf', path:'/tools/convert-pdf-to-markdown', serverSide:true },
  rtf: { title:'Convert RTF to Markdown — Free Online Tool | Rezvo', desc:'Free RTF to Markdown converter. Upload Rich Text Format files to get clean Markdown output instantly. No login needed.', h1:'RTF to Markdown Converter', sub:'Upload an RTF file to convert it to Markdown.', accept:'.rtf', path:'/tools/convert-rtf-to-markdown', serverSide:true },
  webpage: { title:'Convert Webpage to Markdown — Free Online Tool | Rezvo', desc:'Enter any URL to extract its content and convert to clean Markdown. Free web scraper to Markdown converter for any public webpage.', h1:'Webpage to Markdown Converter', sub:'Enter a URL to fetch its content and convert to Markdown.', accept:null, isUrl:true, path:'/tools/convert-webpage-to-markdown' },
  notion: { title:'Convert Notion Page to Markdown — Free Tool | Rezvo', desc:'Convert public Notion pages to Markdown. Paste a public Notion URL to extract and convert the content. Free, no login needed.', h1:'Notion to Markdown Converter', sub:'Paste a public Notion page URL to convert its content to Markdown.', accept:null, isUrl:true, path:'/tools/convert-notion-to-markdown' },
  gdocs: { title:'Convert Google Docs to Markdown — Free Tool | Rezvo', desc:'Convert public Google Docs to Markdown. Paste a published Google Doc URL to extract and convert the content. Free online tool.', h1:'Google Docs to Markdown Converter', sub:'Paste a published Google Doc URL to convert to Markdown.', accept:null, isUrl:true, path:'/tools/convert-google-docs-to-markdown' },
};

export default function MarkdownConverterPage({ type }) {
  const cfg = CONFIGS[type] || CONFIGS.text;
  const [input, setInput] = useState('');
  const [url, setUrl] = useState('');
  const [output, setOutput] = useState('');
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const clearAll = () => { setFileName(''); setInput(''); setOutput(''); setError(''); setUrl(''); if (fileRef.current) fileRef.current.value = ''; };

  const convertClientSide = (text) => {
    if (!text?.trim()) return;
    let result = '';
    switch (type) {
      case 'csv': result = csvToMd(text); break;
      case 'html': result = htmlToMd(text); break;
      case 'json': result = jsonToMd(text); break;
      case 'xml': result = xmlToMd(text); break;
      default: result = cleanText(text);
    }
    setOutput(result);
  };

  const convertServerFile = async (file) => {
    setLoading(true); setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('format', type);
      const res = await api.post('/tools/convert-file', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setOutput(res.data.markdown || '');
      if (res.data.messages?.length) setError(res.data.messages.join(', '));
    } catch (e) { setError(e.response?.data?.detail || 'Conversion failed'); }
    finally { setLoading(false); }
  };

  const convertUrl = async () => {
    if (!url.trim()) return;
    setLoading(true); setError(''); setOutput('');
    try {
      const res = await api.post('/tools/convert-url', { url });
      setOutput(res.data.markdown || '');
    } catch (e) { setError(e.response?.data?.detail || 'Failed to fetch URL'); }
    finally { setLoading(false); }
  };

  const handleFile = useCallback((file) => {
    setFileName(file.name);
    if (cfg.serverSide) {
      convertServerFile(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => { const text = e.target.result; setInput(text); convertClientSide(text); };
      reader.readAsText(file);
    }
  }, [type]);

  const handleDrop = useCallback((e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer?.files?.[0]; if (f) handleFile(f); }, [handleFile]);

  const copyOutput = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const downloadMd = () => {
    const blob = new Blob([output], { type: 'text/markdown' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `${fileName ? fileName.replace(/\.[^.]+$/, '') : 'converted'}.md`; a.click();
  };

  return (
    <ToolLayout title={cfg.h1} subtitle={cfg.sub}>
      <SEOHead title={cfg.title} description={cfg.desc} path={cfg.path} />
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">

        {/* URL input mode */}
        {cfg.isUrl ? (
          <div className="mb-6">
            <label className="text-sm font-medium text-navy-700 mb-1.5 block">
              {type === 'notion' ? 'Public Notion page URL' : type === 'gdocs' ? 'Published Google Doc URL' : 'Webpage URL'}
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                <Input placeholder={type === 'notion' ? 'https://notion.so/your-page' : type === 'gdocs' ? 'https://docs.google.com/document/d/...' : 'https://example.com/page'} value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && convertUrl()} className="pl-10 bg-cream border-gray-200 rounded-xl h-12" data-testid="url-input" />
              </div>
              <Button onClick={convertUrl} disabled={loading} className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-12 px-8 font-bold" data-testid="convert-url-btn">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Convert'}
              </Button>
            </div>
            {type === 'notion' && <p className="text-navy-300 text-xs mt-2">The Notion page must be shared publicly (Share → Publish to web)</p>}
            {type === 'gdocs' && <p className="text-navy-300 text-xs mt-2">Publish the doc first: File → Share → Publish to web</p>}
          </div>
        ) : (
          <>
            {/* File upload zone */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer mb-6 ${dragging ? 'border-teal-500 bg-teal-50' : fileName ? 'border-teal-300 bg-teal-50/30' : 'border-gray-200 hover:border-teal-300 hover:bg-cream'}`}
              onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop}
              onClick={() => !fileName && fileRef.current?.click()} data-testid="upload-zone"
            >
              <input ref={fileRef} type="file" accept={cfg.accept} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} className="hidden" />
              {fileName ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center"><FileText className="w-5 h-5 text-teal-600" /></div>
                  <div className="text-left"><p className="font-medium text-navy-900 text-sm">{fileName}</p></div>
                  <button onClick={e => { e.stopPropagation(); clearAll(); }} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-navy-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Upload className={`w-6 h-6 ${dragging ? 'text-teal-500' : 'text-navy-400'}`} />
                  </div>
                  <p className="text-navy-700 font-medium mb-1">{dragging ? 'Drop your file here' : 'Drag & drop your file here'}</p>
                  <p className="text-navy-400 text-sm">or <span className="text-teal-600 font-medium">click to browse</span></p>
                  <p className="text-navy-300 text-xs mt-2">Accepted: {cfg.accept}</p>
                </>
              )}
            </div>

            {/* Paste fallback */}
            {!cfg.serverSide && (
              <>
                <div className="flex items-center gap-3 mb-2"><div className="flex-1 h-px bg-gray-200" /><span className="text-navy-300 text-xs font-medium uppercase">or paste content</span><div className="flex-1 h-px bg-gray-200" /></div>
                <Textarea placeholder={`Paste your ${type.toUpperCase()} content here...`} value={input} onChange={e => setInput(e.target.value)} className="bg-cream border-gray-200 rounded-xl resize-none h-32 font-mono text-sm mb-4" data-testid="paste-input" />
                <Button onClick={() => convertClientSide(input)} className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-11 px-8 font-bold" data-testid="convert-paste-btn">Convert to Markdown</Button>
              </>
            )}
          </>
        )}

        {loading && <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 text-teal-500 animate-spin" /><span className="ml-3 text-navy-400">Converting...</span></div>}
        {error && <p className="text-amber-600 text-sm mt-4 p-3 bg-amber-50 rounded-xl">{error}</p>}

        {output && (
          <div className="mt-8 anim-fade-up">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-navy-900">Markdown Output</h2>
              <div className="flex gap-2">
                <Button onClick={copyOutput} variant="outline" size="sm" className="rounded-lg border-gray-200 gap-1.5 text-xs">
                  {copied ? <Check className="w-3.5 h-3.5 text-teal-500" /> : <Copy className="w-3.5 h-3.5" />} {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button onClick={downloadMd} variant="outline" size="sm" className="rounded-lg border-gray-200 gap-1.5 text-xs">
                  <Download className="w-3.5 h-3.5" /> Download .md
                </Button>
              </div>
            </div>
            <pre className="bg-navy-900 text-teal-300 p-6 rounded-2xl text-sm leading-relaxed overflow-x-auto font-mono max-h-[500px] overflow-y-auto whitespace-pre-wrap" data-testid="md-output">{output}</pre>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
