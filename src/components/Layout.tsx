import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useUserRole } from '@/hooks/use-user-role';
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
  LogIn
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
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Scale className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                ВРУ
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground shadow-soft'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center space-x-2">
              {user ? (
                <>
                  {(isAdmin() || canManageTenders() || canManageLegal()) && (
                    <Link to="/admin">
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Адмін
                      </Button>
                    </Link>
                  )}
                  <Button onClick={handleSignOut} variant="outline" size="sm">
                    <LogOut className="w-4 h-4 mr-2" />
                    Вийти
                  </Button>
                </>
              ) : (
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    <LogIn className="w-4 h-4 mr-2" />
                    Увійти
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/30 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Верховна Рада України. Всі права захищені.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};