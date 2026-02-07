import { useState } from 'react';
import ToolLayout from './ToolLayout';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Copy, Check, ThumbsUp, Minus, AlertTriangle } from 'lucide-react';

const TONES = [
  { key: 'positive', label: 'Grateful & Warm', icon: ThumbsUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { key: 'neutral', label: 'Professional', icon: Minus, color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'complaint', label: 'Handling Complaint', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
];

function generateReplies(review) {
  const r = review.trim();
  const short = r.length < 80;
  return {
    positive: short
      ? `Thank you so much for the kind words! We truly appreciate your support and look forward to welcoming you back. Your feedback means the world to our small team.`
      : `Thank you for taking the time to leave such a wonderful review! We're thrilled to hear you had a great experience. Feedback like yours motivates us to keep delivering our best. We can't wait to see you again soon!`,
    neutral: short
      ? `Thank you for your feedback. We appreciate you sharing your experience and we'll take your comments on board. We hope to see you again.`
      : `Thank you for your honest feedback. We value every review as it helps us improve our service. We'd love the opportunity to exceed your expectations on your next visit. Please don't hesitate to reach out if there's anything specific we can do better.`,
    complaint: short
      ? `Thank you for letting us know about your experience. We're sorry to hear it didn't meet your expectations. We'd love the chance to make it right — please contact us directly so we can address this personally.`
      : `We sincerely apologise that your experience didn't meet the high standards we set for ourselves. Your feedback is incredibly important and we take it very seriously. We'd like to understand what went wrong and make it right. Could you please reach out to us directly? We want to ensure this doesn't happen again and that your next visit is exceptional.`,
  };
}

export default function ReviewReplyTool() {
  const [review, setReview] = useState('');
  const [replies, setReplies] = useState(null);
  const [copiedKey, setCopiedKey] = useState('');

  const generate = () => {
    if (!review.trim()) return;
    setReplies(generateReplies(review));
  };

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <ToolLayout title="Review Reply Generator" subtitle="Generate professional replies for customer reviews in seconds.">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
        <label className="text-sm font-medium text-navy-700 mb-1.5 block">Paste the review</label>
        <Textarea placeholder="Paste a customer review here..." value={review} onChange={e => setReview(e.target.value)} className="bg-cream border-gray-200 rounded-xl resize-none h-32 mb-4" data-testid="review-input" />
        <Button onClick={generate} className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl px-8 h-11 font-bold" data-testid="review-gen-btn">Generate Replies</Button>

        {replies && (
          <div className="mt-8 space-y-4 anim-fade-up">
            {TONES.map((t) => (
              <div key={t.key} className={`${t.bg} rounded-2xl p-5 group`} data-testid={`reply-${t.key}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <t.icon className={`w-4 h-4 ${t.color}`} />
                    <h4 className="font-display font-bold text-navy-900 text-sm">{t.label}</h4>
                  </div>
                  <Button onClick={() => copy(replies[t.key], t.key)} variant="ghost" size="sm" className="h-8 rounded-lg gap-1.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    {copiedKey === t.key ? <Check className="w-3.5 h-3.5 text-teal-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === t.key ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <p className="text-navy-600 text-sm leading-relaxed">{replies[t.key]}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
