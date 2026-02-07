import { useState } from 'react';
import ToolLayout from './ToolLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Copy, Check } from 'lucide-react';

const TEMPLATES = {
  hairdresser: [
    { label: 'Friendly Reminder', text: 'Hi {name}, just a friendly reminder about your appointment at {business} tomorrow at {time}. We look forward to seeing you! If you need to reschedule, please let us know at least 24 hours in advance. Thanks!' },
    { label: 'Same-Day Reminder', text: 'Hi {name}, this is a reminder that your appointment at {business} is today at {time}. Please arrive 5 minutes early. See you soon!' },
    { label: 'No-Show Follow-Up', text: 'Hi {name}, we noticed you missed your appointment at {business} today. We hope everything is okay! If you\'d like to rebook, please reply to this message or book online. We\'d love to see you soon.' },
    { label: 'Late Cancellation Policy', text: 'Hi {name}, we understand plans change, but we noticed your appointment was missed/cancelled with less than 24 hours\' notice. As a small business, no-shows significantly impact us. Please book again at your convenience — we\'d love to have you back!' },
  ],
  dentist: [
    { label: 'Appointment Reminder', text: 'Hi {name}, this is a reminder about your dental appointment at {business} on {date} at {time}. Please arrive 10 minutes early and bring your insurance details. If you need to reschedule, call us at least 48 hours ahead.' },
    { label: 'Post-Visit Follow-Up', text: 'Hi {name}, thank you for visiting {business} today. If you have any questions about your treatment or experience discomfort, please don\'t hesitate to contact us. See you at your next check-up!' },
    { label: 'Missed Appointment', text: 'Hi {name}, we noticed you missed your appointment at {business}. Regular check-ups are important for your oral health. Please contact us to reschedule — we want to make sure you\'re taken care of.' },
  ],
  trainer: [
    { label: 'Session Reminder', text: 'Hey {name}! Just a reminder — your training session is tomorrow at {time}. Don\'t forget to bring water and wear comfortable workout clothes. Let\'s smash it!' },
    { label: 'No-Show Message', text: 'Hey {name}, missed you at today\'s session! Everything alright? Let me know if you need to reschedule. Consistency is key — let\'s get back on track!' },
    { label: 'Motivation + Rebook', text: 'Hi {name}, it\'s been a while since your last session at {business}. Your fitness journey matters! Book your next session and let\'s keep the momentum going.' },
  ],
  beauty: [
    { label: 'Appointment Reminder', text: 'Hi {name}, looking forward to your beauty appointment at {business} tomorrow at {time}! Please arrive with clean, makeup-free skin if you\'re having a facial. See you soon!' },
    { label: 'Missed Appointment', text: 'Hi {name}, we missed you at your appointment today at {business}. No worries — life happens! Please rebook at your convenience. We can\'t wait to pamper you.' },
    { label: 'Re-engagement', text: 'Hi {name}, it\'s been a while! Treat yourself — book your next appointment at {business} and let us take care of you. You deserve it!' },
  ],
  general: [
    { label: 'Appointment Reminder', text: 'Hi {name}, this is a reminder about your appointment at {business} tomorrow at {time}. If you need to make changes, please let us know 24 hours in advance. See you soon!' },
    { label: 'No-Show Follow-Up', text: 'Hi {name}, we noticed you missed your appointment at {business} today. We hope all is well. If you\'d like to rebook, please get in touch — we\'d love to see you.' },
    { label: 'Late Cancel Policy', text: 'Hi {name}, unfortunately your appointment was missed or cancelled with short notice. As a small business, this affects our schedule. We\'d love to rebook you — please give us 24 hours\' notice next time. Thank you for understanding!' },
  ],
};

export default function NoShowReminderTool() {
  const [niche, setNiche] = useState('general');
  const [clientName, setClientName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [copiedIdx, setCopiedIdx] = useState(-1);

  const templates = TEMPLATES[niche] || TEMPLATES.general;

  const fillTemplate = (text) => {
    return text
      .replace(/{name}/g, clientName || '[Client Name]')
      .replace(/{business}/g, businessName || '[Your Business]')
      .replace(/{time}/g, '[Time]')
      .replace(/{date}/g, '[Date]');
  };

  const copy = (text, i) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(i);
    setTimeout(() => setCopiedIdx(-1), 2000);
  };

  return (
    <ToolLayout title="No-Show Reminder Templates" subtitle="Copy-paste reminder & follow-up messages to reduce client no-shows.">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="text-sm font-medium text-navy-700 mb-1.5 block">Your industry</label>
            <Select value={niche} onValueChange={setNiche}>
              <SelectTrigger className="bg-cream border-gray-200 rounded-xl" data-testid="niche-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General / Other</SelectItem>
                <SelectItem value="hairdresser">Hairdresser / Barber</SelectItem>
                <SelectItem value="dentist">Dentist / Health</SelectItem>
                <SelectItem value="trainer">Personal Trainer</SelectItem>
                <SelectItem value="beauty">Beauty / Nails</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-navy-700 mb-1.5 block">Client name (optional)</label>
            <Input placeholder="e.g. Sarah" value={clientName} onChange={e => setClientName(e.target.value)} className="bg-cream border-gray-200 rounded-xl" />
          </div>
          <div>
            <label className="text-sm font-medium text-navy-700 mb-1.5 block">Business name (optional)</label>
            <Input placeholder="e.g. Jake's Barbers" value={businessName} onChange={e => setBusinessName(e.target.value)} className="bg-cream border-gray-200 rounded-xl" />
          </div>
        </div>

        <div className="space-y-4">
          {templates.map((t, i) => {
            const filled = fillTemplate(t.text);
            return (
              <div key={i} className="bg-cream rounded-2xl p-5 group hover:bg-teal-50/50 transition-colors anim-fade-up" style={{animationDelay: `${i * 0.08}s`}} data-testid={`template-${i}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-display font-bold text-navy-900 text-sm">{t.label}</h4>
                  <Button onClick={() => copy(filled, i)} variant="ghost" size="sm" className="h-8 rounded-lg gap-1.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    {copiedIdx === i ? <Check className="w-3.5 h-3.5 text-teal-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedIdx === i ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <p className="text-navy-600 text-sm leading-relaxed">{filled}</p>
              </div>
            );
          })}
        </div>
      </div>
    </ToolLayout>
  );
}
