import { useEffect, useState } from 'react';
import { Download, LogOut, Filter, Search, RefreshCw, X, FileJson, FileText, CreditCard, Shield, TrendingUp, Clock, CheckCircle, Package as PackageIcon } from 'lucide-react';
import ExcelJS from 'exceljs';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { updateDocument, getPackage } from '../lib/firebaseUtils';
import { collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getDocs } from 'firebase/firestore';
import { US_STATES } from '../utils/constants';
import PaymentVerificationPanel from '../components/PaymentVerificationPanel';

interface LLCApplication {
  id: string;
  user_id: string;
  package_id: string;
  state: string;
  company_name: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  form_data: Record<string, unknown>;
  payment_status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

interface AdminDashboardPageProps {
  onNavigate: (page: string) => void;
}

export default function AdminDashboardPage({ onNavigate }: AdminDashboardPageProps) {
  const { isAdmin, loading: adminLoading, signOut } = useAdminAuth();
  const [applications, setApplications] = useState<LLCApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<LLCApplication | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'applications' | 'payments'>('applications');
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleSections(prev => new Set(prev).add(entry.target.id));
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    
    const scrollElements = document.querySelectorAll('[data-scroll]');
    scrollElements.forEach(el => {
      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach(obs => obs.disconnect());
    };
  }, []);

  useEffect(() => {
    if (adminLoading) return;
    
    if (!isAdmin) {
      onNavigate('admin-login');
      return;
    }
    
    loadApplications();
  }, [isAdmin, adminLoading, onNavigate]);

  useEffect(() => {
    if (selectedApplication) {
      loadPackageDetails(selectedApplication.package_id);
    } else {
      setSelectedPackage(null);
    }
  }, [selectedApplication]);

  const loadPackageDetails = async (packageId: string) => {
    try {
      const pkg = await getPackage(packageId);
      setSelectedPackage(pkg);
    } catch (error) {
      console.error('Error loading package:', error);
      setSelectedPackage(null);
    }
  };

  const loadApplications = async () => {
    setLoading(true);
    try {
      const applicationsRef = collection(db, 'llc_applications');
      const snapshot = await getDocs(applicationsRef);
      const apps = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as LLCApplication[];
      
      apps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setApplications(apps);
    } catch (error) {
      console.error('Error loading applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onNavigate('home');
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const success = await updateDocument('llc_applications', id, { status: newStatus });
      if (success) {
        loadApplications();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Company Name', 'State', 'Status', 'Payment Status'];
    const rows = filteredApplications.map((app) => [
      new Date(app.created_at).toLocaleDateString(),
      app.company_name,
      US_STATES.find((s) => s.code === app.state)?.name || app.state,
      app.status,
      app.payment_status,
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `llc-applications-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToExcel = async () => {
    try {
      const headers = [
        'Order Date', 'Company', 'State', 'Status', 'Payment',
        'Package', 'Price', 'Contact', 'Email', 'Phone',
        'Address', 'City', 'Zip', 'Biz Type', 'Purpose', 'User ID', 'Package ID'
      ];

      const data = await Promise.all(
        filteredApplications.map(async (app) => {
          const pkg = await getPackage(app.package_id);
          const formData = app.form_data as Record<string, any>;
          const stateFullName = US_STATES.find((s) => s.code === app.state)?.name || app.state;
          
          return [
            new Date(app.created_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }),
            app.company_name || '',
            stateFullName || '',
            app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : '',
            app.payment_status ? app.payment_status.charAt(0).toUpperCase() + app.payment_status.slice(1) : '',
            pkg?.name || '',
            Number(pkg?.price) || 0,
            formData?.memberName || '',
            formData?.email || '',
            formData?.phone || '',
            formData?.address || '',
            formData?.city || '',
            formData?.zipCode || '',
            formData?.businessType || '',
            formData?.businessPurpose || '',
            app.user_id || '',
            app.package_id || '',
          ];
        })
      );

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('All Clients', { pageSetup: { paperSize: 9, orientation: 'landscape' } });

      const headerRow = worksheet.addRow(headers);
      
      headerRow.font = { 
        bold: true, 
        color: { argb: 'FFFFFFFF' }, 
        size: 13, 
        name: 'Calibri',
        italic: false
      };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF006B63' } };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      headerRow.height = 35;

      headerRow.eachCell((cell) => {
        cell.border = {
          left: { style: 'medium', color: { argb: 'FF004D47' } },
          right: { style: 'medium', color: { argb: 'FF004D47' } },
          top: { style: 'medium', color: { argb: 'FF004D47' } },
          bottom: { style: 'medium', color: { argb: 'FF004D47' } },
        };
      });

      data.forEach((row, rowIndex) => {
        const excelRow = worksheet.addRow(row);
        excelRow.height = 32;

        const isEvenRow = rowIndex % 2 === 0;
        const lightBg = 'FFF8FFFE';
        const whiteBg = 'FFFFFFFF';
        const defaultBg = isEvenRow ? lightBg : whiteBg;

        excelRow.eachCell((cell, colNumber) => {
          const value = cell.value;
          let cellBg = defaultBg;
          let cellTextColor = 'FF1A1A1A';
          let isBold = false;
          let fontSize = 11;

          if (colNumber === 4) {
            if (value === 'Pending') {
              cellBg = 'FFFEF5E7';
              cellTextColor = 'FFD68910';
            } else if (value === 'Processing') {
              cellBg = 'FFE1F5FE';
              cellTextColor = 'FF0277BD';
            } else if (value === 'Completed') {
              cellBg = 'FFC8E6C9';
              cellTextColor = 'FF1B5E20';
            } else if (value === 'Rejected') {
              cellBg = 'FFFFEBEE';
              cellTextColor = 'FFC62828';
            }
            isBold = true;
            fontSize = 12;
          }
          else if (colNumber === 5) {
            if (value === 'Pending') {
              cellBg = 'FFFFF3E0';
              cellTextColor = 'FFE65100';
            } else if (value === 'Completed' || value === 'Paid') {
              cellBg = 'FFB2DFDB';
              cellTextColor = 'FF00695C';
            } else if (value === 'Failed') {
              cellBg = 'FFEF5350';
              cellTextColor = 'FFFFFFFF';
            }
            isBold = true;
            fontSize = 12;
          }
          else if (colNumber === 2) {
            cellBg = isEvenRow ? 'FFF0FFFE' : 'FFE0F2F1';
            cellTextColor = 'FF00695C';
            isBold = true;
            fontSize = 12;
          }
          else if (colNumber === 6) {
            cellBg = isEvenRow ? 'FFF1F8E9' : 'FFE8F5E9';
            cellTextColor = 'FF558B2F';
            isBold = true;
            fontSize = 11;
          }
          else if (colNumber === 7) {
            cellBg = isEvenRow ? 'FFFCE4EC' : 'FFF3E5F5';
            cellTextColor = 'FF6A1B9A';
            isBold = true;
            fontSize = 11;
          }
          else if (colNumber === 3) {
            cellBg = isEvenRow ? 'FFF5F5F5' : 'FFFFFFFF';
            cellTextColor = 'FF424242';
            fontSize = 11;
          }
          else if (colNumber === 9) {
            cellTextColor = 'FF0288D1';
            fontSize = 10;
          }

          cell.font = { 
            bold: isBold, 
            color: { argb: cellTextColor }, 
            size: fontSize,
            name: 'Calibri'
          };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cellBg } };
          cell.alignment = { 
            horizontal: [7, 1, 3, 4, 5, 12].includes(colNumber) ? 'center' : (colNumber === 7 ? 'right' : 'left'), 
            vertical: 'middle', 
            wrapText: true,
            indent: colNumber === 7 ? 1 : 0
          };
          cell.border = {
            left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
            right: { style: 'thin', color: { argb: 'FFD0D0D0' } },
            top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
            bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          };

          if (colNumber === 7) {
            cell.numFmt = '$#,##0.00';
          }
        });
      });

      worksheet.columns = [
        { width: 14 }, { width: 22 }, { width: 16 }, { width: 15 }, { width: 15 },
        { width: 19 }, { width: 13 }, { width: 21 }, { width: 27 }, { width: 15 },
        { width: 25 }, { width: 15 }, { width: 13 }, { width: 16 }, { width: 21 },
        { width: 29 }, { width: 21 }
      ];

      worksheet.views = [{ state: 'frozen', ySplit: 1 }];
      worksheet.pageSetup.margins = { left: 0.4, right: 0.4, top: 0.6, bottom: 0.6, header: 0, footer: 0 };
      worksheet.pageSetup.fitToPage = true;
      worksheet.pageSetup.fitToHeight = 1;

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `LLC-Applications-${new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Failed to export Excel file. Please try again.');
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch = searchQuery === '' ||
      app.company_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800';
      case 'processing':
        return 'bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800';
      case 'rejected':
        return 'bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800';
      default:
        return 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800';
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    processing: applications.filter((a) => a.status === 'processing').length,
    completed: applications.filter((a) => a.status === 'completed').length,
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 dark:border-red-900"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600 dark:border-red-400 absolute top-0 left-0"></div>
            </div>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 font-medium">Verifying admin access...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <Shield className="h-20 w-20 text-red-400 mx-auto mb-4" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</p>
            <p className="text-lg text-gray-600 dark:text-gray-400">You don't have access to the admin dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pb-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-600 via-orange-600 to-pink-600 dark:from-red-900 dark:via-orange-900 dark:to-pink-900 pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItMnptMCAydjJ6bTAtMnYyem0yIDB2MnptLTIgMHYyem0yIDB2MnptLTIgMHYyem0yIDB2MnptLTIgMHYyem0yIDB2MnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-semibold border border-white/30 mb-6">
                <Shield className="h-4 w-4" />
                <span>Admin Panel</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                Admin Dashboard
              </h1>
              <p className="text-xl md:text-2xl text-red-50">
                Manage LLC formation submissions
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={loadApplications}
                className="group px-6 py-3 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 rounded-xl hover:bg-white/20 transition-all font-semibold flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleSignOut}
                className="group px-6 py-3 bg-white text-red-600 rounded-xl hover:bg-red-50 transition-all font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" className="fill-gray-50 dark:fill-gray-900"/>
          </svg>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12" id="stats" data-scroll>
          {[
            { icon: FileText, title: 'Total Orders', value: stats.total, color: 'from-blue-500 to-cyan-500', bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20', borderColor: 'border-blue-200 dark:border-blue-800' },
            { icon: Clock, title: 'Pending', value: stats.pending, color: 'from-yellow-500 to-orange-500', bgColor: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20', borderColor: 'border-yellow-200 dark:border-yellow-800' },
            { icon: TrendingUp, title: 'Processing', value: stats.processing, color: 'from-purple-500 to-pink-500', bgColor: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20', borderColor: 'border-purple-200 dark:border-purple-800' },
            { icon: CheckCircle, title: 'Completed', value: stats.completed, color: 'from-green-500 to-emerald-500', bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20', borderColor: 'border-green-200 dark:border-green-800' },
          ].map((stat, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${stat.bgColor} rounded-2xl p-8 border ${stat.borderColor} transition-all duration-700 hover:scale-105 hover:shadow-xl ${
                visibleSections.has('stats') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: visibleSections.has('stats') ? `${index * 150}ms` : '0ms' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">{stat.title}</h3>
                <div className={`bg-gradient-to-br ${stat.color} w-12 h-12 rounded-xl flex items-center justify-center shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className={`text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700" id="main-content" data-scroll>
          {/* Tabs */}
          <div className="flex gap-4 border-b-2 border-gray-200 dark:border-gray-700 px-6 pt-6">
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-6 py-4 font-bold transition-all flex items-center gap-2 rounded-t-xl ${
                activeTab === 'applications'
                  ? 'text-red-600 dark:text-red-400 border-b-4 border-red-600 bg-red-50 dark:bg-red-900/10'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <FileText className="h-5 w-5" />
              Applications
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-6 py-4 font-bold transition-all flex items-center gap-2 rounded-t-xl ${
                activeTab === 'payments'
                  ? 'text-red-600 dark:text-red-400 border-b-4 border-red-600 bg-red-50 dark:bg-red-900/10'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <CreditCard className="h-5 w-5" />
              Payments
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'applications' ? (
            <div className="p-8">
              {/* Filters and Search */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-8 mb-8 border-b-2 border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search companies..."
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="pl-12 pr-8 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white font-semibold min-w-[180px] appearance-none cursor-pointer focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={exportToCSV}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-bold shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <Download className="h-5 w-5" />
                    <span>CSV</span>
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-bold shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <FileJson className="h-5 w-5" />
                    <span>Excel</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border-2 border-gray-200 dark:border-gray-700">
                {loading ? (
                  <div className="text-center py-32">
                    <div className="relative inline-block">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 dark:border-red-900"></div>
                      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600 dark:border-red-400 absolute top-0 left-0"></div>
                    </div>
                    <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 font-medium">Loading applications...</p>
                  </div>
                ) : filteredApplications.length === 0 ? (
                  <div className="text-center py-32">
                    <FileText className="h-20 w-20 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Applications Found</h3>
                    <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 border-b-2 border-gray-300 dark:border-gray-600">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">State</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Payment</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-gray-200 dark:divide-gray-700">
                      {filteredApplications.map((app) => (
                        <tr 
                          key={app.id} 
                          onClick={() => setSelectedApplication(app)}
                          className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 dark:hover:from-gray-700 dark:hover:to-blue-900/20 cursor-pointer transition-all duration-300"
                        >
                          <td className="px-6 py-5 text-sm font-semibold text-gray-900 dark:text-white">
                            {new Date(app.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-5 text-sm font-bold text-gray-900 dark:text-white">
                            {app.company_name}
                          </td>
                          <td className="px-6 py-5 text-sm text-gray-900 dark:text-white">
                            {US_STATES.find((s) => s.code === app.state)?.name}
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${getStatusColor(app.status)}`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${app.payment_status === 'completed' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/20 dark:to-emerald-900/20 dark:text-green-200 border border-green-200 dark:border-green-800' : 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 dark:from-yellow-900/20 dark:to-orange-900/20 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800'}`}>
                              {app.payment_status}
                            </span>
                          </td>
                          <td 
                            className="px-6 py-5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <select
                              value={app.status}
                              onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                              className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold dark:bg-gray-700 dark:text-white hover:border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500 transition-all"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="completed">Completed</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Pending Payment Verification</h3>
              <PaymentVerificationPanel />
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-200 dark:border-gray-700 animate-scale-in">
              <div className="sticky top-0 bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-900 dark:to-orange-900 flex items-center justify-between p-8 z-10">
                <div>
                  <h2 className="text-3xl font-bold text-white">
                    Order Details
                  </h2>
                  <p className="text-red-100 mt-1">{selectedApplication.company_name}</p>
                </div>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-white hover:bg-white/20 p-2 rounded-xl transition-all"
                >
                  <X className="h-7 w-7" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { label: 'Company Name', value: selectedApplication.company_name },
                    { label: 'State', value: `${US_STATES.find((s) => s.code === selectedApplication.state)?.name} (${selectedApplication.state})` },
                    { label: 'Status', value: selectedApplication.status, isStatus: true },
                    { label: 'Payment Status', value: selectedApplication.payment_status, isPayment: true },
                    { label: 'Package ID', value: selectedApplication.package_id },
                    { label: 'Submitted Date', value: new Date(selectedApplication.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
                  ].map((item, index) => (
                    <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/10 p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-bold mb-2">{item.label}</p>
                      {item.isStatus ? (
                        <span className={`inline-block px-4 py-2 text-sm font-bold rounded-full ${getStatusColor(selectedApplication.status)}`}>
                          {item.value.charAt(0).toUpperCase() + item.value.slice(1)}
                        </span>
                      ) : item.isPayment ? (
                        <span className={`inline-block px-4 py-2 text-sm font-bold rounded-full ${selectedApplication.payment_status === 'completed' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/20 dark:to-emerald-900/20 dark:text-green-200 border border-green-200 dark:border-green-800' : 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 dark:from-yellow-900/20 dark:to-orange-900/20 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800'}`}>
                          {item.value.charAt(0).toUpperCase() + item.value.slice(1)}
                        </span>
                      ) : (
                        <p className="text-lg font-bold text-gray-900 dark:text-white break-words">
                          {item.value}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Package Details */}
                {selectedPackage && (
                  <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                      <PackageIcon className="h-6 w-6 text-red-600" />
                      Package Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 p-6 rounded-2xl border-2 border-purple-200 dark:border-purple-800">
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-bold mb-2">Package Name</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedPackage.name}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 p-6 rounded-2xl border-2 border-green-200 dark:border-green-800">
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-bold mb-2">Price</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">${selectedPackage.price}</p>
                      </div>
                      {selectedPackage.description && (
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 p-6 rounded-2xl md:col-span-2 border-2 border-blue-200 dark:border-blue-800">
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-bold mb-2">Description</p>
                          <p className="text-gray-900 dark:text-white">{selectedPackage.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Form Data */}
                {selectedApplication.form_data && Object.keys(selectedApplication.form_data).length > 0 && (
                  <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Form Data</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(selectedApplication.form_data).map(([key, value]) => (
                        <div key={key} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-6 rounded-2xl border border-gray-200 dark:border-gray-600">
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-bold mb-2 capitalize">
                            {key.replace(/_/g, ' ')}
                          </p>
                          <p className="text-gray-900 dark:text-white break-words font-semibold">
                            {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-8 flex gap-4">
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 text-gray-900 dark:text-white rounded-xl hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-500 dark:hover:to-gray-600 transition-all font-bold shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0) translateX(0); 
          }
          50% { 
            transform: translateY(-30px) translateX(15px); 
          }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        @keyframes float-delayed {
          0%, 100% { 
            transform: translateY(0) translateX(0); 
          }
          50% { 
            transform: translateY(30px) translateX(-15px); 
          }
        }
        
        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}