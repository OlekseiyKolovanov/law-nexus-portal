import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Edit, Trash2, Loader2 } from 'lucide-react';

interface LeadershipMember {
  id: string;
  name: string;
  position: string;
  photo_url?: string;
  bio?: string;
  order_index: number;
}

export const AdminLeadership = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<LeadershipMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<LeadershipMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    photo_url: '',
    bio: '',
    order_index: 0,
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('leadership')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching leadership:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити керівництво',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingMember) {
        const { error } = await supabase
          .from('leadership')
          .update(formData)
          .eq('id', editingMember.id);

        if (error) throw error;

        toast({
          title: 'Успіх',
          description: 'Члена керівництва оновлено',
        });
      } else {
        const { error } = await supabase
          .from('leadership')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: 'Успіх',
          description: 'Нового члена керівництва додано',
        });
      }

      await fetchMembers();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving member:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося зберегти члена керівництва',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цього члена керівництва?')) return;

    try {
      const { error } = await supabase
        .from('leadership')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Успіх',
        description: 'Члена керівництва видалено',
      });

      await fetchMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося видалити члена керівництва',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      photo_url: '',
      bio: '',
      order_index: members.length,
    });
    setEditingMember(null);
  };

  const openEditDialog = (member: LeadershipMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      position: member.position,
      photo_url: member.photo_url || '',
      bio: member.bio || '',
      order_index: member.order_index,
    });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Завантаження керівництва...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          <h2 className="text-2xl font-bold">Керування керівництвом</h2>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Додати члена керівництва
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingMember ? 'Редагувати члена керівництва' : 'Додати нового члена керівництва'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ім'я *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="position">Посада *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="photo_url">URL фотографії</Label>
                <Input
                  id="photo_url"
                  type="url"
                  value={formData.photo_url}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Біографія</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="order_index">Порядок відображення</Label>
                <Input
                  id="order_index"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Скасувати
                </Button>
                <Button type="submit">
                  {editingMember ? 'Оновити' : 'Додати'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {members.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Керівництво поки що не додано</p>
            </CardContent>
          </Card>
        ) : (
          members.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{member.name}</CardTitle>
                    <CardDescription>{member.position}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(member)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(member.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {member.bio && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};