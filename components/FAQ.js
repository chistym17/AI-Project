import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How do I use the Flow Editor?",
      answer: "First create an assistant and then go to assistant settings. You can access the Flow Editor for that assistant from there and create your structured conversation flow."
    },
    {
      question: "What is the difference between Direct Method and Flow Method?",
      answer: "Direct Method: LLM handles everything intelligently with natural conversations. Flow Method: Use when structured conversation is needed with no LLM hallucinations - you have full control over the conversation path."
    },
    {
      question: "How do I create an assistant?",
      answer: "Simply provide your business information, add Q&As for conversation context, include tools if needed for API calls, and your assistant will be ready without any code needed."
    },
    {
      question: "What are your top features?",
      answer: "• Voice mode with Flow and Normal methods\n• Chat agent for text interactions\n• Memory recall so agents remember previous conversations\n• Safety and guardrails enforced so agents don't go off-topic\n• Full control of your agent's behavior"
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-20 bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-emerald-100 rounded-full mb-6">
            <HelpCircle className="text-emerald-600 mr-2" size={20} />
            <span className="text-emerald-700 font-semibold">Got Questions?</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about building AI agents
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp className="text-emerald-600" size={24} />
                  ) : (
                    <ChevronDown className="text-gray-400" size={24} />
                  )}
                </div>
              </button>
              
              {openIndex === index && (
                <div className="px-8 pb-6">
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Still have questions? We're here to help!
          </p>
          <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-xl">
            <HelpCircle size={20} className="mr-2" />
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
