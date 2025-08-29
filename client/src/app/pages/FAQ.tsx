import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
          className={`text-xl font-bold transition-transform duration-300 ${open ? "rotate-45 text-green-600" : "rotate-0 text-gray-600"
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
            animate={{ opacity: 1, height: "auto" }}
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
  ]

  const [activeId, setActiveId] = useState<string>(faqSections[0].id);
  const activeSection = faqSections.find((sec) => sec.id === activeId)!;

  return (
    <div className="px-[75px]">
      {/* Header */}
      <div className="py-8 text-center items-center">
        <h1 className="text-3xl font-bold">Shopify FAQ</h1>
        <p className="text-gray-600">Frequently Asked Questions</p>
        <p className="mt-2 text-sm text-gray-500">
          Not registered yet?{" "}
          <a href="/register" className="text-blue-600 underline">
            Login
          </a>
        </p>
      </div>

      {/* Main Layout */}
      <div className="md:flex md:space-x-6">
        {/* Sidebar */}
        <div className="mb-6 md:mb-0">
          <p className="font-bold mb-3">Page topics</p>
          <ul className="w-full rounded-xl overflow-hidden shadow border border-gray-200">
            {faqSections.map((sec) => (
              <li key={sec.id}>
                <button
                  onClick={() => setActiveId(sec.id)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-all duration-200 ${sec.id === activeId
                    ? "bg-[#1E7A5A] text-white"
                    : "bg-[#F7F7F7] hover:bg-gray-100"
                    }`}
                >
                  {sec.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Content */}
        <div className="w-full md:w-3/4 bg-white p-6 shadow rounded-md">
          <p className="text-xl font-semibold mb-4">{activeSection.label}</p>
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
  );
};

export default FAQ;
