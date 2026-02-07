import { useState } from 'react';
import ToolLayout from './ToolLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export default function PricingCalculatorTool() {
  const [timeMin, setTimeMin] = useState('60');
  const [materialCost, setMaterialCost] = useState('5');
  const [overhead, setOverhead] = useState('20');
  const [targetIncome, setTargetIncome] = useState('2500');
  const [workDays, setWorkDays] = useState('22');
  const [workHours, setWorkHours] = useState('7');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const mins = parseFloat(timeMin) || 60;
    const materials = parseFloat(materialCost) || 0;
    const overheadPct = parseFloat(overhead) || 0;
    const income = parseFloat(targetIncome) || 2000;
    const days = parseFloat(workDays) || 22;
    const hours = parseFloat(workHours) || 7;

    const monthlyHours = days * hours;
    const baseHourly = income / monthlyHours;
    const hourlyWithOverhead = baseHourly * (1 + overheadPct / 100);
    const perService = (hourlyWithOverhead * (mins / 60)) + materials;
    const clientsPerDay = Math.floor((hours * 60) / mins);
    const monthlyRevenue = perService * clientsPerDay * days;

    setResult({
      hourlyRate: hourlyWithOverhead.toFixed(2),
      perService: perService.toFixed(2),
      clientsPerDay,
      monthlyRevenue: monthlyRevenue.toFixed(2),
      dailyRevenue: (perService * clientsPerDay).toFixed(2),
    });
  };

  return (
    <ToolLayout title="Pricing Calculator" subtitle="Calculate your ideal service price based on costs, time and income goals.">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
        <div className="grid sm:grid-cols-2 gap-5 mb-8">
          <div>
            <label className="text-sm font-medium text-navy-700 mb-1.5 block">Time per service (minutes)</label>
            <Input type="number" value={timeMin} onChange={e => setTimeMin(e.target.value)} className="bg-cream border-gray-200 rounded-xl" data-testid="calc-time" />
          </div>
          <div>
            <label className="text-sm font-medium text-navy-700 mb-1.5 block">Material cost per service (£)</label>
            <Input type="number" value={materialCost} onChange={e => setMaterialCost(e.target.value)} className="bg-cream border-gray-200 rounded-xl" data-testid="calc-material" />
          </div>
          <div>
            <label className="text-sm font-medium text-navy-700 mb-1.5 block">Overhead / profit margin (%)</label>
            <Input type="number" value={overhead} onChange={e => setOverhead(e.target.value)} className="bg-cream border-gray-200 rounded-xl" />
          </div>
          <div>
            <label className="text-sm font-medium text-navy-700 mb-1.5 block">Target monthly income (£)</label>
            <Input type="number" value={targetIncome} onChange={e => setTargetIncome(e.target.value)} className="bg-cream border-gray-200 rounded-xl" />
          </div>
          <div>
            <label className="text-sm font-medium text-navy-700 mb-1.5 block">Working days per month</label>
            <Input type="number" value={workDays} onChange={e => setWorkDays(e.target.value)} className="bg-cream border-gray-200 rounded-xl" />
          </div>
          <div>
            <label className="text-sm font-medium text-navy-700 mb-1.5 block">Hours per day</label>
            <Input type="number" value={workHours} onChange={e => setWorkHours(e.target.value)} className="bg-cream border-gray-200 rounded-xl" />
          </div>
        </div>

        <Button onClick={calculate} className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl px-8 h-11 font-bold w-full sm:w-auto" data-testid="calc-btn">
          Calculate Pricing
        </Button>

        {result && (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 anim-fade-up">
            <div className="bg-[#E8F5F3] rounded-2xl p-5">
              <p className="text-sm text-navy-500 mb-1">Suggested price per service</p>
              <p className="font-display text-3xl font-bold text-teal-600" data-testid="calc-result-price">£{result.perService}</p>
            </div>
            <div className="bg-[#EDE9FE] rounded-2xl p-5">
              <p className="text-sm text-navy-500 mb-1">Your hourly rate</p>
              <p className="font-display text-3xl font-bold text-purple-600">£{result.hourlyRate}/hr</p>
            </div>
            <div className="bg-[#DBEAFE] rounded-2xl p-5">
              <p className="text-sm text-navy-500 mb-1">Clients per day</p>
              <p className="font-display text-3xl font-bold text-blue-600">{result.clientsPerDay}</p>
            </div>
            <div className="bg-[#FEF3E2] rounded-2xl p-5">
              <p className="text-sm text-navy-500 mb-1">Daily revenue potential</p>
              <p className="font-display text-3xl font-bold text-amber-600">£{result.dailyRevenue}</p>
            </div>
            <div className="bg-[#D1FAE5] rounded-2xl p-5 sm:col-span-2">
              <p className="text-sm text-navy-500 mb-1">Monthly revenue potential</p>
              <p className="font-display text-3xl font-bold text-emerald-600">£{result.monthlyRevenue}</p>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
