import React, { useState } from 'react';

import FaqSideBar from '@/features/faq/components/FaqSideBar';
import FaqContent from '@/features/faq/components/FaqContent';
// ------------------
// Type Definitions
// ------------------
interface Question {
  question: string;
  answer: string;
}

interface FAQSection {
  id: string;
  label: string;
  questions: Question[];
}
const faqSections: FAQSection[] = [
  {
    id: 'general',
    label: 'General',
    questions: [
      {
        question: 'What types of furniture do you offer?',
        answer:
          'We specialize in high-end luxury furniture for living rooms, dining areas, bedrooms, and offices. Each piece is designed with timeless elegance and premium materials.',
      },
      {
        question: 'Where are your showrooms located?',
        answer:
          'Our primary showroom is in Ho Chi Minh City. Customers in Da Nang and Ha Noi can browse our online catalog, and delivery is available directly to your home.',
      },
      {
        question: 'Do you provide interior design consultation?',
        answer:
          'Yes. Our design team can advise you on choosing furniture that matches your space and style. Please contact customer support to schedule a consultation.',
      },
      {
        question: 'How do I know if an item is in stock?',
        answer:
          'All items shown on our website are updated regularly. If an item is temporarily unavailable, it will be marked as “Out of Stock.”',
      },
      {
        question: 'Do you offer custom-made luxury furniture?',
        answer:
          'Yes. For select collections, we accept custom orders tailored to your measurements, materials, and finish preferences.',
      },
    ],
  },
  {
    id: 'shopping-information',
    label: 'Shopping information',
    questions: [
      {
        question: 'Which cities do you deliver to? (HCMC, Da Nang, Ha Noi)',
        answer:
          'We currently deliver to Ho Chi Minh City, Da Nang, and Ha Noi.',
      },
      {
        question: 'How long does shipping take?',
        answer:
          'Delivery usually takes 3–7 business days depending on the destination city.',
      },
      {
        question: 'Is shipping free for large orders?',
        answer:
          'Yes. Orders above a certain value qualify for free delivery. Details are provided at checkout.',
      },
      {
        question: 'Can I schedule a delivery date?',
        answer:
          'Yes. During checkout, you may request a preferred delivery date. We will confirm availability based on your location.',
      },
    ],
  },
  {
    id: 'order-and-return',
    label: 'Order and return',
    questions: [
      {
        question: 'How can I place an order? (cash only at delivery)',
        answer:
          'You can place your order directly on our website. Payment is made in cash when your furniture is delivered.',
      },
      {
        question: 'What is your return policy?',
        answer:
          'You may return items within 7 days of delivery if they are unused and in original condition. Please contact customer support to initiate the process.',
      },
      {
        question: 'Can I exchange my order for another product?',
        answer:
          'Yes. Exchanges are accepted within 7 days of delivery, provided the item is in new condition. Price differences will be adjusted accordingly.',
      },
    ],
  },
  {
    id: 'help-and-support',
    label: 'Help and support',
    questions: [
      {
        question: 'How can I contact customer support?',
        answer:
          'You can reach us via phone, email, or by submitting a support request on our website’s “Contact Us” page.',
      },
      {
        question: 'What are your service hours?',
        answer:
          'Our customer service team is available from 9:00 AM to 6:00 PM, Monday through Saturday.',
      },
      {
        question: 'Do you provide assembly support?',
        answer:
          'Yes. Our delivery team will assemble large furniture items upon arrival, free of charge.',
      },
      {
        question: 'How can I track my request or complaint?',
        answer:
          'After contacting us, you will receive a support ticket number. Use this number to follow up with our customer service team.',
      },
    ],
  },
];

// ------------------
// Main FAQ Component
// ------------------
const Faq: React.FC = () => {
  const [activeId, setActiveId] = useState<string>(faqSections[0].id);

  return (
    <>
      {/* Header */}
      <div className="relative w-full h-[220px] sm:h-[250px] md:h-[300px] overflow-hidden bottom-6">
        <img
          //   src={couch}
          //   alt="Couch"
          className="absolute w-full h-full object-cover z-0"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-20 z-10"></div>
        <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            FAQ
          </h1>
          <p className="text-white mt-1 sm:mt-2 text-sm sm:text-base">
            Frequently Asked Questions
          </p>
        </div>
      </div>

      <div className="w-[90%] m-auto md:flex md:justify-between md:gap-4">
        {/* Sidebar */}
        <FaqSideBar
          activeId={activeId}
          setActiveId={setActiveId}
          data={faqSections}
        />

        {/* Content */}
        <FaqContent
          activeId={activeId}
          setActiveId={setActiveId}
          data={faqSections}
        />
      </div>
    </>
  );
};

export default Faq;
