import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useUserRole } from '@/hooks/use-user-role';
import { ThemeToggle } from '@/components/ThemeToggle';
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
    { name: 'Законодавча база', href: '/laws', icon: FileText },
    { name: 'Школа права', href: '/legal-school', icon: GraduationCap },
    { name: 'Тендери', href: '/tenders', icon: Briefcase },
    { name: 'Реєстр адвокатів', href: '/lawyers', icon: Scale },
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
      <header className="sticky top-2 z-40 mx-4 mt-2">
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl shadow-large">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-primary/80 rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-medium transition-all duration-300 group-hover:scale-105">
                <Scale className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  ВРУ
                </span>
                <span className="text-xs text-muted-foreground -mt-1">
                  Парламент
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center space-x-3">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                  >
                    <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  {(isAdmin() || canManageTenders() || canManageLegal()) && (
                    <Link to="/admin">
                      <Button variant="outline" size="sm" className="bg-white/40 dark:bg-white/5 backdrop-blur-sm border-white/20 dark:border-white/10 rounded-xl hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-soft transition-all duration-300">
                        <Settings className="w-4 h-4 mr-2" />
                        Адмін
                      </Button>
                    </Link>
                  )}
                  <Button onClick={handleSignOut} variant="outline" size="sm" className="bg-white/40 dark:bg-white/5 backdrop-blur-sm border-white/20 dark:border-white/10 rounded-xl hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-soft transition-all duration-300">
                    <LogOut className="w-4 h-4 mr-2" />
                    Вийти
                  </Button>
                </>
              ) : (
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="bg-white/40 dark:bg-white/5 backdrop-blur-sm border-white/20 dark:border-white/10 rounded-xl hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-soft transition-all duration-300">
                    <LogIn className="w-4 h-4 mr-2" />
                    Увійти
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
        </div>
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
                  <span>+380 44 255-3636</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-glass rounded-lg flex items-center justify-center">
                    <Mail className="w-3 h-3 text-primary" />
                  </div>
                  <span>info@rada.gov.ua</span>
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
                  <Link 
                    key={item.name}
                    to={item.href} 
                    className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1"
                  >
                    {item.name}
                  </Link>
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
              <Link to="/contact" className="inline-block">
                <Button variant="outline" size="sm" className="soft-button">
                  Зв'язатися з нами
                </Button>
              </Link>
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