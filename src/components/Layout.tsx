import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../hooks/use-auth';
import { useUserRole } from '../hooks/use-user-role';
import { 
  Chrome as Home, 
  Scale, 
  Users, 
  Building2, 
  GraduationCap, 
  FileText, 
  Vote, 
  Phone, 
  Settings, 
  LogOut, 
  User,
  Menu,
  X,
  ChevronDown,
  ShieldAlert,
  Image
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin, isProsecutor, canManageTenders, canManageLegal, canManageAAU, loading: roleLoading } = useUserRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const hasAdminAccess = !roleLoading && (isAdmin() || isProsecutor() || canManageTenders() || canManageLegal() || canManageAAU());

  const navigation = [
    { name: 'Головна', href: '/', icon: Home },
    { 
      name: 'Верховна Рада', 
      icon: Users,
      subItems: [
        { name: 'Керівництво', href: '/leadership' },
        { name: 'Голосування', href: '/voting' },
        { name: 'Закони', href: '/laws' },
      ]
    },
    { 
      name: 'Освіта', 
      icon: GraduationCap,
      subItems: [
        { name: 'Юридична школа', href: '/legal-school' },
      ]
    },
    { 
      name: 'Бізнес', 
      icon: Building2,
      subItems: [
        { name: 'Тендери', href: '/tenders' },
        { name: 'Підприємства', href: '/enterprises' },
      ]
    },
    { 
      name: 'Юстиція', 
      icon: Scale,
      subItems: [
        { name: 'Адвокати', href: '/lawyers' },
        { name: 'Прокуратура (ЄРДР)', href: '/criminal-proceedings' },
      ]
    },
    { name: 'Контакти', href: '/contact', icon: Phone },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 glass-header border-b border-white/10 dark:border-white/5 backdrop-blur-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
                <Scale className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="hidden sm:block font-bold text-base lg:text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Верховна Рада України
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                if (item.subItems) {
                  return (
                    <div key={item.name} className="relative group">
                      <button className="nav-item flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300">
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      <div className="absolute top-full left-0 mt-1 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-large border border-border/20 py-2 backdrop-blur-sm">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.href}
                              to={subItem.href}
                              className={`block px-4 py-2 text-sm transition-colors ${
                                isActive(subItem.href)
                                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-900/30'
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                              }`}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`nav-item flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isActive(item.href)
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-900/30'
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <ThemeToggle />
              
              {/* Photo Hosting Link */}
              <a
                href="https://postimages.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-item hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                title="Фотохостинг"
              >
                <Image className="w-4 h-4" />
                <span className="hidden md:inline">Фото</span>
              </a>
              
              {user ? (
                <div className="flex items-center gap-2">
                  {hasAdminAccess && (
                    <Link
                      to="/admin"
                      className="nav-item flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="hidden sm:inline">Панель</span>
                    </Link>
                  )}
                  
                  <div className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-50/80 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm">
                    <User className="w-4 h-4" />
                    <span className="hidden lg:inline max-w-[100px] truncate">{user.email}</span>
                  </div>
                  
                  <button
                    onClick={signOut}
                    className="nav-item flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Вийти</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="nav-item flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                >
                  <User className="w-4 h-4" />
                  <span>Увійти</span>
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden nav-item p-2 rounded-lg text-gray-600 dark:text-gray-300"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-border/20 py-4 space-y-2 animate-fade-in">
              {navigation.map((item) => {
                const Icon = item.icon;
                if (item.subItems) {
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </div>
                      <div className="ml-6 space-y-1">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.href}
                            to={subItem.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                              isActive(subItem.href)
                                ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-900/30'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-900/30'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-3">
            <p className="text-gray-600 dark:text-gray-400">
              © 2025 Верховна Рада України. Всі права захищені.
            </p>
            <div className="flex justify-center items-center flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-500">
              <span>Власник: Річард Скоропадський</span>
              <span className="hidden sm:inline">•</span>
              <a 
                href="https://t.me/ImKava" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Telegram: @ImKava
              </a>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-600">🎄 З Новим Роком! 🎅</p>
          </div>
        </div>
      </footer>
    </div>
  );
}