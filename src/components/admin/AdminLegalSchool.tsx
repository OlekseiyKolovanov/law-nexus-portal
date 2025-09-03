import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Plus, Edit, Trash2, Loader2, ExternalLink } from 'lucide-react';

interface LegalSchoolTopic {
  id: string;
  title: string;
  content?: string;
  link?: string;
  created_at: string;
}

export const AdminLegalSchool = () => {
  const { toast } = useToast();
  const [topics, setTopics] = useState<LegalSchoolTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTopic, setEditingTopic] = useState<LegalSchoolTopic | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    link: '',
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_school')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Error fetching legal school topics:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити теми школи права',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dataToSave = {
        ...formData,
        content: formData.content || null,
        link: formData.link || null,
      };

      if (editingTopic) {
        const { error } = await supabase
          .from('legal_school')
          .update(dataToSave)
          .eq('id', editingTopic.id);

        if (error) throw error;

        toast({
          title: 'Успіх',
          description: 'Тему оновлено',
        });
      } else {
        const { error } = await supabase
          .from('legal_school')
          .insert([dataToSave]);

        if (error) throw error;

        toast({
          title: 'Успіх',
          description: 'Нову тему додано',
        });
      }

      await fetchTopics();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving topic:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося зберегти тему',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цю тему?')) return;

    try {
      const { error } = await supabase
        .from('legal_school')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Успіх',
        description: 'Тему видалено',
      });

      await fetchTopics();
    } catch (error) {
      console.error('Error deleting topic:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося видалити тему',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      link: '',
    });
    setEditingTopic(null);
  };

  const openEditDialog = (topic: LegalSchoolTopic) => {
    setEditingTopic(topic);
    setFormData({
      title: topic.title,
      content: topic.content || '',
      link: topic.link || '',
    });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Завантаження тем школи права...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          <h2 className="text-2xl font-bold">Керування школою права</h2>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Додати тему
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTopic ? 'Редагувати тему' : 'Додати нову тему'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Назва теми *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Опис теми</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={5}
                  placeholder="Додайте опис або короткий зміст теми..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="link">Посилання на матеріал</Label>
                <Input
                  id="link"
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Скасувати
                </Button>
                <Button type="submit">
                  {editingTopic ? 'Оновити' : 'Додати'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {topics.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Теми школи права поки що не додано</p>
            </CardContent>
          </Card>
        ) : (
          topics.map((topic) => (
            <Card key={topic.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="leading-relaxed">{topic.title}</CardTitle>
                    <CardDescription>
                      Додано: {new Date(topic.created_at).toLocaleDateString('uk-UA')}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {topic.link && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={topic.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(topic)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(topic.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {topic.content && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{topic.content}</p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};