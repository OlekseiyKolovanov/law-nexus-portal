import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText, Loader2, Trash2, Edit, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CriminalProceeding {
  id: string;
  initiator_full_name: string;
  suspect_full_name: string;
  incriminating_article: string;
  status: string;
  created_at: string;
}

const statuses = [
  'на розгляді',
  'схвалено',
  'відмовлено',
  'передано до суду',
  'триває розслідування',
];

export const AdminCriminalProceedings = () => {
  const { toast } = useToast();
  const [proceedings, setProceedings] = useState<CriminalProceeding[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  useEffect(() => {
    fetchProceedings();
  }, []);

  const fetchProceedings = async () => {
    try {
      const { data, error } = await supabase
        .from('criminal_proceedings')
        .select('id, initiator_full_name, suspect_full_name, incriminating_article, status, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProceedings(data || []);
    } catch (error) {
      console.error('Error fetching proceedings:', error);
    } finally {
      setLoading(false);
    }
  };

  const openStatusDialog = (id: string, currentStatus: string) => {
    setSelectedId(id);
    setNewStatus(currentStatus);
    setStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedId) return;

    try {
      const { error } = await supabase
        .from('criminal_proceedings')
        .update({ status: newStatus })
        .eq('id', selectedId);

      if (error) throw error;

      toast({
        title: 'Успіх',
        description: 'Статус оновлено',
      });

      await fetchProceedings();
      setStatusDialogOpen(false);
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося оновити статус',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ви впевнені, що хочете видалити це провадження?')) return;

    try {
      const { error } = await supabase
        .from('criminal_proceedings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Успіх',
        description: 'Провадження видалено',
      });

      await fetchProceedings();
    } catch (error) {
      console.error('Error deleting proceeding:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося видалити провадження',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'на розгляді': return 'bg-yellow-500';
      case 'схвалено': return 'bg-green-500';
      case 'відмовлено': return 'bg-red-500';
      case 'передано до суду': return 'bg-blue-500';
      case 'триває розслідування': return 'bg-purple-500';
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
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5" />
        <h2 className="text-2xl font-bold">Кримінальні провадження (ЄРДР)</h2>
      </div>

      <div className="grid gap-4">
        {proceedings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Провадження поки що відсутні</p>
            </CardContent>
          </Card>
        ) : (
          proceedings.map((proceeding) => (
            <Card key={proceeding.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(proceeding.status)}>
                        {proceeding.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(proceeding.created_at).toLocaleDateString('uk-UA')}
                      </span>
                    </div>
                    <CardTitle className="text-lg">
                      Підозрюваний: {proceeding.suspect_full_name}
                    </CardTitle>
                    <CardDescription>
                      Стаття: {proceeding.incriminating_article}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/criminal-proceedings/${proceeding.id}`} target="_blank">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openStatusDialog(proceeding.id, proceeding.status)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(proceeding.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Ініціатор: {proceeding.initiator_full_name}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Змінити статус провадження</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                Скасувати
              </Button>
              <Button onClick={handleUpdateStatus}>
                Оновити
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
