import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  CheckCircleIcon, 
  ArrowRightIcon,
  CurrencyDollarIcon,
  HomeIcon,
  BuildingOfficeIcon,
  TruckIcon,
  AcademicCapIcon,
  PlayIcon,
  HandThumbUpIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  DevicePhoneMobileIcon,
  BanknotesIcon,
  LightBulbIcon,
  ClockIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loanCards, setLoanCards] = useState([]);
  const [homeInfoCards, setHomeInfoCards] = useState([]);
  const [homeBenefitCards, setHomeBenefitCards] = useState([]);
  const [heroContent, setHeroContent] = useState({
    title: 'Get an instant personal loan in minutes',
    subtitle: 'BeforeSalary makes borrowing easy with fast approvals, fair terms, and convenient repayment plans',
    ctaText: 'Start Now',
    backgroundColor: 'orange',
    showGooglePlay: false,
    showWhatsApp: true,
    isActive: true
  });

  // Icon mapping
  const iconMap = {
    UserGroupIcon,
    CurrencyDollarIcon,
    BanknotesIcon,
    HomeIcon,
    BuildingOfficeIcon,
    TruckIcon,
    AcademicCapIcon,
    DevicePhoneMobileIcon,
    LightBulbIcon,
    ClockIcon,
    Cog6ToothIcon
  };

  useEffect(() => {
    fetchLoans();
    fetchHeroContent();
    fetchLoanCards();
    fetchHomeInfoCards();
    fetchHomeBenefitCards();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await api.get('/loans');
      setLoans(response.data.data || []);
    } catch (error) {
      console.error('Error fetching loans:', error);
    }
  };

  const fetchLoanCards = async () => {
    try {
      const response = await api.get('/home/loan-cards');
      if (response.data.success) {
        setLoanCards(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching loan cards:', error);
      // Fallback to default cards if API fails
      setLoanCards([]);
    }
  };

  const fetchHomeInfoCards = async () => {
    try {
      const response = await api.get('/home/info-cards');
      if (response.data.success) {
        setHomeInfoCards(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching info cards:', error);
      setHomeInfoCards([]);
    }
  };

  const fetchHomeBenefitCards = async () => {
    try {
      const response = await api.get('/home/benefit-cards');
      if (response.data.success) {
        setHomeBenefitCards(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching benefit cards:', error);
      setHomeBenefitCards([]);
    }
  };

  const fetchHeroContent = async () => {
    try {
      const response = await api.get('/content/hero-banner');
      if (response.data.success && response.data.data) {
        setHeroContent(prev => ({
          ...prev,
          title: response.data.data.title || prev.title,
          subtitle: response.data.data.subtitle || prev.subtitle,
          ctaText: response.data.data.ctaText || prev.ctaText,
          backgroundColor: response.data.data.backgroundColor || 'orange',
          showGooglePlay: false,
          showWhatsApp: response.data.data.showWhatsApp !== false,
          googlePlayLink: response.data.data.googlePlayLink || '',
          whatsappLink: response.data.data.whatsappLink || 'https://wa.me/1234567890',
          isActive: response.data.data.isActive !== false
        }));
      }
    } catch (error) {
      console.error('Error fetching hero content:', error);
      // Ensure hero is visible even if API fails
      setHeroContent(prev => ({ ...prev, isActive: true }));
    }
  };

  // Default loan types (fallback if no cards from API)
  const defaultLoanTypes = [
    {
      name: 'Personal Loan - Salaried',
      description: 'Quick and hassle-free personal loans for professionals aged 21-56, with fast approval and flexible repayment options.',
      icon: UserGroupIcon,
      link: '/eligibility'
    },
    {
      name: 'Personal Loan - Self Employed',
      description: 'Reliable funding designed to support self-employed individuals, balancing both business and personal financial needs.',
      icon: CurrencyDollarIcon,
      link: '/eligibility'
    },
    {
      name: 'Micro Loan (Under ₹100K)',
      description: 'Instant small-ticket loans up to ₹100,000 to cover urgent expenses like medical bills, repairs, or short-term cash needs.',
      icon: BanknotesIcon,
      link: '/eligibility'
    },
    {
      name: 'Medical Loan',
      description: 'Medical emergencies can\'t wait. Get quick approval, instant funds, and flexible repayment so you can focus on recovery, not expenses.',
      icon: CurrencyDollarIcon,
      link: '/eligibility'
    },
    {
      name: 'Agriculture Loan',
      description: 'Quick funds for seeds, equipment, or urgent farm needs—approved fast with flexible repayment options.',
      icon: CurrencyDollarIcon,
      link: '/eligibility'
    },
    {
      name: 'EMI Loan',
      description: 'Turn big expenses into easy repayments with EMI Loan. Get quick approval, flexible tenure, and a hassle-free process to manage your goals stress-free.',
      icon: CurrencyDollarIcon,
      link: '/eligibility'
    }
  ];

  // Convert API cards to display format
  const loanTypes = loanCards.length > 0
    ? loanCards.map(card => ({
        name: card.name,
        description: card.description,
        icon: iconMap[card.icon] || CurrencyDollarIcon,
        link: card.link || '/eligibility'
      }))
    : defaultLoanTypes;

  const defaultInfoCards = [
    {
      title: 'Short Term Loan',
      description: 'A short-term loan is a swiftly disbursed financial option designed for urgent needs. It involves a brief repayment period.',
      extraDescription: 'Weekly or monthly installments provide rapid access to funds during emergencies, making it an ideal solution for immediate financial requirements.'
    },
    {
      title: 'Personal Loan',
      description: 'A personal loan is a versatile financial solution tailored to alleviate unplanned expenses. It offers fixed rates, and regular repayments.',
      extraDescription: 'With no collateral required, personal loans provide flexibility and convenience for managing various financial needs.'
    }
  ];

  const infoCards = homeInfoCards.length > 0 ? homeInfoCards : defaultInfoCards;

  const defaultBenefits = [
    {
      title: 'INSTANT FINANCIAL ASSISTANCE',
      description: 'Get quick funds for emergencies with eligibility based on creditworthiness. No collateral needed. Salary advance loans available for unexpected expenses.',
      icon: 'LightBulbIcon'
    },
    {
      title: 'EASY FAST REDRESSAL',
      description: 'Streamlined digital process to avoid lengthy paperwork and queues. Loan approval and bank transfer within 30 minutes.',
      icon: 'ClockIcon'
    },
    {
      title: 'Flexible',
      description: 'Assistance for various unforeseen expenses like home repairs, medical bills, housing, utilities, weddings, or family emergencies. User-friendly application process with no upfront fees.',
      icon: 'Cog6ToothIcon'
    }
  ];

  const benefitCards = homeBenefitCards.length > 0
    ? homeBenefitCards.map(card => ({
        ...card,
        iconComponent: iconMap[card.icon] || LightBulbIcon
      }))
    : defaultBenefits.map(card => ({
        ...card,
        iconComponent: iconMap[card.icon] || LightBulbIcon
      }));

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      {(heroContent.isActive !== false) && (
        <section className={`text-white py-16 md:py-24 relative overflow-hidden ${
          heroContent.backgroundColor === 'orange' 
            ? 'bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600' 
            : heroContent.backgroundColor === 'blue'
            ? 'bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700'
            : 'bg-gradient-to-br from-orange-500 via-orange-400 via-blue-500 to-blue-600'
        }`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-96 h-96 bg-white rotate-45 transform"></div>
            <div className="absolute bottom-20 left-20 w-64 h-64 bg-white rotate-12 transform"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Section */}
              <div className="hero-section-content">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                  {heroContent.title}
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed">
                  {heroContent.subtitle}
                </p>
                
                {/* Red Start Now Button */}
                <Link
                  to="/eligibility"
                  className="bg-red-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-all duration-300 inline-flex items-center justify-center shadow-2xl mb-6"
                >
                  {heroContent.ctaText}
                  <ArrowRightIcon className="ml-2 h-6 w-6" />
                </Link>
                
                {/* App Download Buttons */}
                {(heroContent.showGooglePlay || heroContent.showWhatsApp) && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    {heroContent.showGooglePlay && (
                      <a
                        href={heroContent.googlePlayLink || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition inline-flex items-center justify-center shadow-lg"
                      >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.96-3.24-1.44-1.56-.62-2.46-1.06-2.46-1.95 0-.9.9-1.34 2.46-1.96 1.16-.47 2.15-.93 3.24-1.44 1.03-.47 2.1-.54 3.08.4l.97 1c.52.51.51 1.28.01 1.77-.34.33-.78.6-1.22.83-.8.43-1.61.87-2.42 1.29l.02.03c.11.07.22.13.34.2 1.09.58 2.46.96 2.46 1.95 0 .89-1.37 1.37-2.46 1.95-.12.07-.23.13-.34.2l-.02.03c.81.42 1.62.86 2.42 1.29.44.23.88.5 1.22.83.5.49.51 1.26.01 1.77l-.97 1zm-1.15-5.58c.13.05.27.09.41.14.17.06.35.11.53.17.18.06.36.1.54.14.18.03.35.06.52.07.35.02.68 0 1.02-.02.17-.02.34-.04.51-.07.18-.04.36-.08.54-.14.18-.06.36-.11.53-.17.14-.05.28-.09.41-.14l.03-.01c1.27-.46 2.35-1.05 3.22-1.76.87-.7 1.54-1.5 2.01-2.39.47-.89.71-1.82.71-2.79 0-.97-.24-1.9-.71-2.79-.47-.89-1.14-1.69-2.01-2.39-.87-.71-1.95-1.3-3.22-1.76l-.03-.01c-.13-.05-.27-.09-.41-.14-.17-.06-.35-.11-.53-.17-.18-.06-.36-.1-.54-.14-.17-.03-.34-.06-.51-.07-.34-.02-.67 0-1.02.02-.17.02-.34.04-.51.07-.18.04-.36.08-.54.14-.18.06-.36.11-.53.17-.14.05-.28.09-.41.14l-.03.01c-1.27.46-2.35 1.05-3.22 1.76-.87.7-1.54 1.5-2.01 2.39-.47.89-.71 1.82-.71 2.79 0 .97.24 1.9.71 2.79.47.89 1.14 1.69 2.01 2.39.87.71 1.95 1.3 3.22 1.76l.03.01zm-5.9 0c.13.05.27.09.41.14.17.06.35.11.53.17.18.06.36.1.54.14.18.03.35.06.52.07.35.02.68 0 1.02-.02.17-.02.34-.04.51-.07.18-.04.36-.08.54-.14.18-.06.36-.11.53-.17.14-.05.28-.09.41-.14l.03-.01c1.27-.46 2.35-1.05 3.22-1.76.87-.7 1.54-1.5 2.01-2.39.47-.89.71-1.82.71-2.79 0-.97-.24-1.9-.71-2.79-.47-.89-1.14-1.69-2.01-2.39-.87-.71-1.95-1.3-3.22-1.76l-.03-.01c-.13-.05-.27-.09-.41-.14-.17-.06-.35-.11-.53-.17-.18-.06-.36-.1-.54-.14-.17-.03-.34-.06-.51-.07-.34-.02-.67 0-1.02.02-.17.02-.34.04-.51.07-.18.04-.36.08-.54.14-.18.06-.36.11-.53.17-.14.05-.28.09-.41.14l-.03.01c-1.27.46-2.35 1.05-3.22 1.76-.87.7-1.54 1.5-2.01 2.39-.47.89-.71 1.82-.71 2.79 0 .97.24 1.9.71 2.79.47.89 1.14 1.69 2.01 2.39.87.71 1.95 1.3 3.22 1.76l.03.01z"/>
                        </svg>
                        APPLY ON Google Play
                      </a>
                    )}
                    {heroContent.showWhatsApp && (
                      <a
                        href={heroContent.whatsappLink || 'https://wa.me/1234567890'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition inline-flex items-center justify-center shadow-lg"
                      >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        APPLY ON WhatsApp
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Right Section - Mobile Phone Mockup */}
              <div className="hidden lg:block relative hero-section-content">
                <div className="bg-white rounded-3xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="bg-gray-900 rounded-2xl overflow-hidden">
                    <div className="bg-white h-[600px] rounded-t-2xl p-4 space-y-4 overflow-y-auto">
                      {/* Phone Header */}
                      <div className="flex justify-between items-center mb-4">
                        <div className="w-6 h-6">
                          <div className="w-full h-0.5 bg-gray-400 mb-1"></div>
                          <div className="w-full h-0.5 bg-gray-400 mb-1"></div>
                          <div className="w-full h-0.5 bg-gray-400"></div>
                        </div>
                        <span className="text-xs font-semibold text-gray-800">BeforeSalary</span>
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                      </div>

                      {/* Apply Now Card */}
                      <Link to="/eligibility" className="bg-orange-500 rounded-xl p-4 text-white hover:bg-orange-600 transition block">
                        <div className="flex items-center justify-between font-bold">
                          <span>Apply Now</span>
                          <ArrowRightIcon className="h-5 w-5" />
                        </div>
                      </Link>

                      {/* Easy Personal Loan */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Easy Personal Loan</h3>
                          <p className="text-xs text-gray-500">Your financial Partner anytime anywhere</p>
                        </div>
                        <div className="relative w-16 h-16">
                          <svg className="transform -rotate-90 w-16 h-16">
                            <circle cx="32" cy="32" r="28" stroke="#E5E7EB" strokeWidth="4" fill="none" />
                            <circle cx="32" cy="32" r="28" stroke="#F97316" strokeWidth="4" fill="none" 
                              strokeDasharray={`${2 * Math.PI * 28 * 0.1} ${2 * Math.PI * 28 * 0.9}`} />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-orange-500">10%</span>
                          </div>
                        </div>
                      </div>

                      {/* Video Tutorial Card */}
                      <div className="bg-orange-100 rounded-xl p-4 border-2 border-orange-200">
                        <div className="flex items-center space-x-3">
                          <div className="bg-orange-500 rounded-full p-2">
                            <PlayIcon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-sm">For instant help</p>
                            <p className="text-xs text-gray-600">watch the video tutorial</p>
                          </div>
                        </div>
                      </div>

                      {/* Congratulations Card */}
                      <div className="bg-white border-2 border-yellow-300 rounded-xl p-4 shadow-lg relative">
                        <div className="absolute top-2 right-2">
                          <svg className="w-6 h-6 text-yellow-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <div className="text-center">
                          <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-2">
                            <HandThumbUpIcon className="h-7 w-7 text-white" />
                          </div>
                          <p className="font-bold text-gray-900">Congratulations!</p>
                          <p className="text-xs text-gray-600">You are eligible for the loan</p>
                        </div>
                      </div>

                      {/* Bottom Cards */}
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-xs font-semibold text-gray-700">Loan Calculator</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-xs font-semibold text-gray-700">Check Credit Score</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-xs font-semibold text-gray-700">How to Apply</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-xs font-semibold text-gray-700">Reach Us For Help</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Statistics Banner - Orange Bar */}
      <section className="bg-orange-500 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="flex items-center space-x-4">
              <DevicePhoneMobileIcon className="h-12 w-12" />
              <div>
                <p className="text-2xl font-bold">OVER 1 Million +</p>
                <p className="text-sm text-orange-100">App Downloads</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <BanknotesIcon className="h-12 w-12" />
              <div>
                <p className="text-2xl font-bold">OVER ₹5,100 Crores</p>
                <p className="text-sm text-orange-100">Total Loans Given</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              {heroContent.showGooglePlay && (
                <a
                  href={heroContent.googlePlayLink || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-800 transition inline-flex items-center justify-center text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.96-3.24-1.44-1.56-.62-2.46-1.06-2.46-1.95 0-.9.9-1.34 2.46-1.96 1.16-.47 2.15-.93 3.24-1.44 1.03-.47 2.1-.54 3.08.4l.97 1c.52.51.51 1.28.01 1.77-.34.33-.78.6-1.22.83-.8.43-1.61.87-2.42 1.29l.02.03c.11.07.22.13.34.2 1.09.58 2.46.96 2.46 1.95 0 .89-1.37 1.37-2.46 1.95-.12.07-.23.13-.34.2l-.02.03c.81.42 1.62.86 2.42 1.29.44.23.88.5 1.22.83.5.49.51 1.26.01 1.77l-.97 1zm-1.15-5.58c.13.05.27.09.41.14.17.06.35.11.53.17.18.06.36.1.54.14.18.03.35.06.52.07.35.02.68 0 1.02-.02.17-.02.34-.04.51-.07.18-.04.36-.08.54-.14.18-.06.36-.11.53-.17.14-.05.28-.09.41-.14l.03-.01c1.27-.46 2.35-1.05 3.22-1.76.87-.7 1.54-1.5 2.01-2.39.47-.89.71-1.82.71-2.79 0-.97-.24-1.9-.71-2.79-.47-.89-1.14-1.69-2.01-2.39-.87-.71-1.95-1.3-3.22-1.76l-.03-.01c-.13-.05-.27-.09-.41-.14-.17-.06-.35-.11-.53-.17-.18-.06-.36-.1-.54-.14-.17-.03-.34-.06-.51-.07-.34-.02-.67 0-1.02.02-.17.02-.34.04-.51.07-.18.04-.36.08-.54.14-.18.06-.36.11-.53.17-.14.05-.28.09-.41.14l-.03.01c-1.27.46-2.35 1.05-3.22 1.76-.87.7-1.54 1.5-2.01 2.39-.47.89-.71 1.82-.71 2.79 0 .97.24 1.9.71 2.79.47.89 1.14 1.69 2.01 2.39.87.71 1.95 1.3 3.22 1.76l.03.01zm-5.9 0c.13.05.27.09.41.14.17.06.35.11.53.17.18.06.36.1.54.14.18.03.35.06.52.07.35.02.68 0 1.02-.02.17-.02.34-.04.51-.07.18-.04.36-.08.54-.14.18-.06.36-.11.53-.17.14-.05.28-.09.41-.14l.03-.01c1.27-.46 2.35-1.05 3.22-1.76.87-.7 1.54-1.5 2.01-2.39.47-.89.71-1.82.71-2.79 0-.97-.24-1.9-.71-2.79-.47-.89-1.14-1.69-2.01-2.39-.87-.71-1.95-1.3-3.22-1.76l-.03-.01c-.13-.05-.27-.09-.41-.14-.17-.06-.35-.11-.53-.17-.18-.06-.36-.1-.54-.14-.17-.03-.34-.06-.51-.07-.34-.02-.67 0-1.02.02-.17.02-.34.04-.51.07-.18.04-.36.08-.54.14-.18.06-.36.11-.53.17-.14.05-.28.09-.41.14l-.03.01c-1.27.46-2.35 1.05-3.22 1.76-.87.7-1.54 1.5-2.01 2.39-.47.89-.71 1.82-.71 2.79 0 .97.24 1.9.71 2.79.47.89 1.14 1.69 2.01 2.39.87.71 1.95 1.3 3.22 1.76l.03.01z"/>
                  </svg>
                  APPLY ON Google Play
                </a>
              )}
              {heroContent.showWhatsApp && (
                <a
                  href={heroContent.whatsappLink || 'https://wa.me/1234567890'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition inline-flex items-center justify-center text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  APPLY ON WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Loan Information Cards Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {infoCards.map((card, index) => (
              <div key={card._id || index} className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100 hover:shadow-xl transition">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{card.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-4">{card.description}</p>
                {card.extraDescription && (
                  <p className="text-gray-600 leading-relaxed">{card.extraDescription}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-12">Benefits</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {benefitCards.map((card, index) => {
              const IconComponent = card.iconComponent || iconMap[card.icon] || LightBulbIcon;
              return (
                <div key={card._id || index} className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100 hover:shadow-xl transition">
                  <div className="flex items-center justify-center mb-6">
                    <div className="bg-orange-100 rounded-full p-4">
                      <IconComponent className="h-12 w-12 text-orange-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center uppercase">{card.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-center">{card.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Find Your Perfect Loan Match Section */}
      <section className="py-16 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Find Your Perfect Loan Match
            </h2>
            <Link
              to="/loans"
              className="text-orange-600 font-semibold hover:text-orange-700 inline-flex items-center"
            >
              View all
              <ArrowRightIcon className="ml-1 h-5 w-5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loanTypes.map((loan, index) => {
              const IconComponent = loan.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1"
                >
                  <div className="flex items-start mb-4">
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <IconComponent className="h-8 w-8 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold ml-4 flex-1">{loan.name}</h3>
                  </div>
                  <p className="text-gray-600 mb-6 text-sm leading-relaxed">{loan.description}</p>
                  <Link
                    to={loan.link}
                    className="text-orange-600 font-semibold hover:text-orange-700 inline-flex items-center"
                  >
                    Apply Now
                    <ArrowRightIcon className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Your Needs, Our Responsibility Section */}
      <section className="py-16 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Text Content */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Your Needs, <span className="text-orange-600">Our Responsibility</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Here to support your needs with fair and simple lending
              </p>

              {/* Feature Boxes */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-orange-500">
                  <div className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-orange-600 mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Transparent Terms</h3>
                      <p className="text-gray-600">
                        Clear, simple, and straightforward loan agreements with no hidden charges, so you always know exactly what you're signing up for
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-orange-500">
                  <div className="flex items-start">
                    <ShieldCheckIcon className="h-6 w-6 text-orange-600 mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Data Security</h3>
                      <p className="text-gray-600">
                        We keep your personal information secure and confidential at every step.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-orange-500">
                  <div className="flex items-start">
                    <UserGroupIcon className="h-6 w-6 text-orange-600 mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Ongoing Supports</h3>
                      <p className="text-gray-600">
                        We stay with you beyond disbursal, offering guidance and assistance throughout your repayment journey to keep things smooth and stress-free
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Image Placeholder */}
            <div className="hidden md:block">
              <div className="bg-gradient-to-br from-orange-100 to-blue-100 rounded-2xl p-12 h-96 flex items-center justify-center">
                <div className="text-center">
                  <UserGroupIcon className="h-24 w-24 text-orange-500 mx-auto mb-4" />
                  <p className="text-gray-600">Business Partnership Illustration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How it Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your happy future is our responsibility, and that's why we've created simple steps to make the process easy for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="bg-white rounded-2xl shadow-xl p-8 transform rotate-3">
                  <div className="bg-gray-50 rounded-xl p-6 mb-4">
                    <div className="text-left">
                      <h4 className="font-bold text-gray-900 mb-2">Let's Onboard</h4>
                      <p className="text-sm text-gray-600 mb-4">Start Your Financial Journey</p>
                      <div className="bg-white border rounded-lg p-3">
                        <span className="text-xs text-gray-500">Enter Phone Number</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Quick Loan</h3>
              <p className="text-gray-600">Apply in minutes and get instant access to funds whenever you need them.</p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="bg-white rounded-2xl shadow-xl p-8 transform -rotate-3">
                  <div className="bg-orange-500 rounded-xl p-4 mb-4">
                    <p className="text-white font-bold text-sm flex items-center">
                      Apply Now
                      <ArrowRightIcon className="h-4 w-4 ml-1" />
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900 text-lg">Easy Personal Loan</h4>
                    <p className="text-xs text-gray-600">Your Financial Partner anywhere anytime</p>
                    <div className="w-16 h-16 mx-auto">
                      <div className="relative">
                        <svg className="transform -rotate-90 w-16 h-16">
                          <circle cx="32" cy="32" r="28" stroke="#E5E7EB" strokeWidth="4" fill="none" />
                          <circle cx="32" cy="32" r="28" stroke="#F97316" strokeWidth="4" fill="none" 
                            strokeDasharray={`${2 * Math.PI * 28 * 0.1} ${2 * Math.PI * 28 * 0.9}`} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-orange-500">10%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fast Approval</h3>
              <p className="text-gray-600">No long waits or complex paperwork - enjoy a smooth and hassle-free approval process</p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="bg-white rounded-2xl shadow-xl p-8 transform rotate-3">
                  <div className="bg-green-50 rounded-xl p-6 text-center">
                    <h4 className="text-2xl font-bold text-green-600 mb-2">THANK YOU</h4>
                    <p className="text-xs text-gray-600 mb-2">Thank you! Application submitted successfully.</p>
                    <p className="text-xs text-gray-500">Your application reference number is #BLNV460K</p>
                  </div>
                </div>
              </div>
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Direct Fund Transfer</h3>
              <p className="text-gray-600">Get money directly in your bank account, quickly and securely.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Lending Partners Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600 mb-2">Our Lending Partners</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Powering <span className="text-orange-600">instant loans</span> with just a few clicks!
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {/* Partner 1 */}
            <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
              <div className="bg-orange-500 p-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                    <span className="text-orange-600 font-bold text-lg">A</span>
                  </div>
                </div>
                <ArrowRightIcon className="h-5 w-5 text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Avinash Capital</h3>
                <p className="text-sm text-gray-600 mb-4">Avinash Capital Markets Private Limited</p>
                <div className="text-xs text-gray-500">
                  <a href="#" className="hover:text-orange-600">T&C</a> | <a href="#" className="hover:text-orange-600">Privacy Policy</a>
                </div>
              </div>
            </div>

            {/* Partner 2 */}
            <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
              <div className="bg-orange-500 p-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-bold text-sm">Q</span>
                  </div>
                </div>
                <ArrowRightIcon className="h-5 w-5 text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">lendingplate</h3>
                <p className="text-sm text-gray-600 mb-1">best way to borrow</p>
                <p className="text-sm text-gray-600 mb-4">Unifinz Capital India Limited</p>
                <div className="text-xs text-gray-500">
                  <a href="#" className="hover:text-orange-600">T&C</a> | <a href="#" className="hover:text-orange-600">Privacy Policy</a>
                </div>
              </div>
            </div>

            {/* Partner 3 */}
            <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
              <div className="bg-orange-500 p-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                    <span className="text-orange-600 font-bold text-xs">D</span>
                  </div>
                </div>
                <ArrowRightIcon className="h-5 w-5 text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">DEV-AASHISH CAPITALS</h3>
                <p className="text-sm text-gray-600 mb-4">DEV-AASHISH CAPITALS PRIVATE LIMITED</p>
                <div className="text-xs text-gray-500">
                  <a href="#" className="hover:text-orange-600">T&C</a> | <a href="#" className="hover:text-orange-600">Privacy Policy</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-orange-50">
            Apply now and get instant approval on your loan
          </p>
          <Link
            to="/eligibility"
            className="bg-white text-orange-500 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition inline-block shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            Apply Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
