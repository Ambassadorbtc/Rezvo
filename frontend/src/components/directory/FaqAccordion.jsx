import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const DEFAULT_FAQS = [
  {
    question: 'How do I make a booking on Rezvo?',
    answer: "Simply search for your preferred venue, date, time, and party size using our smart search bar. Browse available time slots, select your preferred option, and complete your booking in just a few clicks. You'll receive instant confirmation via email."
  },
  {
    question: 'Is there a booking fee for diners?',
    answer: "No, Rezvo is completely free for diners. You'll never pay a booking fee or service charge. We only charge businesses a small fee when you complete your visit, so you can discover and book without any hidden costs."
  },
  {
    question: 'Can I modify or cancel my booking?',
    answer: 'Yes, you can modify or cancel most bookings directly through your Rezvo account. Cancellation policies vary by venue, so please check the specific terms when making your reservation. We recommend canceling at least 24 hours in advance to avoid any potential fees.'
  },
  {
    question: 'What does "Not Yet on Rezvo" mean?',
    answer: 'Some venues you see are not yet accepting bookings through Rezvo. These are unclaimed listings that we\'ve added based on their popularity. Click "Notify Me When They Join" to receive an email as soon as they start accepting reservations on our platform.'
  },
  {
    question: 'How do I know if my booking is confirmed?',
    answer: "You'll receive an instant confirmation email after completing your booking. The venue will also receive notification of your reservation. You can view all your upcoming bookings in your Rezvo account dashboard at any time."
  },
  {
    question: 'What types of venues can I book through Rezvo?',
    answer: 'Rezvo specialises in independent UK venues including restaurants, bars, cafés, hair salons, barbershops, and spas. We focus on local, bookable businesses that offer unique experiences rather than large chains.'
  }
];

export default function FaqAccordion({ faqs = DEFAULT_FAQS }) {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div key={index} className="faq-item bg-white rounded-2xl shadow-md overflow-hidden">
          <button
            onClick={() => toggleFaq(index)}
            className="faq-trigger w-full px-6 py-5 flex items-center justify-between text-left hover:bg-off-white transition-colors"
          >
            <h3 className="text-lg font-heading font-black text-forest pr-4">
              {faq.question}
            </h3>
            <ChevronDown
              className={`text-forest transition-transform duration-300 flex-shrink-0 ${
                openIndex === index ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openIndex === index && (
            <div className="faq-content px-6 pb-5 text-muted animate-in fade-in slide-in-from-top-2 duration-200">
              <p>{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
