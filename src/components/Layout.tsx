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
  Image,
  Briefcase
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
      items: [
        { name: 'Керівництво', href: '/leadership' },
        { name: 'Біографія Президента', href: '/president-bio' },
      ],
    },
    {
      name: 'Освіта',
      icon: GraduationCap,
      items: [
        { name: 'Юридична школа', href: '/legal-school' },
      ],
    },
    {
      name: 'Бізнес',
      icon: Briefcase,
      items: [
        { name: 'Тендери', href: '/tenders' },
        { name: 'Підприємства', href: '/enterprises' },
      ],
    },
    {
      name: 'Юстиція',
      icon: Scale,
      items: [
        { name: 'Закони', href: '/laws' },
        { name: 'Адвокати', href: '/lawyers' },
        { name: 'Голосування', href: '/voting' },
        { name: 'Прокуратура (ЄРДР)', href: '/criminal-proceedings' },
      ],
    },
    { name: 'Контакти', href: '/contact', icon: Phone },
    { name: 'Фото', href: 'https://photos.app.goo.gl/K1qUmJiRqV3Nwe5f8', icon: Image, external: true },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 glass-header">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
                <Scale className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="hidden sm:block font-bold text-base lg:text-lg bg-gradient-primary bg-clip-text text-transparent">
                Верховна Рада України
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                if (item.items) {
                  return (
                    <div key={item.name} className="relative group">
                      <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent/50 transition-all duration-200">
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                        <ChevronDown className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180" />
                      </button>
                      <div className="absolute left-0 top-full mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none group-hover:pointer-events-auto">
                        <div className="bg-card backdrop-blur-md rounded-xl shadow-xl border border-border/50 p-2 animate-scale-in">
                          {item.items.map((subItem) => (
                            <Link
                              key={subItem.name}
                              to={subItem.href}
                              className="block px-4 py-3 text-sm text-foreground/80 hover:text-foreground hover:bg-accent/80 rounded-lg transition-all duration-200"
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
                    to={item.href!}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(item.href!)
                        ? 'bg-accent text-foreground'
                        : 'text-foreground/80 hover:text-foreground hover:bg-accent/50'
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
              {hasAdminAccess && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-medium shadow-glow hover:shadow-xl transition-all duration-300 hover:scale-105 animate-glow"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden md:inline">Адмін панель</span>
                </Link>
              )}
              
              <ThemeToggle />

              {user ? (
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/50 text-foreground text-sm">
                    <User className="w-4 h-4" />
                    <span className="hidden lg:inline max-w-[100px] truncate">{user.email}</span>
                  </div>
                  
                  <button
                    onClick={signOut}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground/80 hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Вихід</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-medium shadow-glow hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <User className="w-4 h-4" />
                  <span>Увійти</span>
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-accent/50 transition-all duration-200"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 space-y-2 animate-scale-in">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.items ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground/60">
                        <item.icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </div>
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block pl-10 pr-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-accent/50 rounded-lg transition-all duration-200"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      to={item.href!}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive(item.href!)
                          ? 'bg-accent text-foreground'
                          : 'text-foreground/80 hover:text-foreground hover:bg-accent/50'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  )}
                </div>
              ))}
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