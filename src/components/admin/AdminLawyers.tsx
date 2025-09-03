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
import { Scale, Plus, Edit, Trash2, Loader2, Eye } from 'lucide-react';

interface Lawyer {
  id: string;
  name: string;
  license_number: string;
  specialization?: string;
  contact_info?: string;
  is_active: boolean;
  created_at: string;
}

export const AdminLawyers = () => {
  const { toast } = useToast();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLawyer, setEditingLawyer] = useState<Lawyer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    license_number: '',
    specialization: '',
    contact_info: '',
    is_active: true,
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchLawyers();
  }, []);

  const fetchLawyers = async () => {
    try {
      const { data, error } = await supabase
        .from('lawyers_registry')
        .select('*')
        .order('name');

      if (error) throw error;
      setLawyers(data || []);
    } catch (error) {
      console.error('Error fetching lawyers:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити адвокатів',
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
        specialization: formData.specialization || null,
        contact_info: formData.contact_info || null,
      };

      if (editingLawyer) {
        const { error } = await supabase
          .from('lawyers_registry')
          .update(dataToSave)
          .eq('id', editingLawyer.id);

        if (error) throw error;

        toast({
          title: 'Успіх',
          description: 'Адвоката оновлено',
        });
      } else {
        const { error } = await supabase
          .from('lawyers_registry')
          .insert([dataToSave]);

        if (error) throw error;

        toast({
          title: 'Успіх',
          description: 'Нового адвоката додано',
        });
      }

      await fetchLawyers();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving lawyer:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося зберегти адвоката',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цього адвоката?')) return;

    try {
      const { error } = await supabase
        .from('lawyers_registry')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Успіх',
        description: 'Адвоката видалено',
      });

      await fetchLawyers();
    } catch (error) {
      console.error('Error deleting lawyer:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося видалити адвоката',
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('lawyers_registry')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Успіх',
        description: `Адвоката ${!currentStatus ? 'активовано' : 'деактивовано'}`,
      });

      await fetchLawyers();
    } catch (error) {
      console.error('Error toggling lawyer status:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося змінити статус адвоката',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      license_number: '',
      specialization: '',
      contact_info: '',
      is_active: true,
    });
    setEditingLawyer(null);
  };

  const openEditDialog = (lawyer: Lawyer) => {
    setEditingLawyer(lawyer);
    setFormData({
      name: lawyer.name,
      license_number: lawyer.license_number,
      specialization: lawyer.specialization || '',
      contact_info: lawyer.contact_info || '',
      is_active: lawyer.is_active,
    });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Завантаження адвокатів...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5" />
          <h2 className="text-2xl font-bold">Керування реєстром адвокатів</h2>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Додати адвоката
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingLawyer ? 'Редагувати адвоката' : 'Додати нового адвоката'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ім'я адвоката *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="license_number">Номер ліцензії *</Label>
                <Input
                  id="license_number"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="specialization">Спеціалізація</Label>
                <Input
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_info">Контактна інформація</Label>
                <Textarea
                  id="contact_info"
                  value={formData.contact_info}
                  onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Активний статус</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Скасувати
                </Button>
                <Button type="submit">
                  {editingLawyer ? 'Оновити' : 'Додати'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {lawyers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Scale className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Адвокати поки що не додані</p>
            </CardContent>
          </Card>
        ) : (
          lawyers.map((lawyer) => (
            <Card key={lawyer.id} className={!lawyer.is_active ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{lawyer.name}</CardTitle>
                      {!lawyer.is_active && (
                        <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded">
                          Неактивний
                        </span>
                      )}
                    </div>
                    <CardDescription>
                      Ліцензія: {lawyer.license_number}
                      {lawyer.specialization && ` • ${lawyer.specialization}`}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(lawyer.id, lawyer.is_active)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(lawyer)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(lawyer.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {lawyer.contact_info && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{lawyer.contact_info}</p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};