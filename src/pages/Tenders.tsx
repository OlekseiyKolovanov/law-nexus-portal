import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Briefcase, Search, FileText, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { TenderForm } from '@/components/TenderForm';

interface Tender {
  id: string;
  title: string;
  content: string;
  has_form: boolean;
  created_at: string;
}

const Tenders = () => {
  const { user } = useAuth();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [filteredTenders, setFilteredTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const { data, error } = await supabase
          .from('tenders')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching tenders:', error);
        } else if (data) {
          setTenders(data);
          setFilteredTenders(data);
        }
      } catch (error) {
        console.error('Error fetching tenders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTenders();
  }, []);

  useEffect(() => {
    const filtered = tenders.filter(tender =>
      tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTenders(filtered);
  }, [searchTerm, tenders]);

  const handleApplyToTender = (tender: Tender) => {
    if (!user) {
      // Redirect to auth page
      window.location.href = '/auth';
      return;
    }
    
    setSelectedTender(tender);
    setShowForm(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Тендери</h1>
            <p className="text-muted-foreground">Завантаження...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <section className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
              <Briefcase className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Тендери
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Активні конкурси та можливості співпраці з Верховною Радою України
          </p>
        </section>

        {/* Search */}
        <section className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Пошук тендерів..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </section>

        {/* Tenders List */}
        <section>
          {filteredTenders.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Тендерів за вашим запитом не знайдено.' : 'Активних тендерів наразі немає.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredTenders.map((tender, index) => (
                <Card 
                  key={tender.id} 
                  className="hover:shadow-medium transition-all duration-300 hover:-translate-y-1 animate-scale-in bg-gradient-card border-0"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 leading-relaxed">
                          {tender.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Опубліковано: {new Date(tender.created_at).toLocaleDateString('uk-UA')}
                        </CardDescription>
                      </div>
                      {tender.has_form && (
                        <Button 
                          onClick={() => handleApplyToTender(tender)}
                          className="ml-4 shrink-0"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Подати заявку
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none text-muted-foreground">
                      <p>{tender.content}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Tender Form Modal */}
        {showForm && selectedTender && (
          <TenderForm
            tender={selectedTender}
            onClose={() => {
              setShowForm(false);
              setSelectedTender(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default Tenders;