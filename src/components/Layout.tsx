import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../hooks/use-auth';
import { useUserRole } from '../hooks/use-user-role';
import { Chrome as Home, Scale, Users, Building2, GraduationCap, FileText, Vote, Phone, Settings, LogOut, User } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { role } = useUserRole();

  const navigation = [
    { name: 'Головна', href: '/', icon: Home },
    { name: 'Керівництво', href: '/leadership', icon: Users },
    { name: 'Голосування', href: '/voting', icon: Vote },
    { name: 'Закони', href: '/laws', icon: Scale },
    { name: 'Юридична школа', href: '/legal-school', icon: GraduationCap },
    { name: 'Тендери', href: '/tenders', icon: FileText },
    { name: 'Адвокати', href: '/lawyers', icon: Scale },
    { name: 'Підприємства', href: '/enterprises', icon: Building2 },
    { name: 'Контакти', href: '/contact', icon: Phone },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 glass-header border-b border-white/10 dark:border-white/5">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Верховна Рада України
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`nav-item group flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
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
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              
              {user ? (
                <div className="flex items-center space-x-2">
                  {role === 'admin' && (
                    <Link
                      to="/admin"
                      className="nav-item flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="hidden sm:inline">Адмін</span>
                    </Link>
                  )}
                  
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-green-50/80 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{user.email}</span>
                  </div>
                  
                  <button
                    onClick={signOut}
                    className="nav-item flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Вийти</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="nav-item flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                >
                  <User className="w-4 h-4" />
                  <span>Увійти</span>
                </Link>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              © 2024 Верховна Рада України. Всі права захищені.
            </p>
            <div className="flex justify-center items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
              <span>Власник: Річард Скоропадський</span>
              <span>•</span>
              <a 
                href="https://t.me/ImKava" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Telegram: @ImKava
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}