import { useEffect, useState } from 'react';
import { FileText, Clock, CheckCircle, XCircle, LogOut, User, Sparkles, Edit2, Trash2, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAutoTranslate } from '../contexts/TranslationContext';
import { queryCollection, deleteDocument, getDocument } from '../lib/firebaseUtils';
import { where } from 'firebase/firestore';
import { migrateUserIds } from '../lib/migrate-user-ids';
import { US_STATES } from '../utils/constants';
import { toast } from '../utils/toast';
import { showConfirm } from '../utils/confirmDialog';
import { logActivity } from '../lib/activityLog';
import EditApplicationModal from '../components/EditApplicationModal';
import MessagesDisplay from '../components/MessagesDisplay';

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
  updated_at?: string;
}

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { user, loading: authLoading, signOut } = useAuth();
  const [applications, setApplications] = useState<LLCApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [editingApplication, setEditingApplication] = useState<LLCApplication | null>(null);
  const [packageTypes, setPackageTypes] = useState<Record<string, string>>({});

  // Translations
  const { translatedText: welcomeText } = useAutoTranslate('Welcome Back!');
  const { translatedText: dashboardTitle } = useAutoTranslate('My Dashboard');
  const { translatedText: trackAppsText } = useAutoTranslate('Track your LLC formation applications');
  const { translatedText: loadingAppsText } = useAutoTranslate('Loading applications...');
  const { translatedText: noAppsText } = useAutoTranslate('No Applications Yet');
  const { translatedText: noAppsDesc } = useAutoTranslate('You haven\'t submitted any LLC formation applications yet. Start your business journey today!');
  const { translatedText: startFirstAppBtn } = useAutoTranslate('Start Your First Application');
  const { translatedText: awaitingReviewText } = useAutoTranslate('Awaiting Review');
  const { translatedText: awaitingReviewDesc } = useAutoTranslate('Your application is pending review. Please ensure payment is completed to proceed.');
  const { translatedText: submittedOnText } = useAutoTranslate('Submitted on');
  const { translatedText: messagesFromAdminText } = useAutoTranslate('Messages from Admin');
  const { translatedText: contactAdminText } = useAutoTranslate('Contact Admin');
  const { translatedText: signOutText } = useAutoTranslate('Sign Out');
  const { translatedText: completedText } = useAutoTranslate('Completed');
  const { translatedText: inProgressText } = useAutoTranslate('In Progress');
  const { translatedText: pendingText } = useAutoTranslate('Pending');
  const { translatedText: attentionText } = useAutoTranslate('Attention');
  const { translatedText: completePaymentText } = useAutoTranslate('Complete Payment');
  const { translatedText: editText } = useAutoTranslate('Edit');
  const { translatedText: deleteText } = useAutoTranslate('Delete');
  const { translatedText: totalApplicationsText } = useAutoTranslate('Total Applications');
  const { translatedText: completedStatsText } = useAutoTranslate('Completed');
  const { translatedText: inProgressStatsText } = useAutoTranslate('In Progress');
  const { translatedText: packageTypeLabel } = useAutoTranslate('Package Type');
  const { translatedText: orderStatusLabel } = useAutoTranslate('Order Status');
  const { translatedText: paymentLabel } = useAutoTranslate('Payment');
  const { translatedText: applicationCompletedText } = useAutoTranslate('Application Completed');
  const { translatedText: processingApplicationText } = useAutoTranslate('Processing Application');
  const { translatedText: requiresAttentionText } = useAutoTranslate('Requires Attention');
  const { translatedText: successMsg } = useAutoTranslate('Your LLC has been successfully formed! Congratulations on your new business!');
  const { translatedText: processingMsg } = useAutoTranslate('Your application is being processed. We will notify you of any updates soon.');
  const { translatedText: attentionMsg } = useAutoTranslate('Your application needs attention. Please contact our support team for assistance.');

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
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
  }, [applications]); // Re-run when applications change

  useEffect(() => {
    if (!authLoading && user) {
      console.log('User authenticated:', { uid: user.uid, email: user.email });
      // Run migration to add user_id to existing documents, then load
      (async () => {
        await migrateUserIds(user.uid);
        await loadApplications();
      })();
    } else if (!authLoading && !user) {
      console.log('User not authenticated, redirecting to auth');
      onNavigate('auth');
    }
  }, [user, authLoading, onNavigate]);

  // Separate effect to fetch package types when applications change
  useEffect(() => {
    if (applications.length === 0) {
      setPackageTypes({});
      return;
    }

    const fetchPackageTypes = async () => {
      console.log('🔄 Fetching package types for', applications.length, 'applications');
      const types: Record<string, string> = {};

      // Fetch all packages in parallel
      const promises = applications
        .filter(app => app.package_id)
        .map(async (app) => {
          try {
            console.log(`📦 Fetching package: ${app.package_id}`);
            const packageDoc = await getDocument<any>('packages', app.package_id);
            
            if (packageDoc && packageDoc.name) {
              const tierType = packageDoc.name.split(' ').pop() || 'Basic';
              types[app.package_id] = tierType;
              console.log(`✓ Package ${app.package_id}: ${packageDoc.name} -> ${tierType}`);
            } else {
              console.warn(`⚠ Package doc missing name: ${app.package_id}`);
              types[app.package_id] = 'Basic';
            }
          } catch (err: any) {
            console.warn(`⚠ Failed to fetch package ${app.package_id}:`, err.message);
            types[app.package_id] = 'Basic';
          }
        });

      await Promise.all(promises);
      console.log('✓ All package types fetched:', types);
      setPackageTypes(types);
    };

    fetchPackageTypes();
  }, [applications]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      if (!user) {
        console.warn('User not available when trying to load applications');
        setApplications([]);
        return;
      }

      console.log('=== DASHBOARD LOAD DEBUG ===');
      console.log('Current user UID:', user.uid);
      console.log('Current user email:', user.email);
      
      // Try to get applications - first attempt with user_id filter
      let apps: LLCApplication[] = [];
      
      try {
        console.log('Attempting filtered query: user_id == ', user.uid);
        const filteredApps = await queryCollection<LLCApplication>('llc_applications', [
          where('user_id', '==', user.uid),
        ]);
        console.log('✓ Filtered query returned:', filteredApps.length, 'documents');
        if (filteredApps.length > 0) {
          console.log('First result:', JSON.stringify(filteredApps[0], null, 2));
        }
        apps = filteredApps;
      } catch (filterError: any) {
        console.warn('⚠ Filtered query failed:', filterError.message);
        
        // Fallback: Get all documents to diagnose
        try {
          console.log('Attempting fallback: fetching ALL documents...');
          const allApps = await queryCollection<any>('llc_applications', []);
          console.log(`✓ Total documents in collection: ${allApps.length}`);
          
          if (allApps.length > 0) {
            console.log('Sample document structure:', JSON.stringify(allApps[0], null, 2));
            console.log('Sample document keys:', Object.keys(allApps[0]));
            
            // Log all user_ids to see what's there
            const allUserIds = allApps.map(d => ({ id: d.id, user_id: d.user_id, company: d.company_name }));
            console.log('All documents user_ids:', allUserIds);
            
            // Filter by user_id if field exists, otherwise show all
            const filtered = allApps.filter((doc: any) => 
              doc.user_id === user.uid || !doc.user_id
            );
            console.log(`✓ After client-side filtering: ${filtered.length} documents match`);
            apps = filtered as LLCApplication[];
          } else {
            console.warn('Collection appears to be empty');
          }
        } catch (allError: any) {
          console.error('✗ Failed to fetch all applications:', allError.message);
        }
      }
      
      console.log(`✓ Final: Setting ${apps.length} applications to display`);
      setApplications(apps);
      // Package types will be fetched by the separate useEffect
    } catch (error: any) {
      console.error('✗ Fatal error in loadApplications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onNavigate('home');
  };

  const handleDeleteApplication = async (appId: string, companyName: string) => {
    const confirmed = await showConfirm(
      `Are you sure you want to delete the application for "${companyName}"? This action cannot be undone.`,
      'Delete Application'
    );

    if (!confirmed) {
      return;
    }

    try {
      console.log('Deleting application:', appId);
      const success = await deleteDocument('llc_applications', appId);
      
      if (success) {
        console.log('Application deleted successfully');
        // Log the activity
        if (user) {
          await logActivity(appId, companyName, user.uid, user.email || 'unknown', 'deleted');
        }
        toast.success('Application deleted successfully');
        // Reload applications
        await loadApplications();
      } else {
        toast.error('Failed to delete application. Please try again.');
      }
    } catch (error: any) {
      console.error('Error deleting application:', error);
      toast.error('Error deleting application: ' + error.message);
    }
  };

  const handleEditApplication = (app: LLCApplication) => {
    setEditingApplication(app);
  };

  const handleCloseEditModal = () => {
    setEditingApplication(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin-slow" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

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
      case 'completed':
        return 'text-green-600 dark:text-green-400 font-bold';
      case 'failed':
        return 'text-red-600 dark:text-red-400 font-bold';
      default:
        return 'text-yellow-600 dark:text-yellow-400 font-bold';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-900"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 dark:border-blue-400 absolute top-0 left-0"></div>
            </div>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 dark:text-gray-400">Please log in to view your dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pb-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900 pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItMnptMCAydjJ6bTAtMnYyem0yIDB2MnptLTIgMHYyem0yIDB2MnptLTIgMHYyem0yIDB2MnptLTIgMHYyem0yIDB2MnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-semibold border border-white/30 mb-6">
                <Sparkles className="h-4 w-4" />
                <span>{welcomeText}</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                {dashboardTitle}
              </h1>
              <p className="text-xl md:text-2xl text-blue-50">
                {trackAppsText}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => onNavigate('contact')}
                className="group px-6 py-3 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 rounded-xl hover:bg-white/20 transition-all font-semibold flex items-center justify-center gap-2"
              >
                <User className="h-5 w-5" />
                <span>{contactAdminText}</span>
              </button>
              <button
                onClick={handleSignOut}
                className="group px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                <span>{signOutText}</span>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        {loading ? (
          <div className="text-center py-32">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-900"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 dark:border-blue-400 absolute top-0 left-0"></div>
            </div>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 font-medium">{loadingAppsText}</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="space-y-6">
          

            {/* Empty State */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 text-center border border-gray-100 dark:border-gray-700" id="empty-state" data-scroll>
              <div className={`transition-all duration-1000 ${visibleSections.has('empty-state') ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full mb-6">
                  <FileText className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  {noAppsText}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  {noAppsDesc}
                </p>
                <button
                  onClick={() => onNavigate('get-started')}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-bold shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center space-x-2"
                >
                  <span>{startFirstAppBtn}</span>
                  <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Applications List */}
            <div className="space-y-6 mb-12" id="applications-list" data-scroll>
              {applications.map((app, index) => (
                <div
                  key={app.id}
                  className={`bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-700 border border-gray-100 dark:border-gray-700 ${
                    visibleSections.has('applications-list')
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-10'
                  }`}
                  style={{ 
                    transitionDelay: visibleSections.has('applications-list') 
                      ? `${index * 150}ms` 
                      : '0ms'
                  }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                          {app.company_name}
                        </h3>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(app.status)} inline-flex items-center space-x-2`}>
                          {getStatusIcon(app.status)}
                          <span>{app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1 font-semibold">State</p>
                          <p className="font-bold text-lg text-gray-950 dark:text-white">
                            {US_STATES.find((s) => s.code === app.state)?.name}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1 font-semibold">{packageTypeLabel}</p>
                          <p className="font-bold text-lg text-gray-950 dark:text-white">
                            {packageTypes[app.package_id] || 'Loading...'}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1 font-semibold">{orderStatusLabel}</p>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(app.status)}
                            <span className="font-bold text-lg text-gray-950 dark:text-white">
                              {app.status === 'completed' && completedText}
                              {app.status === 'processing' && inProgressText}
                              {app.status === 'pending' && pendingText}
                              {app.status === 'rejected' && attentionText}
                            </span>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 p-4 rounded-xl border border-green-200 dark:border-green-800">
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1 font-semibold">{paymentLabel}</p>
                          <p className={`text-lg font-bold ${getPaymentStatusColor(app.payment_status)}`}>
                            {app.payment_status.charAt(0).toUpperCase() + app.payment_status.slice(1)}
                          </p>
                        </div>
                      </div>
                        
                      <div className={`p-6 rounded-2xl ${getStatusColor(app.status)}`}>
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {getStatusIcon(app.status)}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-lg mb-1">
                              {app.status === 'completed' && '✅ ' + applicationCompletedText}
                              {app.status === 'processing' && '⏳ ' + processingApplicationText}
                              {app.status === 'pending' && awaitingReviewText}
                              {app.status === 'rejected' && '❌ ' + requiresAttentionText}
                            </p>
                            <p className="text-sm opacity-90">
                              {app.status === 'completed' && successMsg}
                              {app.status === 'processing' && processingMsg}
                              {app.status === 'pending' && awaitingReviewDesc}
                              {app.status === 'rejected' && attentionMsg}
                            </p>
                            <p className="text-xs mt-2 opacity-75">
                              {submittedOnText} {new Date(app.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {app.payment_status === 'pending' && (
                      <div className="lg:w-64 flex flex-col gap-3">
                        <button className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-bold shadow-lg hover:shadow-xl hover:scale-105">
                          {completePaymentText}
                        </button>
                        <button
                          onClick={() => handleEditApplication(app)}
                          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all font-semibold shadow-md hover:shadow-lg inline-flex items-center justify-center space-x-2"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span>{editText}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteApplication(app.id, app.company_name)}
                          className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all font-semibold shadow-md hover:shadow-lg inline-flex items-center justify-center space-x-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>{deleteText}</span>
                        </button>
                      </div>
                    )}

                    {/* Action buttons for non-pending applications */}
                    {app.payment_status !== 'pending' && (
                      <div className="lg:w-64 flex flex-col gap-3">
                        <button
                          onClick={() => handleEditApplication(app)}
                          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all font-semibold shadow-md hover:shadow-lg inline-flex items-center justify-center space-x-2"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span>{editText}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteApplication(app.id, app.company_name)}
                          className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all font-semibold shadow-md hover:shadow-lg inline-flex items-center justify-center space-x-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>{deleteText}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Messages Section */}
                  <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-6">
                      <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                        {messagesFromAdminText}
                      </h4>
                    </div>
                    <MessagesDisplay 
                      applicationId={app.id}
                      userId={user?.uid}
                      isAdmin={false}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="stats" data-scroll>
              {[
                {
                  icon: FileText,
                  title: totalApplicationsText,
                  value: applications.length,
                  color: 'from-blue-500 to-cyan-500',
                  bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
                  borderColor: 'border-blue-200 dark:border-blue-800'
                },
                {
                  icon: CheckCircle,
                  title: completedStatsText,
                  value: applications.filter((app) => app.status === 'completed').length,
                  color: 'from-green-500 to-emerald-500',
                  bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                  borderColor: 'border-green-200 dark:border-green-800'
                },
                {
                  icon: Clock,
                  title: inProgressStatsText,
                  value: applications.filter((app) => ['pending', 'processing'].includes(app.status)).length,
                  color: 'from-yellow-500 to-orange-500',
                  bgColor: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
                  borderColor: 'border-yellow-200 dark:border-yellow-800'
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${stat.bgColor} rounded-2xl p-8 text-center border ${stat.borderColor} transition-all duration-700 hover:scale-105 hover:shadow-xl ${
                    visibleSections.has('stats')
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-10'
                  }`}
                  style={{ 
                    transitionDelay: visibleSections.has('stats') 
                      ? `${index * 150}ms` 
                      : '0ms'
                  }}
                >
                  <div className={`bg-gradient-to-br ${stat.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">{stat.title}</h3>
                  <p className={`text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Animations */}
      <style>{`
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
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>

      {/* Edit Modal */}
      {editingApplication && (
        <EditApplicationModal
          application={editingApplication}
          isOpen={!!editingApplication}
          onClose={handleCloseEditModal}
          onSave={loadApplications}
        />
      )}
    </div>
  );
}