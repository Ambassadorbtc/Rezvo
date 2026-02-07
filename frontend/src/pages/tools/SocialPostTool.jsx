import { useState } from 'react';
import ToolLayout from './ToolLayout';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Copy, Check, RefreshCw } from 'lucide-react';

const IDEAS = {
  hairdresser: {
    jan: ['New Year, new hair! Book your January transformation', 'Winter hair care tips your clients need to hear', '"Before & After" reel of a bold winter colour', 'Share your top 3 products for dry winter hair', 'Post your booking link with a caption: "New year slots filling fast"', 'Client spotlight: share a happy client photo (with permission)', 'Quick tip: how to keep blonde hair from going brassy in winter', 'Behind the scenes of your busiest day', 'Poll: "Should I go shorter for 2026?" Let followers vote', 'Share your price list with a clean, branded graphic'],
    feb: ['Valentine\'s Day glam — book your appointment now', 'Couples pamper session idea for Valentine\'s', 'Share a romantic updo tutorial reel', 'Client love: repost a positive review as a story', '"Treat yourself" campaign — self-love haircare', 'Quick tip: 3 ways to add volume to fine hair', 'Show your salon\'s cosy winter vibe', 'Staff pick: our favourite product this month', 'Before & after: a colour correction transformation', 'Book now, limited Valentine\'s week slots available'],
    mar: ['Spring refresh: time for a new look!', 'Share 3 trending spring hairstyles', 'International Women\'s Day — celebrate your female clients', 'Behind the scenes: a day in the life at the salon', 'Spring cleaning your haircare routine — tips post', 'Staff introduction post — meet the team', 'Reel: fastest blowdry technique', 'Client testimonial graphic', 'Easter special: book now for pre-Easter appointments', 'Q&A: answer your most asked hair questions'],
  },
  dentist: {
    jan: ['New Year\'s resolution: better oral health. Book your check-up!', 'Top 5 dental tips for 2026', 'Post-holiday sugar detox — why your teeth need a check', 'Meet the team: introduce a dentist or hygienist', 'Myth busting: "Do I really need to floss every day?"', 'Share your online booking link', 'Before & after: a smile makeover case study', 'Quick tip: the right way to brush', 'Patient testimonial (with permission)', 'Fun fact about teeth — educational carousel'],
    feb: ['Love your smile this Valentine\'s Day', 'Teeth whitening special for February', 'Share a "day in the life" at your practice', 'Fun fact: how many times should you replace your toothbrush?', 'Patient Q&A: most common questions answered', 'Refer a friend campaign post', 'Behind the scenes: sterilisation and safety', 'Kids dental health month — tips for parents', 'Team photo with a fun caption', 'Book your spring check-up now'],
  },
  trainer: {
    jan: ['New Year fitness goals? Let\'s smash them together!', '30-day challenge: who\'s in?', 'Quick workout video: 10-minute HIIT at home', 'Client transformation spotlight', 'Myth busting: "Lifting weights makes you bulky"', 'Free session giveaway for new followers', 'Meal prep Sunday: easy high-protein recipes', 'Share your booking link: "Start your journey today"', 'Motivation Monday: your favourite fitness quote', 'Progress photos: 3 months of consistent training'],
    feb: ['Couples workout ideas for Valentine\'s', 'Love your body challenge', 'Quick 15-minute ab workout video', 'Client testimonial post', 'Nutrition tip: pre-workout fuel', 'Behind the scenes of a PT session', 'FAQ: How often should beginners train?', 'Share a healthy Valentine\'s treat recipe', 'Accountability partner campaign', 'Book a free consultation — link in bio'],
  },
  beauty: {
    jan: ['New year skin reset — book your facial today', 'Winter skincare routine tips', 'Share your most popular treatment', 'Client glow-up before & after', 'Top 3 products for hydrated winter skin', 'Introduce yourself: why you started your beauty business', 'Quick reel: 60-second skincare routine', 'New year special offer announcement', 'Myth busting: "You don\'t need SPF in winter"', 'Share your price list with booking link'],
    feb: ['Galentine\'s pamper packages', 'Valentine\'s glow-up: book your appointment', 'Self-care Sunday routine post', 'Product review: your honest favourite', 'Love your skin campaign', 'Client testimonial carousel', 'Quick tip: how to apply face masks properly', 'Behind the scenes: treatment room tour', 'Limited Valentine\'s appointments available', 'Educational post: understanding your skin type'],
  },
  general: {
    jan: ['Happy New Year! Book your first appointment of 2026', 'New year, fresh start — share your services', 'Behind the scenes: a day in your business', 'Client testimonial spotlight', 'Share your booking link: "Start the year right"', 'Top tip related to your industry', 'Meet the team introduction post', 'New year special offer announcement', 'Share a fun fact about your business', 'Goal setting post: what\'s ahead for your business in 2026'],
    feb: ['Valentine\'s themed post related to your service', 'Client appreciation post', 'Share a quick how-to or tutorial', 'Team photo with personality', 'Refer a friend campaign', 'Behind the scenes of your busiest day', 'FAQ post: answer common client questions', 'Share your price list creatively', 'Motivational Monday post', 'Book now CTA: limited February slots'],
    mar: ['Spring is here — refresh your routine', 'International Women\'s Day celebration post', 'Share a client success story', 'Spring cleaning tips related to your niche', 'Easter special announcement', 'Staff spotlight: meet a team member', 'Quick tip carousel', 'Share a positive review', 'Behind the scenes reel', 'Book your spring appointments now'],
  },
};

const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
const MONTH_LABELS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function SocialPostTool() {
  const [niche, setNiche] = useState('general');
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [ideas, setIdeas] = useState(null);
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const pool = IDEAS[niche] || IDEAS.general;
    const monthIdeas = pool[month] || pool.jan || pool[Object.keys(pool)[0]];
    setIdeas(monthIdeas);
  };

  const copyAll = () => {
    if (!ideas) return;
    navigator.clipboard.writeText(ideas.map((idea, i) => `${i + 1}. ${idea}`).join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout title="Social Post Ideas" subtitle="Get 10 social media post ideas tailored to your industry and month.">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium text-navy-700 mb-1.5 block">Industry</label>
            <Select value={niche} onValueChange={setNiche}>
              <SelectTrigger className="bg-cream border-gray-200 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="hairdresser">Hairdresser / Barber</SelectItem>
                <SelectItem value="dentist">Dentist / Health</SelectItem>
                <SelectItem value="trainer">Personal Trainer</SelectItem>
                <SelectItem value="beauty">Beauty / Skincare</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-navy-700 mb-1.5 block">Month</label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="bg-cream border-gray-200 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => <SelectItem key={m} value={m}>{MONTH_LABELS[i]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={generate} className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-10 px-6 font-bold w-full gap-2" data-testid="social-gen">
              <RefreshCw className="w-4 h-4" /> Generate Ideas
            </Button>
          </div>
        </div>

        {ideas && (
          <div className="anim-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-navy-900">Your 10 Post Ideas</h3>
              <Button onClick={copyAll} variant="outline" size="sm" className="rounded-lg border-gray-200 gap-1.5 text-xs">
                {copied ? <Check className="w-3.5 h-3.5 text-teal-500" /> : <Copy className="w-3.5 h-3.5" />} {copied ? 'Copied!' : 'Copy All'}
              </Button>
            </div>
            <div className="space-y-2">
              {ideas.map((idea, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-cream rounded-xl hover:bg-teal-50/50 transition-colors anim-fade-up" style={{animationDelay:`${i*0.04}s`}}>
                  <span className="w-6 h-6 rounded-full bg-teal-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>
                  <p className="text-navy-700 text-sm">{idea}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
