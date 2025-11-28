import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

const NavigationManagement = () => {
  const [navItems, setNavItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    label: '',
    path: '',
    icon: '',
    order: 0,
    isVisible: true,
    isPublic: true
  });

  useEffect(() => {
    fetchNavigation();
  }, []);

  const fetchNavigation = async () => {
    try {
      const response = await api.get('/admin/navigation');
      if (response.data.success) {
        const items = response.data.data || [];
        // Ensure all items have _id for editing/deleting
        const itemsWithIds = items.map((item, index) => ({
          ...item,
          _id: item._id || `temp-${index}`,
          order: item.order || index + 1
        }));
        setNavItems(itemsWithIds);
      } else {
        setNavItems([]);
      }
    } catch (error) {
      console.error('Error fetching navigation:', error);
      toast.error('Failed to load navigation items');
      setNavItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/admin/navigation/${editingItem._id}`, formData);
        toast.success('Navigation item updated');
      } else {
        await api.post('/admin/navigation', formData);
        toast.success('Navigation item added');
      }
      setShowModal(false);
      setEditingItem(null);
      resetForm();
      fetchNavigation();
    } catch (error) {
      toast.error('Failed to save navigation item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      label: item.label || '',
      path: item.path || '',
      icon: item.icon || '',
      order: item.order || 0,
      isVisible: item.isVisible !== false,
      isPublic: item.isPublic !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this navigation item?')) return;
    try {
      await api.delete(`/admin/navigation/${id}`);
      toast.success('Navigation item deleted');
      fetchNavigation();
    } catch (error) {
      toast.error('Failed to delete navigation item');
    }
  };

  const handleMove = async (id, direction) => {
    const item = navItems.find(i => i._id === id);
    if (!item) return;
    
    const newOrder = direction === 'up' ? item.order - 1 : item.order + 1;
    const swapItem = navItems.find(i => i.order === newOrder);
    
    if (swapItem) {
      try {
        await api.put(`/admin/navigation/${id}`, { order: newOrder });
        await api.put(`/admin/navigation/${swapItem._id}`, { order: item.order });
        fetchNavigation();
      } catch (error) {
        toast.error('Failed to reorder');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      label: '',
      path: '',
      icon: '',
      order: navItems.length + 1,
      isVisible: true,
      isPublic: true
    });
    setEditingItem(null);
  };

  const sortedItems = [...navItems].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Navigation Menu</h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Menu Item
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : sortedItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">No navigation items found. Click "Add Menu Item" to create one.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Path</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visibility</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedItems.map((item) => (
                <tr key={item._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.label}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.path}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.isVisible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.isVisible ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
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
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
              <button onClick={() => { setShowModal(false); resetForm(); }}>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label *</label>
                <input
                  type="text"
                  required
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Home"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Path *</label>
                <input
                  type="text"
                  required
                  value={formData.path}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="/"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon Name (optional)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="HomeIcon"
                />
              </div>
              <div className="flex items-center space-x-4 pt-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isVisible}
                      onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Visible</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Public</span>
                  </label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  {editingItem ? 'Update' : 'Add'} Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigationManagement;



