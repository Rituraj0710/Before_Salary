import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { PlusSmallIcon, MinusSmallIcon } from '@heroicons/react/24/outline';

const categories = ['All', 'General', 'Personal Loan', 'Business Loan', 'Home Loan', 'Vehicle Loan', 'Education Loan'];

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [category, setCategory] = useState('All');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchFAQs = async () => {
      try {
        const url = category === 'All' ? '/content/faq/all' : `/content/faq/all?category=${encodeURIComponent(category)}`;
        const response = await api.get(url);
        if (isMounted) {
          const records = (response.data.data || []).filter(faq => faq.isActive !== false);
          setFaqs(records);
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      }
    };
    fetchFAQs();
    return () => { isMounted = false; };
  }, [category]);

  const toggleFAQ = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#FFF6EE] py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.4em] text-orange-400 mb-3">FAQs</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#051441] mb-4">
            Frequently Asked Questions (FAQs)
          </h1>
          <p className="text-lg text-[#4B5563] max-w-2xl mx-auto">
            Find answers to common questions about our loan services. Can't find what you're looking for?
            <a href="/contact" className="text-orange-500 hover:text-orange-600 font-semibold ml-1">Contact us</a>.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-5 py-2 rounded-full font-semibold transition shadow ${
                category === cat
                  ? 'bg-[#051441] text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {faqs.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-10 text-center text-gray-500">
            No FAQs found for this category.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {faqs.map((faq) => {
              const isOpen = openId === faq._id;
              return (
                <div
                  key={faq._id}
                  className="bg-white rounded-full px-6 py-4 shadow-sm border border-transparent hover:border-orange-200 transition"
                >
                  <button
                    onClick={() => toggleFAQ(faq._id)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                        {isOpen ? <MinusSmallIcon className="h-5 w-5" /> : <PlusSmallIcon className="h-5 w-5" />}
                      </div>
                      <span className="font-semibold text-[#051441]">{faq.question}</span>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="mt-4 text-sm text-gray-600 bg-[#FFF8F1] rounded-2xl px-4 py-4 shadow-inner">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-16 bg-[#FF8C2A] text-white py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-sm uppercase tracking-widest text-white/80">Over 1 Million+</p>
            <p className="text-2xl font-bold">App Downloads</p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-sm uppercase tracking-widest text-white/80">Over ₹5,100 Crores</p>
            <p className="text-2xl font-bold">Total Loans Given</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <a
              href="#"
              className="bg-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-blue-800 transition"
            >
              Get it on Google Play
            </a>
            <a
              href="#"
              className="bg-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-500 transition"
            >
              Apply on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;

