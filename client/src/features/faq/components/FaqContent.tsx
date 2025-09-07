import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FaqAccordionItem from './FaqAccordionItem';

interface Question {
  question: string;
  answer: string;
}

interface FAQSection {
  id: string;
  label: string;
  questions: Question[];
}

interface FaqContentProps {
  activeId: string;
  setActiveId: React.Dispatch<React.SetStateAction<string>>;
  data: FAQSection[];
}
const FaqContent: React.FC<FaqContentProps> = ({
  activeId,
  setActiveId,
  data,
}) => {
  const activeSection = data.find((sec) => sec.id === activeId)!;
  return (
    <div className="w-full md:w-2/3 bg-white p-4 shadow rounded-md mt-10">
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
            <FaqAccordionItem key={idx} qa={qa} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FaqContent;
