import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, Loader2, Save } from 'lucide-react';

interface Statistics {
  laws_count: number;
  school_topics_count: number;
  active_tenders_count: number;
  staff_count: number;
}

export const AdminStatistics = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<Statistics>({
    laws_count: 0,
    school_topics_count: 0,
    active_tenders_count: 0,
    staff_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const { data, error } = await supabase
        .from('statistics')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching statistics:', error);
      } else if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('statistics')
        .update(stats)
        .eq('id', (await supabase.from('statistics').select('id').single()).data?.id);

      if (error) throw error;

      toast({
        title: 'Успіх',
        description: 'Статистику оновлено',
      });
    } catch (error) {
      console.error('Error updating statistics:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося оновити статистику',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Завантаження статистики...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        <h2 className="text-2xl font-bold">Керування статистикою</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Редагування статистики</CardTitle>
          <CardDescription>
            Оновіть показники для відображення на головній сторінці
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="laws_count">Кількість законів</Label>
              <Input
                id="laws_count"
                type="number"
                value={stats.laws_count}
                onChange={(e) => setStats({ ...stats, laws_count: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="school_topics_count">Тем у школі права</Label>
              <Input
                id="school_topics_count"
                type="number"
                value={stats.school_topics_count}
                onChange={(e) => setStats({ ...stats, school_topics_count: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="active_tenders_count">Активні тендери</Label>
              <Input
                id="active_tenders_count"
                type="number"
                value={stats.active_tenders_count}
                onChange={(e) => setStats({ ...stats, active_tenders_count: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff_count">Співробітники</Label>
              <Input
                id="staff_count"
                type="number"
                value={stats.staff_count}
                onChange={(e) => setStats({ ...stats, staff_count: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Збереження...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Зберегти
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};