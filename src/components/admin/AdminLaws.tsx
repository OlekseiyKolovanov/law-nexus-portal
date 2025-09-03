import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText, Plus, Edit, Trash2, Loader2, ExternalLink } from 'lucide-react';

interface Law {
  id: string;
  title: string;
  link: string;
  created_at: string;
}

export const AdminLaws = () => {
  const { toast } = useToast();
  const [laws, setLaws] = useState<Law[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLaw, setEditingLaw] = useState<Law | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    link: '',
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchLaws();
  }, []);

  const fetchLaws = async () => {
    try {
      const { data, error } = await supabase
        .from('laws')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLaws(data || []);
    } catch (error) {
      console.error('Error fetching laws:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити закони',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingLaw) {
        const { error } = await supabase
          .from('laws')
          .update(formData)
          .eq('id', editingLaw.id);

        if (error) throw error;

        toast({
          title: 'Успіх',
          description: 'Закон оновлено',
        });
      } else {
        const { error } = await supabase
          .from('laws')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: 'Успіх',
          description: 'Новий закон додано',
        });
      }

      await fetchLaws();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving law:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося зберегти закон',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цей закон?')) return;

    try {
      const { error } = await supabase
        .from('laws')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Успіх',
        description: 'Закон видалено',
      });

      await fetchLaws();
    } catch (error) {
      console.error('Error deleting law:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося видалити закон',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      link: '',
    });
    setEditingLaw(null);
  };

  const openEditDialog = (law: Law) => {
    setEditingLaw(law);
    setFormData({
      title: law.title,
      link: law.link,
    });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Завантаження законів...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          <h2 className="text-2xl font-bold">Керування законами</h2>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Додати закон
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingLaw ? 'Редагувати закон' : 'Додати новий закон'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Назва закону *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="link">Посилання на закон *</Label>
                <Input
                  id="link"
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  required
                  placeholder="https://..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Скасувати
                </Button>
                <Button type="submit">
                  {editingLaw ? 'Оновити' : 'Додати'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {laws.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Закони поки що не додано</p>
            </CardContent>
          </Card>
        ) : (
          laws.map((law) => (
            <Card key={law.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="leading-relaxed">{law.title}</CardTitle>
                    <CardDescription>
                      Додано: {new Date(law.created_at).toLocaleDateString('uk-UA')}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={law.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(law)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(law.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};