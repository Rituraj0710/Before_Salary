import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  ShieldCheckIcon, 
  UserGroupIcon,
  LightBulbIcon,
  ClockIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  ScaleIcon,
  LockClosedIcon,
  HandRaisedIcon,
  HandThumbUpIcon,
  DevicePhoneMobileIcon,
  BanknotesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';

const About = () => {
  const [content, setContent] = useState(null);
  const [heroContent, setHeroContent] = useState({
    showGooglePlay: true,
    showWhatsApp: true,
    googlePlayLink: '',
    whatsappLink: 'https://wa.me/1234567890'
  });

  useEffect(() => {
    fetchContent();
    fetchHeroContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await api.get('/content/about');
      if (response.data && response.data.success !== false) {
        if (Array.isArray(response.data.data) && response.data.data.length > 0) {
          setContent(response.data.data);
        } else {
          setContent(null);
        }
      } else {
        setContent(null);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      setContent(null);
    }
  };

  const fetchHeroContent = async () => {
    try {
      const response = await api.get('/content/hero-banner');
      if (response.data.success && response.data.data) {
        setHeroContent(prev => ({
          ...prev,
          showGooglePlay: response.data.data.showGooglePlay !== false,
          showWhatsApp: response.data.data.showWhatsApp !== false,
          googlePlayLink: response.data.data.googlePlayLink || '',
          whatsappLink: response.data.data.whatsappLink || 'https://wa.me/1234567890'
        }));
      }
    } catch (error) {
      console.error('Error fetching hero content:', error);
    }
  };

  const whatSetsUsApart = [
    {
      icon: LightBulbIcon,
      title: 'Speed',
      description: 'Get funds when you need them most without unnecessary delays. Quick approvals and fast disbursals ensure life never comes to a standstill.'
    },
    {
      icon: Cog6ToothIcon,
      title: 'Efficiency',
      description: 'From application to disbursal, every step is smooth and hassle-free. Our streamlined process saves you both time and effort.'
    },
    {
      icon: ArrowRightIcon,
      title: 'Flexibility',
      description: 'Choose loan amounts and repayment tenures that fit your lifestyle. We adapt to your needs instead of forcing rigid structures.'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Empathy and Understanding',
      description: 'We see more than just numbers — we see people. Every borrower is treated with fairness, dignity, and care.'
    },
    {
      icon: ScaleIcon,
      title: 'Transparent',
      description: 'No fine print, no hidden surprises — just clear terms you can trust. What we promise is exactly what you get.'
    },
    {
      icon: LockClosedIcon,
      title: 'Security First',
      description: 'Your data and transactions are protected with advanced security systems. Peace of mind comes built into every loan.'
    },
    {
      icon: HandRaisedIcon,
      title: 'Accessibility',
      description: 'Designed to support salaried, self-employed, and underserved communities alike. Financial help made easy, fair, and inclusive.'
    },
    {
      icon: ClockIcon,
      title: 'Customer Support',
      description: 'A dedicated team is always ready to guide you at every step. From queries to repayments, we\'re here for you.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* About Us Title Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 text-center mb-12">About us</h1>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Images and Shapes Placeholder */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {/* Image Placeholder 1 */}
                <div className="bg-gradient-to-br from-orange-100 to-blue-100 rounded-2xl p-8 h-64 flex items-center justify-center">
                  <UserGroupIcon className="h-24 w-24 text-orange-500" />
                </div>
                {/* Image Placeholder 2 */}
                <div className="bg-gradient-to-br from-blue-100 to-orange-100 rounded-2xl p-8 h-64 flex items-center justify-center mt-8">
                  <DevicePhoneMobileIcon className="h-24 w-24 text-blue-500" />
                </div>
              </div>
              {/* Decorative Shapes */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200 rounded-full opacity-20 -z-10"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-200 rounded-full opacity-20 -z-10"></div>
            </div>

            {/* Right - Company Mission */}
            <div className="bg-orange-500 rounded-2xl p-8 lg:p-12 text-white shadow-xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Company Mission</h2>
              <p className="text-xl font-semibold mb-6 text-orange-50">BeforeSalary: Your Lifeline When Life Can't Wait</p>
              <p className="text-white/90 leading-relaxed text-lg">
                Life can throw unexpected bills and emergencies your way—that's when BeforeSalary steps in. We make access to credit simple, fast, and fair, delivering emergency loans without stress or paperwork. Powered by smart technology, we get funds to you in minutes, supporting real people with real solutions. More than lending, we help build financial resilience and confidence to move forward.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Company Vision Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Company Vision Box */}
            <div className="bg-orange-500 rounded-2xl p-8 lg:p-12 text-white shadow-xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Company Vision</h2>
              <p className="text-xl font-semibold mb-6 text-orange-50">Our Vision: Financial Support for Every Step of Life</p>
              <div className="space-y-4 text-white/90 leading-relaxed text-lg">
                <p>
                  We envision a world where financial support is accessible, fair, and reliable for everyone. Our vision is to break down the traditional barriers of lending, making it possible for people from all walks of life to access the funds they need when they need them most.
                </p>
                <p>
                  Through innovative technology and a deep understanding of our customers' needs, we aim to empower individuals and families to build financial resilience, achieve their goals, and navigate life's challenges with confidence and stability.
                </p>
              </div>
            </div>

            {/* Right - Images Placeholder */}
            <div className="relative">
              <div className="space-y-4">
                {/* Image Placeholder 1 */}
                <div className="bg-gradient-to-br from-pink-100 to-green-100 rounded-2xl p-8 h-48 flex items-center justify-center">
                  <HandThumbUpIcon className="h-20 w-20 text-pink-500" />
                </div>
                {/* Image Placeholder 2 */}
                <div className="bg-gradient-to-br from-blue-100 to-orange-100 rounded-2xl p-8 h-48 flex items-center justify-center">
                  <UserGroupIcon className="h-20 w-20 text-blue-500" />
                </div>
              </div>
              {/* Decorative Shapes */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-300 rounded-lg opacity-30 -z-10 transform rotate-12"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-orange-300 rounded-lg opacity-30 -z-10 transform -rotate-12"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Your Partner in Financial Support Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text Content */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Your Partner in Financial Support</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
                <p>
                  Life has a way of throwing surprises at us, some exciting, others challenging. When those challenges involve sudden expenses or financial emergencies, the right help at the right time can make all the difference.
                </p>
                <p>
                  At BeforeSalary, we understand that financial needs don't always come with advance notice. That's why we've built a platform that delivers fast, fair, and reliable emergency loans—without the stress, paperwork, or long waiting periods that traditional lenders often require.
                </p>
                <p>
                  We're more than just a lending platform. We're your partner in building financial resilience. Whether you're facing a medical emergency, unexpected home repairs, or any other urgent expense, we're here to provide the support you need, when you need it most.
                </p>
                <p>
                  Our commitment extends beyond just providing loans. We believe in empowering our customers with the tools, knowledge, and confidence to make informed financial decisions and build a more secure future.
                </p>
              </div>
            </div>

            {/* Right - Circular Images Placeholder */}
            <div className="flex justify-center">
              <div className="relative w-80 h-80">
                {/* Large Circle */}
                <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
                {/* Inner Circles */}
                <div className="absolute top-4 left-4 w-24 h-24 bg-gradient-to-br from-blue-100 to-orange-100 rounded-full flex items-center justify-center">
                  <UserGroupIcon className="h-12 w-12 text-blue-600" />
                </div>
                <div className="absolute top-4 right-4 w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                  <HandThumbUpIcon className="h-12 w-12 text-purple-600" />
                </div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                  <DevicePhoneMobileIcon className="h-12 w-12 text-green-600" />
                </div>
                {/* Decorative Dots */}
                <div className="absolute top-1/2 left-0 w-3 h-3 bg-orange-400 rounded-full"></div>
                <div className="absolute top-0 right-1/2 w-3 h-3 bg-blue-400 rounded-full"></div>
                <div className="absolute bottom-0 left-1/4 w-3 h-3 bg-orange-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Sets Us Apart Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-12">What sets us apart</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whatSetsUsApart.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:shadow-xl transition">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-orange-100 rounded-full p-3">
                      <IconComponent className="h-10 w-10 text-orange-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed text-center">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Statistics Banner */}
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
                  GET IT ON Google Play
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

      {/* Additional Support Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Accessibility Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-orange-100 rounded-full p-4">
                  <HandRaisedIcon className="h-12 w-12 text-orange-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Accessibility</h3>
              <p className="text-gray-600 leading-relaxed text-center">
                Designed to support salaried, self-employed, and underserved communities alike. Financial help made easy, fair, and inclusive.
              </p>
            </div>

            {/* Customer Support Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-orange-100 rounded-full p-4">
                  <ClockIcon className="h-12 w-12 text-orange-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">24/7 Customer Support</h3>
              <p className="text-gray-600 leading-relaxed text-center">
                A dedicated team is always ready to guide you at every step. From queries to repayments, we're here for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Warning */}
      <section className="bg-blue-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-center">
            <span className="font-semibold">Beware of fraud!</span> Always use our secure Repayment Website Link for loan payments. Do not make direct bank payments. BeforeSalary is not responsible for payments made to other accounts.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
