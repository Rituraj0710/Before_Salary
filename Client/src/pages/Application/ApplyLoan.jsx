import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { 
  UserIcon, 
  HomeIcon, 
  BriefcaseIcon, 
  DocumentIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const ApplyLoan = () => {
  const { user, sendOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loanId = searchParams.get('loanId');

  const [step, setStep] = useState(1);
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryError, setCategoryError] = useState(null);
  const [dynamicFields, setDynamicFields] = useState([]);
  const [loadingFields, setLoadingFields] = useState(false);

  const [formData, setFormData] = useState({
    loanId: loanId || '',
    personalInfo: {
      fullName: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: '',
      gender: '',
      pan: user?.pan || '',
      aadhar: user?.aadhar || '',
      maritalStatus: '',
      numberOfDependents: 0
    },
    address: {
      current: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      },
      permanent: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      }
    },
    employmentInfo: {
      employmentType: '',
      companyName: '',
      designation: '',
      workExperience: '',
      monthlyIncome: '',
      businessType: '',
      businessAge: ''
    },
    loanDetails: {
      loanAmount: '',
      loanTenure: '',
      purpose: ''
    },
    documents: {
      idProof: [],
      addressProof: [],
      incomeProof: [],
      bankStatement: [],
      otherDocuments: []
    },
    dynamicFields: {} // Store dynamic field values
  });

  useEffect(() => {
    fetchLoans();
    if (loanId) {
      fetchLoan(loanId);
    }
    
    // Pre-fill form with eligibility data if available
    const eligibilityData = sessionStorage.getItem('eligibilityData');
    if (eligibilityData) {
      try {
        const data = JSON.parse(eligibilityData);
        setFormData(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            pan: data.pancard || prev.personalInfo.pan,
            email: data.personalEmail || prev.personalInfo.email,
            dateOfBirth: data.dob || prev.personalInfo.dateOfBirth,
            gender: data.gender || prev.personalInfo.gender
          },
          employmentInfo: {
            ...prev.employmentInfo,
            employmentType: data.employmentType === 'SALARIED' ? 'Salaried' : data.employmentType === 'SELF EMPLOYED' ? 'Self-Employed' : prev.employmentInfo.employmentType,
            companyName: data.companyName || prev.employmentInfo.companyName,
            monthlyIncome: data.netMonthlyIncome || prev.employmentInfo.monthlyIncome
          },
          address: {
            ...prev.address,
            current: {
              ...prev.address.current,
              pincode: data.pinCode || prev.address.current.pincode,
              state: data.state || prev.address.current.state,
              city: data.city || prev.address.current.city
            }
          }
        }));
      } catch (error) {
        console.error('Error parsing eligibility data:', error);
      }
    }
  }, [loanId]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories?withCounts=1');
      setCategories(res.data.data || []);
    } catch (e) {
      setCategoryError(e.response?.data?.message || 'Categories unavailable');
    }
  };

  const fetchLoans = async () => {
    try {
      const response = await api.get('/loans');
      setLoans(response.data.data || []);
    } catch (error) {
      console.error('Error fetching loans:', error);
    }
  };

  const fetchLoan = async (id) => {
    try {
      const response = await api.get(`/loans`);
      const loan = response.data.data.find(l => l._id === id);
      if (loan) {
        setSelectedLoan(loan);
        // Fetch dynamic fields for the loan's category
        if (loan.category?._id || loan.category) {
          fetchDynamicFields(loan.category._id || loan.category);
        }
      }
    } catch (error) {
      console.error('Error fetching loan:', error);
    }
  };

  const fetchDynamicFields = async (categoryId) => {
    if (!categoryId) return;
    try {
      setLoadingFields(true);
      const response = await api.get(`/form-fields/category/${categoryId}`);
      setDynamicFields(response.data.data || []);
    } catch (error) {
      console.error('Error fetching dynamic fields:', error);
      setDynamicFields([]);
    } finally {
      setLoadingFields(false);
    }
  };

  const handleChange = (e, section, field) => {
    if (section && field) {
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [field]: e.target.value
        }
      });
    } else if (section) {
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [e.target.name]: e.target.value
        }
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleNestedChange = (e, section, subsection, field) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [subsection]: {
          ...formData[section][subsection],
          [field]: e.target.value
        }
      }
    });
  };

  const handleFileChange = (e, docType) => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      documents: {
        ...formData.documents,
        [docType]: files
      }
    });
  };

  const handleDynamicFieldChange = (fieldName, value, fieldType) => {
    setFormData({
      ...formData,
      dynamicFields: {
        ...formData.dynamicFields,
        [fieldName]: fieldType === 'File' ? value : value
      }
    });
  };

  const handleDynamicFileChange = (fieldName, files) => {
    setFormData({
      ...formData,
      dynamicFields: {
        ...formData.dynamicFields,
        [fieldName]: Array.from(files)
      }
    });
  };

  const renderDynamicField = (field) => {
    const fieldValue = formData.dynamicFields[field.name] || '';
    const fieldId = `dynamic-${field._id}`;

    switch (field.type) {
      case 'Text':
        return (
          <input
            type="text"
            id={fieldId}
            name={field.name}
            required={field.required}
            value={fieldValue}
            onChange={(e) => handleDynamicFieldChange(field.name, e.target.value, 'Text')}
            placeholder={field.placeholder || `Enter ${field.label || field.name}`}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
      
      case 'Number':
        return (
          <input
            type="number"
            id={fieldId}
            name={field.name}
            required={field.required}
            value={fieldValue}
            onChange={(e) => handleDynamicFieldChange(field.name, e.target.value, 'Number')}
            placeholder={field.placeholder || `Enter ${field.label || field.name}`}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
      
      case 'Email':
        return (
          <input
            type="email"
            id={fieldId}
            name={field.name}
            required={field.required}
            value={fieldValue}
            onChange={(e) => handleDynamicFieldChange(field.name, e.target.value, 'Email')}
            placeholder={field.placeholder || 'Enter email address'}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
      
      case 'Phone':
        return (
          <input
            type="tel"
            id={fieldId}
            name={field.name}
            required={field.required}
            value={fieldValue}
            onChange={(e) => handleDynamicFieldChange(field.name, e.target.value, 'Phone')}
            placeholder={field.placeholder || 'Enter phone number'}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
      
      case 'Date':
        return (
          <input
            type="date"
            id={fieldId}
            name={field.name}
            required={field.required}
            value={fieldValue}
            onChange={(e) => handleDynamicFieldChange(field.name, e.target.value, 'Date')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
      
      case 'Textarea':
        return (
          <textarea
            id={fieldId}
            name={field.name}
            required={field.required}
            value={fieldValue}
            onChange={(e) => handleDynamicFieldChange(field.name, e.target.value, 'Textarea')}
            placeholder={field.placeholder || `Enter ${field.label || field.name}`}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
      
      case 'Select':
        return (
          <select
            id={fieldId}
            name={field.name}
            required={field.required}
            value={fieldValue}
            onChange={(e) => handleDynamicFieldChange(field.name, e.target.value, 'Select')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Select an option --</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      
      case 'Radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="radio"
                  name={field.name}
                  value={option}
                  required={field.required}
                  checked={fieldValue === option}
                  onChange={(e) => handleDynamicFieldChange(field.name, e.target.value, 'Radio')}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        );
      
      case 'Checkbox':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              id={fieldId}
              name={field.name}
              required={field.required}
              checked={!!fieldValue}
              onChange={(e) => handleDynamicFieldChange(field.name, e.target.checked, 'Checkbox')}
              className="mr-2"
            />
            {field.placeholder || field.label || 'Check this box'}
          </label>
        );
      
      case 'File':
        return (
          <input
            type="file"
            id={fieldId}
            name={field.name}
            required={field.required}
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleDynamicFileChange(field.name, e.target.files)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
      
      default:
        return null;
    }
  };

  const handleSendOTP = async () => {
    const result = await sendOTP(formData.personalInfo.email, formData.personalInfo.phone, 'application');
    if (result.success) {
      setOtpSent(true);
      toast.success('OTP sent successfully!');
    }
  };

  const handleVerifyOTP = async () => {
    const result = await verifyOTP(formData.personalInfo.email, formData.personalInfo.phone, otp, 'application');
    if (result.success) {
      setOtpVerified(true);
      toast.success('OTP verified successfully!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!otpVerified) {
      toast.error('Please verify OTP first');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('loanId', formData.loanId);
      formDataToSend.append('personalInfo', JSON.stringify(formData.personalInfo));
      formDataToSend.append('address', JSON.stringify(formData.address));
      formDataToSend.append('employmentInfo', JSON.stringify(formData.employmentInfo));
      formDataToSend.append('loanDetails', JSON.stringify(formData.loanDetails));

      // Append static document files
      Object.keys(formData.documents).forEach(docType => {
        formData.documents[docType].forEach((file, index) => {
          formDataToSend.append(docType, file);
        });
      });

      // Prepare dynamic fields data (excluding files)
      const dynamicFieldsData = {};
      const dynamicFileFields = {};

      dynamicFields.forEach(field => {
        const value = formData.dynamicFields[field.name];
        if (field.type === 'File' && value && Array.isArray(value) && value.length > 0) {
          // Store file field name for later appending
          dynamicFileFields[field.name] = value;
        } else if (value !== undefined && value !== null && value !== '') {
          // Store non-file field values
          dynamicFieldsData[field.name] = value;
        }
      });

      // Append dynamic fields data
      formDataToSend.append('dynamicFields', JSON.stringify(dynamicFieldsData));

      // Append dynamic file fields
      Object.keys(dynamicFileFields).forEach(fieldName => {
        dynamicFileFields[fieldName].forEach((file) => {
          formDataToSend.append(`dynamicFiles_${fieldName}`, file);
        });
      });

      const response = await api.post('/applications', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Application submitted successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 5) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Filter loans by selectedCategory
  const filteredLoans = selectedCategory
    ? loans.filter(l => l.category && (l.category._id === selectedCategory || l.category === selectedCategory))
    : loans;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Apply for Loan</h1>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step > s ? <CheckCircleIcon className="h-6 w-6" /> : s}
                  </div>
                  {s < 5 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      step > s ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Personal Info</span>
              <span>Address</span>
              <span>Employment</span>
              <span>Loan Details</span>
              <span>Documents</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <UserIcon className="h-6 w-6 mr-2" />
                  Personal Information
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.personalInfo.fullName}
                      onChange={(e) => handleChange(e, 'personalInfo', 'fullName')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.personalInfo.email}
                      onChange={(e) => handleChange(e, 'personalInfo', 'email')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.personalInfo.phone}
                      onChange={(e) => handleChange(e, 'personalInfo', 'phone')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.personalInfo.dateOfBirth}
                      onChange={(e) => handleChange(e, 'personalInfo', 'dateOfBirth')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PAN *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.personalInfo.pan}
                      onChange={(e) => handleChange(e, 'personalInfo', 'pan')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                      maxLength="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aadhar *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.personalInfo.aadhar}
                      onChange={(e) => handleChange(e, 'personalInfo', 'aadhar')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      maxLength="12"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Address */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <HomeIcon className="h-6 w-6 mr-2" />
                  Address Information
                </h2>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Current Address</h3>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.address.current.street}
                        onChange={(e) => handleNestedChange(e, 'address', 'current', 'street')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.address.current.city}
                        onChange={(e) => handleNestedChange(e, 'address', 'current', 'city')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.address.current.state}
                        onChange={(e) => handleNestedChange(e, 'address', 'current', 'state')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.address.current.pincode}
                        onChange={(e) => handleNestedChange(e, 'address', 'current', 'pincode')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        maxLength="6"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Permanent Address</h3>
                  <label className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            address: {
                              ...formData.address,
                              permanent: { ...formData.address.current }
                            }
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">Same as current address</span>
                  </label>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.address.permanent.street}
                        onChange={(e) => handleNestedChange(e, 'address', 'permanent', 'street')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.address.permanent.city}
                        onChange={(e) => handleNestedChange(e, 'address', 'permanent', 'city')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.address.permanent.state}
                        onChange={(e) => handleNestedChange(e, 'address', 'permanent', 'state')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.address.permanent.pincode}
                        onChange={(e) => handleNestedChange(e, 'address', 'permanent', 'pincode')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        maxLength="6"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Employment */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <BriefcaseIcon className="h-6 w-6 mr-2" />
                  Employment / Source of Income
                </h2>
                
                {loadingFields ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading form fields...</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {dynamicFields
                      .filter(f => f.section === 'employment')
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((field) => (
                        <div key={field._id} className={field.width === 'half' ? 'md:col-span-1' : 'md:col-span-2'}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {field.label || field.name}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          {field.placeholder && (
                            <p className="text-xs text-gray-500 mb-2">{field.placeholder}</p>
                          )}
                          {renderDynamicField(field)}
                        </div>
                      ))}
                    {dynamicFields.filter(f => f.section === 'employment').length === 0 && (
                      <div className="md:col-span-2 text-center py-8 text-gray-500">
                        <p>No employment fields configured for this loan category.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Loan Details */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Loan Details</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Loan Type *
                  </label>
                  <select
                    required
                    value={formData.loanId}
                    onChange={(e) => {
                      setFormData({ ...formData, loanId: e.target.value });
                      const loan = filteredLoans.find(l => l._id === e.target.value);
                      setSelectedLoan(loan || null);
                      // Fetch dynamic fields when loan is selected
                      if (loan?.category?._id || loan?.category) {
                        fetchDynamicFields(loan.category._id || loan.category);
                      } else {
                        setDynamicFields([]);
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Loan Type</option>
                    {filteredLoans.map((loan) => (
                      <option key={loan._id} value={loan._id}>
                        {loan.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      // Clear selected loan when category changes
                      setFormData(f => ({ ...f, loanId: '' }));
                      setSelectedLoan(null);
                      setDynamicFields([]);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name} ({c.loanCount || 0})</option>
                    ))}
                  </select>
                  {categoryError && <p className="text-xs text-red-600 mt-2">{categoryError}</p>}
                </div>

                {selectedLoan && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Category:</strong> {selectedLoan.category?.name || 'Uncategorized'}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Interest Rate:</strong> {selectedLoan.interestRate?.min}% - {selectedLoan.interestRate?.max}%
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Loan Amount Range:</strong> ₹{selectedLoan.minLoanAmount?.toLocaleString()} - ₹{selectedLoan.maxLoanAmount?.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Tenure:</strong> {selectedLoan.minTenure} - {selectedLoan.maxTenure} months
                    </p>
                  </div>
                )}

                {loadingFields ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading form fields...</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {dynamicFields
                      .filter(f => f.section === 'loanDetails')
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((field) => (
                        <div key={field._id} className={field.width === 'half' ? 'md:col-span-1' : 'md:col-span-2'}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {field.label || field.name}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          {field.placeholder && (
                            <p className="text-xs text-gray-500 mb-2">{field.placeholder}</p>
                          )}
                          {renderDynamicField(field)}
                        </div>
                      ))}
                    {dynamicFields.filter(f => f.section === 'loanDetails').length === 0 && (
                      <div className="md:col-span-2 text-center py-8 text-gray-500">
                        <p>No loan details fields configured for this loan category.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Documents & OTP Verification */}
            {step === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <DocumentIcon className="h-6 w-6 mr-2" />
                  Documents & Verify
                </h2>

                {loadingFields ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading form fields...</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {dynamicFields
                      .filter(f => f.section === 'documents')
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((field) => (
                        <div key={field._id} className={field.width === 'half' ? 'md:col-span-1' : 'md:col-span-2'}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {field.label || field.name}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          {field.placeholder && (
                            <p className="text-xs text-gray-500 mb-2">{field.placeholder}</p>
                          )}
                          {renderDynamicField(field)}
                        </div>
                      ))}
                    {dynamicFields.filter(f => f.section === 'documents').length === 0 && (
                      <div className="md:col-span-2 text-center py-8 text-gray-500">
                        <p>No document fields configured for this loan category.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* OTP Verification */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">OTP Verification</h3>
                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Send OTP
                    </button>
                  ) : !otpVerified ? (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        OTP sent to {formData.personalInfo.email} and {formData.personalInfo.phone}
                      </p>
                      <div className="flex gap-4">
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Enter OTP"
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          maxLength="6"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOTP}
                          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                        >
                          Verify OTP
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center text-green-600">
                      <CheckCircleIcon className="h-6 w-6 mr-2" />
                      <span>OTP Verified Successfully</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 1}
                className="flex items-center px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Previous
              </button>
              {step < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Next
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !otpVerified}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplyLoan;

