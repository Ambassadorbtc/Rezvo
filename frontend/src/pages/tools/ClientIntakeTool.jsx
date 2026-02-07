import { useState } from 'react';
import ToolLayout from './ToolLayout';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Copy, Check } from 'lucide-react';

const QUESTIONS = {
  hairdresser: ['What type of hair do you have? (straight, wavy, curly, coily)', 'Have you had any chemical treatments in the last 6 months? (colour, perm, relaxer)', 'Do you have any scalp conditions or sensitivities?', 'What products do you currently use on your hair?', 'Are you allergic to any hair products or ingredients?', 'What is your hair care routine like?', 'How often do you wash your hair?', 'What look are you hoping to achieve today?', 'Do you have any reference photos to share?', 'How much time do you spend styling your hair daily?'],
  dentist: ['When was your last dental check-up?', 'Do you have any ongoing dental issues or pain?', 'Are you currently taking any medications?', 'Do you have any allergies (especially to anaesthetics or latex)?', 'Have you had any dental surgery in the past?', 'Do you grind your teeth or clench your jaw?', 'Do you smoke or use tobacco products?', 'How often do you brush and floss?', 'Do you have any medical conditions we should be aware of? (diabetes, heart conditions, etc.)', 'Are you pregnant or breastfeeding?', 'Do you experience anxiety about dental procedures?'],
  trainer: ['What are your primary fitness goals? (weight loss, muscle gain, flexibility, endurance)', 'Do you have any injuries or physical limitations?', 'What is your current activity level?', 'Have you worked with a personal trainer before?', 'Do you take any medications that affect exercise?', 'What types of exercise do you enjoy?', 'How many days per week can you commit to training?', 'Do you follow any specific diet or nutrition plan?', 'What is your preferred training time?', 'Do you have access to a gym or prefer home/outdoor workouts?'],
  beauty: ['What is your skin type? (oily, dry, combination, sensitive)', 'Do you have any skin allergies or sensitivities?', 'Are you currently using any skincare products? Which ones?', 'Have you had any cosmetic procedures before?', 'Are you on any medications (especially retinoids or blood thinners)?', 'Do you have any skin conditions? (eczema, rosacea, acne)', 'What results are you hoping to achieve?', 'Are you pregnant or breastfeeding?', 'How much sun exposure do you get daily?', 'What is your budget for ongoing treatments?'],
  nails: ['Do you have any nail conditions? (fungal, brittle, ridged)', 'Are you allergic to any nail products (gel, acrylic, adhesives)?', 'Do you prefer a natural or dramatic look?', 'How active are you with your hands daily? (typing, manual work)', 'Have you had gel/acrylic nails before?', 'Do you have a preferred nail shape? (square, round, almond, coffin)', 'How often would you like to maintain your nails?', 'Any reference photos for what you would like?'],
  massage: ['Do you have any injuries or areas of pain?', 'Are you pregnant?', 'Do you have any medical conditions? (blood clots, cancer, osteoporosis)', 'Are you currently taking any medications?', 'What is your preferred pressure level? (light, medium, firm)', 'Have you had a professional massage before?', 'Are there any areas you would like us to focus on?', 'Are there any areas you would like us to avoid?', 'Do you have any allergies to oils or lotions?'],
  general: ['What service are you booking today?', 'Is this your first visit?', 'Do you have any allergies or sensitivities we should know about?', 'Are you currently taking any medications?', 'Do you have any medical conditions we should be aware of?', 'How did you hear about us?', 'What results are you hoping to achieve?', 'Do you have any questions before we begin?', 'What is the best way to contact you for reminders?', 'Would you like to receive promotional offers and updates?'],
};

export default function ClientIntakeTool() {
  const [niche, setNiche] = useState('general');
  const [copied, setCopied] = useState(false);
  const questions = QUESTIONS[niche] || QUESTIONS.general;

  const copyAll = () => {
    const text = questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout title="Client Intake Questions" subtitle="Generate professional intake questionnaires for your industry.">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <label className="text-sm font-medium text-navy-700 mb-1.5 block">Select your industry</label>
            <Select value={niche} onValueChange={setNiche}>
              <SelectTrigger className="bg-cream border-gray-200 rounded-xl" data-testid="intake-niche"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General / Other</SelectItem>
                <SelectItem value="hairdresser">Hairdresser / Barber</SelectItem>
                <SelectItem value="dentist">Dentist / Health</SelectItem>
                <SelectItem value="trainer">Personal Trainer</SelectItem>
                <SelectItem value="beauty">Beauty / Skincare</SelectItem>
                <SelectItem value="nails">Nail Technician</SelectItem>
                <SelectItem value="massage">Massage Therapist</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={copyAll} className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-11 px-6 font-bold self-end gap-2" data-testid="intake-copy">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? 'Copied!' : 'Copy All'}
          </Button>
        </div>
        <div className="space-y-3">
          {questions.map((q, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-cream rounded-xl anim-fade-up hover:bg-teal-50/50 transition-colors" style={{animationDelay: `${i * 0.04}s`}} data-testid={`q-${i}`}>
              <span className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600 font-bold text-xs flex-shrink-0">{i + 1}</span>
              <p className="text-navy-700 text-sm leading-relaxed">{q}</p>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
