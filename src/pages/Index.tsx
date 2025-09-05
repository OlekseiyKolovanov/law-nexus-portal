import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  GraduationCap, 
  Briefcase, 
  Users,
  TrendingUp,
  Scale,
  Building2,
  Award
} from 'lucide-react';

interface Statistics {
  laws_count: number;
  school_topics_count: number;
  active_tenders_count: number;
  staff_count: number;
}

const Index = () => {
  const [stats, setStats] = useState<Statistics>({
    laws_count: 0,
    school_topics_count: 0,
    active_tenders_count: 0,
    staff_count: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const { data, error } = await supabase
          .from('statistics')
          .select('*')
          .single();

        if (error) {
          console.error('Error fetching statistics:', error);
        } else if (data) {
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const statsCards = [
    {
      title: 'Законів у базі',
      value: stats.laws_count,
      icon: FileText,
      description: 'Активних законодавчих актів',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Тем у школі права',
      value: stats.school_topics_count,
      icon: GraduationCap,
      description: 'Навчальних матеріалів',
      gradient: 'from-green-500 to-green-600',
    },
    {
      title: 'Активних тендерів',
      value: stats.active_tenders_count,
      icon: Briefcase,
      description: 'Відкритих конкурсів',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Співробітників у фракції',
      value: stats.staff_count,
      icon: Users,
      description: 'Активних працівників',
      gradient: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-hero border border-border/20 shadow-large floating-element">
          <div className="relative px-8 py-16 text-center">
            <div className="mx-auto max-w-4xl">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-icon rounded-3xl flex items-center justify-center shadow-glow animate-glow icon-glow">
                  <Scale className="w-10 h-10 text-primary-foreground" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent animate-fade-in">
                Верховна Рада України
              </h1>
              <p className="text-xl text-muted-foreground mb-8 animate-slide-up max-w-2xl mx-auto">
                Офіційний портал парламенту України. Тут ви знайдете актуальну інформацію про 
                законодавчу діяльність, керівництво та можливості співпраці.
              </p>
              <div className="flex flex-wrap justify-center gap-4 animate-fade-in">
                <div className="flex items-center space-x-2 px-6 py-3 bg-gradient-glass backdrop-blur-sm rounded-2xl border border-border/20 shadow-soft hover:shadow-medium transition-all duration-500 hover:-translate-y-1">
                  <div className="w-6 h-6 bg-gradient-icon rounded-lg flex items-center justify-center">
                    <Award className="w-3 h-3 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium">Прозорість</span>
                </div>
                <div className="flex items-center space-x-2 px-6 py-3 bg-gradient-glass backdrop-blur-sm rounded-2xl border border-border/20 shadow-soft hover:shadow-medium transition-all duration-500 hover:-translate-y-1">
                  <div className="w-6 h-6 bg-gradient-icon rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium">Ефективність</span>
                </div>
                <div className="flex items-center space-x-2 px-6 py-3 bg-gradient-glass backdrop-blur-sm rounded-2xl border border-border/20 shadow-soft hover:shadow-medium transition-all duration-500 hover:-translate-y-1">
                  <div className="w-6 h-6 bg-gradient-icon rounded-lg flex items-center justify-center">
                    <Building2 className="w-3 h-3 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium">Розвиток</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Статистика</h2>
            <p className="text-muted-foreground">Актуальні дані про діяльність парламенту</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card 
                  key={card.title} 
                  className="relative overflow-hidden hover:shadow-glow transition-all duration-500 hover:-translate-y-2 hover:scale-105 animate-scale-in bg-gradient-card border border-border/20 rounded-2xl floating-element"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {card.title}
                      </CardTitle>
                      <div className={`p-3 rounded-2xl bg-gradient-to-r ${card.gradient} shadow-medium icon-glow`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold">
                        {loading ? '...' : card.value.toLocaleString()}
                      </div>
                      <CardDescription className="text-xs">
                        {card.description}
                      </CardDescription>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Quick Links */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Швидкий доступ</h2>
            <p className="text-muted-foreground">Основні розділи порталу</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="/laws" className="interactive-card glow-border group">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500/80 to-blue-600/80 rounded-2xl flex items-center justify-center mb-4 shadow-medium icon-glow group-hover:scale-110 transition-transform duration-500">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Законодавча база</CardTitle>
                <CardDescription>
                  Доступ до повного архіву законів та нормативних актів України
                </CardDescription>
              </CardHeader>
            </a>
            
            <a href="/legal-school" className="interactive-card glow-border group">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-r from-green-500/80 to-green-600/80 rounded-2xl flex items-center justify-center mb-4 shadow-medium icon-glow group-hover:scale-110 transition-transform duration-500">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Школа права</CardTitle>
                <CardDescription>
                  Навчальні матеріали та курси з правознавства для громадян
                </CardDescription>
              </CardHeader>
            </a>
            
            <a href="/tenders" className="interactive-card glow-border group">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500/80 to-purple-600/80 rounded-2xl flex items-center justify-center mb-4 shadow-medium icon-glow group-hover:scale-110 transition-transform duration-500">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Тендери</CardTitle>
                <CardDescription>
                  Активні конкурси та можливості співпراці з парламентом
                </CardDescription>
              </CardHeader>
            </a>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
