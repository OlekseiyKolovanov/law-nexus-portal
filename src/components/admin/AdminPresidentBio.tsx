import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Loader2, Plus, Edit } from 'lucide-react';

interface PresidentBio {
  id: string;
  full_name: string;
  position: string;
  bio: string;
  photo_url: string | null;
  birth_date: string | null;
  education: string | null;
  achievements: string | null;
}

export const AdminPresidentBio = () => {
  const { toast } = useToast();
  const [bio, setBio] = useState<PresidentBio | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    position: 'Президент',
    bio: '',
    photo_url: '',
    birth_date: '',
    education: '',
    achievements: '',
  });

  useEffect(() => {
    fetchBio();
  }, []);

  const fetchBio = async () => {
    try {
      const { data, error } = await supabase
        .from('president_biography')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setBio(data);
    } catch (error) {
      console.error('Error fetching bio:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (data?: PresidentBio) => {
    if (data) {
      setFormData({
        full_name: data.full_name,
        position: data.position,
        bio: data.bio,
        photo_url: data.photo_url || '',
        birth_date: data.birth_date || '',
        education: data.education || '',
        achievements: data.achievements || '',
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (bio) {
        // Update existing
        const { error } = await supabase
          .from('president_biography')
          .update(formData)
          .eq('id', bio.id);

        if (error) throw error;
        toast({ title: 'Успіх', description: 'Біографію оновлено' });
      } else {
        // Create new
        const { error } = await supabase
          .from('president_biography')
          .insert([formData]);

        if (error) throw error;
        toast({ title: 'Успіх', description: 'Біографію створено' });
      }

      await fetchBio();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving bio:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося зберегти біографію',
        variant: 'destructive',
      });
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
          <User className="w-5 h-5" />
          <h2 className="text-2xl font-bold">Біографія Президента</h2>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openEditDialog(bio || undefined)}>
              {bio ? <><Edit className="w-4 h-4 mr-2" />Редагувати</> : <><Plus className="w-4 h-4 mr-2" />Створити</>}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{bio ? 'Редагувати біографію' : 'Створити біографію'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">ПІБ *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
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
                <Label htmlFor="photo_url">URL фото</Label>
                <Input
                  id="photo_url"
                  value={formData.photo_url}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">Дата народження</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Біографія *</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  required
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">Освіта</Label>
                <Textarea
                  id="education"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="achievements">Досягнення</Label>
                <Textarea
                  id="achievements"
                  value={formData.achievements}
                  onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Скасувати
                </Button>
                <Button type="submit">
                  Зберегти
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {bio ? (
        <Card>
          <CardHeader>
            <CardTitle>{bio.full_name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {bio.photo_url && (
              <img src={bio.photo_url} alt={bio.full_name} className="w-32 h-32 rounded-full object-cover" />
            )}
            <div>
              <p className="font-medium">Посада:</p>
              <p className="text-muted-foreground">{bio.position}</p>
            </div>
            {bio.birth_date && (
              <div>
                <p className="font-medium">Дата народження:</p>
                <p className="text-muted-foreground">
                  {new Date(bio.birth_date).toLocaleDateString('uk-UA')}
                </p>
              </div>
            )}
            <div>
              <p className="font-medium">Біографія:</p>
              <p className="text-muted-foreground whitespace-pre-wrap">{bio.bio}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Біографія ще не створена</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
