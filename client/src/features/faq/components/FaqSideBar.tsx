import React from 'react';

interface Question {
  question: string;
  answer: string;
}

interface FAQSection {
  id: string;
  label: string;
  questions: Question[];
}

interface FaqSideBarProps {
  activeId: string;
  setActiveId: React.Dispatch<React.SetStateAction<string>>;
  data: FAQSection[];
}
const FaqSideBar: React.FC<FaqSideBarProps> = ({
  activeId,
  setActiveId,
  data,
}) => {
  return (
    <div className="mb-6 md:mb-0 w-full md:w-1/3">
      <p className="font-bold text-xl mb-3">Page topics</p>
      <ul className="w-full rounded-xl overflow-hidden">
        {data.map((sec: any) => (
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
  );
};

export default FaqSideBar;
