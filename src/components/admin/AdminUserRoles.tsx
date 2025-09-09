import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Plus, Loader2, Trash2, Users } from 'lucide-react';

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profiles?: {
    nickname?: string;
    first_name?: string;
    last_name?: string;
  } | null;
}

export const AdminUserRoles = () => {
  const { toast } = useToast();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    user_nickname: '',
    role: 'admin',
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchUserRoles();
  }, []);

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          profiles:user_id (
            nickname,
            first_name,
            last_name
          )
        `);

      if (error) throw error;
      setUserRoles(data || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Find user by nickname
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('nickname', formData.user_nickname)
        .single();

      if (profileError || !profile) {
        toast({
          title: 'Помилка',
          description: 'Користувача з таким ніком не знайдено',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: profile.user_id,
          role: formData.role,
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: 'Помилка',
            description: 'Користувач вже має цю роль',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: 'Успіх',
        description: 'Роль додано користувачу',
      });

      await fetchUserRoles();
      setDialogOpen(false);
      setFormData({ user_nickname: '', role: 'admin' });
    } catch (error) {
      console.error('Error adding role:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося додати роль',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цю роль?')) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: 'Успіх',
        description: 'Роль видалено',
      });

      await fetchUserRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося видалити роль',
        variant: 'destructive',
      });
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Адміністратор';
      case 'deputy': return 'Депутат';
      case 'license_manager': return 'Менеджер ліцензій';
      case 'law_manager': return 'Менеджер законів';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'deputy': return 'bg-blue-500';
      case 'license_manager': return 'bg-green-500';
      case 'law_manager': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
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
          <Shield className="w-5 h-5" />
          <h2 className="text-2xl font-bold">Керування ролями користувачів</h2>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Додати роль
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Додати роль користувачу</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddRole} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user_nickname">Нік користувача *</Label>
                <Input
                  id="user_nickname"
                  value={formData.user_nickname}
                  onChange={(e) => setFormData({ ...formData, user_nickname: e.target.value })}
                  required
                  placeholder="Введіть нік користувача"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Роль *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Адміністратор</SelectItem>
                    <SelectItem value="deputy">Депутат</SelectItem>
                    <SelectItem value="license_manager">Менеджер ліцензій</SelectItem>
                    <SelectItem value="law_manager">Менеджер законів</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Скасувати
                </Button>
                <Button type="submit">
                  Додати роль
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {userRoles.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Ролі користувачів поки що не призначено</p>
            </CardContent>
          </Card>
        ) : (
          userRoles.map((userRole) => (
            <Card key={userRole.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {userRole.profiles?.nickname || 
                       `${userRole.profiles?.first_name || ''} ${userRole.profiles?.last_name || ''}`.trim() || 
                       'Невідомий користувач'}
                    </CardTitle>
                    <CardDescription>
                      Додано: {new Date(userRole.created_at).toLocaleDateString('uk-UA')}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleColor(userRole.role)}>
                      {getRoleLabel(userRole.role)}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteRole(userRole.id)}
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