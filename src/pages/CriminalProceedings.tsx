import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'react-router-dom';
import { FileText, Plus, ExternalLink, Calendar, User } from 'lucide-react';

interface CriminalProceeding {
  id: string;
  initiator_full_name: string;
  initiating_structure: string;
  suspect_full_name: string;
  incriminating_article: string;
  circumstances_description: string;
  crime_date: string;
  status: string;
  created_at: string;
  user_id: string;
}

export default function CriminalProceedings() {
  const { user } = useAuth();
  const [proceedings, setProceedings] = useState<CriminalProceeding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProceedings();
  }, []);

  const fetchProceedings = async () => {
    try {
      const { data, error } = await supabase
        .from('criminal_proceedings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProceedings(data || []);
    } catch (error) {
      console.error('Error fetching proceedings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'на розгляді': return 'bg-yellow-500';
      case 'схвалено': return 'bg-green-500';
      case 'відмовлено': return 'bg-red-500';
      case 'передано до суду': return 'bg-blue-500';
      case 'триває розслідування': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Завантаження...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gradient-festive mb-2">
              Єдиний реєстр досудових розслідувань
            </h1>
            <p className="text-muted-foreground">
              Загальнодоступна інформація про кримінальні провадження
            </p>
          </div>
          {user && (
            <Link to="/criminal-proceedings/new">
              <Button className="btn-festive">
                <Plus className="w-4 h-4 mr-2" />
                Подати провадження
              </Button>
            </Link>
          )}
        </div>

        {/* Proceedings List */}
        <div className="grid gap-6">
          {proceedings.length === 0 ? (
            <Card className="festive-card">
              <CardContent className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">
                  Кримінальні провадження поки що відсутні
                </p>
                {user && (
                  <Link to="/criminal-proceedings/new">
                    <Button className="btn-festive mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Подати перше провадження
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            proceedings.map((proceeding) => (
              <Card key={proceeding.id} className="festive-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusColor(proceeding.status)}>
                          {proceeding.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(proceeding.created_at).toLocaleDateString('uk-UA')}
                        </span>
                      </div>
                      <CardTitle className="text-xl mb-1">
                        Підозрюваний: {proceeding.suspect_full_name}
                      </CardTitle>
                      <CardDescription>
                        Стаття: {proceeding.incriminating_article}
                      </CardDescription>
                    </div>
                    <Link to={`/criminal-proceedings/${proceeding.id}`}>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Детальніше
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <User className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Ініціатор:</p>
                      <p className="text-muted-foreground">{proceeding.initiator_full_name}</p>
                      <p className="text-muted-foreground text-xs">{proceeding.initiating_structure}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Короткий опис:</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {proceeding.circumstances_description}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Дата вчинення: {new Date(proceeding.crime_date).toLocaleDateString('uk-UA')}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
