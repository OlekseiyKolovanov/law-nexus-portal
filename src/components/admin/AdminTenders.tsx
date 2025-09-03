import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Briefcase, Plus, Edit, Trash2, Loader2, Eye } from 'lucide-react';

interface Tender {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  has_form: boolean;
  created_at: string;
}

export const AdminTenders = () => {
  const { toast } = useToast();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTender, setEditingTender] = useState<Tender | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_active: true,
    has_form: false,
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    try {
      const { data, error } = await supabase
        .from('tenders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTenders(data || []);
    } catch (error) {
      console.error('Error fetching tenders:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити тендери',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTender) {
        const { error } = await supabase
          .from('tenders')
          .update(formData)
          .eq('id', editingTender.id);

        if (error) throw error;

        toast({
          title: 'Успіх',
          description: 'Тендер оновлено',
        });
      } else {
        const { error } = await supabase
          .from('tenders')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: 'Успіх',
          description: 'Новий тендер додано',
        });
      }

      await fetchTenders();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving tender:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося зберегти тендер',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цей тендер?')) return;

    try {
      const { error } = await supabase
        .from('tenders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Успіх',
        description: 'Тендер видалено',
      });

      await fetchTenders();
    } catch (error) {
      console.error('Error deleting tender:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося видалити тендер',
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('tenders')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Успіх',
        description: `Тендер ${!currentStatus ? 'активовано' : 'деактивовано'}`,
      });

      await fetchTenders();
    } catch (error) {
      console.error('Error toggling tender status:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося змінити статус тендера',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      is_active: true,
      has_form: false,
    });
    setEditingTender(null);
  };

  const openEditDialog = (tender: Tender) => {
    setEditingTender(tender);
    setFormData({
      title: tender.title,
      content: tender.content,
      is_active: tender.is_active,
      has_form: tender.has_form,
    });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Завантаження тендерів...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          <h2 className="text-2xl font-bold">Керування тендерами</h2>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Додати тендер
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTender ? 'Редагувати тендер' : 'Додати новий тендер'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Назва тендера *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Опис тендера *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={5}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Активний тендер</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="has_form"
                  checked={formData.has_form}
                  onCheckedChange={(checked) => setFormData({ ...formData, has_form: checked })}
                />
                <Label htmlFor="has_form">Має форму для заявок</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Скасувати
                </Button>
                <Button type="submit">
                  {editingTender ? 'Оновити' : 'Додати'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {tenders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Тендери поки що не додано</p>
            </CardContent>
          </Card>
        ) : (
          tenders.map((tender) => (
            <Card key={tender.id} className={!tender.is_active ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="leading-relaxed">{tender.title}</CardTitle>
                      {!tender.is_active && (
                        <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded">
                          Неактивний
                        </span>
                      )}
                      {tender.has_form && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                          Має форму
                        </span>
                      )}
                    </div>
                    <CardDescription>
                      Додано: {new Date(tender.created_at).toLocaleDateString('uk-UA')}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(tender.id, tender.is_active)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(tender)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(tender.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{tender.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};