import { useState } from 'react';
import ToolLayout from './ToolLayout';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { AlertTriangle, Check, Clock } from 'lucide-react';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function OpeningHoursTool() {
  const [text, setText] = useState('');
  const [results, setResults] = useState(null);

  const analyze = () => {
    if (!text.trim()) return;
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const parsed = [];
    const issues = [];
    const daysCovered = new Set();

    lines.forEach(line => {
      const dayMatch = DAYS.find(d => line.toLowerCase().includes(d.toLowerCase()));
      if (dayMatch) daysCovered.add(dayMatch);
      const timePattern = /(\d{1,2}[:.]\d{2})\s*[-–to]+\s*(\d{1,2}[:.]\d{2})/gi;
      const matches = [...line.matchAll(timePattern)];
      if (matches.length > 0) {
        matches.forEach(m => {
          const start = m[1].replace('.', ':');
          const end = m[2].replace('.', ':');
          parsed.push({ day: dayMatch || 'Unknown', start, end, raw: line });
          const [sh, sm] = start.split(':').map(Number);
          const [eh, em] = end.split(':').map(Number);
          const startMin = sh * 60 + sm;
          const endMin = eh * 60 + em;
          if (endMin <= startMin) issues.push({ type: 'error', msg: `${dayMatch || 'Line'}: End time (${end}) is before start time (${start})` });
          if (endMin - startMin > 12 * 60) issues.push({ type: 'warning', msg: `${dayMatch || 'Line'}: Very long shift (${((endMin - startMin) / 60).toFixed(1)} hours)` });
          if (sh < 6) issues.push({ type: 'warning', msg: `${dayMatch || 'Line'}: Very early start (${start})` });
        });
      }
      if (line.toLowerCase().includes('closed')) {
        if (dayMatch) daysCovered.add(dayMatch);
        parsed.push({ day: dayMatch || 'Unknown', start: 'Closed', end: 'Closed', raw: line });
      }
    });

    const missingDays = DAYS.filter(d => !daysCovered.has(d));
    missingDays.forEach(d => issues.push({ type: 'warning', msg: `${d}: Not mentioned — is this a day off?` }));

    // Check for overlapping times on same day
    const byDay = {};
    parsed.filter(p => p.start !== 'Closed').forEach(p => {
      if (!byDay[p.day]) byDay[p.day] = [];
      byDay[p.day].push(p);
    });
    Object.entries(byDay).forEach(([day, slots]) => {
      if (slots.length > 1) {
        issues.push({ type: 'warning', msg: `${day}: Multiple time slots detected — check for overlaps` });
      }
    });

    // Calculate total weekly hours
    let totalMin = 0;
    parsed.filter(p => p.start !== 'Closed').forEach(p => {
      const [sh, sm] = p.start.split(':').map(Number);
      const [eh, em] = p.end.split(':').map(Number);
      totalMin += (eh * 60 + em) - (sh * 60 + sm);
    });

    setResults({ parsed, issues, missingDays, totalHours: (totalMin / 60).toFixed(1), daysOpen: parsed.filter(p => p.start !== 'Closed').length });
  };

  return (
    <ToolLayout title="Opening Hours Gap Finder" subtitle="Paste your business hours to find gaps, overlaps and issues.">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
        <label className="text-sm font-medium text-navy-700 mb-1.5 block">Paste your opening hours</label>
        <Textarea placeholder={`Monday: 9:00 - 17:00\nTuesday: 9:00 - 17:00\nWednesday: 9:00 - 17:00\nThursday: 9:00 - 19:00\nFriday: 9:00 - 17:00\nSaturday: 10:00 - 16:00\nSunday: Closed`} value={text} onChange={e => setText(e.target.value)} className="bg-cream border-gray-200 rounded-xl resize-none h-44 font-mono text-sm mb-4" data-testid="hours-input" />
        <Button onClick={analyze} className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl px-8 h-11 font-bold" data-testid="hours-analyze">Analyze Hours</Button>

        {results && (
          <div className="mt-8 space-y-6 anim-fade-up">
            {/* Summary */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-[#E8F5F3] rounded-2xl p-4 text-center">
                <p className="font-display text-2xl font-bold text-teal-600">{results.totalHours}h</p>
                <p className="text-sm text-navy-500">Weekly hours</p>
              </div>
              <div className="bg-[#DBEAFE] rounded-2xl p-4 text-center">
                <p className="font-display text-2xl font-bold text-blue-600">{results.daysOpen}</p>
                <p className="text-sm text-navy-500">Days open</p>
              </div>
              <div className={`${results.issues.length ? 'bg-[#FEF3E2]' : 'bg-[#D1FAE5]'} rounded-2xl p-4 text-center`}>
                <p className={`font-display text-2xl font-bold ${results.issues.length ? 'text-amber-600' : 'text-emerald-600'}`}>{results.issues.length}</p>
                <p className="text-sm text-navy-500">Issues found</p>
              </div>
            </div>

            {/* Issues */}
            {results.issues.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-display font-bold text-navy-900 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Issues & Suggestions</h3>
                {results.issues.map((issue, i) => (
                  <div key={i} className={`p-3 rounded-xl text-sm flex items-start gap-2 ${issue.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                    {issue.type === 'error' ? <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                    {issue.msg}
                  </div>
                ))}
              </div>
            )}
            {results.issues.length === 0 && (
              <div className="p-4 bg-emerald-50 rounded-xl text-emerald-700 text-sm flex items-center gap-2">
                <Check className="w-4 h-4" /> Your opening hours look good! No issues found.
              </div>
            )}

            {/* Parsed schedule */}
            <div>
              <h3 className="font-display font-bold text-navy-900 mb-3">Parsed Schedule</h3>
              <div className="space-y-2">
                {results.parsed.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-cream rounded-xl text-sm">
                    <span className="font-medium text-navy-900 w-24">{p.day}</span>
                    <span className={`font-mono ${p.start === 'Closed' ? 'text-navy-400' : 'text-teal-600 font-medium'}`}>
                      {p.start === 'Closed' ? 'Closed' : `${p.start} — ${p.end}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
