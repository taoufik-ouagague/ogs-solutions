import { Building2, Menu, X, Sun, Moon, User, LogOut, Shield } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useTranslationHelper } from '../hooks/useTranslationHelper';
import LanguageSelector from './LanguageSelector';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage?: string;
}

export default function Header({ onNavigate }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [translatedNav, setTranslatedNav] = useState({ Home: 'Home', Services: 'Services', Contact: 'Contact', Dashboard: 'Dashboard', SignOut: 'Sign Out', SignIn: 'Sign In' });
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { translate } = useTranslationHelper();
  const location = useLocation();

  // Translate navigation items
  useEffect(() => {
    const translateNav = async () => {
      const [home, services, contact, dashboard, signOut, signIn] = await Promise.all([
        translate('Home'),
        translate('Services'),
        translate('Contact'),
        translate('Dashboard'),
        translate('Sign Out'),
        translate('Sign In'),
      ]);
      setTranslatedNav({ Home: home, Services: services, Contact: contact, Dashboard: dashboard, SignOut: signOut, SignIn: signIn });
    };
    translateNav();
  }, [translate]);

  // Determine current page from URL path
  const currentPage = useMemo(() => {
    const path = location.pathname.substring(1);
    if (!path || path === '') return 'home';
    return path === 'admin/dashboard' ? 'admin-dashboard' : 
           path === 'admin/login' ? 'admin-login' : 
           path === 'admin/setup' ? 'admin-setup' :
           path === 'admin/dashboard' ? 'admin-dashboard' :
           path.replace(/\//g, '-');
  }, [location.pathname]);

  const navigation = [
    { name: translatedNav.Home, id: 'home' },
    { name: translatedNav.Services, id: 'services' },
    { name: translatedNav.Contact, id: 'contact' },
  ];

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 
                       bg-white/80 dark:bg-gray-900/80 
                       backdrop-blur-xl 
                       border-b border-gray-200/50 dark:border-gray-800/50
                       shadow-sm shadow-gray-200/50 dark:shadow-black/20
                       transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="group flex items-center cursor-pointer gap-2.5"
            onClick={() => onNavigate('home')}
          >
            <div className="relative">
              <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400 
                                   group-hover:scale-110 group-hover:rotate-3
                                   transition-all duration-300" />
              <div className="absolute inset-0 blur-lg bg-blue-500/0 
                             group-hover:bg-blue-500/30 dark:group-hover:bg-blue-400/30
                             transition-all duration-300" />
            </div>
            <span className="text-xl font-bold 
                           bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300
                           group-hover:from-blue-600 group-hover:to-purple-600
                           dark:group-hover:from-blue-400 dark:group-hover:to-purple-400
                           bg-clip-text text-transparent
                           transition-all duration-300">
              OGS Solution
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg
                           transition-all duration-300 ease-out
                           group/nav
                           ${
                             currentPage === item.id
                               ? 'text-blue-600 dark:text-blue-400'
                               : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                           }`}
              >
                {/* Background on hover/active */}
                <div className={`absolute inset-0 rounded-lg transition-all duration-300
                               ${currentPage === item.id 
                                 ? 'bg-blue-50 dark:bg-blue-950/30 scale-100 opacity-100' 
                                 : 'bg-gray-100 dark:bg-gray-800 scale-95 opacity-0 group-hover/nav:scale-100 group-hover/nav:opacity-100'
                               }`} />
                
                {/* Active indicator line */}
                {currentPage === item.id && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 
                                 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                )}
                
                <span className="relative">{item.name}</span>
              </button>
            ))}

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2" />

            {user ? (
              <>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                             transition-all duration-300 group/nav
                             ${
                               currentPage === 'dashboard'
                                 ? 'text-blue-600 dark:text-blue-400'
                                 : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                             }`}
                >
                  <div className={`absolute inset-0 rounded-lg transition-all duration-300
                                 ${currentPage === 'dashboard'
                                   ? 'bg-blue-50 dark:bg-blue-950/30 scale-100 opacity-100'
                                   : 'bg-gray-100 dark:bg-gray-800 scale-95 opacity-0 group-hover/nav:scale-100 group-hover/nav:opacity-100'
                                 }`} />
                  <User className="h-4 w-4 relative" />
                  <span className="relative">{translatedNav.Dashboard}</span>
                </button>

                <button
                  onClick={signOut}
                  className="relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                           text-gray-700 dark:text-gray-300 
                           hover:text-red-600 dark:hover:text-red-400
                           transition-all duration-300 group/nav"
                >
                  <div className="absolute inset-0 rounded-lg bg-gray-100 dark:bg-gray-800 
                                 scale-95 opacity-0 group-hover/nav:scale-100 group-hover/nav:opacity-100
                                 transition-all duration-300" />
                  <LogOut className="h-4 w-4 relative" />
                  <span className="relative">{translatedNav.SignOut}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate('auth')}
                className="relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                         text-gray-700 dark:text-gray-300 
                         hover:text-blue-600 dark:hover:text-blue-400
                         transition-all duration-300 group/nav"
              >
                <div className="absolute inset-0 rounded-lg bg-gray-100 dark:bg-gray-800 
                               scale-95 opacity-0 group-hover/nav:scale-100 group-hover/nav:opacity-100
                               transition-all duration-300" />
                <User className="h-4 w-4 relative" />
                <span className="relative">{translatedNav.SignIn}</span>
              </button>
            )}

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2" />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="group/theme relative p-2.5 rounded-xl
                       bg-gray-100 dark:bg-gray-800
                       hover:bg-gradient-to-br hover:from-amber-100 hover:to-orange-100
                       dark:hover:from-blue-900/30 dark:hover:to-purple-900/30
                       border border-gray-200 dark:border-gray-700
                       hover:border-amber-300 dark:hover:border-blue-600
                       hover:shadow-lg hover:shadow-amber-200/50 dark:hover:shadow-blue-500/20
                       active:scale-95
                       transition-all duration-300"
              aria-label="Toggle theme"
            >
              <div className="relative">
                {theme === 'light' ? (
                  <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300 
                                 group-hover/theme:text-blue-600 dark:group-hover/theme:text-blue-400
                                 group-hover/theme:rotate-12 group-hover/theme:scale-110
                                 transition-all duration-300" />
                ) : (
                  <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300 
                                group-hover/theme:text-amber-500 dark:group-hover/theme:text-amber-400
                                group-hover/theme:rotate-90 group-hover/theme:scale-110
                                transition-all duration-300" />
                )}
                <div className="absolute inset-0 blur-md 
                               bg-amber-500/0 group-hover/theme:bg-amber-500/30
                               dark:bg-blue-500/0 dark:group-hover/theme:bg-blue-500/30
                               transition-all duration-300" />
              </div>
            </button>

            {/* Language Selector */}
            <LanguageSelector />

            {/* Admin Button */}
            <button
              onClick={() => onNavigate('admin-login')}
              className="relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                       text-gray-700 dark:text-gray-300 
                       hover:text-red-600 dark:hover:text-red-400
                       transition-all duration-300 group/nav"
            >
              <div className="absolute inset-0 rounded-lg 
                             bg-red-50 dark:bg-red-950/20
                             scale-95 opacity-0 group-hover/nav:scale-100 group-hover/nav:opacity-100
                             transition-all duration-300" />
              <Shield className="h-4 w-4 relative" />
              <span className="relative">Admin</span>
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="group/theme p-2 rounded-lg
                       bg-gray-100 dark:bg-gray-800
                       hover:bg-gradient-to-br hover:from-amber-100 hover:to-orange-100
                       dark:hover:from-blue-900/30 dark:hover:to-purple-900/30
                       active:scale-95
                       transition-all duration-300"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300 
                               group-hover/theme:rotate-12
                               transition-transform duration-300" />
              ) : (
                <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300 
                              group-hover/theme:rotate-90
                              transition-transform duration-300" />
              )}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="group/menu p-2 rounded-lg
                       bg-gray-100 dark:bg-gray-800
                       hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50
                       dark:hover:from-blue-900/30 dark:hover:to-purple-900/30
                       active:scale-95
                       transition-all duration-300"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-700 dark:text-gray-300 
                            group-hover/menu:text-red-600 dark:group-hover/menu:text-red-400
                            group-hover/menu:rotate-90
                            transition-all duration-300" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300 
                              group-hover/menu:text-blue-600 dark:group-hover/menu:text-blue-400
                              transition-all duration-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden 
                       bg-white/95 dark:bg-gray-900/95 
                       backdrop-blur-xl
                       border-t border-gray-200/50 dark:border-gray-800/50
                       animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="px-4 py-4 space-y-2">
            {navigation.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{ animationDelay: `${index * 50}ms` }}
                className={`block w-full text-left px-4 py-3 rounded-xl text-base font-medium 
                           transition-all duration-300
                           animate-in slide-in-from-left fade-in
                           group/mobile
                           ${
                             currentPage === item.id
                               ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 text-blue-600 dark:text-blue-400 shadow-sm'
                               : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                           }`}
              >
                <div className="flex items-center justify-between">
                  <span>{item.name}</span>
                  {currentPage === item.id && (
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                  )}
                </div>
              </button>
            ))}

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent my-3" />

            <button
              onClick={() => handleNavClick('admin-login')}
              style={{ animationDelay: '150ms' }}
              className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-base font-medium 
                       text-gray-700 dark:text-gray-300 
                       hover:bg-red-50 dark:hover:bg-red-950/20
                       hover:text-red-600 dark:hover:text-red-400
                       transition-all duration-300
                       animate-in slide-in-from-left fade-in"
            >
              <Shield className="h-5 w-5" />
              <span>Admin Login</span>
            </button>

            {user ? (
              <>
                <button
                  onClick={() => handleNavClick('dashboard')}
                  style={{ animationDelay: '200ms' }}
                  className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-base font-medium 
                             transition-all duration-300
                             animate-in slide-in-from-left fade-in
                             ${
                               currentPage === 'dashboard'
                                 ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 text-blue-600 dark:text-blue-400 shadow-sm'
                                 : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                             }`}
                >
                  <User className="h-5 w-5" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  style={{ animationDelay: '250ms' }}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-base font-medium 
                           text-gray-700 dark:text-gray-300 
                           hover:bg-red-50 dark:hover:bg-red-950/20
                           hover:text-red-600 dark:hover:text-red-400
                           transition-all duration-300
                           animate-in slide-in-from-left fade-in"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNavClick('auth')}
                style={{ animationDelay: '200ms' }}
                className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-base font-medium 
                         text-gray-700 dark:text-gray-300 
                         hover:bg-gray-50 dark:hover:bg-gray-800/50
                         transition-all duration-300
                         animate-in slide-in-from-left fade-in"
              >
                <User className="h-5 w-5" />
                <span>{translatedNav.SignIn}</span>
              </button>
            )}

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent my-3" />

            {/* Get Started Button */}
            <button
              onClick={() => handleNavClick('get-started')}
              style={{ animationDelay: '300ms' }}
              className="group/cta relative block w-full px-6 py-3.5 
                       bg-gradient-to-r from-blue-600 to-blue-700
                       dark:from-blue-500 dark:to-purple-600
                       text-white rounded-xl
                       hover:shadow-lg hover:shadow-blue-500/30
                       active:scale-[0.98]
                       font-semibold text-center
                       overflow-hidden
                       transition-all duration-300
                       animate-in slide-in-from-left fade-in"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 
                             opacity-0 group-hover/cta:opacity-100 
                             transition-opacity duration-300" />
              <span className="relative flex items-center justify-center gap-2">
                Get Started
                <svg 
                  className="w-5 h-5 group-hover/cta:translate-x-1 transition-transform duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>

            {/* Language Selector for Mobile */}
            <div className="pt-2 flex justify-center animate-in fade-in duration-500" style={{ animationDelay: '350ms' }}>
              <LanguageSelector />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}