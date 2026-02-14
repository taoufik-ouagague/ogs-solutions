import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, AlertCircle } from 'lucide-react';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from '../utils/toast';
import { US_STATES } from '../utils/constants';

interface StatePrice {
  id: string;
  state: string;
  name: string;
  basic_price: number;
  epic_price: number;
  ultimate_price: number;
  created_at: string;
  updated_at: string;
}

interface FormData {
  state: string;
  name: string;
  basic_price: string;
  epic_price: string;
  ultimate_price: string;
  isCustomState?: boolean;
}

export default function StateManagementPanel() {
  const [states, setStates] = useState<StatePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [useCustomState, setUseCustomState] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    state: '',
    name: '',
    basic_price: '',
    epic_price: '',
    ultimate_price: '',
    isCustomState: false,
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStates();
  }, []);

  const loadStates = async () => {
    setLoading(true);
    try {
      const stateRef = collection(db, 'package_state');
      const snapshot = await getDocs(stateRef);
      const statesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as StatePrice[];
      
      statesData.sort((a, b) => a.state.localeCompare(b.state));
      setStates(statesData);
    } catch (error: any) {
      console.error('Error loading states:', error);
      
      // Better error messages for common issues
      if (error.code === 'permission-denied') {
        toast.error('Permission denied. Please ensure Firestore rules are deployed correctly.');
        console.error('Firestore Rules Update Required:', {
          issue: 'Missing or insufficient permissions for package_state collection',
          solution: 'Deploy the updated firestore.rules file to Firebase'
        });
      } else {
        toast.error('Failed to load states: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      state: '',
      name: '',
      basic_price: '',
      epic_price: '',
      ultimate_price: '',
      isCustomState: false,
    });
    setEditingId(null);
    setUseCustomState(false);
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (state: StatePrice) => {
    // Check if this is a custom state (not in US_STATES)
    const isCustom = !US_STATES.some(s => s.code === state.state);
    
    setFormData({
      state: state.state,
      name: state.name,
      basic_price: String(state.basic_price),
      epic_price: String(state.epic_price),
      ultimate_price: String(state.ultimate_price),
      isCustomState: isCustom,
    });
    setEditingId(state.id);
    setUseCustomState(isCustom);
    setShowForm(true);
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedState = e.target.value;
    const stateObj = US_STATES.find((s) => s.code === selectedState);
    setFormData((prev) => ({
      ...prev,
      state: selectedState,
      name: stateObj?.name || '',
    }));
  };

  const handlePriceChange = (field: keyof Omit<FormData, 'state' | 'name'>, value: string) => {
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const validateForm = () => {
    if (!formData.state || !formData.name) {
      toast.error('Please select a state');
      return false;
    }
    if (!formData.basic_price || !formData.epic_price || !formData.ultimate_price) {
      toast.error('Please enter all prices');
      return false;
    }
    const basic = parseInt(formData.basic_price);
    const epic = parseInt(formData.epic_price);
    const ultimate = parseInt(formData.ultimate_price);
    
    if (basic <= 0 || epic <= 0 || ultimate <= 0) {
      toast.error('Prices must be greater than 0');
      return false;
    }
    if (!(basic < epic && epic < ultimate)) {
      toast.error('Prices must be: Basic < Epic < Ultimate');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const stateDocRef = doc(collection(db, 'package_state'), formData.state);
      const timestamp = new Date().toISOString();

      if (editingId) {
        // Update existing
        await updateDoc(stateDocRef, {
          state: formData.state,
          name: formData.name,
          basic_price: parseInt(formData.basic_price),
          epic_price: parseInt(formData.epic_price),
          ultimate_price: parseInt(formData.ultimate_price),
          updated_at: timestamp,
        });
        toast.success('State updated successfully');
      } else {
        // Create new
        // Check if state already exists
        const existingState = states.find((s) => s.state === formData.state);
        if (existingState) {
          toast.error('This state already exists');
          return;
        }

        await setDoc(stateDocRef, {
          state: formData.state,
          name: formData.name,
          basic_price: parseInt(formData.basic_price),
          epic_price: parseInt(formData.epic_price),
          ultimate_price: parseInt(formData.ultimate_price),
          created_at: timestamp,
          updated_at: timestamp,
        });
        toast.success('State added successfully');
      }

      setShowForm(false);
      resetForm();
      loadStates();
    } catch (error) {
      console.error('Error saving state:', error);
      toast.error('Failed to save state');
    }
  };

  const handleDelete = async (state: StatePrice) => {
    if (!window.confirm(`Are you sure you want to delete ${state.name} (${state.state})?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'package_state', state.id));
      toast.success('State deleted successfully');
      loadStates();
    } catch (error) {
      console.error('Error deleting state:', error);
      toast.error('Failed to delete state');
    }
  };

  const filteredStates = states.filter((state) => {
    const matchesSearch =
      state.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      state.state.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="relative inline-block">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 dark:border-red-900"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600 dark:border-red-400 absolute top-0 left-0"></div>
        </div>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 font-medium">Loading states...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">State Pricing Management</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage pricing information for each state</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all font-bold shadow-lg hover:shadow-xl hover:scale-105 whitespace-nowrap"
        >
          <Plus className="h-5 w-5" />
          Add New State
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by state name or code..."
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white transition-all"
          />
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {editingId ? (
                  <>
                    <Edit2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    Edit State
                  </>
                ) : (
                  <>
                    <Plus className="h-6 w-6 text-green-600 dark:text-green-400" />
                    Add New State
                  </>
                )}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Toggle for Custom State */}
              <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Add Custom State?
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Enable if state is not in the list
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUseCustomState(!useCustomState);
                    setFormData((prev) => ({
                      ...prev,
                      state: '',
                      name: '',
                      isCustomState: !useCustomState,
                    }));
                  }}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    useCustomState
                      ? 'bg-purple-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      useCustomState ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Dropdown for Existing States */}
              {!useCustomState ? (
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Select State *
                  </label>
                  <select
                    value={formData.state}
                    onChange={handleStateChange}
                    disabled={!!editingId}
                    className={`w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white font-semibold appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      editingId ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="">Choose a state...</option>
                    {US_STATES.map((state) => {
                      const exists = states.find((s) => s.state === state.code && s.id !== editingId);
                      return (
                        <option key={state.code} value={state.code} disabled={!!exists}>
                          {state.name} ({state.code}) {exists ? '- Already exists' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              ) : (
                <>
                  {/* Custom State Code Input */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      State Code * (e.g., XX, UN, CA)
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase().slice(0, 2);
                        setFormData((prev) => ({
                          ...prev,
                          state: value,
                        }));
                      }}
                      placeholder="Enter state code (2 letters)"
                      maxLength={2}
                      disabled={!!editingId}
                      className={`w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white font-semibold focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all uppercase ${
                        editingId ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>

                  {/* Custom State Name Input */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      State Name * (e.g., United Nations, Custom Area)
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }));
                      }}
                      placeholder="Enter full state name"
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white font-semibold focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    />
                  </div>
                </>
              )}

              {/* State Name (Read-only) - Only shown when using predefined states */}
              {!useCustomState && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    State Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    disabled
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-gray-400 bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>
              )}

              {/* Price Info Box */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Prices must be in order: Basic &lt; Epic &lt; Ultimate
                </p>
              </div>

              {/* Price Input Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Basic Price', field: 'basic_price' as const, color: 'blue' },
                  { label: 'Epic Price', field: 'epic_price' as const, color: 'purple' },
                  { label: 'Ultimate Price', field: 'ultimate_price' as const, color: 'gradient' },
                ].map(({ label, field, color }) => (
                  <div key={field}>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      {label} *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={formData[field]}
                        onChange={(e) => handlePriceChange(field, e.target.value)}
                        placeholder="0"
                        className={`flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-${color}-500 focus:border-${color}-500 dark:bg-gray-700 dark:text-white transition-all font-semibold`}
                      />
                      <span className="text-lg font-bold text-gray-700 dark:text-gray-300 min-w-fit">DHS</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-bold flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
              >
                <Save className="h-5 w-5" />
                {editingId ? 'Update State' : 'Add State'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* States Table */}
      <div className="overflow-x-auto rounded-xl border-2 border-gray-200 dark:border-gray-700">
        {filteredStates.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
              {states.length === 0 ? 'No states added yet' : 'No states match your search'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 border-b-2 border-gray-300 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  State
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  State Name
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Basic Price
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Epic Price
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Ultimate Price
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-200 dark:divide-gray-700">
              {filteredStates.map((state) => (
                <tr
                  key={state.id}
                  className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 dark:hover:from-gray-700 dark:hover:to-blue-900/20 transition-all duration-300"
                >
                  <td className="px-6 py-5 text-sm font-bold text-gray-900 dark:text-white">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold">
                      {state.state}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm font-semibold text-gray-900 dark:text-white">
                    {state.name}
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-right text-blue-600 dark:text-blue-400">
                    {state.basic_price} <span className="text-gray-600 dark:text-gray-400">DHS</span>
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-right text-purple-600 dark:text-purple-400">
                    {state.epic_price} <span className="text-gray-600 dark:text-gray-400">DHS</span>
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-right text-emerald-600 dark:text-emerald-400">
                    {state.ultimate_price} <span className="text-gray-600 dark:text-gray-400">DHS</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(state)}
                        className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all hover:scale-110 active:scale-95"
                        title="Edit state"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(state)}
                        className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all hover:scale-110 active:scale-95"
                        title="Delete state"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Total States</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{states.length}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Average Basic Price</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {Math.round(states.reduce((sum, s) => sum + s.basic_price, 0) / states.length || 0)} <span className="text-lg text-gray-600 dark:text-gray-400">DHS</span>
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Average Ultimate Price</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {Math.round(states.reduce((sum, s) => sum + s.ultimate_price, 0) / states.length || 0)} <span className="text-lg text-gray-600 dark:text-gray-400">DHS</span>
          </p>
        </div>
      </div>
    </div>
  );
}
