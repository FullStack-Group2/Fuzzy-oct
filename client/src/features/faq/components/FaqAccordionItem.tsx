import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
  question: string;
  answer: string;
}

interface AccordionItemProps {
  qa: Question;
}

// ------------------
// Accordion Item Component
// ------------------
const FaqAccordionItem: React.FC<AccordionItemProps> = ({ qa }) => {
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

export default FaqAccordionItem;
