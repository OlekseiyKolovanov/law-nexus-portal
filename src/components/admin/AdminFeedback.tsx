import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Loader2, Mail, Calendar } from 'lucide-react';

interface Feedback {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export const AdminFeedback = () => {
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

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

  const handleDeleteFeedback = async (id: string) => {
    if (!confirm('Ви впевнені, що хочете видалити це повідомлення?')) return;

    try {
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Успіх',
        description: 'Повідомлення видалено',
      });

      await fetchFeedbacks();
      setSelectedFeedback(null);
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося видалити повідомлення',
        variant: 'destructive',
      });
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

      <div className="grid gap-6 md:grid-cols-2">
        {/* Feedback List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Всі звернення</h3>
          
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
                onClick={() => setSelectedFeedback(feedback)}
              >
                <CardHeader>
                  <CardTitle className="text-base">{feedback.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{feedback.email}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
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
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selectedFeedback.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      {selectedFeedback.email}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedFeedback.created_at).toLocaleDateString('uk-UA')}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Повідомлення:</h4>
                  <p className="text-sm whitespace-pre-wrap">{selectedFeedback.message}</p>
                </div>

                <Button 
                  onClick={() => handleDeleteFeedback(selectedFeedback.id)} 
                  variant="destructive" 
                  className="w-full"
                >
                  Видалити повідомлення
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
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
