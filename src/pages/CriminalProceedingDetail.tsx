import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, FileText, ExternalLink } from 'lucide-react';

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
  updated_at: string;
}

interface Document {
  id: string;
  document_name: string;
  document_link: string;
  order_index: number;
}

export default function CriminalProceedingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [proceeding, setProceeding] = useState<CriminalProceeding | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProceeding();
      fetchDocuments();
    }
  }, [id]);

  const fetchProceeding = async () => {
    try {
      const { data, error } = await supabase
        .from('criminal_proceedings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProceeding(data);
    } catch (error) {
      console.error('Error fetching proceeding:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('proceeding_documents')
        .select('*')
        .eq('proceeding_id', id)
        .order('order_index');

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
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

  if (!proceeding) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="festive-card">
            <CardContent className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground mb-4">
                Провадження не знайдено
              </p>
              <Button onClick={() => navigate('/criminal-proceedings')} className="btn-festive">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад до списку
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <Button
          variant="outline"
          onClick={() => navigate('/criminal-proceedings')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад до реєстру
        </Button>

        <Card className="festive-card">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={getStatusColor(proceeding.status)}>
                    {proceeding.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Створено: {new Date(proceeding.created_at).toLocaleDateString('uk-UA')}
                  </span>
                </div>
                <CardTitle className="text-3xl text-gradient-festive mb-2">
                  Кримінальне провадження
                </CardTitle>
                <CardDescription>
                  ID: {proceeding.id}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Підозрюваний
                  </h3>
                  <p className="text-lg font-semibold">{proceeding.suspect_full_name}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Інкримінована стаття
                  </h3>
                  <p className="text-lg">{proceeding.incriminating_article}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Дата вчинення злочину
                  </h3>
                  <p className="text-lg">
                    {new Date(proceeding.crime_date).toLocaleDateString('uk-UA')}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Ініціатор внесення
                  </h3>
                  <p className="text-lg font-semibold">{proceeding.initiator_full_name}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Структура
                  </h3>
                  <p className="text-lg">{proceeding.initiating_structure}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Останнє оновлення
                  </h3>
                  <p className="text-lg">
                    {new Date(proceeding.updated_at).toLocaleDateString('uk-UA')}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Обставини злочину
              </h3>
              <p className="text-base leading-relaxed whitespace-pre-wrap">
                {proceeding.circumstances_description}
              </p>
            </div>

            {documents.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Прикріплені документи
                </h3>
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.document_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                    >
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="flex-1 font-medium">{doc.document_name}</span>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
