import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const LoanManagement = () => {
  const [loans, setLoans] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [formFields, setFormFields] = useState([]);
  const [pendingFields, setPendingFields] = useState([]); // Fields added before loan creation
  const [loadingFields, setLoadingFields] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [loanFile, setLoanFile] = useState(null);
  const [loanFilePreview, setLoanFilePreview] = useState(null);
  const [loanFileInputRef, setLoanFileInputRef] = useState(null);
  const [fieldForm, setFieldForm] = useState({
    name: '',
    type: 'Text',
    width: 'full',
    required: false,
    placeholder: '',
    label: '',
    options: [],
    order: 0
  });
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: '',
    description: '',
    interestRate: { min: 0, max: 0, default: 0 },
    minLoanAmount: 0,
    maxLoanAmount: 0,
    minTenure: 0,
    maxTenure: 0,
    image: '',
    isActive: true,
    order: 0
  });

  useEffect(() => {
    fetchLoans();
    fetchCategories();
  }, []);

  // Load form fields when editingLoan changes
  useEffect(() => {
    if (editingLoan && editingLoan._id) {
      fetchFormFields(editingLoan._id);
    } else {
      setFormFields([]);
    }
  }, [editingLoan?._id]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await api.get('/categories');
      const categoriesData = response.data.data || [];
      // Sort by name
      const sortedCategories = categoriesData.sort((a, b) => 
        (a.name || '').localeCompare(b.name || '')
      );
      setCategories(sortedCategories);
      
      // Set default type to first category if available
      if (sortedCategories.length > 0 && !formData.type) {
        setFormData(prev => ({ ...prev, type: sortedCategories[0].name }));
      }
    } catch (error) {
      toast.error('Failed to fetch categories');
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchLoans = async () => {
    try {
      // Get all loans including inactive ones for admin
      const response = await api.get('/admin/loans');
      const loansData = response.data.data || [];
      // Sort by order, then by name
      const sortedLoans = loansData.sort((a, b) => {
        if (a.order !== b.order) {
          return (a.order || 0) - (b.order || 0);
        }
        return (a.name || '').localeCompare(b.name || '');
      });
      setLoans(sortedLoans);
    } catch (error) {
      // Fallback to public endpoint if admin endpoint doesn't exist
      try {
        const response = await api.get('/loans');
        setLoans(response.data.data || []);
      } catch (err) {
        toast.error('Failed to fetch loans');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.name || !formData.name.trim()) {
        toast.error('Loan name is required');
        return;
      }
      if (!formData.type || !formData.type.trim()) {
        toast.error('Loan type is required');
        return;
      }
      if (!formData.description || !formData.description.trim()) {
        toast.error('Description is required');
        return;
      }
      
      // Validate numeric fields
      const minLoanAmount = Number(formData.minLoanAmount);
      const maxLoanAmount = Number(formData.maxLoanAmount);
      const minTenure = Number(formData.minTenure);
      const maxTenure = Number(formData.maxTenure);
      const interestRateMin = Number(formData.interestRate?.min);
      const interestRateMax = Number(formData.interestRate?.max);
      const interestRateDefault = Number(formData.interestRate?.default);
      
      if (!minLoanAmount || minLoanAmount <= 0) {
        toast.error('Min loan amount must be greater than 0');
        return;
      }
      if (!maxLoanAmount || maxLoanAmount <= 0) {
        toast.error('Max loan amount must be greater than 0');
        return;
      }
      if (maxLoanAmount < minLoanAmount) {
        toast.error('Max loan amount must be greater than or equal to min loan amount');
        return;
      }
      if (!minTenure || minTenure <= 0) {
        toast.error('Min tenure must be greater than 0');
        return;
      }
      if (!maxTenure || maxTenure <= 0) {
        toast.error('Max tenure must be greater than 0');
        return;
      }
      if (maxTenure < minTenure) {
        toast.error('Max tenure must be greater than or equal to min tenure');
        return;
      }
      if (interestRateMin === undefined || interestRateMin === null || isNaN(interestRateMin)) {
        toast.error('Min interest rate is required');
        return;
      }
      if (interestRateMax === undefined || interestRateMax === null || isNaN(interestRateMax)) {
        toast.error('Max interest rate is required');
        return;
      }
      if (interestRateDefault === undefined || interestRateDefault === null || isNaN(interestRateDefault)) {
        toast.error('Default interest rate is required');
        return;
      }
      if (interestRateMax < interestRateMin) {
        toast.error('Max interest rate must be greater than or equal to min interest rate');
        return;
      }
      if (interestRateDefault < interestRateMin || interestRateDefault > interestRateMax) {
        toast.error('Default interest rate must be between min and max interest rate');
        return;
      }
      
      let savedLoan;
      
      // Always use FormData to ensure consistency with backend multer middleware
      const submitData = new FormData();
      
      // Ensure we have valid values before appending
      const name = formData.name.trim();
      const slug = formData.slug?.trim() || generateSlug(name);
      const type = formData.type.trim();
      const description = formData.description.trim();
      
      submitData.append('name', name);
      submitData.append('slug', slug);
      submitData.append('type', type);
      submitData.append('description', description);
      submitData.append('interestRate', JSON.stringify({
        min: interestRateMin,
        max: interestRateMax,
        default: interestRateDefault
      }));
      submitData.append('minLoanAmount', String(minLoanAmount));
      submitData.append('maxLoanAmount', String(maxLoanAmount));
      submitData.append('minTenure', String(minTenure));
      submitData.append('maxTenure', String(maxTenure));
      submitData.append('isActive', String(formData.isActive !== false));
      submitData.append('order', String(Number(formData.order) || 0));
      if (loanFile) {
        submitData.append('file', loanFile);
      }
      
      // Log what we're sending
      console.log('=== Frontend: Submitting loan data ===');
      console.log('Form data values:', {
        name: name,
        slug: slug,
        type: type,
        description: description ? 'present' : 'missing',
        interestRate: formData.interestRate,
        minLoanAmount: formData.minLoanAmount,
        maxLoanAmount: formData.maxLoanAmount,
        minTenure: formData.minTenure,
        maxTenure: formData.maxTenure,
        hasFile: !!loanFile
      });
      
      // Log FormData contents (for debugging)
      console.log('FormData entries:');
      for (let pair of submitData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]));
      }
      
      if (editingLoan) {
        const response = await api.put(`/loans/${editingLoan._id}`, submitData);
        savedLoan = response.data.data;
        toast.success('Loan updated successfully');
        // Reload form fields after update
        if (savedLoan._id) {
          fetchFormFields(savedLoan._id);
        }
      } else {
        const response = await api.post('/loans', submitData);
        savedLoan = response.data.data;
        toast.success('Loan created successfully');
        // Set as editing loan so form fields section appears
        console.log('Loan created, savedLoan:', savedLoan);
        if (savedLoan && savedLoan._id) {
          setEditingLoan(savedLoan);
          // Save all pending fields to database
          if (pendingFields.length > 0) {
            try {
              await Promise.all(
                pendingFields.map(async (field) => {
                  const fieldData = {
                    ...field,
                    loanId: savedLoan._id
                  };
                  delete fieldData._id; // Remove temp ID
                  await api.post('/form-fields', fieldData);
                })
              );
              toast.success(`${pendingFields.length} form field(s) saved successfully`);
              setPendingFields([]);
            } catch (error) {
              console.error('Error saving pending fields:', error);
              toast.error('Loan created but some form fields failed to save');
            }
          }
          // Load form fields for the new loan
          fetchFormFields(savedLoan._id);
        } else {
          console.error('Loan created but no ID in response:', response.data);
        }
      }
      // Update form data with saved loan data
      setFormData({
        name: savedLoan.name || '',
        slug: savedLoan.slug || '',
        type: savedLoan.type || '',
        description: savedLoan.description || '',
        interestRate: savedLoan.interestRate || { min: 0, max: 0, default: 0 },
        minLoanAmount: savedLoan.minLoanAmount || 0,
        maxLoanAmount: savedLoan.maxLoanAmount || 0,
        minTenure: savedLoan.minTenure || 0,
        maxTenure: savedLoan.maxTenure || 0,
        image: savedLoan.image || '',
        isActive: savedLoan.isActive !== false,
        order: savedLoan.order || 0
      });
      // Clear file and preview after successful save
      setLoanFile(null);
      setLoanFilePreview(null);
      if (loanFileInputRef) {
        loanFileInputRef.value = '';
      }
      fetchLoans();
      // Don't close modal - allow user to add form fields
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save loan');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoanFile(file);
      // Create preview for images, show file name for other files
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLoanFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setLoanFilePreview(file.name);
      }
    }
  };

  const handleEdit = async (loan) => {
    setEditingLoan(loan);
    setPendingFields([]); // Clear pending fields when editing existing loan
    setFormData({
      name: loan.name || '',
      slug: loan.slug || '',
      type: loan.type || (categories.length > 0 ? categories[0].name : ''),
      description: loan.description || '',
      interestRate: loan.interestRate || { min: 0, max: 0, default: 0 },
      minLoanAmount: loan.minLoanAmount || 0,
      maxLoanAmount: loan.maxLoanAmount || 0,
      minTenure: loan.minTenure || 0,
      maxTenure: loan.maxTenure || 0,
      image: loan.image || '',
      isActive: loan.isActive !== false,
      order: loan.order || 0
    });
    // Set file preview if file exists
    if (loan.image) {
      const apiBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const fileUrl = loan.image.startsWith('http') ? loan.image : `${apiBaseUrl}${loan.image}`;
      // Check if it's an image by extension
      const isImage = /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(loan.image);
      if (isImage) {
        setLoanFilePreview(fileUrl);
      } else {
        setLoanFilePreview(loan.image.split('/').pop()); // Show filename
      }
    } else {
      setLoanFilePreview(null);
    }
    setLoanFile(null);
    setShowModal(true);
    // Load form fields for this loan
    if (loan._id) {
      fetchFormFields(loan._id);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this loan?')) return;
    try {
      await api.delete(`/loans/${id}`);
      toast.success('Loan deleted successfully');
      fetchLoans();
    } catch (error) {
      toast.error('Failed to delete loan');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      type: categories.length > 0 ? categories[0].name : '',
      description: '',
      interestRate: { min: 0, max: 0, default: 0 },
      minLoanAmount: 0,
      maxLoanAmount: 0,
      minTenure: 0,
      maxTenure: 0,
      image: '',
      isActive: true,
      order: 0
    });
    setEditingLoan(null);
    setPendingFields([]);
    setLoanFile(null);
    setLoanFilePreview(null);
    if (loanFileInputRef) {
      loanFileInputRef.value = '';
    }
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const fetchFormFields = async (loanId) => {
    if (!loanId) return;
    try {
      setLoadingFields(true);
      const response = await api.get(`/form-fields/${loanId}`);
      setFormFields(response.data.data || []);
    } catch (error) {
      console.error('Error fetching form fields:', error);
      setFormFields([]);
    } finally {
      setLoadingFields(false);
    }
  };

  const handleAddField = () => {
    setEditingField(null);
    const currentFields = editingLoan?._id ? formFields : pendingFields;
    setFieldForm({
      name: '',
      type: '',
      width: '',
      required: false,
      placeholder: '',
      label: '',
      options: [],
      order: currentFields.length
    });
    setShowFieldModal(true);
  };

  const handleEditField = (field) => {
    setEditingField(field);
    setFieldForm({
      name: field.name || '',
      type: field.type || 'Text',
      width: field.width || 'full',
      required: field.required || false,
      placeholder: field.placeholder || '',
      label: field.label || field.name || '',
      options: field.options || [],
      order: field.order || 0
    });
    setShowFieldModal(true);
  };

  const handleDeleteField = async (fieldId) => {
    if (!window.confirm('Are you sure you want to delete this form field?')) return;
    
    // If it's a pending field (temp ID), just remove from state
    if (fieldId.toString().startsWith('temp-')) {
      setPendingFields(pendingFields.filter(f => f._id !== fieldId));
      toast.success('Form field removed');
      return;
    }
    
    // Otherwise, delete from database
    try {
      await api.delete(`/form-fields/${fieldId}`);
      toast.success('Form field deleted successfully');
      if (editingLoan?._id) {
        fetchFormFields(editingLoan._id);
      }
    } catch (error) {
      toast.error('Failed to delete form field');
    }
  };

  const handleFieldSubmit = async (e) => {
    e.preventDefault();
    
    // Auto-generate name from label if not provided
    const name = fieldForm.name || fieldForm.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const fieldData = {
      name,
      label: fieldForm.label || name,
      type: fieldForm.type,
      placeholder: fieldForm.placeholder || undefined,
      options: fieldForm.options || [],
      required: fieldForm.required || false,
      width: fieldForm.width || 'full',
      order: fieldForm.order || (editingLoan?._id ? formFields.length : pendingFields.length)
    };

    // If no loan exists yet, store in pending fields
    if (!editingLoan?._id) {
      if (editingField) {
        // Update pending field
        setPendingFields(pendingFields.map(f => 
          f._id === editingField._id ? { ...fieldData, _id: editingField._id } : f
        ));
        toast.success('Form field updated');
      } else {
        // Add new pending field
        setPendingFields([...pendingFields, { ...fieldData, _id: `temp-${Date.now()}` }]);
        toast.success('Form field added (will be saved when loan is created)');
      }
      setShowFieldModal(false);
      setEditingField(null);
      resetFieldForm();
      return;
    }

    // If loan exists, save to database
    try {
      const dbFieldData = {
        ...fieldData,
        loanId: editingLoan._id
      };

      if (editingField) {
        await api.put(`/form-fields/${editingField._id}`, dbFieldData);
        toast.success('Form field updated successfully');
      } else {
        await api.post('/form-fields', dbFieldData);
        toast.success('Form field created successfully');
      }

      setShowFieldModal(false);
      setEditingField(null);
      resetFieldForm();
      fetchFormFields(editingLoan._id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save form field');
    }
  };

  const resetFieldForm = () => {
    setFieldForm({
      name: '',
      type: '',
      width: '',
      required: false,
      placeholder: '',
      label: '',
      options: [],
      order: 0
    });
    setEditingField(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Loan Management</h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Loan
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600 mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interest Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loan Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loans.map((loan) => (
                <tr key={loan._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{loan.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loan.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {loan.interestRate?.min}% - {loan.interestRate?.max}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{loan.minLoanAmount?.toLocaleString()} - ₹{loan.maxLoanAmount?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        loan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {loan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(loan)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(loan._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{editingLoan ? 'Edit Loan' : 'Add New Loan'}</h3>
              <button onClick={() => { 
                setShowModal(false); 
                setEditingLoan(null);
                setFormFields([]);
                resetForm(); 
              }}>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loan Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        name: e.target.value,
                        slug: generateSlug(e.target.value)
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type (Category) *</label>
                {loadingCategories ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-500">
                    Loading categories...
                  </div>
                ) : (
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
                {categories.length === 0 && !loadingCategories && (
                  <p className="text-xs text-gray-500 mt-1">
                    No categories available. Please create categories first.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Interest Rate (%) *</label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    value={formData.interestRate.min}
                    onChange={(e) => setFormData({
                      ...formData,
                      interestRate: { ...formData.interestRate, min: parseFloat(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Interest Rate (%) *</label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    value={formData.interestRate.max}
                    onChange={(e) => setFormData({
                      ...formData,
                      interestRate: { ...formData.interestRate, max: parseFloat(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Interest Rate (%) *</label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    value={formData.interestRate.default}
                    onChange={(e) => setFormData({
                      ...formData,
                      interestRate: { ...formData.interestRate, default: parseFloat(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Loan Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.minLoanAmount}
                    onChange={(e) => setFormData({ ...formData, minLoanAmount: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Loan Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.maxLoanAmount}
                    onChange={(e) => setFormData({ ...formData, maxLoanAmount: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Tenure (months) *</label>
                  <input
                    type="number"
                    required
                    value={formData.minTenure}
                    onChange={(e) => setFormData({ ...formData, minTenure: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Tenure (months) *</label>
                  <input
                    type="number"
                    required
                    value={formData.maxTenure}
                    onChange={(e) => setFormData({ ...formData, maxTenure: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                <input
                  type="file"
                  ref={(el) => setLoanFileInputRef(el)}
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                {loanFilePreview && (
                  <div className="mt-2">
                    {typeof loanFilePreview === 'string' && (loanFilePreview.startsWith('data:') || loanFilePreview.startsWith('http')) ? (
                      <img
                        src={loanFilePreview}
                        alt="File preview"
                        className="w-32 h-32 object-cover rounded border"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-100 rounded border text-sm text-gray-700">
                        📄 {loanFilePreview}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div> */}

              {/* Loan Application Form Fields Section */}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Loan Application Form Fields</h4>
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="px-3 py-1.5 rounded-lg flex items-center text-sm bg-blue-500 text-white hover:bg-blue-600"
                    title="Add new form field"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add New
                  </button>
                </div>

                {!editingLoan?._id ? (
                  // Show pending fields before loan creation
                  pendingFields.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No form fields added yet. Click "Add New" to create one.
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="mb-2 text-xs text-gray-600 italic">
                        These fields will be saved when you create the loan
                      </div>
                      <div className="space-y-2">
                        {pendingFields.map((field) => (
                          <div
                            key={field._id}
                            className="bg-white border rounded-lg p-3 flex items-center justify-between"
                          >
                            <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                              <div>
                                <span className="text-sm font-medium text-gray-900">{field.label || field.name}</span>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">{field.type}</span>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">{field.width || '-'}</span>
                              </div>
                              <div>
                                {field.required ? (
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                    Required
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                                    Optional
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                type="button"
                                onClick={() => handleEditField(field)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Edit field"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteField(field._id)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Delete field"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ) : loadingFields ? (
                  <div className="text-center py-4 text-gray-500">Loading fields...</div>
                ) : formFields.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No form fields added yet. Click "Add New" to create one.
                  </div>
                ) : (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-2">
                        {formFields.map((field) => (
                          <div
                            key={field._id}
                            className="bg-white border rounded-lg p-3 flex items-center justify-between"
                          >
                            <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                              <div>
                                <span className="text-sm font-medium text-gray-900">{field.name}</span>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">{field.type}</span>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">{field.width || '-'}</span>
                              </div>
                              <div>
                                {field.required ? (
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                    Required
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                                    Optional
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                type="button"
                                onClick={() => handleEditField(field)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Edit field"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteField(field._id)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Delete field"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => { 
                    setShowModal(false); 
                    setEditingLoan(null);
                    setFormFields([]);
                    resetForm(); 
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {editingLoan?._id ? 'Close' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  {editingLoan?._id ? 'Update' : 'Create'} Loan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Form Field Modal */}
      {showFieldModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Generate Form</h3>
              <button onClick={() => { setShowFieldModal(false); resetFieldForm(); }}>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleFieldSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  required
                  value={fieldForm.type}
                  onChange={(e) => setFieldForm({ ...fieldForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select One</option>
                  <option value="Text">Text</option>
                  <option value="Number">Number</option>
                  <option value="Email">Email</option>
                  <option value="Phone">Phone</option>
                  <option value="Date">Date</option>
                  <option value="Textarea">Textarea</option>
                  <option value="Select">Select</option>
                  <option value="Checkbox">Checkbox</option>
                  <option value="Radio">Radio</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Is Required *</label>
                <select
                  required
                  value={fieldForm.required === undefined || fieldForm.required === null ? '' : (fieldForm.required ? 'Required' : 'Optional')}
                  onChange={(e) => setFieldForm({ ...fieldForm, required: e.target.value === 'Required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select One</option>
                  <option value="Required">Required</option>
                  <option value="Optional">Optional</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label *</label>
                <input
                  type="text"
                  required
                  value={fieldForm.label}
                  onChange={(e) => {
                    const label = e.target.value;
                    setFieldForm({ 
                      ...fieldForm, 
                      label: label,
                      name: fieldForm.name || label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter field label"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Width *</label>
                <select
                  required
                  value={fieldForm.width}
                  onChange={(e) => setFieldForm({ ...fieldForm, width: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select One</option>
                  <option value="full">Full</option>
                  <option value="half">Half</option>
                  <option value="third">Third</option>
                  <option value="quarter">Quarter</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instruction (if any)</label>
                <textarea
                  value={fieldForm.placeholder || ''}
                  onChange={(e) => setFieldForm({ ...fieldForm, placeholder: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows="4"
                  placeholder="Enter instructions for this field"
                />
              </div>
              {(fieldForm.type === 'Select' || fieldForm.type === 'Radio') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Options (one per line)</label>
                  <textarea
                    value={fieldForm.options.join('\n')}
                    onChange={(e) => {
                      const options = e.target.value.split('\n').filter(opt => opt.trim());
                      setFieldForm({ ...fieldForm, options });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows="3"
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                  />
                </div>
              )}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanManagement;

