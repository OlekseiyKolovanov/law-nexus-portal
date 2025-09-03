import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
        toast({ title: 'Успіх', description: 'Підприємство оновлено' });
      } else {
        const { error } = await supabase
          .from('enterprises')
          .insert([formData]);

        if (error) throw error;
        toast({ title: 'Успіх', description: 'Нове підприємство додано' });
      }

      await fetchEnterprises();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: 'Помилка', description: 'Не вдалося зберегти', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      business_type: '',
      owner_name: '',
      registration_number: '',
      contact_info: '',
      is_active: true,
    });
    setEditingEnterprise(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Завантаження...</span>
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
              Додати
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Додати підприємство</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Назва *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <Button type="submit">Зберегти</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {enterprises.map((enterprise) => (
          <Card key={enterprise.id}>
            <CardHeader>
              <CardTitle>{enterprise.name}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};