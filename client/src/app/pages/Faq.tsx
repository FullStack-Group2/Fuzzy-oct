// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author:
// ID:

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import couch from '../../assets/icon/couch.png';

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

interface AccordionItemProps {
  qa: Question;
}

// ------------------
// Accordion Item Component
// ------------------
const AccordionItem: React.FC<AccordionItemProps> = ({ qa }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-3">
      {/* Question */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-left"
      >
        <h3 className="text-lg font-semibold text-gray-900">{qa.question}</h3>
        <span
          className={`text-xl font-bold transition-transform duration-300 ${
            open ? 'rotate-45 text-green-600' : 'rotate-0 text-gray-600'
          }`}
        >
          +
        </span>
      </button>

      {/* Answer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="mt-2 text-gray-700">{qa.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ------------------
// Main FAQ Component
// ------------------
const FAQ: React.FC = () => {
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

  const [activeId, setActiveId] = useState<string>(faqSections[0].id);
  const activeSection = faqSections.find((sec) => sec.id === activeId)!;

  return (
    <>
      {/* Header */}
      <div className="relative w-full h-[220px] sm:h-[250px] md:h-[300px] overflow-hidden bottom-6">
        <img
          src={couch}
          alt="Couch"
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
          <p className="mt-2 text-xs sm:text-sm text-white">
            Not registered yet?{' '}
            <a href="/register" className="text-blue-400 underline">
              Login
            </a>
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-[75px]">
        {/* Main Layout */}
        <div className="md:flex md:space-x-6">
          {/* Sidebar */}
          <div className="mb-6 md:mb-0 w-full md:w-1/4">
            <p className="font-bold text-xl mb-3">Page topics</p>
            <ul className="w-full rounded-xl overflow-hidden">
              {faqSections.map((sec) => (
                <li key={sec.id}>
                  <button
                    onClick={() => setActiveId(sec.id)}
                    className={`w-full text-left px-3 py-2 transition-all duration-200 ${
                      sec.id === activeId
                        ? 'bg-[#1E7A5A] text-white'
                        : 'bg-[#F7F7F7] hover:bg-gray-100'
                    }`}
                  >
                    {sec.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Content */}
          <div className="w-2/3 bg-white p-4 shadow rounded-md m-8">
            <p className="text-2xl sm:text-[30px] font-bold mb-3">
              {activeSection.label}
            </p>
            <div className="border-gray-200 mb-4"></div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {activeSection.questions.map((qa, idx) => (
                  <AccordionItem key={idx} qa={qa} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQ;
