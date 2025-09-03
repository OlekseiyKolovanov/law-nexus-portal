import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Search, ExternalLink } from 'lucide-react';

interface Law {
  id: string;
  title: string;
  link: string;
  created_at: string;
}

const Laws = () => {
  const [laws, setLaws] = useState<Law[]>([]);
  const [filteredLaws, setFilteredLaws] = useState<Law[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLaws = async () => {
      try {
        const { data, error } = await supabase
          .from('laws')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching laws:', error);
        } else if (data) {
          setLaws(data);
          setFilteredLaws(data);
        }
      } catch (error) {
        console.error('Error fetching laws:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLaws();
  }, []);

  useEffect(() => {
    const filtered = laws.filter(law =>
      law.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLaws(filtered);
  }, [searchTerm, laws]);

  if (loading) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Законодавча база</h1>
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
              <FileText className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Законодавча база
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Повний архів законів та нормативних актів України
          </p>
        </section>

        {/* Search */}
        <section className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Пошук законів..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </section>

        {/* Laws List */}
        <section>
          {filteredLaws.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Законів за вашим запитом не знайдено.' : 'Законодавча база буде наповнена найближчим часом.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredLaws.map((law, index) => (
                <Card 
                  key={law.id} 
                  className="hover:shadow-medium transition-all duration-300 hover:-translate-y-1 animate-scale-in bg-gradient-card border-0"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 leading-relaxed">
                          {law.title}
                        </CardTitle>
                        <CardDescription>
                          Додано: {new Date(law.created_at).toLocaleDateString('uk-UA')}
                        </CardDescription>
                      </div>
                      <Button asChild variant="outline" size="sm" className="ml-4 shrink-0">
                        <a href={law.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Переглянути
                        </a>
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Laws;