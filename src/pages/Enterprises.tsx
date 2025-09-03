import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Search, Phone, Mail, FileText } from 'lucide-react';

interface Enterprise {
  id: string;
  name: string;
  business_type: string;
  owner_name: string;
  registration_number?: string;
  contact_info?: string;
  is_active: boolean;
  created_at: string;
}

const Enterprises = () => {
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [filteredEnterprises, setFilteredEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEnterprises = async () => {
      try {
        const { data, error } = await supabase
          .from('enterprises')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) {
          console.error('Error fetching enterprises:', error);
        } else if (data) {
          setEnterprises(data);
          setFilteredEnterprises(data);
        }
      } catch (error) {
        console.error('Error fetching enterprises:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnterprises();
  }, []);

  useEffect(() => {
    const filtered = enterprises.filter(enterprise =>
      enterprise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enterprise.business_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enterprise.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (enterprise.registration_number && enterprise.registration_number.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredEnterprises(filtered);
  }, [searchTerm, enterprises]);

  if (loading) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Підприємства</h1>
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
              <Building2 className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Підприємства
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Реєстр підприємств та організацій України
          </p>
        </section>

        {/* Search */}
        <section className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Пошук за назвою, типом бізнесу або власником..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </section>

        {/* Enterprises List */}
        <section>
          {filteredEnterprises.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Підприємств за вашим запитом не знайдено.' : 'Реєстр підприємств буде наповнений найближчим часом.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEnterprises.map((enterprise, index) => (
                <Card 
                  key={enterprise.id} 
                  className="hover:shadow-medium transition-all duration-300 hover:-translate-y-1 animate-scale-in bg-gradient-card border-0"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{enterprise.name}</CardTitle>
                    <CardDescription>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-primary" />
                          <span>{enterprise.business_type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span>Власник: {enterprise.owner_name}</span>
                        </div>
                        {enterprise.registration_number && (
                          <div className="text-sm text-muted-foreground">
                            Реєстр. №: {enterprise.registration_number}
                          </div>
                        )}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  {enterprise.contact_info && (
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{enterprise.contact_info}</span>
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

export default Enterprises;