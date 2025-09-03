import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { Users, Mail, Phone } from 'lucide-react';

interface LeadershipMember {
  id: string;
  name: string;
  position: string;
  photo_url?: string;
  bio?: string;
  order_index: number;
}

const Leadership = () => {
  const [leadership, setLeadership] = useState<LeadershipMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeadership = async () => {
      try {
        const { data, error } = await supabase
          .from('leadership')
          .select('*')
          .order('order_index', { ascending: true });

        if (error) {
          console.error('Error fetching leadership:', error);
        } else if (data) {
          setLeadership(data);
        }
      } catch (error) {
        console.error('Error fetching leadership:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadership();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Керівництво</h1>
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
              <Users className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Керівництво
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Керівний склад Верховної Ради України та основні посадові особи
          </p>
        </section>

        {/* Leadership Grid */}
        <section>
          {leadership.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Інформація про керівництво буде додана найближчим часом.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {leadership.map((member, index) => (
                <Card 
                  key={member.id} 
                  className="hover:shadow-medium transition-all duration-300 hover:-translate-y-1 animate-scale-in bg-gradient-card border-0"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="text-center pb-2">
                    <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-primary/20">
                      <AvatarImage src={member.photo_url} alt={member.name} />
                      <AvatarFallback className="text-lg font-semibold bg-gradient-primary text-primary-foreground">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-xl">{member.name}</CardTitle>
                    <CardDescription className="text-base font-medium text-primary">
                      {member.position}
                    </CardDescription>
                  </CardHeader>
                  {member.bio && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {member.bio}
                      </p>
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

export default Leadership;