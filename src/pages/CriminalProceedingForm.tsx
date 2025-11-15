import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, FileText } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  link: string;
}

export default function CriminalProceedingForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([
    { id: crypto.randomUUID(), name: '', link: '' }
  ]);

  const [formData, setFormData] = useState({
    initiator_full_name: '',
    initiating_structure: '',
    suspect_full_name: '',
    incriminating_article: '',
    circumstances_description: '',
    crime_date: '',
  });

  const addDocument = () => {
    if (documents.length < 20) {
      setDocuments([...documents, { id: crypto.randomUUID(), name: '', link: '' }]);
    }
  };

  const removeDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const updateDocument = (id: string, field: 'name' | 'link', value: string) => {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, [field]: value } : doc
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Помилка',
        description: 'Необхідно увійти в систему',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    setLoading(true);

    try {
      // Create the proceeding
      const { data: proceeding, error: proceedingError } = await supabase
        .from('criminal_proceedings')
        .insert([{
          ...formData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (proceedingError) throw proceedingError;

      // Add documents if any
      const validDocuments = documents.filter(doc => doc.name && doc.link);
      if (validDocuments.length > 0 && proceeding) {
        const documentsToInsert = validDocuments.map((doc, index) => ({
          proceeding_id: proceeding.id,
          document_name: doc.name,
          document_link: doc.link,
          order_index: index,
        }));

        const { error: docsError } = await supabase
          .from('proceeding_documents')
          .insert(documentsToInsert);

        if (docsError) throw docsError;
      }

      toast({
        title: 'Успіх',
        description: 'Кримінальне провадження успішно подано',
      });

      navigate(`/criminal-proceedings/${proceeding.id}`);
    } catch (error) {
      console.error('Error creating proceeding:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося подати провадження',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="festive-card">
            <CardContent className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground mb-4">
                Для подання кримінального провадження необхідно увійти в систему
              </p>
              <Button onClick={() => navigate('/auth')} className="btn-festive">
                Увійти
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="festive-card">
          <CardHeader>
            <CardTitle className="text-3xl text-gradient-festive">
              Подання кримінального провадження до ЄРДР
            </CardTitle>
            <CardDescription>
              Заповніть всі поля для реєстрації провадження
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="initiator_full_name">
                  ПІБ ініціатора внесення до ЄРДР *
                </Label>
                <Input
                  id="initiator_full_name"
                  value={formData.initiator_full_name}
                  onChange={(e) => setFormData({ ...formData, initiator_full_name: e.target.value })}
                  required
                  placeholder="Прізвище Ім'я По батькові"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="initiating_structure">
                  Структура котра клопотає про відкриття КП *
                </Label>
                <Input
                  id="initiating_structure"
                  value={formData.initiating_structure}
                  onChange={(e) => setFormData({ ...formData, initiating_structure: e.target.value })}
                  required
                  placeholder="Назва структури"
                />
              </div>

              <div className="space-y-2">
                <Label>Посилання на кримінальне провадження</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Додайте посилання на документи (Google Docs тощо). Максимум 20 документів.
                </p>
                <div className="space-y-3">
                  {documents.map((doc, index) => (
                    <div key={doc.id} className="flex gap-2">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Назва документу"
                          value={doc.name}
                          onChange={(e) => updateDocument(doc.id, 'name', e.target.value)}
                        />
                        <Input
                          placeholder="Посилання на документ"
                          value={doc.link}
                          onChange={(e) => updateDocument(doc.id, 'link', e.target.value)}
                          type="url"
                        />
                      </div>
                      {documents.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeDocument(doc.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {documents.length < 20 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addDocument}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Додати документ
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="suspect_full_name">ПІБ підозрюваного *</Label>
                <Input
                  id="suspect_full_name"
                  value={formData.suspect_full_name}
                  onChange={(e) => setFormData({ ...formData, suspect_full_name: e.target.value })}
                  required
                  placeholder="Прізвище Ім'я По батькові"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="incriminating_article">
                  Стаття котра інкримінується підозрюваному *
                </Label>
                <Input
                  id="incriminating_article"
                  value={formData.incriminating_article}
                  onChange={(e) => setFormData({ ...formData, incriminating_article: e.target.value })}
                  required
                  placeholder="Наприклад: Стаття 111 КК України"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="circumstances_description">
                  Короткий опис обставин, які можуть «пролити світло» на обставини злочину *
                </Label>
                <Textarea
                  id="circumstances_description"
                  value={formData.circumstances_description}
                  onChange={(e) => setFormData({ ...formData, circumstances_description: e.target.value })}
                  required
                  rows={6}
                  placeholder="Детальний опис обставин..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="crime_date">Дата вчинення злочину *</Label>
                <Input
                  id="crime_date"
                  type="date"
                  value={formData.crime_date}
                  onChange={(e) => setFormData({ ...formData, crime_date: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/criminal-proceedings')}
                  disabled={loading}
                >
                  Скасувати
                </Button>
                <Button type="submit" disabled={loading} className="btn-festive">
                  {loading ? 'Подання...' : 'Подати провадження'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
