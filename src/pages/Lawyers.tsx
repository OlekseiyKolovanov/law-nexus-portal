import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Scale, Search, Phone, Mail, MapPin } from 'lucide-react';

interface Lawyer {
  id: string;
  name: string;
  license_number: string;
  specialization?: string;
  contact_info?: string;
  is_active: boolean;
  created_at: string;
}

const Lawyers = () => {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [filteredLawyers, setFilteredLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const { data, error } = await supabase
          .from('lawyers_registry')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) {
          console.error('Error fetching lawyers:', error);
        } else if (data) {
          setLawyers(data);
          setFilteredLawyers(data);
        }
      } catch (error) {
        console.error('Error fetching lawyers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLawyers();
  }, []);

  useEffect(() => {
    const filtered = lawyers.filter(lawyer =>
      lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lawyer.license_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lawyer.specialization && lawyer.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredLawyers(filtered);
  }, [searchTerm, lawyers]);

  if (loading) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Реєстр адвокатів</h1>
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
              <Scale className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Реєстр адвокатів
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Офіційний реєстр ліцензованих адвокатів України
          </p>
        </section>

        {/* Search */}
        <section className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Пошук за ім'ям, номером ліцензії або спеціалізацією..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </section>

        {/* Lawyers List */}
        <section>
          {filteredLawyers.length === 0 ? (
            <div className="text-center py-12">
              <Scale className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Адвокатів за вашим запитом не знайдено.' : 'Реєстр адвокатів буде наповнений найближчим часом.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLawyers.map((lawyer, index) => (
                <Card 
                  key={lawyer.id} 
                  className="hover:shadow-medium transition-all duration-300 hover:-translate-y-1 animate-scale-in bg-gradient-card border-0"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{lawyer.name}</CardTitle>
                    <CardDescription>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Scale className="w-4 h-4 text-primary" />
                          <span>Ліцензія: {lawyer.license_number}</span>
                        </div>
                        {lawyer.specialization && (
                          <div className="text-sm text-muted-foreground">
                            Спеціалізація: {lawyer.specialization}
                          </div>
                        )}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  {lawyer.contact_info && (
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{lawyer.contact_info}</span>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Lawyers;