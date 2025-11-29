import { useState, useEffect, useRef } from 'react';
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
  ArrowLeftIcon,
  CameraIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const ApplyLoan = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loanId = searchParams.get('loanId');

  const [step, setStep] = useState(1);
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryError, setCategoryError] = useState(null);
  const [dynamicFields, setDynamicFields] = useState([]);
  const [loadingFields, setLoadingFields] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [validatedFields, setValidatedFields] = useState({});

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
      otherDocuments: [],
      selfie: null
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

  // Refetch dynamic fields when selectedLoan or categories change
  useEffect(() => {
    if (!selectedLoan) return;

    // Preferred: use explicit category relation on loan
    let categoryId = selectedLoan.category?._id || selectedLoan.category || null;

    // Fallback: try to match loan type/name to a category by name
    if (!categoryId && categories.length > 0) {
      const loanType = (selectedLoan.type || '').toLowerCase();
      const loanName = (selectedLoan.name || '').toLowerCase();
      const matchedCategory = categories.find(
        (c) =>
          (c.name || '').toLowerCase() === loanType ||
          (c.name || '').toLowerCase() === loanName
      );
      if (matchedCategory) {
        categoryId = matchedCategory._id;
        console.log('Matched loan to category by name/type:', matchedCategory.name, matchedCategory._id);
      }
    }

    console.log('Resolved categoryId for selectedLoan:', categoryId || 'NONE', 'loanId:', selectedLoan._id);
    fetchDynamicFields(categoryId, selectedLoan._id);
  }, [selectedLoan?._id, selectedLoan?.category, selectedLoan?.type, selectedLoan?.name, categories.length]);

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
        // Ensure formData has the current loanId
        setFormData(prev => ({ ...prev, loanId: loan._id }));
        // Dynamic fields will be fetched by the selectedLoan effect
      }
    } catch (error) {
      console.error('Error fetching loan:', error);
    }
  };

  const fetchDynamicFields = async (categoryId, loanId) => {
    try {
      setLoadingFields(true);
      let fields = [];

      // Try by category first (new configuration)
      if (categoryId) {
        console.log('Fetching form fields for categoryId:', categoryId);
        const response = await api.get(`/form-fields/category/${categoryId}`);
        fields = response.data.data || [];
      }

      // Fallback: if no fields by category, try loan-specific fields (backward compatibility)
      if ((!fields || fields.length === 0) && loanId) {
        console.log('No category fields found, fetching form fields for loanId:', loanId);
        const loanResponse = await api.get(`/form-fields/loan/${loanId}`);
        fields = loanResponse.data.data || [];
      }

      console.log('Fetched dynamic fields total:', fields.length);
      console.log('Fields by section:', {
        employment: fields.filter(f => f.section === 'employment').length,
        loanDetails: fields.filter(f => f.section === 'loanDetails').length,
        documents: fields.filter(f => f.section === 'documents').length
      });

      setDynamicFields(fields);
    } catch (error) {
      console.error('Error fetching dynamic fields:', error);
      console.error('Error details:', error.response?.data);
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
      // Validate field in real-time
      validateField(section, field, e.target.value);
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

  const validateField = (section, field, value) => {
    if (step === 1 && section === 'personalInfo') {
      const errors = { ...fieldErrors.step1 };
      const validated = { ...validatedFields.step1 };
      
      if (field === 'fullName') {
        if (!value?.trim()) {
          errors.fullName = 'Full Name is required';
          delete validated.fullName;
        } else {
          validated.fullName = true;
          delete errors.fullName;
        }
      } else if (field === 'email') {
        if (!value?.trim()) {
          errors.email = 'Email is required';
          delete validated.email;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Invalid email format';
          delete validated.email;
        } else {
          validated.email = true;
          delete errors.email;
        }
      } else if (field === 'phone') {
        const phoneDigits = value?.replace(/\D/g, '') || '';
        if (!phoneDigits) {
          errors.phone = 'Phone is required';
          delete validated.phone;
        } else if (phoneDigits.length !== 10) {
          errors.phone = 'Phone must be 10 digits';
          delete validated.phone;
        } else {
          validated.phone = true;
          delete errors.phone;
        }
      } else if (field === 'dateOfBirth') {
        if (!value) {
          errors.dateOfBirth = 'Date of Birth is required';
          delete validated.dateOfBirth;
        } else {
          validated.dateOfBirth = true;
          delete errors.dateOfBirth;
        }
      } else if (field === 'pan') {
        if (!value?.trim()) {
          errors.pan = 'PAN is required';
          delete validated.pan;
        } else if (value.length !== 10) {
          errors.pan = 'PAN must be 10 characters';
          delete validated.pan;
        } else {
          validated.pan = true;
          delete errors.pan;
        }
      } else if (field === 'aadhar') {
        if (!value?.trim()) {
          errors.aadhar = 'Aadhar is required';
          delete validated.aadhar;
        } else if (value.length !== 12) {
          errors.aadhar = 'Aadhar must be 12 digits';
          delete validated.aadhar;
        } else {
          validated.aadhar = true;
          delete errors.aadhar;
        }
      }
      
      setFieldErrors(prev => ({ ...prev, step1: errors }));
      setValidatedFields(prev => ({ ...prev, step1: validated }));
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
    // Validate field in real-time
    if (step === 2 && section === 'address') {
      const errors = { ...fieldErrors.step2 };
      const validated = { ...validatedFields.step2 };
      const fieldKey = `${subsection}${field.charAt(0).toUpperCase() + field.slice(1)}`;
      
      if (field === 'pincode') {
        if (!e.target.value?.trim()) {
          errors[fieldKey] = 'Pincode is required';
          delete validated[fieldKey];
        } else if (!/^[0-9]{6}$/.test(e.target.value)) {
          errors[fieldKey] = 'Pincode must be 6 digits';
          delete validated[fieldKey];
        } else {
          validated[fieldKey] = true;
          delete errors[fieldKey];
        }
      } else {
        if (!e.target.value?.trim()) {
          errors[fieldKey] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
          delete validated[fieldKey];
        } else {
          validated[fieldKey] = true;
          delete errors[fieldKey];
        }
      }
      
      setFieldErrors(prev => ({ ...prev, step2: errors }));
      setValidatedFields(prev => ({ ...prev, step2: validated }));
    }
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
    
    // Validate dynamic field if required
    const field = dynamicFields.find(f => f.name === fieldName);
    if (field && field.required) {
      const stepKey = `step${step}`;
      const errors = { ...fieldErrors[stepKey] };
      const validated = { ...validatedFields[stepKey] };
      const dynamicKey = `dynamic_${fieldName}`;
      
      if (!value || (typeof value === 'string' && !value.trim()) || (Array.isArray(value) && value.length === 0)) {
        errors[dynamicKey] = `${field.label || fieldName} is required`;
        delete validated[dynamicKey];
      } else {
        validated[dynamicKey] = true;
        delete errors[dynamicKey];
      }
      
      setFieldErrors(prev => ({ ...prev, [stepKey]: errors }));
      setValidatedFields(prev => ({ ...prev, [stepKey]: validated }));
    }
  };

  const handleDynamicFileChange = (fieldName, files) => {
    setFormData({
      ...formData,
      dynamicFields: {
        ...formData.dynamicFields,
        [fieldName]: Array.from(files)
      }
    });
    
    // Validate dynamic file field if required
    const field = dynamicFields.find(f => f.name === fieldName);
    if (field && field.required) {
      const stepKey = `step${step}`;
      const errors = { ...fieldErrors[stepKey] };
      const validated = { ...validatedFields[stepKey] };
      const dynamicKey = `dynamic_${fieldName}`;
      
      if (!files || files.length === 0) {
        errors[dynamicKey] = `${field.label || fieldName} is required`;
        delete validated[dynamicKey];
      } else {
        validated[dynamicKey] = true;
        delete errors[dynamicKey];
      }
      
      setFieldErrors(prev => ({ ...prev, [stepKey]: errors }));
      setValidatedFields(prev => ({ ...prev, [stepKey]: validated }));
    }
  };

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user', // Front camera for selfie
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false 
      });
      setCameraStream(stream);
      setShowCamera(true);
      // Use setTimeout to ensure the video element is rendered before setting stream
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Explicitly play the video
          videoRef.current.play().catch(err => {
            console.error('Error playing video:', err);
          });
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const captureSelfie = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob, then to File
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `selfie-${Date.now()}.jpg`, { 
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        
        setFormData({
          ...formData,
          documents: {
            ...formData.documents,
            selfie: file
          }
        });
        
        // Mark selfie as validated
        setValidatedFields(prev => ({
          ...prev,
          step5: {
            ...prev.step5,
            selfie: true
          }
        }));
        setFieldErrors(prev => ({
          ...prev,
          step5: {
            ...prev.step5,
            selfie: undefined
          }
        }));
        
        toast.success('Selfie captured successfully!');
        stopCamera();
      }
    }, 'image/jpeg', 0.9);
  };

  const removeSelfie = () => {
    setFormData({
      ...formData,
      documents: {
        ...formData.documents,
        selfie: null
      }
    });
    // Remove selfie validation
    setValidatedFields(prev => ({
      ...prev,
      step5: {
        ...prev.step5,
        selfie: false
      }
    }));
  };

  // Ensure video plays when stream is set
  useEffect(() => {
    if (showCamera && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
      });
    }
  }, [showCamera, cameraStream]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      // Extract loanAmount and loanTenure from dynamicFields
      // Look for common field names that might represent loan amount and tenure
      const loanDetailsToSend = { ...formData.loanDetails };
      
      // Get all dynamic fields in the loanDetails section
      const loanDetailsFields = dynamicFields.filter(f => f.section === 'loanDetails');
      
      loanDetailsFields.forEach(field => {
        const fieldValue = formData.dynamicFields[field.name];
        const fieldNameLower = (field.name || '').toLowerCase();
        const fieldLabelLower = (field.label || '').toLowerCase();
        
        // Try to match loan amount fields
        if (!loanDetailsToSend.loanAmount || loanDetailsToSend.loanAmount === '') {
          if (
            fieldNameLower.includes('loanamount') || 
            fieldNameLower.includes('loan amount') ||
            fieldNameLower.includes('amount') ||
            fieldLabelLower.includes('loan amount') ||
            fieldLabelLower.includes('amount')
          ) {
            if (fieldValue && fieldValue !== '') {
              loanDetailsToSend.loanAmount = fieldValue;
            }
          }
        }
        
        // Try to match loan tenure fields
        if (!loanDetailsToSend.loanTenure || loanDetailsToSend.loanTenure === '') {
          if (
            fieldNameLower.includes('loantenure') || 
            fieldNameLower.includes('loan tenure') ||
            fieldNameLower.includes('tenure') ||
            fieldLabelLower.includes('loan tenure') ||
            fieldLabelLower.includes('tenure')
          ) {
            if (fieldValue && fieldValue !== '') {
              loanDetailsToSend.loanTenure = fieldValue;
            }
          }
        }
      });
      
      // Validate that we have loanAmount and loanTenure
      if (!loanDetailsToSend.loanAmount || loanDetailsToSend.loanAmount === '') {
        toast.error('Please enter a valid loan amount');
        setLoading(false);
        return;
      }
      
      if (!loanDetailsToSend.loanTenure || loanDetailsToSend.loanTenure === '') {
        toast.error('Please enter a valid loan tenure');
        setLoading(false);
        return;
      }
      
      // Ensure loanAmount and loanTenure are numbers
      loanDetailsToSend.loanAmount = Number(loanDetailsToSend.loanAmount);
      loanDetailsToSend.loanTenure = Number(loanDetailsToSend.loanTenure);
      
      if (isNaN(loanDetailsToSend.loanAmount) || loanDetailsToSend.loanAmount <= 0) {
        toast.error('Loan amount must be a valid positive number');
        setLoading(false);
        return;
      }
      
      if (isNaN(loanDetailsToSend.loanTenure) || loanDetailsToSend.loanTenure <= 0) {
        toast.error('Loan tenure must be a valid positive number');
        setLoading(false);
        return;
      }
      
      // Extract and validate employmentInfo
      const employmentInfoToSend = { ...formData.employmentInfo };
      
      // Get all dynamic fields in the employment section
      const employmentFields = dynamicFields.filter(f => f.section === 'employment');
      
      employmentFields.forEach(field => {
        const fieldValue = formData.dynamicFields[field.name];
        const fieldNameLower = (field.name || '').toLowerCase();
        const fieldLabelLower = (field.label || '').toLowerCase();
        
        // Try to match employment type fields
        if (!employmentInfoToSend.employmentType || employmentInfoToSend.employmentType === '') {
          if (
            fieldNameLower.includes('employmenttype') || 
            fieldNameLower.includes('employment type') ||
            fieldNameLower.includes('employment') ||
            fieldLabelLower.includes('employment type') ||
            fieldLabelLower.includes('employment')
          ) {
            if (fieldValue && fieldValue !== '') {
              employmentInfoToSend.employmentType = fieldValue;
            }
          }
        }
        
        // Try to match monthly income fields
        if (!employmentInfoToSend.monthlyIncome || employmentInfoToSend.monthlyIncome === '') {
          if (
            fieldNameLower.includes('monthlyincome') || 
            fieldNameLower.includes('monthly income') ||
            fieldNameLower.includes('income') ||
            fieldLabelLower.includes('monthly income') ||
            fieldLabelLower.includes('income')
          ) {
            if (fieldValue && fieldValue !== '') {
              employmentInfoToSend.monthlyIncome = fieldValue;
            }
          }
        }
      });
      
      // Validate employmentType
      if (!employmentInfoToSend.employmentType || employmentInfoToSend.employmentType === '') {
        toast.error('Please select an employment type');
        setLoading(false);
        return;
      }
      
      // Validate and convert monthlyIncome to Number
      if (!employmentInfoToSend.monthlyIncome || employmentInfoToSend.monthlyIncome === '') {
        toast.error('Please enter your monthly income');
        setLoading(false);
        return;
      }
      
      employmentInfoToSend.monthlyIncome = Number(employmentInfoToSend.monthlyIncome);
      
      if (isNaN(employmentInfoToSend.monthlyIncome) || employmentInfoToSend.monthlyIncome <= 0) {
        toast.error('Monthly income must be a valid positive number');
        setLoading(false);
        return;
      }
      
      // Validate selfie is captured
      if (!formData.documents.selfie) {
        toast.error('Please capture a selfie before submitting');
        setLoading(false);
        return;
      }
      
      const formDataToSend = new FormData();
      
      formDataToSend.append('loanId', formData.loanId);
      formDataToSend.append('personalInfo', JSON.stringify(formData.personalInfo));
      formDataToSend.append('address', JSON.stringify(formData.address));
      formDataToSend.append('employmentInfo', JSON.stringify(employmentInfoToSend));
      formDataToSend.append('loanDetails', JSON.stringify(loanDetailsToSend));

      // Append static document files
      Object.keys(formData.documents).forEach(docType => {
        const docValue = formData.documents[docType];
        if (docType === 'selfie' && docValue) {
          // Selfie is a single file, not an array
          formDataToSend.append(docType, docValue);
        } else if (Array.isArray(docValue)) {
          docValue.forEach((file, index) => {
            formDataToSend.append(docType, file);
          });
        }
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

  // Validation functions for each step
  const validateStep1 = () => {
    const errors = {};
    const validated = {};
    
    if (!formData.personalInfo.fullName?.trim()) {
      errors.fullName = 'Full Name is required';
    } else {
      validated.fullName = true;
    }
    
    if (!formData.personalInfo.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalInfo.email)) {
      errors.email = 'Invalid email format';
    } else {
      validated.email = true;
    }
    
    if (!formData.personalInfo.phone?.trim()) {
      errors.phone = 'Phone is required';
    } else if (!/^[0-9]{10}$/.test(formData.personalInfo.phone.replace(/\D/g, ''))) {
      errors.phone = 'Phone must be 10 digits';
    } else {
      validated.phone = true;
    }
    
    if (!formData.personalInfo.dateOfBirth) {
      errors.dateOfBirth = 'Date of Birth is required';
    } else {
      validated.dateOfBirth = true;
    }
    
    if (!formData.personalInfo.pan?.trim()) {
      errors.pan = 'PAN is required';
    } else if (formData.personalInfo.pan.length !== 10) {
      errors.pan = 'PAN must be 10 characters';
    } else {
      validated.pan = true;
    }
    
    if (!formData.personalInfo.aadhar?.trim()) {
      errors.aadhar = 'Aadhar is required';
    } else if (formData.personalInfo.aadhar.length !== 12) {
      errors.aadhar = 'Aadhar must be 12 digits';
    } else {
      validated.aadhar = true;
    }
    
    setFieldErrors(prev => ({ ...prev, step1: errors }));
    setValidatedFields(prev => ({ ...prev, step1: validated }));
    
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};
    const validated = {};
    
    // Current address validation
    if (!formData.address.current.street?.trim()) {
      errors.currentStreet = 'Street Address is required';
    } else {
      validated.currentStreet = true;
    }
    
    if (!formData.address.current.city?.trim()) {
      errors.currentCity = 'City is required';
    } else {
      validated.currentCity = true;
    }
    
    if (!formData.address.current.state?.trim()) {
      errors.currentState = 'State is required';
    } else {
      validated.currentState = true;
    }
    
    if (!formData.address.current.pincode?.trim()) {
      errors.currentPincode = 'Pincode is required';
    } else if (!/^[0-9]{6}$/.test(formData.address.current.pincode)) {
      errors.currentPincode = 'Pincode must be 6 digits';
    } else {
      validated.currentPincode = true;
    }
    
    // Permanent address validation
    if (!formData.address.permanent.street?.trim()) {
      errors.permanentStreet = 'Street Address is required';
    } else {
      validated.permanentStreet = true;
    }
    
    if (!formData.address.permanent.city?.trim()) {
      errors.permanentCity = 'City is required';
    } else {
      validated.permanentCity = true;
    }
    
    if (!formData.address.permanent.state?.trim()) {
      errors.permanentState = 'State is required';
    } else {
      validated.permanentState = true;
    }
    
    if (!formData.address.permanent.pincode?.trim()) {
      errors.permanentPincode = 'Pincode is required';
    } else if (!/^[0-9]{6}$/.test(formData.address.permanent.pincode)) {
      errors.permanentPincode = 'Pincode must be 6 digits';
    } else {
      validated.permanentPincode = true;
    }
    
    setFieldErrors(prev => ({ ...prev, step2: errors }));
    setValidatedFields(prev => ({ ...prev, step2: validated }));
    
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors = {};
    const validated = {};
    
    if (!formData.employmentInfo.employmentType?.trim()) {
      errors.employmentType = 'Employment Type is required';
    } else {
      validated.employmentType = true;
    }
    
    if (!formData.employmentInfo.monthlyIncome?.toString().trim()) {
      errors.monthlyIncome = 'Monthly Income is required';
    } else if (isNaN(Number(formData.employmentInfo.monthlyIncome)) || Number(formData.employmentInfo.monthlyIncome) <= 0) {
      errors.monthlyIncome = 'Monthly Income must be a valid positive number';
    } else {
      validated.monthlyIncome = true;
    }
    
    // Validate required dynamic fields
    const employmentFields = dynamicFields.filter(f => f.section === 'employment' && f.required);
    employmentFields.forEach(field => {
      const value = formData.dynamicFields[field.name];
      if (!value || (typeof value === 'string' && !value.trim()) || (Array.isArray(value) && value.length === 0)) {
        errors[`dynamic_${field.name}`] = `${field.label || field.name} is required`;
      } else {
        validated[`dynamic_${field.name}`] = true;
      }
    });
    
    setFieldErrors(prev => ({ ...prev, step3: errors }));
    setValidatedFields(prev => ({ ...prev, step3: validated }));
    
    return Object.keys(errors).length === 0;
  };

  const validateStep4 = () => {
    const errors = {};
    const validated = {};
    
    if (!formData.loanDetails.loanAmount?.toString().trim()) {
      errors.loanAmount = 'Loan Amount is required';
    } else if (isNaN(Number(formData.loanDetails.loanAmount)) || Number(formData.loanDetails.loanAmount) <= 0) {
      errors.loanAmount = 'Loan Amount must be a valid positive number';
    } else if (selectedLoan && selectedLoan.minLoanAmount && Number(formData.loanDetails.loanAmount) < selectedLoan.minLoanAmount) {
      errors.loanAmount = `Loan Amount must be at least ₹${selectedLoan.minLoanAmount.toLocaleString()}`;
    } else if (selectedLoan && selectedLoan.maxLoanAmount && Number(formData.loanDetails.loanAmount) > selectedLoan.maxLoanAmount) {
      errors.loanAmount = `Loan Amount must not exceed ₹${selectedLoan.maxLoanAmount.toLocaleString()}`;
    } else {
      validated.loanAmount = true;
    }
    
    if (!formData.loanDetails.loanTenure?.toString().trim()) {
      errors.loanTenure = 'Loan Tenure is required';
    } else if (isNaN(Number(formData.loanDetails.loanTenure)) || Number(formData.loanDetails.loanTenure) <= 0) {
      errors.loanTenure = 'Loan Tenure must be a valid positive number';
    } else if (selectedLoan && selectedLoan.minTenure && Number(formData.loanDetails.loanTenure) < selectedLoan.minTenure) {
      errors.loanTenure = `Loan Tenure must be at least ${selectedLoan.minTenure} months`;
    } else if (selectedLoan && selectedLoan.maxTenure && Number(formData.loanDetails.loanTenure) > selectedLoan.maxTenure) {
      errors.loanTenure = `Loan Tenure must not exceed ${selectedLoan.maxTenure} months`;
    } else {
      validated.loanTenure = true;
    }
    
    // Validate required dynamic fields
    const loanDetailsFields = dynamicFields.filter(f => f.section === 'loanDetails' && f.required);
    loanDetailsFields.forEach(field => {
      const value = formData.dynamicFields[field.name];
      if (!value || (typeof value === 'string' && !value.trim()) || (Array.isArray(value) && value.length === 0)) {
        errors[`dynamic_${field.name}`] = `${field.label || field.name} is required`;
      } else {
        validated[`dynamic_${field.name}`] = true;
      }
    });
    
    setFieldErrors(prev => ({ ...prev, step4: errors }));
    setValidatedFields(prev => ({ ...prev, step4: validated }));
    
    return Object.keys(errors).length === 0;
  };

  const validateStep5 = () => {
    const errors = {};
    const validated = {};
    
    if (!formData.documents.selfie) {
      errors.selfie = 'Selfie is required';
    } else {
      validated.selfie = true;
    }
    
    // Validate required dynamic document fields
    const documentFields = dynamicFields.filter(f => f.section === 'documents' && f.required);
    documentFields.forEach(field => {
      const value = formData.dynamicFields[field.name];
      if (!value || (Array.isArray(value) && value.length === 0)) {
        errors[`dynamic_${field.name}`] = `${field.label || field.name} is required`;
      } else {
        validated[`dynamic_${field.name}`] = true;
      }
    });
    
    setFieldErrors(prev => ({ ...prev, step5: errors }));
    setValidatedFields(prev => ({ ...prev, step5: validated }));
    
    return Object.keys(errors).length === 0;
  };

  const validateCurrentStep = () => {
    switch (step) {
      case 1:
        return validateStep1();
      case 2:
        return validateStep2();
      case 3:
        return validateStep3();
      case 4:
        return validateStep4();
      case 5:
        return validateStep5();
      default:
        return true;
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        const step1Fields = ['fullName', 'email', 'phone', 'dateOfBirth', 'pan', 'aadhar'];
        return step1Fields.every(field => validatedFields.step1?.[field]);
      case 2:
        const step2Fields = ['currentStreet', 'currentCity', 'currentState', 'currentPincode', 'permanentStreet', 'permanentCity', 'permanentState', 'permanentPincode'];
        return step2Fields.every(field => validatedFields.step2?.[field]);
      case 3:
        const step3Required = ['employmentType', 'monthlyIncome'];
        const step3Valid = step3Required.every(field => validatedFields.step3?.[field]);
        // Check dynamic required fields
        const employmentRequired = dynamicFields.filter(f => f.section === 'employment' && f.required);
        const dynamicValid = employmentRequired.every(field => validatedFields.step3?.[`dynamic_${field.name}`]);
        return step3Valid && dynamicValid;
      case 4:
        const step4Required = ['loanAmount', 'loanTenure'];
        const step4Valid = step4Required.every(field => validatedFields.step4?.[field]);
        // Check dynamic required fields
        const loanDetailsRequired = dynamicFields.filter(f => f.section === 'loanDetails' && f.required);
        const loanDynamicValid = loanDetailsRequired.every(field => validatedFields.step4?.[`dynamic_${field.name}`]);
        return step4Valid && loanDynamicValid;
      case 5:
        const step5Valid = validatedFields.step5?.selfie;
        // Check dynamic required fields
        const documentRequired = dynamicFields.filter(f => f.section === 'documents' && f.required);
        const docDynamicValid = documentRequired.every(field => validatedFields.step5?.[`dynamic_${field.name}`]);
        return step5Valid && docDynamicValid;
      default:
        return true;
    }
  };

  const nextStep = () => {
    // Stop camera if active when leaving step 5
    if (step === 5 && showCamera) {
      stopCamera();
    }
    
    // Validate current step before proceeding
    if (validateCurrentStep()) {
      if (step < 5) setStep(step + 1);
    } else {
      toast.error('Please fill all required fields before proceeding');
    }
  };

  const prevStep = () => {
    // Stop camera if active when leaving step 5
    if (step === 5 && showCamera) {
      stopCamera();
    }
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
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      Full Name *
                      {validatedFields.step1?.fullName && (
                        <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
                      )}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.personalInfo.fullName}
                      onChange={(e) => handleChange(e, 'personalInfo', 'fullName')}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        fieldErrors.step1?.fullName ? 'border-red-500' : validatedFields.step1?.fullName ? 'border-green-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.step1?.fullName && (
                      <p className="text-xs text-red-500 mt-1">{fieldErrors.step1.fullName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      Email *
                      {validatedFields.step1?.email && (
                        <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
                      )}
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.personalInfo.email}
                      onChange={(e) => handleChange(e, 'personalInfo', 'email')}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        fieldErrors.step1?.email ? 'border-red-500' : validatedFields.step1?.email ? 'border-green-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.step1?.email && (
                      <p className="text-xs text-red-500 mt-1">{fieldErrors.step1.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      Phone *
                      {validatedFields.step1?.phone && (
                        <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
                      )}
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.personalInfo.phone}
                      onChange={(e) => handleChange(e, 'personalInfo', 'phone')}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        fieldErrors.step1?.phone ? 'border-red-500' : validatedFields.step1?.phone ? 'border-green-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.step1?.phone && (
                      <p className="text-xs text-red-500 mt-1">{fieldErrors.step1.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      Date of Birth *
                      {validatedFields.step1?.dateOfBirth && (
                        <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
                      )}
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.personalInfo.dateOfBirth}
                      onChange={(e) => handleChange(e, 'personalInfo', 'dateOfBirth')}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        fieldErrors.step1?.dateOfBirth ? 'border-red-500' : validatedFields.step1?.dateOfBirth ? 'border-green-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.step1?.dateOfBirth && (
                      <p className="text-xs text-red-500 mt-1">{fieldErrors.step1.dateOfBirth}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      PAN *
                      {validatedFields.step1?.pan && (
                        <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
                      )}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.personalInfo.pan}
                      onChange={(e) => handleChange(e, 'personalInfo', 'pan')}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase ${
                        fieldErrors.step1?.pan ? 'border-red-500' : validatedFields.step1?.pan ? 'border-green-500' : 'border-gray-300'
                      }`}
                      maxLength="10"
                    />
                    {fieldErrors.step1?.pan && (
                      <p className="text-xs text-red-500 mt-1">{fieldErrors.step1.pan}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      Aadhar *
                      {validatedFields.step1?.aadhar && (
                        <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
                      )}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.personalInfo.aadhar}
                      onChange={(e) => handleChange(e, 'personalInfo', 'aadhar')}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        fieldErrors.step1?.aadhar ? 'border-red-500' : validatedFields.step1?.aadhar ? 'border-green-500' : 'border-gray-300'
                      }`}
                      maxLength="12"
                    />
                    {fieldErrors.step1?.aadhar && (
                      <p className="text-xs text-red-500 mt-1">{fieldErrors.step1.aadhar}</p>
                    )}
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
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        Street Address *
                        {validatedFields.step2?.currentStreet && (
                          <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
                        )}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.address.current.street}
                        onChange={(e) => handleNestedChange(e, 'address', 'current', 'street')}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          fieldErrors.step2?.currentStreet ? 'border-red-500' : validatedFields.step2?.currentStreet ? 'border-green-500' : 'border-gray-300'
                        }`}
                      />
                      {fieldErrors.step2?.currentStreet && (
                        <p className="text-xs text-red-500 mt-1">{fieldErrors.step2.currentStreet}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        City *
                        {validatedFields.step2?.currentCity && (
                          <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
                        )}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.address.current.city}
                        onChange={(e) => handleNestedChange(e, 'address', 'current', 'city')}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          fieldErrors.step2?.currentCity ? 'border-red-500' : validatedFields.step2?.currentCity ? 'border-green-500' : 'border-gray-300'
                        }`}
                      />
                      {fieldErrors.step2?.currentCity && (
                        <p className="text-xs text-red-500 mt-1">{fieldErrors.step2.currentCity}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        State *
                        {validatedFields.step2?.currentState && (
                          <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
                        )}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.address.current.state}
                        onChange={(e) => handleNestedChange(e, 'address', 'current', 'state')}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          fieldErrors.step2?.currentState ? 'border-red-500' : validatedFields.step2?.currentState ? 'border-green-500' : 'border-gray-300'
                        }`}
                      />
                      {fieldErrors.step2?.currentState && (
                        <p className="text-xs text-red-500 mt-1">{fieldErrors.step2.currentState}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        Pincode *
                        {validatedFields.step2?.currentPincode && (
                          <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
                        )}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.address.current.pincode}
                        onChange={(e) => handleNestedChange(e, 'address', 'current', 'pincode')}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          fieldErrors.step2?.currentPincode ? 'border-red-500' : validatedFields.step2?.currentPincode ? 'border-green-500' : 'border-gray-300'
                        }`}
                        maxLength="6"
                      />
                      {fieldErrors.step2?.currentPincode && (
                        <p className="text-xs text-red-500 mt-1">{fieldErrors.step2.currentPincode}</p>
                      )}
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
                    {/* Static Employment Type Field */}
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        Employment Type <span className="text-red-500">*</span>
                        {validatedFields.step3?.employmentType && (
                          <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
                        )}
                      </label>
                      <select
                        required
                        value={formData.employmentInfo.employmentType}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            employmentInfo: {
                              ...formData.employmentInfo,
                              employmentType: e.target.value
                            }
                          });
                          // Validate in real-time
                          const errors = { ...fieldErrors.step3 };
                          const validated = { ...validatedFields.step3 };
                          if (e.target.value) {
                            validated.employmentType = true;
                            delete errors.employmentType;
                          } else {
                            errors.employmentType = 'Employment Type is required';
                            delete validated.employmentType;
                          }
                          setFieldErrors(prev => ({ ...prev, step3: errors }));
                          setValidatedFields(prev => ({ ...prev, step3: validated }));
                        }}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          fieldErrors.step3?.employmentType ? 'border-red-500' : validatedFields.step3?.employmentType ? 'border-green-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Employment Type</option>
                        <option value="Salaried">Salaried</option>
                        <option value="Self-Employed">Self-Employed</option>
                        <option value="Business">Business</option>
                      </select>
                      {fieldErrors.step3?.employmentType && (
                        <p className="text-xs text-red-500 mt-1">{fieldErrors.step3.employmentType}</p>
                      )}
                    </div>
                    
                    {/* Static Monthly Income Field */}
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        Monthly Income (₹) <span className="text-red-500">*</span>
                        {validatedFields.step3?.monthlyIncome && (
                          <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
                        )}
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.employmentInfo.monthlyIncome}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            employmentInfo: {
                              ...formData.employmentInfo,
                              monthlyIncome: e.target.value
                            }
                          });
                          // Validate in real-time
                          const errors = { ...fieldErrors.step3 };
                          const validated = { ...validatedFields.step3 };
                          const income = Number(e.target.value);
                          if (!e.target.value?.toString().trim()) {
                            errors.monthlyIncome = 'Monthly Income is required';
                            delete validated.monthlyIncome;
                          } else if (isNaN(income) || income <= 0) {
                            errors.monthlyIncome = 'Monthly Income must be a valid positive number';
                            delete validated.monthlyIncome;
                          } else {
                            validated.monthlyIncome = true;
                            delete errors.monthlyIncome;
                          }
                          setFieldErrors(prev => ({ ...prev, step3: errors }));
                          setValidatedFields(prev => ({ ...prev, step3: validated }));
                        }}
                        min="0"
                        placeholder="Enter your monthly income"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          fieldErrors.step3?.monthlyIncome ? 'border-red-500' : validatedFields.step3?.monthlyIncome ? 'border-green-500' : 'border-gray-300'
                        }`}
                      />
                      {fieldErrors.step3?.monthlyIncome && (
                        <p className="text-xs text-red-500 mt-1">{fieldErrors.step3.monthlyIncome}</p>
                      )}
                    </div>
                    
                    {/* Dynamic Employment Fields */}
                    {(() => {
                      const employmentFields = dynamicFields
                        .filter(f => f.section === 'employment')
                        .sort((a, b) => (a.order || 0) - (b.order || 0));
                      console.log('Employment fields:', employmentFields.length, employmentFields);
                      return employmentFields;
                    })()
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
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Loan Details */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Loan Details</h2>
                
                {selectedLoan && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Loan Type:</strong> {selectedLoan.name}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Category:</strong> {selectedLoan.category?.name || 'Uncategorized'}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Interest Rate:</strong> {selectedLoan.interestRate?.min}% - {selectedLoan.interestRate?.max}%
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Loan Amount Range:</strong> ₹{selectedLoan.minLoanAmount?.toLocaleString() || '0'} - ₹{selectedLoan.maxLoanAmount?.toLocaleString() || '0'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Tenure:</strong> {selectedLoan.minTenure || 0} - {selectedLoan.maxTenure || 0} months
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
                    {/* Static Loan Amount Field */}
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        Loan Amount (₹) <span className="text-red-500">*</span>
                        {validatedFields.step4?.loanAmount && (
                          <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
                        )}
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.loanDetails.loanAmount}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            loanDetails: {
                              ...formData.loanDetails,
                              loanAmount: e.target.value
                            }
                          });
                          // Validate in real-time
                          const errors = { ...fieldErrors.step4 };
                          const validated = { ...validatedFields.step4 };
                          const amount = Number(e.target.value);
                          if (!e.target.value?.toString().trim()) {
                            errors.loanAmount = 'Loan Amount is required';
                            delete validated.loanAmount;
                          } else if (isNaN(amount) || amount <= 0) {
                            errors.loanAmount = 'Loan Amount must be a valid positive number';
                            delete validated.loanAmount;
                          } else if (selectedLoan && selectedLoan.minLoanAmount && amount < selectedLoan.minLoanAmount) {
                            errors.loanAmount = `Loan Amount must be at least ₹${selectedLoan.minLoanAmount.toLocaleString()}`;
                            delete validated.loanAmount;
                          } else if (selectedLoan && selectedLoan.maxLoanAmount && amount > selectedLoan.maxLoanAmount) {
                            errors.loanAmount = `Loan Amount must not exceed ₹${selectedLoan.maxLoanAmount.toLocaleString()}`;
                            delete validated.loanAmount;
                          } else {
                            validated.loanAmount = true;
                            delete errors.loanAmount;
                          }
                          setFieldErrors(prev => ({ ...prev, step4: errors }));
                          setValidatedFields(prev => ({ ...prev, step4: validated }));
                        }}
                        min={selectedLoan?.minLoanAmount || 0}
                        max={selectedLoan?.maxLoanAmount || undefined}
                        placeholder={`Enter loan amount (₹${selectedLoan?.minLoanAmount?.toLocaleString() || '0'} - ₹${selectedLoan?.maxLoanAmount?.toLocaleString() || '0'})`}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          fieldErrors.step4?.loanAmount ? 'border-red-500' : validatedFields.step4?.loanAmount ? 'border-green-500' : 'border-gray-300'
                        }`}
                      />
                      {fieldErrors.step4?.loanAmount && (
                        <p className="text-xs text-red-500 mt-1">{fieldErrors.step4.loanAmount}</p>
                      )}
                    </div>
                    
                    {/* Static Loan Tenure Field */}
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        Loan Tenure (Months) <span className="text-red-500">*</span>
                        {validatedFields.step4?.loanTenure && (
                          <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
                        )}
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.loanDetails.loanTenure}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            loanDetails: {
                              ...formData.loanDetails,
                              loanTenure: e.target.value
                            }
                          });
                          // Validate in real-time
                          const errors = { ...fieldErrors.step4 };
                          const validated = { ...validatedFields.step4 };
                          const tenure = Number(e.target.value);
                          if (!e.target.value?.toString().trim()) {
                            errors.loanTenure = 'Loan Tenure is required';
                            delete validated.loanTenure;
                          } else if (isNaN(tenure) || tenure <= 0) {
                            errors.loanTenure = 'Loan Tenure must be a valid positive number';
                            delete validated.loanTenure;
                          } else if (selectedLoan && selectedLoan.minTenure && tenure < selectedLoan.minTenure) {
                            errors.loanTenure = `Loan Tenure must be at least ${selectedLoan.minTenure} months`;
                            delete validated.loanTenure;
                          } else if (selectedLoan && selectedLoan.maxTenure && tenure > selectedLoan.maxTenure) {
                            errors.loanTenure = `Loan Tenure must not exceed ${selectedLoan.maxTenure} months`;
                            delete validated.loanTenure;
                          } else {
                            validated.loanTenure = true;
                            delete errors.loanTenure;
                          }
                          setFieldErrors(prev => ({ ...prev, step4: errors }));
                          setValidatedFields(prev => ({ ...prev, step4: validated }));
                        }}
                        min={selectedLoan?.minTenure || 0}
                        max={selectedLoan?.maxTenure || undefined}
                        placeholder={`Enter tenure (${selectedLoan?.minTenure || 0} - ${selectedLoan?.maxTenure || 0} months)`}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          fieldErrors.step4?.loanTenure ? 'border-red-500' : validatedFields.step4?.loanTenure ? 'border-green-500' : 'border-gray-300'
                        }`}
                      />
                      {fieldErrors.step4?.loanTenure && (
                        <p className="text-xs text-red-500 mt-1">{fieldErrors.step4.loanTenure}</p>
                      )}
                    </div>
                    
                    {/* Dynamic Fields */}
                    {(() => {
                      const loanDetailsFields = dynamicFields
                        .filter(f => f.section === 'loanDetails')
                        .sort((a, b) => (a.order || 0) - (b.order || 0));
                      console.log('Loan Details fields:', loanDetailsFields.length, loanDetailsFields);
                      return loanDetailsFields;
                    })()
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
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Documents */}
            {step === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <DocumentIcon className="h-6 w-6 mr-2" />
                  Documents
                </h2>

                {/* Selfie Capture Section */}
                <div className="md:col-span-2 border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Selfie <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-4">
                    Please take a selfie using your device camera. This helps us verify your identity.
                  </p>
                  
                  {!formData.documents.selfie && !showCamera && (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition w-full md:w-auto"
                    >
                      <CameraIcon className="h-5 w-5" />
                      Take Selfie
                    </button>
                  )}

                  {showCamera && (
                    <div className="space-y-4">
                      <div className="relative bg-black rounded-lg overflow-hidden">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-auto max-h-96 object-contain"
                        />
                        <canvas ref={canvasRef} className="hidden" />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={captureSelfie}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                          <CameraIcon className="h-5 w-5" />
                          Capture Photo
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                        >
                          <XMarkIcon className="h-5 w-5" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {formData.documents.selfie && !showCamera && (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <div className="flex items-center mb-2">
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                          <span className="text-sm font-medium text-green-700">Selfie captured successfully</span>
                        </div>
                        <img
                          src={URL.createObjectURL(formData.documents.selfie)}
                          alt="Selfie preview"
                          className="max-w-full h-auto max-h-64 rounded-lg border-2 border-green-500"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          <CameraIcon className="h-5 w-5" />
                          Retake
                        </button>
                        <button
                          type="button"
                          onClick={removeSelfie}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                          <XMarkIcon className="h-5 w-5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {loadingFields ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading form fields...</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {(() => {
                      const documentsFields = dynamicFields
                        .filter(f => f.section === 'documents')
                        .sort((a, b) => (a.order || 0) - (b.order || 0));
                      console.log('Documents fields:', documentsFields.length, documentsFields);
                      return documentsFields;
                    })()
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
                  disabled={!isStepValid()}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
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

