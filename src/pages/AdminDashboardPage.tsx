import { useEffect, useState } from 'react';
import { Download, LogOut, Filter, Search, RefreshCw, X, FileJson, FileText, CreditCard, Shield, TrendingUp, Clock, CheckCircle, Package as PackageIcon, Edit2, Trash2, ChevronDown, MessageSquare, Mail, Trash } from 'lucide-react';
import ExcelJS from 'exceljs';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { updateDocument, getPackage, getAllPackages, getCollectionData } from '../lib/firebaseUtils';
import { toast } from '../utils/toast';
import { collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getDocs, deleteDoc, doc } from 'firebase/firestore';
import { US_STATES } from '../utils/constants';
import PaymentVerificationPanel from '../components/PaymentVerificationPanel';
import SendMessageComponent from '../components/SendMessageComponent';
import MessagesDisplay from '../components/MessagesDisplay';
import StateManagementPanel from '../components/StateManagementPanel';
import PackageManagementPanel from '../components/PackageManagementPanel';
import PaymentMethodsPanel from '../components/PaymentMethodsPanel';
import { useActivityLogs } from '../hooks/useActivityLogs';

interface LLCApplication {
  id: string;
  user_id: string;
  package_id: string;
  state: string;
  state_name?: string;
  company_name: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  form_data: Record<string, unknown>;
  payment_status: 'pending' | 'advance' | 'paid';
  created_at: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

interface AdminDashboardPageProps {
  onNavigate: (page: string) => void;
}

export default function AdminDashboardPage({ onNavigate }: AdminDashboardPageProps) {
  const { isAdmin, loading: adminLoading, signOut } = useAdminAuth();
  const { activities } = useActivityLogs(50);
  const [applications, setApplications] = useState<LLCApplication[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [availableStates, setAvailableStates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [packageFilter, setPackageFilter] = useState('all');
  const [activityFilterQuery, setActivityFilterQuery] = useState('');
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [contactStatusFilter, setContactStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<LLCApplication | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'applications' | 'payments' | 'activity' | 'contacts' | 'states' | 'packages' | 'payment-methods'>('applications');
  const [modalTab, setModalTab] = useState<'details' | 'messages'>('details');
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);

  // Hide/Show header when modal opens/closes
  useEffect(() => {
    const header = document.querySelector('header') || document.querySelector('nav');
    
    if (selectedApplication && header) {
      // Hide header
      (header as HTMLElement).style.display = 'none';
    } else if (!selectedApplication && header) {
      // Show header
      (header as HTMLElement).style.display = '';
    }

    // Cleanup: ensure header is visible when component unmounts
    return () => {
      if (header) {
        (header as HTMLElement).style.display = '';
      }
    };
  }, [selectedApplication]);

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
  }, [applications]);

  useEffect(() => {
    if (adminLoading) return;
    
    if (!isAdmin) {
      onNavigate('admin-login');
      return;
    }
    
    loadApplications();
    loadContactMessages();
    loadAvailableStates();
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
      // Load packages
      const allPackages = await getAllPackages();
      setPackages(allPackages);
      
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

  const loadContactMessages = async () => {
    try {
      const messagesRef = collection(db, 'contact_messages');
      const snapshot = await getDocs(messagesRef);
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ContactMessage[];
      
      messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setContactMessages(messages);
    } catch (error) {
      console.error('Error loading contact messages:', error);
      setContactMessages([]);
    }
  };

  const loadAvailableStates = async () => {
    try {
      // Load ONLY states configured in State Pricing Management (package_state collection)
      const configuredStates = await getCollectionData<any>('package_state');
      
      // Map to standard format
      const states = configuredStates.map((state: any) => ({
        code: state.state,
        name: state.name
      }));
      
      setAvailableStates(states);
    } catch (error) {
      console.error('Error loading states:', error);
      // Fallback to empty (no states available)
      setAvailableStates([]);
    }
  };

  const getStateDisplayName = (application: any): string => {
    if (!application) return 'N/A';
    
    const stateCode = application.state?.trim().toUpperCase() || '';
    
    // If state_name exists, use it (priority)
    if (application.state_name) {
      return `${application.state_name} (${stateCode})`;
    }
    
    // If no state code, return N/A
    if (!stateCode) {
      return 'N/A';
    }
    
    // Try to find in availableStates (should always have US_STATES)
    const foundState = availableStates.find((s: any) => {
      return s.code?.trim().toUpperCase() === stateCode;
    });
    
    if (foundState) {
      return `${foundState.name} (${stateCode})`;
    }
    
    // This shouldn't happen now, but return code as fallback
    return stateCode;
  };

  const deleteContactMessage = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this contact message?')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'contact_messages', id));
      toast.success('Contact message deleted successfully');
      loadContactMessages();
    } catch (error) {
      console.error('Error deleting contact message:', error);
      toast.error('Failed to delete contact message');
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
        toast.success('Status updated successfully');
        loadApplications();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleUpdatePaymentStatus = async (id: string, newPaymentStatus: string) => {
    try {
      const success = await updateDocument('llc_applications', id, { payment_status: newPaymentStatus });
      if (success) {
        toast.success('Payment status updated successfully');
        loadApplications();
      } else {
        toast.error('Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
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
      toast.success('Excel file exported successfully');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Failed to export Excel file. Please try again.');
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch = searchQuery === '' ||
      app.company_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by package name
    let matchesPackage = true;
    if (packageFilter !== 'all') {
      const appPackage = packages.find(p => p.id === app.package_id);
      matchesPackage = appPackage && appPackage.name.toLowerCase().includes(packageFilter.toLowerCase());
    }
    
    return matchesStatus && matchesSearch && matchesPackage;
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800';
      case 'advance':
        return 'bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-800';
      default:
        return 'bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800';
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
          <div className="flex gap-4 border-b-2 border-gray-200 dark:border-gray-700 px-6 pt-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-6 py-4 font-bold transition-all flex items-center gap-2 rounded-t-xl whitespace-nowrap ${
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
              className={`px-6 py-4 font-bold transition-all flex items-center gap-2 rounded-t-xl whitespace-nowrap ${
                activeTab === 'payments'
                  ? 'text-red-600 dark:text-red-400 border-b-4 border-red-600 bg-red-50 dark:bg-red-900/10'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <CreditCard className="h-5 w-5" />
              Payments
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-6 py-4 font-bold transition-all flex items-center gap-2 rounded-t-xl whitespace-nowrap ${
                activeTab === 'activity'
                  ? 'text-red-600 dark:text-red-400 border-b-4 border-red-600 bg-red-50 dark:bg-red-900/10'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <Clock className="h-5 w-5" />
              Activity Log
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-6 py-4 font-bold transition-all flex items-center gap-2 rounded-t-xl whitespace-nowrap ${
                activeTab === 'contacts'
                  ? 'text-red-600 dark:text-red-400 border-b-4 border-red-600 bg-red-50 dark:bg-red-900/10'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <Mail className="h-5 w-5" />
              Contact Submissions
            </button>
            <button
              onClick={() => setActiveTab('states')}
              className={`px-6 py-4 font-bold transition-all flex items-center gap-2 rounded-t-xl whitespace-nowrap ${
                activeTab === 'states'
                  ? 'text-red-600 dark:text-red-400 border-b-4 border-red-600 bg-red-50 dark:bg-red-900/10'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <PackageIcon className="h-5 w-5" />
              State Pricing
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={`px-6 py-4 font-bold transition-all flex items-center gap-2 rounded-t-xl whitespace-nowrap ${
                activeTab === 'packages'
                  ? 'text-red-600 dark:text-red-400 border-b-4 border-red-600 bg-red-50 dark:bg-red-900/10'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <PackageIcon className="h-5 w-5" />
              Packages
            </button>
            <button
              onClick={() => setActiveTab('payment-methods')}
              className={`px-6 py-4 font-bold transition-all flex items-center gap-2 rounded-t-xl whitespace-nowrap ${
                activeTab === 'payment-methods'
                  ? 'text-red-600 dark:text-red-400 border-b-4 border-red-600 bg-red-50 dark:bg-red-900/10'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <CreditCard className="h-5 w-5" />
              Payment Methods
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
                  <div className="relative">
                    <PackageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      value={packageFilter}
                      onChange={(e) => setPackageFilter(e.target.value)}
                      className="pl-12 pr-8 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white font-semibold min-w-[180px] appearance-none cursor-pointer focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                    >
                      <option value="all">All Packages</option>
                      <option value="basic">Basic</option>
                      <option value="ultimate">Ultimate</option>
                      <option value="epic">Epic</option>
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
                          <td 
                            className="px-6 py-5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <select
                              value={app.payment_status}
                              onChange={(e) => handleUpdatePaymentStatus(app.id, e.target.value)}
                              className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold dark:bg-gray-700 dark:text-white hover:border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500 transition-all"
                            >
                              <option value="pending">Pending</option>
                              <option value="advance">Advance</option>
                              <option value="paid">Paid</option>
                            </select>
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
          ) : activeTab === 'payments' ? (
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Pending Payment Verification</h3>
              <PaymentVerificationPanel />
            </div>
          ) : activeTab === 'activity' ? (
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Order Activity</h3>
              
              {/* Search Filter */}
              <div className="mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Filter by client name or LLC name..."
                    value={activityFilterQuery}
                    onChange={(e) => setActivityFilterQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500 transition-all"
                  />
                </div>
              </div>
              
              {/* Activity Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Edited Orders */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Edit2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Order Updates
                  </h4>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {activities.filter(a => 
                      a.action === 'edited' && (
                        a.application_name.toLowerCase().includes(activityFilterQuery.toLowerCase()) ||
                        a.user_email.toLowerCase().includes(activityFilterQuery.toLowerCase())
                      )
                    ).length > 0 ? (
                      activities.filter(a => 
                        a.action === 'edited' && (
                          a.application_name.toLowerCase().includes(activityFilterQuery.toLowerCase()) ||
                          a.user_email.toLowerCase().includes(activityFilterQuery.toLowerCase())
                        )
                      ).map((activity) => (
                        <div
                          key={activity.id}
                          className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 p-4 rounded-xl border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all"
                        >
                          <div 
                            className="flex items-start justify-between cursor-pointer"
                            onClick={() => setExpandedActivityId(expandedActivityId === activity.id ? null : activity.id)}
                          >
                            <div className="flex-1">
                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-1 font-semibold">
                                {activity.application_name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                by {activity.user_email}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {new Date(activity.timestamp).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <ChevronDown 
                              className={`h-5 w-5 text-blue-600 dark:text-blue-400 transition-transform ${expandedActivityId === activity.id ? 'rotate-180' : ''}`}
                            />
                          </div>
                          
                          {expandedActivityId === activity.id && activity.changes && (
                            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                              <div className="bg-white dark:bg-gray-900/50 p-3 rounded-lg text-xs font-mono text-gray-600 dark:text-gray-300 overflow-x-auto max-h-40 overflow-y-auto">
                                <pre>{JSON.stringify(activity.changes, null, 2)}</pre>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Clock className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p>No order updates yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Deleted Orders */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                    Deleted Orders
                  </h4>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {activities.filter(a => 
                      a.action === 'deleted' && (
                        a.application_name.toLowerCase().includes(activityFilterQuery.toLowerCase()) ||
                        a.user_email.toLowerCase().includes(activityFilterQuery.toLowerCase())
                      )
                    ).length > 0 ? (
                      activities.filter(a => 
                        a.action === 'deleted' && (
                          a.application_name.toLowerCase().includes(activityFilterQuery.toLowerCase()) ||
                          a.user_email.toLowerCase().includes(activityFilterQuery.toLowerCase())
                        )
                      ).map((activity) => (
                        <div
                          key={activity.id}
                          className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10 p-4 rounded-xl border border-red-200 dark:border-red-800 hover:shadow-md transition-all"
                        >
                          <div 
                            className="flex items-start justify-between cursor-pointer"
                            onClick={() => setExpandedActivityId(expandedActivityId === activity.id ? null : activity.id)}
                          >
                            <div className="flex-1">
                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-1 font-semibold">
                                {activity.application_name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                by {activity.user_email}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {new Date(activity.timestamp).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <ChevronDown 
                              className={`h-5 w-5 text-red-600 dark:text-red-400 transition-transform ${expandedActivityId === activity.id ? 'rotate-180' : ''}`}
                            />
                          </div>
                          
                          {expandedActivityId === activity.id && activity.changes && (
                            <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800">
                              <div className="bg-white dark:bg-gray-900/50 p-3 rounded-lg text-xs font-mono text-gray-600 dark:text-gray-300 overflow-x-auto max-h-40 overflow-y-auto">
                                <pre>{JSON.stringify(activity.changes, null, 2)}</pre>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Clock className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p>No deleted orders</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'contacts' ? (
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Contact Submissions</h3>
              
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-8 mb-8 border-b-2 border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={contactSearchQuery}
                      onChange={(e) => setContactSearchQuery(e.target.value)}
                      placeholder="Search by name, email, or subject..."
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500 transition-all"
                    />
                  </div>
                  <select
                    value={contactStatusFilter}
                    onChange={(e) => setContactStatusFilter(e.target.value)}
                    className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white dark:bg-gray-700 font-semibold hover:border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500 transition-all"
                  >
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                  </select>
                </div>
                <button
                  onClick={loadContactMessages}
                  className="group px-6 py-3 bg-red-600 dark:bg-red-700 text-white rounded-xl hover:bg-red-700 dark:hover:bg-red-600 transition-all font-semibold flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <RefreshCw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Contact Messages Table */}
              {contactMessages.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b-2 border-gray-200 dark:border-gray-700">
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Subject</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contactMessages
                        .filter(msg => {
                          const matchesSearch = 
                            msg.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
                            msg.email.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
                            msg.subject.toLowerCase().includes(contactSearchQuery.toLowerCase());
                          
                          const matchesStatus = contactStatusFilter === 'all' || msg.status === contactStatusFilter;
                          
                          return matchesSearch && matchesStatus;
                        })
                        .map((msg) => (
                          <tr 
                            key={msg.id}
                            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
                          >
                            <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-400">
                              {new Date(msg.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="px-6 py-5 text-sm font-semibold text-gray-900 dark:text-white">
                              {msg.name}
                            </td>
                            <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-400">
                              <a 
                                href={`mailto:${msg.email}`}
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {msg.email}
                              </a>
                            </td>
                            <td className="px-6 py-5 text-sm text-gray-900 dark:text-white font-medium">
                              {msg.subject}
                            </td>
                            <td className="px-6 py-5">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                msg.status === 'new' 
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                  : msg.status === 'read'
                                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                                  : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              }`}>
                                {msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    const messageText = `Name: ${msg.name}\nEmail: ${msg.email}\nSubject: ${msg.subject}\n\nMessage:\n${msg.message}`;
                                    alert(messageText);
                                  }}
                                  className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
                                  title="View message"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => deleteContactMessage(msg.id)}
                                  className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                                  title="Delete message"
                                >
                                  <Trash className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16">
                  <Mail className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">No contact submissions yet</p>
                </div>
              )}
            </div>
          ) : activeTab === 'states' ? (
            <div className="p-8">
              <StateManagementPanel />
            </div>
          ) : activeTab === 'packages' ? (
            <div className="p-8">
              <PackageManagementPanel />
            </div>
          ) : activeTab === 'payment-methods' ? (
            <div className="p-8">
              <PaymentMethodsPanel />
            </div>
          ) : null}
        </div>

        {/* Detail Modal - FIXED WITH HIDDEN HEADER */}
        {selectedApplication && (
          <div 
            className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/70 to-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 transition-all duration-300 ease-out"
            style={{
              animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={() => setSelectedApplication(null)}
          >
            <div 
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100/20 dark:border-gray-700/30 max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              style={{
                animation: 'slideUp 0.3s ease-out',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <style>{`
                @keyframes fadeIn {
                  from {
                    opacity: 0;
                  }
                  to {
                    opacity: 1;
                  }
                }
                
                @keyframes slideUp {
                  from {
                    opacity: 0;
                    transform: translateY(20px) scale(0.95);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                  }
                }

                .custom-scrollbar::-webkit-scrollbar {
                  width: 8px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                  background: transparent;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: rgba(156, 163, 175, 0.3);
                  border-radius: 4px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: rgba(156, 163, 175, 0.5);
                }

                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: rgba(75, 85, 99, 0.5);
                }

                .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: rgba(75, 85, 99, 0.7);
                }

                .section-divider {
                  position: relative;
                  overflow: hidden;
                }

                .section-divider::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  height: 1px;
                  background: linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.3), transparent);
                }
              `}</style>
              
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-br from-red-600/90 via-orange-600/90 to-pink-600/90 dark:from-red-900/90 dark:via-orange-900/90 dark:to-pink-900/90 backdrop-blur-sm flex flex-col z-10 border-b border-white/10">
                <div className="flex items-center justify-between px-6 py-5">
                  <div>
                    <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                      <FileText className="h-6 w-6" />
                      Order Details
                    </h2>
                    <p className="text-red-100 mt-1 text-sm">{selectedApplication.company_name}</p>
                  </div>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200 group hover:scale-105 active:scale-95"
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5 text-white group-hover:rotate-90 transition-transform duration-200" />
                  </button>
                </div>
                
                {/* Modal Tabs */}
                <div className="flex gap-4 px-6 border-t border-white/10 overflow-x-auto">
                  <button
                    onClick={() => setModalTab('details')}
                    className={`px-4 py-3 font-bold transition-all flex items-center gap-2 whitespace-nowrap border-b-2 ${
                      modalTab === 'details'
                        ? 'text-white border-b-white'
                        : 'text-red-100 border-b-transparent hover:text-white'
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    Details
                  </button>
                  <button
                    onClick={() => setModalTab('messages')}
                    className={`px-4 py-3 font-bold transition-all flex items-center gap-2 whitespace-nowrap border-b-2 ${
                      modalTab === 'messages'
                        ? 'text-white border-b-white'
                        : 'text-red-100 border-b-transparent hover:text-white'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Messages
                  </button>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                {modalTab === 'details' ? (
                  // Details Tab
                  <div className="space-y-6">
                  
                  {/* Basic Info Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2">
                      <div className="w-1 h-5 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                        Basic Information
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { label: 'Company Name', value: selectedApplication.company_name },
                        { label: 'State', value: getStateDisplayName(selectedApplication) },
                        { label: 'Status', value: selectedApplication.status, isStatus: true },
                        { label: 'Payment Status', value: selectedApplication.payment_status, isPayment: true },
                        { label: 'Package ID', value: selectedApplication.package_id },
                        { label: 'Submitted Date', value: new Date(selectedApplication.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
                      ].map((item, index) => (
                        <div key={index} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1.5">{item.label}</p>
                          {item.isStatus ? (
                            <span className={`inline-block px-3 py-1.5 text-xs font-bold rounded-full ${getStatusColor(selectedApplication.status)}`}>
                              {item.value.charAt(0).toUpperCase() + item.value.slice(1)}
                            </span>
                          ) : item.isPayment ? (
                            <span className={`inline-block px-3 py-1.5 text-xs font-bold rounded-full ${getPaymentStatusColor(selectedApplication.payment_status)}`}>
                              {item.value.charAt(0).toUpperCase() + item.value.slice(1)}
                            </span>
                          ) : (
                            <p className="text-sm font-semibold text-gray-900 dark:text-white break-words">
                              {item.value}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Package Details */}
                  {selectedPackage && (
                    <div className="space-y-4 pt-4 section-divider">
                      <div className="flex items-center gap-2 pb-2 pt-2">
                        <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
                          <PackageIcon className="h-4 w-4" />
                          Package Details
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1.5">Package Name</p>
                          <p className="text-base font-bold text-gray-900 dark:text-white">{selectedPackage.name}</p>
                        </div>
                        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1.5">Price</p>
                          <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">${selectedPackage.price}</p>
                        </div>
                        {selectedPackage.description && (
                          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl md:col-span-2 border border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1.5">Description</p>
                            <p className="text-sm text-gray-900 dark:text-white">{selectedPackage.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Form Data */}
                  {selectedApplication.form_data && Object.keys(selectedApplication.form_data).length > 0 && (
                    <div className="space-y-4 pt-4 section-divider">
                      <div className="flex items-center gap-2 pb-2 pt-2">
                        <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                          Form Data
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(selectedApplication.form_data).map(([key, value]) => (
                          <div key={key} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1.5 capitalize">
                              {key.replace(/_/g, ' ')}
                            </p>
                            <p className="text-sm text-gray-900 dark:text-white break-words font-medium">
                              {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  </div>
                ) : (
                  // Messages Tab
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Send Message with Attachments
                      </h3>
                      <SendMessageComponent 
                        applicationId={selectedApplication.id}
                        userId={selectedApplication.user_id}
                        onMessageSent={() => {
                          // Refresh messages if needed
                        }}
                      />
                    </div>
                    
                    <div className="pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Message History
                      </h3>
                      <MessagesDisplay 
                        applicationId={selectedApplication.id}
                        userId={selectedApplication.user_id}
                        isAdmin={true}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 flex gap-3 px-6 py-5 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-t from-gray-50/80 via-white/40 to-transparent dark:from-gray-800/80 dark:via-gray-900/40 backdrop-blur-sm">
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="flex-1 px-5 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 font-medium hover:scale-[1.02] active:scale-[0.98] hover:shadow-sm"
                >
                  Close
                </button>
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