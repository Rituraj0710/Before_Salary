import { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const iconOptions = [
  { name: 'LightBulbIcon', label: 'Idea / Assistance' },
  { name: 'ClockIcon', label: 'Clock / Speed' },
  { name: 'Cog6ToothIcon', label: 'Settings / Flexibility' },
  { name: 'UserGroupIcon', label: 'Users / Community' },
  { name: 'ShieldCheckIcon', label: 'Security' },
  { name: 'HandThumbUpIcon', label: 'Support' },
  { name: 'DevicePhoneMobileIcon', label: 'Mobile / Digital' },
  { name: 'CurrencyDollarIcon', label: 'Finance' },
  { name: 'BanknotesIcon', label: 'Money' }
];

const HomeContentSettings = () => {
  const [activeSubTab, setActiveSubTab] = useState('info');
  const [infoCards, setInfoCards] = useState([]);
  const [benefitCards, setBenefitCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [editingInfoCard, setEditingInfoCard] = useState(null);
  const [infoForm, setInfoForm] = useState({
    title: '',
    description: '',
    extraDescription: '',
    order: 0,
    isActive: true
  });

  const [showBenefitModal, setShowBenefitModal] = useState(false);
  const [editingBenefitCard, setEditingBenefitCard] = useState(null);
  const [benefitForm, setBenefitForm] = useState({
    title: '',
    description: '',
    icon: 'LightBulbIcon',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [infoRes, benefitRes] = await Promise.all([
        api.get('/admin/home-info-cards'),
        api.get('/admin/home-benefit-cards')
      ]);
      if (infoRes.data.success) {
        setInfoCards(infoRes.data.data || []);
      }
      if (benefitRes.data.success) {
        setBenefitCards(benefitRes.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching home content:', error);
      toast.error('Failed to load home content');
    } finally {
      setLoading(false);
    }
  };

  const resetInfoForm = () => {
    setInfoForm({
      title: '',
      description: '',
      extraDescription: '',
      order: infoCards.length,
      isActive: true
    });
    setEditingInfoCard(null);
    setShowInfoModal(false);
  };

  const resetBenefitForm = () => {
    setBenefitForm({
      title: '',
      description: '',
      icon: 'LightBulbIcon',
      order: benefitCards.length,
      isActive: true
    });
    setEditingBenefitCard(null);
    setShowBenefitModal(false);
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInfoCard) {
        await api.put(`/admin/home-info-cards/${editingInfoCard._id}`, infoForm);
        toast.success('Info card updated successfully');
      } else {
        await api.post('/admin/home-info-cards', infoForm);
        toast.success('Info card created successfully');
      }
      resetInfoForm();
      fetchAllData();
    } catch (error) {
      console.error('Error saving info card:', error);
      toast.error(error.response?.data?.message || 'Failed to save info card');
    }
  };

  const handleBenefitSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBenefitCard) {
        await api.put(`/admin/home-benefit-cards/${editingBenefitCard._id}`, benefitForm);
        toast.success('Benefit card updated successfully');
      } else {
        await api.post('/admin/home-benefit-cards', benefitForm);
        toast.success('Benefit card created successfully');
      }
      resetBenefitForm();
      fetchAllData();
    } catch (error) {
      console.error('Error saving benefit card:', error);
      toast.error(error.response?.data?.message || 'Failed to save benefit card');
    }
  };

  const handleDeleteInfo = async (id) => {
    if (!window.confirm('Delete this info card?')) return;
    try {
      await api.delete(`/admin/home-info-cards/${id}`);
      toast.success('Info card deleted');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to delete info card');
    }
  };

  const handleDeleteBenefit = async (id) => {
    if (!window.confirm('Delete this benefit card?')) return;
    try {
      await api.delete(`/admin/home-benefit-cards/${id}`);
      toast.success('Benefit card deleted');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to delete benefit card');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setActiveSubTab('info')}
          className={`px-4 py-2 rounded-lg font-semibold ${activeSubTab === 'info' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 border'}`}
        >
          Loan Information Cards
        </button>
        <button
          onClick={() => setActiveSubTab('benefits')}
          className={`px-4 py-2 rounded-lg font-semibold ${activeSubTab === 'benefits' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 border'}`}
        >
          Benefits Cards
        </button>
      </div>

      {activeSubTab === 'info' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <h3 className="text-xl font-bold text-gray-900">Loan Information Cards</h3>
            <button
              onClick={() => {
                resetInfoForm();
                setShowInfoModal(true);
              }}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600"
            >
              <PlusIcon className="h-5 w-5" />
              Add Card
            </button>
          </div>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {infoCards.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No info cards found. Click "Add Card" to create the first one.
                  </td>
                </tr>
              ) : (
                infoCards
                  .sort((a, b) => a.order - b.order)
                  .map(card => (
                    <tr key={card._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{card.order}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{card.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-md">{card.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${card.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {card.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-3">
                        <button
                          onClick={() => {
                            setEditingInfoCard(card);
                            setInfoForm({
                              title: card.title,
                              description: card.description,
                              extraDescription: card.extraDescription || '',
                              order: card.order,
                              isActive: card.isActive
                            });
                            setShowInfoModal(true);
                          }}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          <PencilIcon className="h-5 w-5 inline" />
                        </button>
                        <button
                          onClick={() => handleDeleteInfo(card._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeSubTab === 'benefits' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <h3 className="text-xl font-bold text-gray-900">Benefits Cards</h3>
            <button
              onClick={() => {
                resetBenefitForm();
                setShowBenefitModal(true);
              }}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600"
            >
              <PlusIcon className="h-5 w-5" />
              Add Card
            </button>
          </div>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {benefitCards.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No benefit cards found. Click "Add Card" to create one.
                  </td>
                </tr>
              ) : (
                benefitCards
                  .sort((a, b) => a.order - b.order)
                  .map(card => (
                    <tr key={card._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{card.order}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{card.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-md">{card.description}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{card.icon}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${card.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {card.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-3">
                        <button
                          onClick={() => {
                            setEditingBenefitCard(card);
                            setBenefitForm({
                              title: card.title,
                              description: card.description,
                              icon: card.icon,
                              order: card.order,
                              isActive: card.isActive
                            });
                            setShowBenefitModal(true);
                          }}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          <PencilIcon className="h-5 w-5 inline" />
                        </button>
                        <button
                          onClick={() => handleDeleteBenefit(card._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">{editingInfoCard ? 'Edit Info Card' : 'Add Info Card'}</h3>
              <button onClick={resetInfoForm} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleInfoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={infoForm.title}
                  onChange={(e) => setInfoForm({ ...infoForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Short Term Loan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  required
                  value={infoForm.description}
                  onChange={(e) => setInfoForm({ ...infoForm, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Primary description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Description</label>
                <textarea
                  value={infoForm.extraDescription}
                  onChange={(e) => setInfoForm({ ...infoForm, extraDescription: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Secondary description text"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                  <input
                    type="number"
                    value={infoForm.order}
                    onChange={(e) => setInfoForm({ ...infoForm, order: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={infoForm.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setInfoForm({ ...infoForm, isActive: e.target.value === 'active' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button type="button" onClick={resetInfoForm} className="px-6 py-2 border border-gray-300 rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                  {editingInfoCard ? 'Update Card' : 'Create Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Benefit Modal */}
      {showBenefitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">{editingBenefitCard ? 'Edit Benefit Card' : 'Add Benefit Card'}</h3>
              <button onClick={resetBenefitForm} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleBenefitSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={benefitForm.title}
                  onChange={(e) => setBenefitForm({ ...benefitForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Instant Financial Assistance"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  required
                  value={benefitForm.description}
                  onChange={(e) => setBenefitForm({ ...benefitForm, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Benefit description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon *</label>
                <select
                  value={benefitForm.icon}
                  onChange={(e) => setBenefitForm({ ...benefitForm, icon: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  {iconOptions.map(icon => (
                    <option key={icon.name} value={icon.name}>{icon.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                  <input
                    type="number"
                    value={benefitForm.order}
                    onChange={(e) => setBenefitForm({ ...benefitForm, order: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={benefitForm.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setBenefitForm({ ...benefitForm, isActive: e.target.value === 'active' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button type="button" onClick={resetBenefitForm} className="px-6 py-2 border border-gray-300 rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                  {editingBenefitCard ? 'Update Card' : 'Create Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeContentSettings;


