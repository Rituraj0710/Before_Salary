import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { TrashIcon } from '@heroicons/react/24/outline';

const Categories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [catForm, setCatForm] = useState({ name: '', description: '' });
  const [catImageFile, setCatImageFile] = useState(null);
  const [catImagePreview, setCatImagePreview] = useState(null);
  const [selectedCat, setSelectedCat] = useState(null);
  const [editingCat, setEditingCat] = useState(null);
  const imageInputRef = useRef(null);
  const editImageInputRef = useRef(null);
  const [loans, setLoans] = useState([]);
  const [loanForm, setLoanForm] = useState({
    name: '',
    description: '',
    type: '',
    interestRateMin: '',
    interestRateMax: '',
    interestRateDefault: '',
    minLoanAmount: '',
    maxLoanAmount: '',
    minTenure: '',
    maxTenure: ''
  });
  const [savingCat, setSavingCat] = useState(false);
  const [savingLoan, setSavingLoan] = useState(false);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoadingCats(true);
    setError(null);
    try {
      // FIX: Remove duplicate /api in the path
      const res = await api.get('/categories?withCounts=1');
      const categoriesData = res.data.data || [];
      // Debug: Log to see if image field is present
      console.log('Loaded categories:', categoriesData.map(c => ({ name: c.name, image: c.image })));
      setCategories(categoriesData);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoadingCats(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        setError('Please select an image file');
        return;
      }
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('File size must be less than 2MB');
        return;
      }
      setCatImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCatImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        setError('Please select an image file');
        return;
      }
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('File size must be less than 2MB');
        return;
      }
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingCat(prev => ({
          ...prev,
          imagePreview: reader.result,
          imageFile: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const startEdit = (cat) => {
    const apiBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const imageUrl = cat.image ? (cat.image.startsWith('http') ? cat.image : `${apiBaseUrl}${cat.image}`) : null;
    
    setEditingCat({
      _id: cat._id,
      name: cat.name,
      description: cat.description || '',
      image: cat.image,
      imageUrl: imageUrl,
      imageFile: null,
      imagePreview: imageUrl
    });
    setError(null);
    setMsg(null);
  };

  const cancelEdit = () => {
    setEditingCat(null);
    setError(null);
    setMsg(null);
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete the category "${categoryName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setError(null);
      setMsg(null);
      const res = await api.delete(`/categories/${categoryId}`);
      
      if (res.data.success) {
        setMsg('Category deleted successfully');
        // Remove category from list
        setCategories(prev => prev.filter(c => c._id !== categoryId));
        
        // If deleted category was selected, clear selection
        if (selectedCat?._id === categoryId) {
          setSelectedCat(null);
          setLoans([]);
        }
        
        // If deleted category was being edited, cancel edit
        if (editingCat?._id === categoryId) {
          cancelEdit();
        }
      }
    } catch (e) {
      const errorMessage = e.response?.data?.message || e.message || 'Failed to delete category';
      setError(errorMessage);
      
      // If category has linked loans, show a more helpful message
      if (errorMessage.includes('linked loans')) {
        setError(`Cannot delete category "${categoryName}" because it has loans associated with it. Please remove or reassign the loans first.`);
      }
    }
  };

  const updateCategory = async () => {
    if (!editingCat) return;
    
    // Validate name before submitting
    const trimmedName = editingCat.name?.trim();
    if (!trimmedName) {
      setError('Category name is required');
      return;
    }

    setSavingCat(true);
    setError(null);
    setMsg(null);
    try {
      const formData = new FormData();
      formData.append('name', trimmedName);
      formData.append('description', (editingCat.description || '').trim());
      if (editingCat.imageFile) {
        formData.append('image', editingCat.imageFile);
        console.log('Updating with image file:', editingCat.imageFile.name);
      }

      // Axios interceptor will handle Content-Type for FormData
      const res = await api.put(`/categories/${editingCat._id}`, formData);
      setMsg('Category updated successfully');
      
      // Update the category in the list
      setCategories(prev => prev.map(c => 
        c._id === editingCat._id ? { ...res.data.data, loanCount: c.loanCount || 0 } : c
      ));
      
      // If this was the selected category, update it
      if (selectedCat?._id === editingCat._id) {
        setSelectedCat(res.data.data);
      }
      
      cancelEdit();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setSavingCat(false);
    }
  };

  const submitCategory = async () => {
    // Validate name before submitting
    const trimmedName = catForm.name?.trim();
    if (!trimmedName) {
      setError('Category name is required');
      setSavingCat(false);
      return;
    }

    setSavingCat(true);
    setError(null);
    setMsg(null);
    try {
      const formData = new FormData();
      formData.append('name', trimmedName);
      formData.append('description', (catForm.description || '').trim());
      if (catImageFile) {
        formData.append('image', catImageFile);
        console.log('Image file to upload:', catImageFile.name, 'Size:', catImageFile.size, 'Type:', catImageFile.type);
      } else {
        console.log('No image file selected');
      }

      // Axios interceptor will handle Content-Type for FormData
      const res = await api.post('/categories', formData);
      
      console.log('Category creation response:', res.data);
      
      if (res.data.success && res.data.data) {
        setMsg('Category created successfully');
        // Reload categories to ensure we have the latest data including image
        await loadCategories();
      }
      
      // Reset form
      setCatForm({ name: '', description: '' });
      setCatImageFile(null);
      setCatImagePreview(null);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setSavingCat(false);
    }
  };

  const selectCategory = async (cat) => {
    setSelectedCat(cat);
    setLoans([]);
    setError(null);
    setMsg(null);
    try {
      // FIX: Remove duplicate /api in the path
      const res = await api.get(`/categories/${cat._id}/loans`);
      setLoans(res.data.data || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  const submitLoan = async () => {
    if (!selectedCat) return;
    setSavingLoan(true);
    setError(null);
    setMsg(null);
    try {
      // FIX: Remove duplicate /api in the path
      const res = await api.post(`/categories/${selectedCat._id}/loans`, loanForm);
      setMsg('Loan created');
      setLoanForm({
        name: '',
        description: '',
        type: '',
        interestRateMin: '',
        interestRateMax: '',
        interestRateDefault: '',
        minLoanAmount: '',
        maxLoanAmount: '',
        minTenure: '',
        maxTenure: ''
      });
      setLoans(prev => [res.data.data, ...prev]);
      setCategories(prev => prev.map(c => c._id === selectedCat._id
        ? { ...c, loanCount: (c.loanCount || 0) + 1 }
        : c));
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setSavingLoan(false);
    }
  };

  if (!isAdmin) {
    return <div className="p-6 text-sm text-red-600">Admin access required.</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Loan Categories</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          {editingCat ? (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Edit Category</h2>
                <button
                  onClick={cancelEdit}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Cancel
                </button>
              </div>
              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Name"
                value={editingCat.name}
                onChange={e => setEditingCat(prev => ({ ...prev, name: e.target.value }))}
              />
              
              {/* Image Upload Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Image
                </label>
                <input
                  ref={editImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageChange}
                  className="w-full border px-3 py-2 rounded text-sm"
                />
                {editingCat.imagePreview && (
                  <div className="mt-2">
                    <img
                      src={editingCat.imagePreview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded border"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {editingCat.imageFile ? 'New image selected' : 'Current image'}
                    </p>
                  </div>
                )}
              </div>

              <textarea
                className="w-full border px-3 py-2 rounded"
                placeholder="Description"
                value={editingCat.description}
                onChange={e => setEditingCat(prev => ({ ...prev, description: e.target.value }))}
              />
              <button
                disabled={savingCat || !editingCat.name}
                onClick={updateCategory}
                className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50 w-full"
              >
                {savingCat ? 'Updating...' : 'Update Category'}
              </button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-medium">Create Category</h2>
              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Name"
                value={catForm.name}
                onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))}
              />
              
              {/* Image Upload Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Image
                </label>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border px-3 py-2 rounded text-sm"
                />
                {catImagePreview && (
                  <div className="mt-2">
                    <img
                      src={catImagePreview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded border"
                    />
                  </div>
                )}
              </div>

              <textarea
                className="w-full border px-3 py-2 rounded"
                placeholder="Description"
                value={catForm.description}
                onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))}
              />
              <button
                disabled={savingCat || !catForm.name}
                onClick={submitCategory}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {savingCat ? 'Saving...' : 'Add Category'}
              </button>
            </>
          )}
        </div>

        <div className="md:col-span-2">
          <h2 className="text-lg font-medium mb-2">Categories</h2>
            {loadingCats && <div className="text-sm text-gray-500">Loading...</div>}
            <div className="space-y-2">
              {categories.map(c => {
                const apiBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
                // Construct image URL - handle both relative and absolute paths
                let imageUrl = null;
                if (c.image && c.image.trim() !== '') {
                  if (c.image.startsWith('http://') || c.image.startsWith('https://')) {
                    imageUrl = c.image;
                  } else if (c.image.startsWith('/uploads')) {
                    imageUrl = `${apiBaseUrl}${c.image}`;
                  } else if (c.image.startsWith('uploads')) {
                    imageUrl = `${apiBaseUrl}/${c.image}`;
                  } else {
                    // If image doesn't start with /uploads, add it
                    imageUrl = `${apiBaseUrl}/uploads/${c.image}`;
                  }
                }
                
                return (
                  <div
                    key={c._id}
                    className={`border rounded p-3 ${selectedCat?._id === c._id ? 'bg-blue-50 border-blue-400' : 'bg-white'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => selectCategory(c)}
                      >
                        <div className="flex items-center gap-3">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={c.name}
                              className="w-16 h-16 object-cover rounded border"
                              onError={(e) => {
                                // Hide image if it fails to load
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center">
                              <span className="text-xs text-gray-400">No Image</span>
                            </div>
                          )}
                          <div>
                            <span className="font-medium">{c.name}</span>
                            {c.description && <p className="text-xs text-gray-600 mt-1">{c.description}</p>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{c.loanCount || 0} loans</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(c);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 hover:underline"
                          title="Edit category"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(c._id, c.name);
                          }}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Delete category"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {!loadingCats && categories.length === 0 && (
                <div className="text-xs text-gray-500">No categories yet.</div>
              )}
            </div>
        </div>
      </div>


      {(error || msg) && (
        <div className="pt-2 text-sm">
          {error && <span className="text-red-600">{error}</span>}
          {msg && <span className="text-green-600 ml-4">{msg}</span>}
        </div>
      )}
    </div>
  );
};

export default Categories;
