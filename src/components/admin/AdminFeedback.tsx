import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Loader2, Mail, User, Calendar } from 'lucide-react';

interface Feedback {
  id: string;
  name: string;
  email: string;
  message_type: string;
  subject: string;
  message: string;
  status: string;
  admin_response?: string;
  created_at: string;
  updated_at: string;
}

export const AdminFeedback = () => {
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити зворотний зв\'язок',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFeedback = async () => {
    if (!selectedFeedback) return;

    try {
      const { error } = await supabase
        .from('feedback')
        .update({
          status: statusUpdate || selectedFeedback.status,
          admin_response: adminResponse || selectedFeedback.admin_response,
        })
        .eq('id', selectedFeedback.id);

      if (error) throw error;

      toast({
        title: 'Успіх',
        description: 'Зворотний зв\'язок оновлено',
      });

      await fetchFeedbacks();
      setSelectedFeedback(null);
      setAdminResponse('');
      setStatusUpdate('');
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося оновити зворотний зв\'язок',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'Новий';
      case 'in_progress': return 'В роботі';
      case 'resolved': return 'Вирішено';
      case 'closed': return 'Закрито';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'question': return 'Питання';
      case 'complaint': return 'Скарга';
      case 'suggestion': return 'Пропозиція';
      case 'message': return 'Повідомлення';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Завантаження зворотного зв'язку...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        <h2 className="text-2xl font-bold">Зворотний зв'язок</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feedback List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Список звернень</h3>
          
          {feedbacks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Звернень поки що немає</p>
              </CardContent>
            </Card>
          ) : (
            feedbacks.map((feedback) => (
              <Card 
                key={feedback.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedFeedback?.id === feedback.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  setSelectedFeedback(feedback);
                  setAdminResponse(feedback.admin_response || '');
                  setStatusUpdate(feedback.status);
                }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{feedback.subject}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <User className="w-3 h-3" />
                        {feedback.name}
                        <Mail className="w-3 h-3 ml-2" />
                        {feedback.email}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={getStatusColor(feedback.status)}>
                        {getStatusLabel(feedback.status)}
                      </Badge>
                      <Badge variant="outline">
                        {getTypeLabel(feedback.message_type)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {feedback.message}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {new Date(feedback.created_at).toLocaleDateString('uk-UA')}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Feedback Details */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Деталі звернення</h3>
          
          {selectedFeedback ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedFeedback.subject}</CardTitle>
                <CardDescription>
                  {selectedFeedback.name} ({selectedFeedback.email}) - {getTypeLabel(selectedFeedback.message_type)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Повідомлення:</h4>
                  <p className="text-sm bg-muted p-3 rounded-md">
                    {selectedFeedback.message}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Статус:</label>
                  <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Новий</SelectItem>
                      <SelectItem value="in_progress">В роботі</SelectItem>
                      <SelectItem value="resolved">Вирішено</SelectItem>
                      <SelectItem value="closed">Закрито</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Відповідь адміністратора:</label>
                  <Textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    placeholder="Введіть відповідь..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleUpdateFeedback}>
                    Зберегти зміни
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Оберіть звернення для перегляду деталей</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};