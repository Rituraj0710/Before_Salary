import { useState, useEffect } from 'react';
import api from '../../utils/api';

const Terms = () => {
  const [content, setContent] = useState(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await api.get('/content/terms');
      setContent(response.data.data);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms & Conditions</h1>
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
                By accessing and using BeforeSalary's services, you agree to be bound by these 
                Terms and Conditions. Please read them carefully.
              </p>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Use of Service</h2>
              <p>
                You agree to use our services only for lawful purposes and in accordance with these 
                Terms. You must not use our services in any way that could damage, disable, or impair 
                our platform.
              </p>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Loan Applications</h2>
              <p>
                All loan applications are subject to approval based on our eligibility criteria. 
                We reserve the right to reject any application without providing a reason.
              </p>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Interest Rates</h2>
              <p>
                Interest rates are subject to change and may vary based on your credit profile and 
                other factors. The final interest rate will be communicated upon loan approval.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Terms;



