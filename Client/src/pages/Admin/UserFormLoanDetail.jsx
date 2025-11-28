import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { 
  EyeIcon,
  XMarkIcon,
  DocumentTextIcon,
  UserIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  DocumentArrowUpIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const UserFormLoanDetail = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('form-builder');
  
  // Applications state
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Form builder state
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formFields, setFormFields] = useState([]);
  const [loadingFields, setLoadingFields] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [fieldForm, setFieldForm] = useState({
    name: '',
    type: 'Text',
    required: false,
    placeholder: '',
    label: '',
    options: [],
    order: 0,
    section: 'employment'
  });

  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch categories');
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const fetchFormFields = useCallback(async () => {
    if (!selectedCategory) return;
    try {
      setLoadingFields(true);
      const response = await api.get(`/form-fields/category/${selectedCategory}`);
      setFormFields(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch form fields');
      console.error('Error fetching form fields:', error);
    } finally {
      setLoadingFields(false);
    }
  }, [selectedCategory]);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/applications');
      setApplications(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch loan applications');
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'applications') {
      fetchApplications();
    } else {
      fetchCategories();
    }
  }, [activeTab, fetchApplications, fetchCategories]);

  useEffect(() => {
    if (selectedCategory) {
      fetchFormFields();
    } else {
      setFormFields([]);
    }
  }, [selectedCategory, fetchFormFields]);

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800';
      case 'Documents Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDocumentUrl = (url) => {
    if (!url) return null;
    const apiBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return url.startsWith('http') ? url : `${apiBaseUrl}${url}`;
  };

  const handleAddField = (section = 'employment') => {
    setEditingField(null);
    setFieldForm({
      name: '',
      type: 'Text',
      required: false,
      placeholder: '',
      label: '',
      options: [],
      order: formFields.filter(f => f.section === section).length,
      section: section
    });
    setShowFieldModal(true);
  };

  const handleEditField = (field) => {
    setEditingField(field);
    setFieldForm({
      name: field.name || '',
      type: field.type || 'Text',
      required: field.required || false,
      placeholder: field.placeholder || '',
      label: field.label || field.name || '',
      options: field.options || [],
      order: field.order || 0,
      section: field.section || 'employment'
    });
    setShowFieldModal(true);
  };

  const handleDeleteField = async (fieldId) => {
    if (!window.confirm('Are you sure you want to delete this field?')) return;
    try {
      await api.delete(`/form-fields/${fieldId}`);
      toast.success('Field deleted successfully');
      fetchFormFields();
    } catch (error) {
      toast.error('Failed to delete field');
    }
  };

  const handleFieldSubmit = async (e) => {
    e.preventDefault();
    
    const name = fieldForm.name || fieldForm.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const fieldData = {
      categoryId: selectedCategory,
      name,
      label: fieldForm.label || name,
      type: fieldForm.type,
      placeholder: fieldForm.placeholder || undefined,
      options: fieldForm.options || [],
      required: fieldForm.required || false,
      width: 'full',
      order: fieldForm.order || formFields.filter(f => f.section === fieldForm.section).length,
      section: fieldForm.section || 'employment'
    };

    try {
      if (editingField) {
        await api.put(`/form-fields/${editingField._id}`, fieldData);
        toast.success('Field updated successfully');
      } else {
        await api.post('/form-fields', fieldData);
        toast.success('Field added successfully');
      }
      setShowFieldModal(false);
      setEditingField(null);
      resetFieldForm();
      fetchFormFields();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save field');
    }
  };

  const resetFieldForm = () => {
    setFieldForm({
      name: '',
      type: 'Text',
      required: false,
      placeholder: '',
      label: '',
      options: [],
      order: 0,
      section: 'employment'
    });
    setEditingField(null);
  };

  const renderPreviewField = (field, index) => (
    <div key={field._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label || field.name}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.placeholder && (
            <p className="text-xs text-gray-500 mb-2">{field.placeholder}</p>
          )}
        </div>
        <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
          #{index + 1}
        </span>
      </div>
      
      {/* Render field based on type */}
      {field.type === 'Text' && (
        <input
          type="text"
          disabled
          placeholder={`Enter ${field.label || field.name.toLowerCase()}`}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-500 cursor-not-allowed"
        />
      )}
      
      {field.type === 'Number' && (
        <input
          type="number"
          disabled
          placeholder={`Enter ${field.label || field.name.toLowerCase()}`}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-500 cursor-not-allowed"
        />
      )}
      
      {field.type === 'Email' && (
        <input
          type="email"
          disabled
          placeholder={`Enter email address`}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-500 cursor-not-allowed"
        />
      )}
      
      {field.type === 'Phone' && (
        <input
          type="tel"
          disabled
          placeholder={`Enter phone number`}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-500 cursor-not-allowed"
        />
      )}
      
      {field.type === 'Date' && (
        <input
          type="date"
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-500 cursor-not-allowed"
        />
      )}
      
      {field.type === 'Textarea' && (
        <textarea
          disabled
          rows="3"
          placeholder={`Enter ${field.label || field.name.toLowerCase()}`}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-500 cursor-not-allowed resize-none"
        />
      )}
      
      {field.type === 'Select' && field.options && field.options.length > 0 && (
        <select
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-500 cursor-not-allowed"
        >
          <option value="">-- Select an option --</option>
          {field.options.map((option, optIndex) => (
            <option key={optIndex} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}
      
      {field.type === 'Radio' && field.options && field.options.length > 0 && (
        <div className="space-y-2">
          {field.options.map((option, optIndex) => (
            <label key={optIndex} className="flex items-center text-gray-500 cursor-not-allowed">
              <input
                type="radio"
                disabled
                name={`preview-${field._id}`}
                className="mr-2"
              />
              {option}
            </label>
          ))}
        </div>
      )}
      
      {field.type === 'Checkbox' && (
        <label className="flex items-center text-gray-500 cursor-not-allowed">
          <input
            type="checkbox"
            disabled
            className="mr-2"
          />
          {field.placeholder || 'Check this box'}
        </label>
      )}
      
      {field.type === 'File' && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-500">File upload area</p>
          <p className="text-xs text-gray-400 mt-1">Click to browse files</p>
        </div>
      )}
      
      <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
        <span className="px-2 py-1 bg-gray-200 rounded">
          {field.type}
        </span>
        {field.required ? (
          <span className="px-2 py-1 bg-red-100 text-red-600 rounded">
            Required
          </span>
        ) : (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">
            Optional
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Form – Loan Detail</h2>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('form-builder')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'form-builder'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Cog6ToothIcon className="h-5 w-5 inline mr-2" />
            Form Builder
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'applications'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <DocumentTextIcon className="h-5 w-5 inline mr-2" />
            Applications
          </button>
        </nav>
      </div>

      {/* Form Builder Tab */}
      {activeTab === 'form-builder' && (
        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Loan Category</h3>
            {loadingCategories ? (
              <div className="flex items-center text-gray-500">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-orange-600 mr-2"></div>
                Loading categories...
              </div>
            ) : (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">-- Select a Category --</option>
                {categories.length === 0 ? (
                  <option value="" disabled>No categories available</option>
                ) : (
                  categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))
                )}
              </select>
            )}
            {!loadingCategories && categories.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                No categories found. Please create categories in the "Loan Categories" section first.
              </p>
            )}
          </div>

          {selectedCategory && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Form Fields for {categories.find(c => c._id === selectedCategory)?.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Create dynamic form fields organized in 3 sections: <strong>Employment / Source of Income</strong>, <strong>Loan Details</strong>, and <strong>Documents</strong>. 
                  These fields will appear in the loan application form for all loans in this category.
                </p>
              </div>

              <div className="p-6">
                {loadingFields ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Employment / Source of Income Section */}
                    <div className="border border-gray-200 rounded-lg">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <h4 className="text-md font-semibold text-gray-900 flex items-center">
                          <BuildingOfficeIcon className="h-5 w-5 mr-2 text-orange-500" />
                          Employment / Source of Income
                        </h4>
                        <button
                          onClick={() => handleAddField('employment')}
                          className="bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 flex items-center text-sm"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Add Field
                        </button>
                      </div>
                      <div className="p-4 space-y-3">
                        {formFields.filter(f => f.section === 'employment').length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">No fields in this section</p>
                        ) : (
                          formFields
                            .filter(f => f.section === 'employment')
                            .sort((a, b) => (a.order || 0) - (b.order || 0))
                            .map((field) => (
                              <div
                                key={field._id}
                                className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50"
                              >
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{field.label || field.name}</p>
                                    <p className="text-xs text-gray-500">Name: {field.name}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">Type: {field.type}</p>
                                  </div>
                                  <div>
                                    {field.required ? (
                                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                        Required
                                      </span>
                                    ) : (
                                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                                        Optional
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Order: {field.order}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                  <button
                                    onClick={() => handleEditField(field)}
                                    className="text-blue-600 hover:text-blue-800 p-1"
                                    title="Edit field"
                                  >
                                    <PencilIcon className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteField(field._id)}
                                    className="text-red-600 hover:text-red-800 p-1"
                                    title="Delete field"
                                  >
                                    <TrashIcon className="h-5 w-5" />
                                  </button>
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    </div>

                    {/* Loan Details Section */}
                    <div className="border border-gray-200 rounded-lg">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <h4 className="text-md font-semibold text-gray-900 flex items-center">
                          <CurrencyDollarIcon className="h-5 w-5 mr-2 text-orange-500" />
                          Loan Details
                        </h4>
                        <button
                          onClick={() => handleAddField('loanDetails')}
                          className="bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 flex items-center text-sm"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Add Field
                        </button>
                      </div>
                      <div className="p-4 space-y-3">
                        {formFields.filter(f => f.section === 'loanDetails').length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">No fields in this section</p>
                        ) : (
                          formFields
                            .filter(f => f.section === 'loanDetails')
                            .sort((a, b) => (a.order || 0) - (b.order || 0))
                            .map((field) => (
                              <div
                                key={field._id}
                                className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50"
                              >
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{field.label || field.name}</p>
                                    <p className="text-xs text-gray-500">Name: {field.name}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">Type: {field.type}</p>
                                  </div>
                                  <div>
                                    {field.required ? (
                                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                        Required
                                      </span>
                                    ) : (
                                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                                        Optional
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Order: {field.order}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                  <button
                                    onClick={() => handleEditField(field)}
                                    className="text-blue-600 hover:text-blue-800 p-1"
                                    title="Edit field"
                                  >
                                    <PencilIcon className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteField(field._id)}
                                    className="text-red-600 hover:text-red-800 p-1"
                                    title="Delete field"
                                  >
                                    <TrashIcon className="h-5 w-5" />
                                  </button>
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    </div>

                    {/* Documents Section */}
                    <div className="border border-gray-200 rounded-lg">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <h4 className="text-md font-semibold text-gray-900 flex items-center">
                          <DocumentArrowUpIcon className="h-5 w-5 mr-2 text-orange-500" />
                          Documents
                        </h4>
                        <button
                          onClick={() => handleAddField('documents')}
                          className="bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 flex items-center text-sm"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Add Field
                        </button>
                      </div>
                      <div className="p-4 space-y-3">
                        {formFields.filter(f => f.section === 'documents').length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">No fields in this section</p>
                        ) : (
                          formFields
                            .filter(f => f.section === 'documents')
                            .sort((a, b) => (a.order || 0) - (b.order || 0))
                            .map((field) => (
                              <div
                                key={field._id}
                                className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50"
                              >
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{field.label || field.name}</p>
                                    <p className="text-xs text-gray-500">Name: {field.name}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">Type: {field.type}</p>
                                  </div>
                                  <div>
                                    {field.required ? (
                                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                        Required
                                      </span>
                                    ) : (
                                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                                        Optional
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Order: {field.order}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                  <button
                                    onClick={() => handleEditField(field)}
                                    className="text-blue-600 hover:text-blue-800 p-1"
                                    title="Edit field"
                                  >
                                    <PencilIcon className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteField(field._id)}
                                    className="text-red-600 hover:text-red-800 p-1"
                                    title="Delete field"
                                  >
                                    <TrashIcon className="h-5 w-5" />
                                  </button>
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Preview Section */}
          {selectedCategory && formFields.length > 0 && (
            <div className="bg-white rounded-lg shadow mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Form Preview</h3>
                <p className="text-sm text-gray-500 mt-1">
                  This is how the form will appear to users. Fields are organized by sections.
                </p>
              </div>
              <div className="p-6">
                <div className="max-w-2xl mx-auto space-y-6">
                  {/* Employment Section Preview */}
                  {formFields.filter(f => f.section === 'employment').length > 0 && (
                    <div className="border border-gray-200 rounded-lg">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <h4 className="text-md font-semibold text-gray-900 flex items-center">
                          <BuildingOfficeIcon className="h-5 w-5 mr-2 text-orange-500" />
                          Employment / Source of Income
                        </h4>
                      </div>
                      <div className="p-4 space-y-4">
                        {[...formFields]
                          .filter(f => f.section === 'employment')
                          .sort((a, b) => (a.order || 0) - (b.order || 0))
                          .map((field, index) => renderPreviewField(field, index))}
                      </div>
                    </div>
                  )}

                  {/* Loan Details Section Preview */}
                  {formFields.filter(f => f.section === 'loanDetails').length > 0 && (
                    <div className="border border-gray-200 rounded-lg">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <h4 className="text-md font-semibold text-gray-900 flex items-center">
                          <CurrencyDollarIcon className="h-5 w-5 mr-2 text-orange-500" />
                          Loan Details
                        </h4>
                      </div>
                      <div className="p-4 space-y-4">
                        {[...formFields]
                          .filter(f => f.section === 'loanDetails')
                          .sort((a, b) => (a.order || 0) - (b.order || 0))
                          .map((field, index) => renderPreviewField(field, index))}
                      </div>
                    </div>
                  )}

                  {/* Documents Section Preview */}
                  {formFields.filter(f => f.section === 'documents').length > 0 && (
                    <div className="border border-gray-200 rounded-lg">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <h4 className="text-md font-semibold text-gray-900 flex items-center">
                          <DocumentArrowUpIcon className="h-5 w-5 mr-2 text-orange-500" />
                          Documents
                        </h4>
                      </div>
                      <div className="p-4 space-y-4">
                        {[...formFields]
                          .filter(f => f.section === 'documents')
                          .sort((a, b) => (a.order || 0) - (b.order || 0))
                          .map((field, index) => renderPreviewField(field, index))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600 mx-auto"></div>
            </div>
          ) : applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No loan applications found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loan Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loan Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {app.applicationNumber || 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.personalInfo?.fullName || app.userId?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.personalInfo?.email || app.userId?.email || 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.personalInfo?.phone || app.userId?.phone || 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.loanId?.name || app.loanType || 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{app.loanDetails?.loanAmount?.toLocaleString() || '0'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                        {app.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(app.createdAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(app)}
                        className="text-orange-600 hover:text-orange-900 flex items-center"
                      >
                        <EyeIcon className="h-5 w-5 mr-1" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          )}
        </>
      )}

      {/* Field Modal */}
      {showFieldModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                {editingField ? 'Edit Field' : 'Add New Field'}
              </h3>
              <button
                onClick={() => {
                  setShowFieldModal(false);
                  resetFieldForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleFieldSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field Label *</label>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter field label"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field Name *</label>
                <input
                  type="text"
                  required
                  value={fieldForm.name}
                  onChange={(e) => setFieldForm({ ...fieldForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="field-name (auto-generated from label)"
                />
                <p className="text-xs text-gray-500 mt-1">Used internally (auto-generated from label if not provided)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
                <select
                  required
                  value={fieldForm.section}
                  onChange={(e) => setFieldForm({ ...fieldForm, section: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="employment">Employment / Source of Income</option>
                  <option value="loanDetails">Loan Details</option>
                  <option value="documents">Documents</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field Type *</label>
                <select
                  required
                  value={fieldForm.type}
                  onChange={(e) => setFieldForm({ ...fieldForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="Text">Text</option>
                  <option value="Number">Number</option>
                  <option value="Email">Email</option>
                  <option value="Phone">Phone</option>
                  <option value="Date">Date</option>
                  <option value="Textarea">Textarea</option>
                  <option value="Select">Select</option>
                  <option value="Checkbox">Checkbox</option>
                  <option value="Radio">Radio</option>
                  <option value="File">File Upload</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Is Required *</label>
                <select
                  required
                  value={fieldForm.required ? 'Yes' : 'No'}
                  onChange={(e) => setFieldForm({ ...fieldForm, required: e.target.value === 'Yes' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder / Instructions</label>
                <textarea
                  value={fieldForm.placeholder || ''}
                  onChange={(e) => setFieldForm({ ...fieldForm, placeholder: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  rows="3"
                  placeholder="Enter instructions or placeholder text"
                />
              </div>

              {(fieldForm.type === 'Select' || fieldForm.type === 'Radio') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Options (one per line) *</label>
                  <textarea
                    required
                    value={fieldForm.options.join('\n')}
                    onChange={(e) => {
                      const options = e.target.value.split('\n').filter(opt => opt.trim());
                      setFieldForm({ ...fieldForm, options });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    rows="4"
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowFieldModal(false);
                    resetFieldForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  {editingField ? 'Update' : 'Add'} Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                Application Details - {selectedApplication.applicationNumber || 'N/A'}
              </h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedApplication(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Application Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                {/* Dynamic Fields Data */}
                {selectedApplication.dynamicFields && Object.keys(selectedApplication.dynamicFields).length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center mb-4">
                      <DocumentTextIcon className="h-5 w-5 text-orange-500 mr-2" />
                      <h4 className="text-lg font-semibold text-gray-900">Additional Form Data</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(selectedApplication.dynamicFields).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-sm font-medium text-gray-500">{key}</p>
                          <p className="text-sm text-gray-900">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span className={`mt-1 inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedApplication.status)}`}>
                      {selectedApplication.status || 'N/A'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-500">Submitted On</p>
                    <p className="text-sm text-gray-900">{formatDate(selectedApplication.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <UserIcon className="h-5 w-5 text-orange-500 mr-2" />
                  <h4 className="text-lg font-semibold text-gray-900">Personal Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Full Name</p>
                    <p className="text-sm text-gray-900">{selectedApplication.personalInfo?.fullName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{selectedApplication.personalInfo?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-sm text-gray-900">{selectedApplication.personalInfo?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                    <p className="text-sm text-gray-900">{formatDate(selectedApplication.personalInfo?.dateOfBirth)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Gender</p>
                    <p className="text-sm text-gray-900">{selectedApplication.personalInfo?.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">PAN</p>
                    <p className="text-sm text-gray-900">{selectedApplication.personalInfo?.pan || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Aadhar</p>
                    <p className="text-sm text-gray-900">{selectedApplication.personalInfo?.aadhar || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Marital Status</p>
                    <p className="text-sm text-gray-900">{selectedApplication.personalInfo?.maritalStatus || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Number of Dependents</p>
                    <p className="text-sm text-gray-900">{selectedApplication.personalInfo?.numberOfDependents || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <MapPinIcon className="h-5 w-5 text-orange-500 mr-2" />
                  <h4 className="text-lg font-semibold text-gray-900">Address Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Current Address</h5>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-900">{selectedApplication.address?.current?.street || 'N/A'}</p>
                      <p className="text-gray-500">
                        {[
                          selectedApplication.address?.current?.city,
                          selectedApplication.address?.current?.state,
                          selectedApplication.address?.current?.pincode
                        ].filter(Boolean).join(', ') || 'N/A'}
                      </p>
                      <p className="text-gray-500">{selectedApplication.address?.current?.country || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Permanent Address</h5>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-900">{selectedApplication.address?.permanent?.street || 'N/A'}</p>
                      <p className="text-gray-500">
                        {[
                          selectedApplication.address?.permanent?.city,
                          selectedApplication.address?.permanent?.state,
                          selectedApplication.address?.permanent?.pincode
                        ].filter(Boolean).join(', ') || 'N/A'}
                      </p>
                      <p className="text-gray-500">{selectedApplication.address?.permanent?.country || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Employment Information */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <BuildingOfficeIcon className="h-5 w-5 text-orange-500 mr-2" />
                  <h4 className="text-lg font-semibold text-gray-900">Employment Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Employment Type</p>
                    <p className="text-sm text-gray-900">{selectedApplication.employmentInfo?.employmentType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Company Name</p>
                    <p className="text-sm text-gray-900">{selectedApplication.employmentInfo?.companyName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Designation</p>
                    <p className="text-sm text-gray-900">{selectedApplication.employmentInfo?.designation || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Work Experience</p>
                    <p className="text-sm text-gray-900">
                      {selectedApplication.employmentInfo?.workExperience 
                        ? `${selectedApplication.employmentInfo.workExperience} years` 
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Monthly Income</p>
                    <p className="text-sm text-gray-900">
                      {selectedApplication.employmentInfo?.monthlyIncome 
                        ? `₹${selectedApplication.employmentInfo.monthlyIncome.toLocaleString()}` 
                        : 'N/A'}
                    </p>
                  </div>
                  {selectedApplication.employmentInfo?.businessType && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Business Type</p>
                      <p className="text-sm text-gray-900">{selectedApplication.employmentInfo.businessType}</p>
                    </div>
                  )}
                  {selectedApplication.employmentInfo?.businessAge && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Business Age</p>
                      <p className="text-sm text-gray-900">
                        {selectedApplication.employmentInfo.businessAge} years
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Loan Details */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <CurrencyDollarIcon className="h-5 w-5 text-orange-500 mr-2" />
                  <h4 className="text-lg font-semibold text-gray-900">Loan Details</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Loan Type</p>
                    <p className="text-sm text-gray-900">{selectedApplication.loanId?.name || selectedApplication.loanType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Loan Amount</p>
                    <p className="text-sm text-gray-900">
                      ₹{selectedApplication.loanDetails?.loanAmount?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Loan Tenure</p>
                    <p className="text-sm text-gray-900">
                      {selectedApplication.loanDetails?.loanTenure 
                        ? `${selectedApplication.loanDetails.loanTenure} months` 
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Interest Rate</p>
                    <p className="text-sm text-gray-900">
                      {selectedApplication.loanDetails?.interestRate 
                        ? `${selectedApplication.loanDetails.interestRate}%` 
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">EMI</p>
                    <p className="text-sm text-gray-900">
                      {selectedApplication.loanDetails?.emi 
                        ? `₹${selectedApplication.loanDetails.emi.toLocaleString()}` 
                        : 'N/A'}
                    </p>
                  </div>
                  {selectedApplication.loanDetails?.purpose && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Purpose</p>
                      <p className="text-sm text-gray-900">{selectedApplication.loanDetails.purpose}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents */}
              {selectedApplication.documents && selectedApplication.documents.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <DocumentArrowUpIcon className="h-5 w-5 text-orange-500 mr-2" />
                    <h4 className="text-lg font-semibold text-gray-900">Documents</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedApplication.documents.map((doc, index) => {
                      const docUrl = getDocumentUrl(doc.url);
                      return (
                        <div key={index} className="border border-gray-200 rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{doc.type}</p>
                              <p className="text-xs text-gray-500">{doc.name}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              doc.status === 'Verified' 
                                ? 'bg-green-100 text-green-800' 
                                : doc.status === 'Rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {doc.status || 'Pending'}
                            </span>
                          </div>
                          {docUrl && (
                            <a
                              href={docUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-orange-600 hover:text-orange-800 underline"
                            >
                              View Document
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedApplication.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-700">{selectedApplication.rejectionReason}</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedApplication(null);
                }}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserFormLoanDetail;

