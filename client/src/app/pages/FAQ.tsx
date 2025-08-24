import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion' // 

const FAQ = () => {
  const faqSections = [
    {
      id: 'getting-started',
      label: 'Getting started with Shopify',
      questions: [
        {
          question: 'What is Shopify and how does it work?',
          answer:
            'Shopify là nền tảng thương mại điện tử cho phép bạn khởi tạo, phát triển và quản lý cửa hàng online một cách dễ dàng.',
        },
        {
          question: 'Do I need to be a designer or developer to use Shopify?',
          answer:
            'Không cần. Bạn chỉ việc chọn theme, tùy chỉnh giao diện bằng trình builder và cài app để thêm tính năng.',
        },
      ],
    },
    {
      id: 'selling',
      label: 'Selling on Shopify',
      questions: [
        {
          question: 'What sales channels can I use?',
          answer:
            'Bạn có thể bán trên website, mạng xã hội, chợ TMĐT (Amazon, eBay) và cả cửa hàng thực với Shopify POS.',
        },
      ],
    },
    {
      id: 'payments',
      label: 'Payments on Shopify',
      questions: [
        {
          question: 'What payment methods are supported?',
          answer:
            'Hỗ trợ Shopify Payments, PayPal, Apple Pay, Google Pay và hàng trăm cổng thanh toán bên thứ ba.',
        },
      ],
    },
    {
      id: 'shipping',
      label: 'Shipping with Shopify',
      questions: [
        {
          question: 'Can I offer discounted shipping rates?',
          answer:
            'Có, với Shopify Shipping bạn được hưởng giá cước ưu đãi và in nhãn vận chuyển ngay trong admin.',
        },
      ],
    },
  ]

  const [activeId, setActiveId] = useState(faqSections[0].id)
  const activeSection = faqSections.find((s) => s.id === activeId)

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="py-8 text-center md:text-left md:flex md:justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Shopify FAQ</h1>
          <p className="text-gray-600">
            Hướng dẫn nhanh giúp bạn làm quen với nền tảng Shopify.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Not registered yet? {' '}
            <a href="/register" className="text-blue-600 underline">
              Login
            </a>
          </p>
        </div>
      </div>

      {/* Main */}
      <div className="md:flex md:space-x-6">
        {/* Sidebar */}
        <ul className="w-full md:w-1/4 space-y-2 mb-6 md:mb-0">
          {faqSections.map((sec) => (
            <li key={sec.id}>
              <button
                onClick={() => setActiveId(sec.id)}
                className={`w-full text-left px-3 py-2 rounded-md transition-all duration-200 ${
                  sec.id === activeId
                    ? 'font-semibold border-l-4 border-blue-600 bg-blue-50 text-blue-800'
                    : 'hover:bg-gray-100'
                }`}
              >
                {sec.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Content */}
        <div className="w-full md:w-3/4 bg-white p-6 shadow rounded-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeSection.questions.map((qa, idx) => (
                <div key={idx} className="mb-6">
                  <h3 className="text-lg font-semibold mb-1">{qa.question}</h3>
                  <p className="text-gray-700">{qa.answer}</p>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default FAQ
