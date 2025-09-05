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
import { Building2, Plus, Edit, Trash2, Loader2, Eye } from 'lucide-react';

interface Enterprise {
  id: string;
  name: string;
  business_type: string;
  owner_name: string;
  authorized_person?: string;
  registration_number?: string;
  contact_info?: string;
  is_active: boolean;
  created_at: string;
}

export const AdminEnterprises = () => {
  const { toast } = useToast();
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEnterprise, setEditingEnterprise] = useState<Enterprise | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    business_type: '',
    owner_name: '',
    authorized_person: '',
    registration_number: '',
    contact_info: '',
    is_active: true,
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchEnterprises();
  }, []);

  const fetchEnterprises = async () => {
    try {
      const { data, error } = await supabase
        .from('enterprises')
        .select('*')
        .order('name');

      if (error) throw error;
      setEnterprises(data || []);
    } catch (error) {
      console.error('Error fetching enterprises:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити підприємства',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingEnterprise) {
        const { error } = await supabase
          .from('enterprises')
          .update(formData)
          .eq('id', editingEnterprise.id);

        if (error) throw error;
        
        toast({
          title: 'Успіх',
          description: 'Підприємство оновлено',
        });
      } else {
        const { error } = await supabase
          .from('enterprises')
          .insert([formData]);

        if (error) throw error;
        
        toast({
          title: 'Успіх',
          description: 'Нове підприємство додано',
        });
      }

      await fetchEnterprises();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving enterprise:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося зберегти підприємство',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ви впевнені, що хочете видалити це підприємство?')) return;

    try {
      const { error } = await supabase
        .from('enterprises')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Успіх',
        description: 'Підприємство видалено',
      });

      await fetchEnterprises();
    } catch (error) {
      console.error('Error deleting enterprise:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося видалити підприємство',
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('enterprises')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Успіх',
        description: `Підприємство ${!currentStatus ? 'активовано' : 'деактивовано'}`,
      });

      await fetchEnterprises();
    } catch (error) {
      console.error('Error toggling enterprise status:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося змінити статус підприємства',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      business_type: '',
      owner_name: '',
      authorized_person: '',
      registration_number: '',
      contact_info: '',
      is_active: true,
    });
    setEditingEnterprise(null);
  };

  const openEditDialog = (enterprise: Enterprise) => {
    setEditingEnterprise(enterprise);
    setFormData({
      name: enterprise.name,
      business_type: enterprise.business_type,
      owner_name: enterprise.owner_name,
      authorized_person: enterprise.authorized_person || '',
      registration_number: enterprise.registration_number || '',
      contact_info: enterprise.contact_info || '',
      is_active: enterprise.is_active,
    });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Завантаження підприємств...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          <h2 className="text-2xl font-bold">Підприємства</h2>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Додати підприємство
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEnterprise ? 'Редагувати підприємство' : 'Додати нове підприємство'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Назва підприємства *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_type">Тип бізнесу *</Label>
                <Input
                  id="business_type"
                  value={formData.business_type}
                  onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                  placeholder="Наприклад: ТОВ, ПП, АТ"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="owner_name">Власник *</Label>
                <Input
                  id="owner_name"
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  placeholder="ПІБ власника"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="authorized_person">Уповноважена особа</Label>
                <Input
                  id="authorized_person"
                  value={formData.authorized_person}
                  onChange={(e) => setFormData({ ...formData, authorized_person: e.target.value })}
                  placeholder="ПІБ уповноваженої особи"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registration_number">Реєстраційний номер</Label>
                <Input
                  id="registration_number"
                  value={formData.registration_number}
                  onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                  placeholder="ЄДРПОУ або інший номер"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_info">Контактна інформація</Label>
                <Textarea
                  id="contact_info"
                  value={formData.contact_info}
                  onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                  placeholder="Телефон, email, адреса тощо"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Активне підприємство</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Скасувати
                </Button>
                <Button type="submit">
                  {editingEnterprise ? 'Оновити' : 'Додати'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {enterprises.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Підприємства поки що не додано</p>
            </CardContent>
          </Card>
        ) : (
          enterprises.map((enterprise) => (
            <Card key={enterprise.id} className={!enterprise.is_active ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="leading-relaxed">{enterprise.name}</CardTitle>
                      {!enterprise.is_active && (
                        <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded">
                          Неактивне
                        </span>
                      )}
                    </div>
                    <CardDescription>
                      <div className="space-y-1">
                        <div>Тип: {enterprise.business_type}</div>
                        <div>Власник: {enterprise.owner_name}</div>
                        {enterprise.authorized_person && (
                          <div>Уповноважена особа: {enterprise.authorized_person}</div>
                        )}
                        {enterprise.registration_number && (
                          <div>Реєстр. номер: {enterprise.registration_number}</div>
                        )}
                        <div>Додано: {new Date(enterprise.created_at).toLocaleDateString('uk-UA')}</div>
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(enterprise.id, enterprise.is_active)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(enterprise)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(enterprise.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {enterprise.contact_info && (
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <strong>Контакти:</strong> {enterprise.contact_info}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};