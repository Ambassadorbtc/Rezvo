import { useState } from 'react';
import ToolLayout from './ToolLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Copy, Check, Link2 } from 'lucide-react';

export default function BookingLinkTool() {
  const [name, setName] = useState('');
  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = () => {
    if (!name.trim() || !service.trim()) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
    const params = new URLSearchParams({ s: service, d: date, t: time }).toString();
    const url = `${window.location.origin}/book/${slug}?${params}`;
    setLink(url);
  };

  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout title="Instant Booking Link Maker" subtitle="Create a quick shareable booking link for your business.">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div><label className="text-sm font-medium text-navy-700 mb-1.5 block">Business name *</label><Input placeholder="e.g. Jake's Barbers" value={name} onChange={e => setName(e.target.value)} className="bg-cream border-gray-200 rounded-xl" /></div>
          <div><label className="text-sm font-medium text-navy-700 mb-1.5 block">Service *</label><Input placeholder="e.g. Haircut & Beard Trim" value={service} onChange={e => setService(e.target.value)} className="bg-cream border-gray-200 rounded-xl" /></div>
          <div><label className="text-sm font-medium text-navy-700 mb-1.5 block">Date (optional)</label><Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-cream border-gray-200 rounded-xl" /></div>
          <div><label className="text-sm font-medium text-navy-700 mb-1.5 block">Time (optional)</label><Input type="time" value={time} onChange={e => setTime(e.target.value)} className="bg-cream border-gray-200 rounded-xl" /></div>
        </div>
        <Button onClick={generate} className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-11 px-8 font-bold gap-2" data-testid="blink-gen"><Link2 className="w-4 h-4" /> Generate Link</Button>

        {link && (
          <div className="mt-8 anim-fade-up">
            <h3 className="font-display font-bold text-navy-900 mb-3">Your Booking Link</h3>
            <div className="flex items-center gap-3 bg-[#E8F5F3] rounded-xl p-4">
              <p className="text-teal-700 text-sm font-mono flex-1 truncate">{link}</p>
              <Button onClick={copy} variant="outline" size="sm" className="rounded-lg gap-1.5 flex-shrink-0">
                {copied ? <Check className="w-3.5 h-3.5 text-teal-500" /> : <Copy className="w-3.5 h-3.5" />} {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <p className="text-navy-300 text-xs mt-3">Share this link on WhatsApp, Instagram, or print it as a QR code using our QR Code Generator tool.</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
