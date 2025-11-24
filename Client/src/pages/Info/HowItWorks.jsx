import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { 
  UserIcon, 
  DocumentCheckIcon, 
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const HowItWorks = () => {
  const [content, setContent] = useState(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await api.get('/content/how-it-works');
      setContent(response.data.data);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const steps = [
    {
      icon: UserIcon,
      title: 'Create Account',
      description: 'Register with us by providing your basic information. It takes just a few minutes.'
    },
    {
      icon: DocumentCheckIcon,
      title: 'Apply for Loan',
      description: 'Fill out our simple online application form with your loan requirements and details.'
    },
    {
      icon: CheckCircleIcon,
      title: 'Document Verification',
      description: 'Upload required documents. Our team will verify them quickly and efficiently.'
    },
    {
      icon: ArrowRightIcon,
      title: 'Get Approved',
      description: 'Once approved, funds will be disbursed to your account within 24-48 hours.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our simple 4-step process makes getting a loan quick and easy
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="h-8 w-8 text-blue-600" />
                </div>
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-6">
            Join thousands of satisfied customers who have trusted us with their financial needs.
          </p>
          <Link
            to="/eligibility"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition inline-flex items-center"
          >
            Apply Now
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;

