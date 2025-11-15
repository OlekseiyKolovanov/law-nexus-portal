import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Scale, Plus, CreditCard as Edit, Trash2, Loader as Loader2, ExternalLink, ThumbsUp, ThumbsDown, Minus, ChartBar as BarChart3 } from 'lucide-react';

interface Voting {
  id: string;
  title: string;
  link: string | null;
  is_active: boolean;
  created_at: string;
}

interface VotingStats {
  for_count: number;
  against_count: number;
  abstain_count: number;
  total_votes: number;
}

export const AdminVoting = () => {
  const { toast } = useToast();
  const [votings, setVotings] = useState<Voting[]>([]);
  const [votingStats, setVotingStats] = useState<Record<string, VotingStats>>({});
  const [loading, setLoading] = useState(true);
  const [editingVoting, setEditingVoting] = useState<Voting | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    is_active: true,
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchVotings();
  }, []);

  const fetchVotings = async () => {
    try {
      const { data, error } = await supabase
        .from('votings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVotings(data || []);
      
      // Fetch stats for each voting
      if (data) {
        for (const voting of data) {
          await fetchVotingStats(voting.id);
        }
      }
    } catch (error) {
      console.error('Error fetching votings:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити голосування',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVotingStats = async (votingId: string) => {
    try {
      const { data: votes, error } = await supabase
        .from('votes')
        .select('vote')
        .eq('voting_id', votingId);

      if (error) throw error;

      const forCount = votes?.filter(v => v.vote === 'for').length || 0;
      const againstCount = votes?.filter(v => v.vote === 'against').length || 0;
      const abstainCount = votes?.filter(v => v.vote === 'abstain').length || 0;

      setVotingStats(prev => ({
        ...prev,
        [votingId]: {
          for_count: forCount,
          against_count: againstCount,
          abstain_count: abstainCount,
          total_votes: forCount + againstCount + abstainCount,
        }
      }));
    } catch (error) {
      console.error('Error fetching voting stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingVoting) {
        const { error } = await supabase
          .from('votings')
          .update(formData)
          .eq('id', editingVoting.id);

        if (error) throw error;

        toast({
          title: 'Успіх',
          description: 'Голосування оновлено',
        });
      } else {
        const { error } = await supabase
          .from('votings')
          .insert(formData);

        if (error) throw error;

        toast({
          title: 'Успіх',
          description: 'Нове голосування створено',
        });
      }

      await fetchVotings();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving voting:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося зберегти голосування',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ви впевнені, що хочете видалити це голосування?')) return;

    try {
      const { error } = await supabase
        .from('votings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Успіх',
        description: 'Голосування видалено',
      });

      await fetchVotings();
    } catch (error) {
      console.error('Error deleting voting:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося видалити голосування',
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('votings')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Успіх',
        description: `Голосування ${!currentStatus ? 'активовано' : 'деактивовано'}`,
      });

      await fetchVotings();
    } catch (error) {
      console.error('Error toggling voting status:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося змінити статус голосування',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      link: '',
      is_active: true,
    });
    setEditingVoting(null);
  };

  const openEditDialog = (voting: Voting) => {
    setEditingVoting(voting);
    setFormData({
      title: voting.title,
      link: voting.link || '',
      is_active: voting.is_active,
    });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Завантаження голосувань...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5" />
          <h2 className="text-2xl font-bold">Керування голосуваннями</h2>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Створити голосування
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingVoting ? 'Редагувати голосування' : 'Створити нове голосування'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Заголовок закону *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Назва законопроекту"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="link">Посилання на закон</Label>
                <Input
                  id="link"
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Активне голосування</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Скасувати
                </Button>
                <Button type="submit">
                  {editingVoting ? 'Оновити' : 'Створити'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {votings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Scale className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Голосування поки що не створено</p>
            </CardContent>
          </Card>
        ) : (
          votings.map((voting) => {
            const stats = votingStats[voting.id];
            const totalVotes = stats?.total_votes || 0;
            
            return (
              <Card key={voting.id} className={!voting.is_active ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="leading-relaxed">{voting.title}</CardTitle>
                        {!voting.is_active && (
                          <Badge variant="secondary">Неактивне</Badge>
                        )}
                      </div>
                      <CardDescription>
                        <div className="space-y-1">
                          <div>Створено: {new Date(voting.created_at).toLocaleDateString('uk-UA')}</div>
                          {stats && (
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3 text-green-600" />
                                {stats.for_count}
                              </span>
                              <span className="flex items-center gap-1">
                                <ThumbsDown className="w-3 h-3 text-red-600" />
                                {stats.against_count}
                              </span>
                              <span className="flex items-center gap-1">
                                <Minus className="w-3 h-3 text-gray-600" />
                                {stats.abstain_count}
                              </span>
                              <span className="flex items-center gap-1">
                                <BarChart3 className="w-3 h-3" />
                                Всього: {totalVotes}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {voting.link && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={voting.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(voting.id, voting.is_active)}
                      >
                        {voting.is_active ? 'Деактивувати' : 'Активувати'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(voting)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(voting.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};