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
    }
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
      if (loan) setSelectedLoan(loan);
    } catch (error) {
      console.error('Error fetching loan:', error);
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

      // Append files
      Object.keys(formData.documents).forEach(docType => {
        formData.documents[docType].forEach((file, index) => {
          formDataToSend.append(docType, file);
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
                  Employment Information
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employment Type *
                    </label>
                    <select
                      required
                      value={formData.employmentInfo.employmentType}
                      onChange={(e) => handleChange(e, 'employmentInfo', 'employmentType')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select</option>
                      <option value="Salaried">Salaried</option>
                      <option value="Self-Employed">Self-Employed</option>
                      <option value="Business">Business</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Income *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.employmentInfo.monthlyIncome}
                      onChange={(e) => handleChange(e, 'employmentInfo', 'monthlyIncome')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {formData.employmentInfo.employmentType === 'Salaried' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.employmentInfo.companyName}
                          onChange={(e) => handleChange(e, 'employmentInfo', 'companyName')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Designation *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.employmentInfo.designation}
                          onChange={(e) => handleChange(e, 'employmentInfo', 'designation')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Work Experience (Years) *
                        </label>
                        <input
                          type="number"
                          required
                          value={formData.employmentInfo.workExperience}
                          onChange={(e) => handleChange(e, 'employmentInfo', 'workExperience')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </>
                  )}
                  {(formData.employmentInfo.employmentType === 'Self-Employed' || formData.employmentInfo.employmentType === 'Business') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Type *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.employmentInfo.businessType}
                          onChange={(e) => handleChange(e, 'employmentInfo', 'businessType')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Age (Years) *
                        </label>
                        <input
                          type="number"
                          required
                          value={formData.employmentInfo.businessAge}
                          onChange={(e) => handleChange(e, 'employmentInfo', 'businessAge')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </>
                  )}
                </div>
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
                      const loan = loans.find(l => l._id === e.target.value);
                      if (loan) setSelectedLoan(loan);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Loan Type</option>
                    {loans.map((loan) => (
                      <option key={loan._id} value={loan._id}>
                        {loan.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedLoan && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
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

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loan Amount * (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.loanDetails.loanAmount}
                      onChange={(e) => handleChange(e, 'loanDetails', 'loanAmount')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min={selectedLoan?.minLoanAmount || 0}
                      max={selectedLoan?.maxLoanAmount || 10000000}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loan Tenure (Months) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.loanDetails.loanTenure}
                      onChange={(e) => handleChange(e, 'loanDetails', 'loanTenure')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min={selectedLoan?.minTenure || 1}
                      max={selectedLoan?.maxTenure || 360}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loan Purpose *
                    </label>
                    <textarea
                      required
                      value={formData.loanDetails.purpose}
                      onChange={(e) => handleChange(e, 'loanDetails', 'purpose')}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe the purpose of your loan"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Documents & OTP Verification */}
            {step === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <DocumentIcon className="h-6 w-6 mr-2" />
                  Upload Documents & Verify
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Proof (Aadhar, PAN, etc.) *
                    </label>
                    <input
                      type="file"
                      multiple
                      required
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'idProof')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Proof *
                    </label>
                    <input
                      type="file"
                      multiple
                      required
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'addressProof')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Income Proof *
                    </label>
                    <input
                      type="file"
                      multiple
                      required
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'incomeProof')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Statement *
                    </label>
                    <input
                      type="file"
                      multiple
                      required
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'bankStatement')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Other Documents (Optional)
                    </label>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'otherDocuments')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

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

