import { useState } from 'react';
import ToolLayout from './ToolLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Copy, Check, Plus, Trash2 } from 'lucide-react';

export default function ServiceMenuTool() {
  const [businessName, setBusinessName] = useState('');
  const [items, setItems] = useState([{ name: '', price: '' }, { name: '', price: '' }, { name: '', price: '' }]);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const addRow = () => setItems([...items, { name: '', price: '' }]);
  const removeRow = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateRow = (i, field, val) => { const n = [...items]; n[i][field] = val; setItems(n); };

  const generate = () => {
    const valid = items.filter(i => i.name.trim() && i.price.trim());
    if (!valid.length) return;
    const maxLen = Math.max(...valid.map(i => i.name.length));
    let text = businessName ? `═══ ${businessName.toUpperCase()} ═══\n\n` : '';
    text += 'SERVICES & PRICING\n';
    text += '─'.repeat(maxLen + 16) + '\n\n';
    valid.forEach(i => {
      const dots = '·'.repeat(Math.max(2, maxLen + 10 - i.name.length - i.price.length));
      text += `  ${i.name} ${dots} £${i.price}\n`;
    });
    text += '\n' + '─'.repeat(maxLen + 16);
    text += '\n\nBook online → rezvo.app';
    setOutput(text);
  };

  const copyText = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout title="Service Menu Generator" subtitle="Create a clean, formatted service menu with prices.">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
        <div className="mb-6">
          <label className="text-sm font-medium text-navy-700 mb-1.5 block">Business Name (optional)</label>
          <Input placeholder="e.g. Jake's Barbershop" value={businessName} onChange={e => setBusinessName(e.target.value)} className="bg-cream border-gray-200 rounded-xl" />
        </div>

        <div className="space-y-3 mb-6">
          <label className="text-sm font-medium text-navy-700">Services</label>
          {items.map((item, i) => (
            <div key={i} className="flex gap-3 items-center anim-fade-up" style={{animationDelay: `${i * 0.05}s`}}>
              <Input placeholder="Service name" value={item.name} onChange={e => updateRow(i, 'name', e.target.value)} className="flex-1 bg-cream border-gray-200 rounded-xl" data-testid={`menu-name-${i}`} />
              <div className="relative w-28">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 text-sm">£</span>
                <Input placeholder="0.00" value={item.price} onChange={e => updateRow(i, 'price', e.target.value)} className="pl-7 bg-cream border-gray-200 rounded-xl" data-testid={`menu-price-${i}`} />
              </div>
              {items.length > 1 && (
                <button onClick={() => removeRow(i)} className="w-9 h-9 rounded-lg text-navy-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button onClick={addRow} className="flex items-center gap-2 text-teal-600 text-sm font-medium hover:text-teal-700 transition-colors">
            <Plus className="w-4 h-4" /> Add service
          </button>
        </div>

        <Button onClick={generate} className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl px-8 h-11 font-bold w-full sm:w-auto" data-testid="menu-generate-btn">
          Generate Menu
        </Button>

        {output && (
          <div className="mt-8 anim-fade-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-navy-900">Your Menu</h3>
              <Button onClick={copyText} variant="outline" size="sm" className="rounded-lg border-gray-200 gap-1.5 text-xs">
                {copied ? <Check className="w-3.5 h-3.5 text-teal-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <pre className="bg-navy-900 text-teal-300 p-6 rounded-2xl text-sm leading-relaxed overflow-x-auto font-mono" data-testid="menu-output">{output}</pre>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
