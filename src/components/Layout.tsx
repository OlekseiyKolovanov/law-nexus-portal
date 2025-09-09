import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useUserRole } from '@/hooks/use-user-role';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MouseTrackingCard } from '@/components/MouseTrackingCard';
import { 
  Home, 
  Users, 
  FileText, 
  GraduationCap, 
  Briefcase, 
  Scale, 
  Building2, 
  Settings,
  LogOut,
  LogIn,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, signOut } = useAuth();
  const { isAdmin, canManageTenders, canManageLegal } = useUserRole();
  const location = useLocation();

  const navigation = [
    { name: 'Головна', href: '/', icon: Home },
    { name: 'Керівництво', href: '/leadership', icon: Users },
    { name: 'Голосування', href: '/voting', icon: Scale },
    { name: 'Законодавча база', href: '/laws', icon: FileText },
    { name: 'Школа права', href: '/legal-school', icon: GraduationCap },
    { name: 'Тендери', href: '/tenders', icon: Briefcase },
    { name: 'Реєстр адвокатів', href: '/lawyers', icon: Users },
    { name: 'Підприємства', href: '/enterprises', icon: Building2 },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      <ThemeToggle />
      
      {/* Header */}
      <header className="sticky top-3 z-40 mx-4 mt-3">
        <MouseTrackingCard intensity={0.5}>
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/40 dark:border-gray-700/40 transition-all duration-500">
            <div className="container mx-auto px-6">
              <div className="flex h-12 items-center justify-between">
                <Link to="/" className="flex items-center space-x-3 group">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                    <Scale className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ВРУ
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                      Парламент
                    </span>
                  </div>
                </Link>

                <nav className="hidden lg:flex items-center space-x-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <MouseTrackingCard key={item.name} intensity={0.3}>
                        <Link
                          to={item.href}
                          className={`nav-item group flex items-center space-x-2 ${
                            isActive(item.href) 
                              ? 'active' 
                              : ''
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110" />
                          <span>{item.name}</span>
                        </Link>
                      </MouseTrackingCard>
                    );
                  })}
                </nav>

                <div className="flex items-center space-x-3">
                  {user ? (
                    <>
                      {(isAdmin() || canManageTenders() || canManageLegal()) && (
                        <MouseTrackingCard intensity={0.3}>
                          <Link to="/admin">
                            <Button variant="outline" size="sm" className="bg-card/70 dark:bg-card/80 text-foreground border-border/30 rounded-xl hover:bg-accent dark:hover:bg-accent/80 hover:shadow-medium transition-all duration-300 h-9 px-4">
                              <Settings className="w-4 h-4 mr-2" />
                              Адмін
                            </Button>
                          </Link>
                        </MouseTrackingCard>
                      )}
                      <MouseTrackingCard intensity={0.3}>
                        <Button onClick={handleSignOut} variant="outline" size="sm" className="bg-card/70 dark:bg-card/80 text-foreground border-border/30 rounded-xl hover:bg-accent dark:hover:bg-accent/80 hover:shadow-medium transition-all duration-300 h-9 px-4">
                        <Button onClick={handleSignOut} variant="outline" size="sm" className="bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-200 border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-white/80 dark:hover:bg-gray-700/80 hover:shadow-md transition-all duration-300 h-8 px-3">
                          <Button variant="outline" size="sm" className="bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-200 border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-white/80 dark:hover:bg-gray-700/80 hover:shadow-md transition-all duration-300 h-8 px-3">
                          Вийти
                        </Button>
                      </MouseTrackingCard>
                    </>
                  ) : (
                    <MouseTrackingCard intensity={0.3}>
                      <Link to="/auth">
                        <Button variant="outline" size="sm" className="bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-200 border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-white/80 dark:hover:bg-gray-700/80 hover:shadow-md transition-all duration-300 h-8 px-3">
                          <LogIn className="w-4 h-4 mr-2" />
                          Увійти
                        </Button>
                      </Link>
                    </MouseTrackingCard>
                  )}
                </div>
              </div>
            </div>
          </div>
        </MouseTrackingCard>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer with Contact */}
      <footer className="floating-element mx-4 mb-4 mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-icon rounded-xl flex items-center justify-center icon-glow">
                  <Mail className="w-4 h-4 text-primary-foreground" />
                </div>
                Контакти
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-glass rounded-lg flex items-center justify-center">
                    <Phone className="w-3 h-3 text-primary" />
                  </div>
                  <span>@ImKava</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-glass rounded-lg flex items-center justify-center">
                    <Mail className="w-3 h-3 text-primary" />
                  </div>
                  <span>Річард Скоропадський</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-glass rounded-lg flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-primary" />
                  </div>
                  <span>вул. Грушевського, 5, Київ, 01008</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Швидкі посилання</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
            {navigation.slice(0, 4).map((item) => (
              <MouseTrackingCard key={item.name} intensity={0.2}>
                <Link 
                  to={item.href} 
                  className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 hover:shadow-soft px-2 py-1 rounded-lg"
                >
                  {item.name}
                </Link>
              </MouseTrackingCard>
            ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Про портал</h3>
              <p className="text-sm text-muted-foreground">
                Офіційний веб-портал Верховної Ради України. 
                Актуальна інформація про законодавчу діяльність та парламентські процедури.
              </p>
              <MouseTrackingCard intensity={0.3}>
                <Link to="/contact" className="inline-block">
                  <Button variant="outline" size="sm" className="bg-gradient-glass border-border/30 rounded-xl hover:shadow-medium transition-all duration-300">
                    Зв'язатися з нами
                  </Button>
                </Link>
              </MouseTrackingCard>
            </div>
          </div>
          
          <div className="border-t border-border/20 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Верховна Рада України. Всі права захищені.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};