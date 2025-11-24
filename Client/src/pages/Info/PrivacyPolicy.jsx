import { useState, useEffect } from 'react';
import api from '../../utils/api';

const PrivacyPolicy = () => {
  const [content, setContent] = useState(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await api.get('/content/privacy');
      setContent(response.data.data);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          {content && content.length > 0 ? (
            content.map((section, index) => (
              <div key={index} className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
                <div className="text-gray-600 whitespace-pre-line">{section.content}</div>
              </div>
            ))
          ) : (
            <div className="text-gray-600 space-y-4">
              <p>Last updated: {new Date().toLocaleDateString()}</p>
              <p>
                At BeforeSalary, we are committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you 
                use our services.
              </p>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Information We Collect</h2>
              <p>
                We collect information that you provide directly to us, including your name, email 
                address, phone number, financial information, and other details necessary to process 
                your loan application.
              </p>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How We Use Your Information</h2>
              <p>
                We use the information we collect to process your loan application, communicate with 
                you, improve our services, and comply with legal obligations.
              </p>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Data Security</h2>
              <p>
                We implement appropriate security measures to protect your personal information from 
                unauthorized access, alteration, disclosure, or destruction.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;


