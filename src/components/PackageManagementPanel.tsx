import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, AlertCircle, Check } from 'lucide-react';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from '../utils/toast';

interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FormData {
  name: string;
  price: string;
  description: string;
  features: string;
  is_active: boolean;
}

export default function PackageManagementPanel() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    price: '',
    description: '',
    features: '',
    is_active: true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const packageRef = collection(db, 'packages');
      const snapshot = await getDocs(packageRef);
      const packagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Package[];

      packagesData.sort((a, b) => {
        if (a.is_active !== b.is_active) {
          return b.is_active ? 1 : -1;
        }
        return a.name.localeCompare(b.name);
      });
      setPackages(packagesData);
    } catch (error: any) {
      console.error('Error loading packages:', error);
      
      // Better error messages for common issues
      if (error.code === 'permission-denied') {
        toast.error('Permission denied. Please ensure Firestore rules are deployed correctly.');
        console.error('Firestore Rules Update Required:', {
          issue: 'Missing or insufficient permissions for packages collection',
          solution: 'Deploy the updated firestore.rules file to Firebase'
        });
      } else {
        toast.error('Failed to load packages: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      features: '',
      is_active: true,
    });
    setEditingId(null);
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (pkg: Package) => {
    setFormData({
      name: pkg.name,
      price: String(pkg.price),
      description: pkg.description,
      features: pkg.features.join('\n'),
      is_active: pkg.is_active,
    });
    setEditingId(pkg.id);
    setShowForm(true);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a package name');
      return false;
    }
    if (!formData.price || parseInt(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return false;
    }
    if (!formData.features.trim()) {
      toast.error('Please add at least one feature');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const features = formData.features
        .split('\n')
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      const timestamp = new Date().toISOString();
      let packageId = editingId;

      if (editingId) {
        // Update existing
        const packageRef = doc(db, 'packages', editingId);
        await updateDoc(packageRef, {
          name: formData.name,
          price: parseInt(formData.price),
          description: formData.description,
          features: features,
          is_active: formData.is_active,
          updated_at: timestamp,
        });
        toast.success('Package updated successfully');
      } else {
        // Create new - generate ID from name
        packageId = formData.name.toLowerCase().replace(/\s+/g, '-');
        const packageRef = doc(db, 'packages', packageId);
        
        // Check if package already exists
        const existingPkg = packages.find((p) => p.id === packageId);
        if (existingPkg) {
          toast.error('A package with this name already exists');
          return;
        }

        await setDoc(packageRef, {
          name: formData.name,
          price: parseInt(formData.price),
          description: formData.description,
          features: features,
          is_active: formData.is_active,
          created_at: timestamp,
          updated_at: timestamp,
        });
        toast.success('Package created successfully');
      }

      setShowForm(false);
      resetForm();
      loadPackages();
    } catch (error) {
      console.error('Error saving package:', error);
      toast.error('Failed to save package');
    }
  };

  const handleDelete = async (pkg: Package) => {
    if (!window.confirm(`Are you sure you want to delete "${pkg.name}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'packages', pkg.id));
      toast.success('Package deleted successfully');
      loadPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      toast.error('Failed to delete package');
    }
  };

  const handleToggleActive = async (pkg: Package) => {
    try {
      const packageRef = doc(db, 'packages', pkg.id);
      await updateDoc(packageRef, {
        is_active: !pkg.is_active,
        updated_at: new Date().toISOString(),
      });
      toast.success(`Package ${pkg.is_active ? 'deactivated' : 'activated'} successfully`);
      loadPackages();
    } catch (error) {
      console.error('Error toggling package status:', error);
      toast.error('Failed to update package status');
    }
  };

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterActive === 'all' || (filterActive === 'active' ? pkg.is_active : !pkg.is_active);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="relative inline-block">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 dark:border-purple-900"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600 dark:border-purple-400 absolute top-0 left-0"></div>
        </div>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 font-medium">Loading packages...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Package Management</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all available service packages</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-bold shadow-lg hover:shadow-xl hover:scale-105 whitespace-nowrap"
        >
          <Plus className="h-5 w-5" />
          Add New Package
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by package name or description..."
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-all"
          />
        </div>
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white font-semibold appearance-none transition-all"
        >
          <option value="all">All Packages</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 md:p-8 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {editingId ? (
                  <>
                    <Edit2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    Edit Package
                  </>
                ) : (
                  <>
                    <Plus className="h-6 w-6 text-green-600 dark:text-green-400" />
                    Add New Package
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
              {/* Package Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Package Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Basic, Premium, Ultimate"
                  disabled={!!editingId}
                  className={`w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white font-semibold focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                    editingId ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-700' : ''
                  }`}
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Price (DHS) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                    placeholder="0"
                    min="0"
                    className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-all font-semibold"
                  />
                  <span className="text-lg font-bold text-gray-700 dark:text-gray-300 min-w-fit">DHS</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this package"
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-all resize-none"
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Features * (One per line)
                </label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData((prev) => ({ ...prev, features: e.target.value }))}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-all font-mono text-sm resize-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Enter each feature on a new line
                </p>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                  Active Package (visible to customers)
                </label>
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
                {editingId ? 'Update Package' : 'Create Package'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Packages Grid/Cards */}
      {filteredPackages.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
            {packages.length === 0 ? 'No packages created yet' : 'No packages match your search'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl hover:scale-105 border-2 ${
                pkg.is_active
                  ? 'bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-700'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 opacity-75'
              }`}
            >
              {/* Status Badge */}
              <div className="relative">
                <div className={`h-12 bg-gradient-to-r ${pkg.is_active ? 'from-purple-500 to-pink-500' : 'from-gray-400 to-gray-500'}`} />
                <div className="absolute top-2 right-2 flex gap-2">
                  {pkg.is_active && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-white/90 dark:bg-gray-900/90 rounded-full text-xs font-bold text-green-600 dark:text-green-400">
                      <Check className="h-3 w-3" />
                      Active
                    </div>
                  )}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 space-y-4">
                {/* Name and Price */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{pkg.name}</h3>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                    {pkg.price} <span className="text-lg text-gray-600 dark:text-gray-400">DHS</span>
                  </p>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {pkg.description}
                </p>

                {/* Features */}
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                    Features ({pkg.features.length})
                  </p>
                  <ul className="space-y-1">
                    {pkg.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <Check className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {pkg.features.length > 3 && (
                      <li className="text-xs text-gray-500 dark:text-gray-400 italic">
                        +{pkg.features.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>

                {/* Meta Info */}
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p>Created: {new Date(pkg.created_at).toLocaleDateString()}</p>
                  <p>Updated: {new Date(pkg.updated_at).toLocaleDateString()}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleEdit(pkg)}
                    className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all font-bold text-sm flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(pkg)}
                    className={`flex-1 px-3 py-2 rounded-lg transition-all font-bold text-sm flex items-center justify-center gap-2 hover:scale-105 active:scale-95 ${
                      pkg.is_active
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                    }`}
                  >
                    {pkg.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(pkg)}
                    className="flex-1 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all font-bold text-sm flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Total Packages</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{packages.length}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Active Packages</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {packages.filter((p) => p.is_active).length}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Inactive Packages</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            {packages.filter((p) => !p.is_active).length}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Average Price</p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {Math.round(packages.reduce((sum, p) => sum + p.price, 0) / packages.length || 0)} <span className="text-lg text-gray-600 dark:text-gray-400">DHS</span>
          </p>
        </div>
      </div>
    </div>
  );
}
