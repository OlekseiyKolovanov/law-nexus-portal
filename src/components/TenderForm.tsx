import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface TenderFormQuestion {
  id: string;
  question: string;
  question_type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
  options?: string[];
  is_required: boolean;
  order_index: number;
}

interface TenderFormProps {
  tender: {
    id: string;
    title: string;
  };
  onClose: () => void;
}

export const TenderForm = ({ tender, onClose }: TenderFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<TenderFormQuestion[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from('tender_form_questions')
          .select('*')
          .eq('tender_id', tender.id)
          .order('order_index');

        if (error) {
          console.error('Error fetching questions:', error);
          toast({
            title: 'Помилка',
            description: 'Не вдалося завантажити форму заявки',
            variant: 'destructive',
          });
        } else if (data) {
          setQuestions(data as TenderFormQuestion[]);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [tender.id, toast]);

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    // Validate required fields
    const requiredQuestions = questions.filter(q => q.is_required);
    const missingResponses = requiredQuestions.filter(q => !responses[q.id] || responses[q.id] === '');
    
    if (missingResponses.length > 0) {
      toast({
        title: 'Помилка',
        description: 'Будь ласка, заповніть всі обов\'язкові поля',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('tender_form_responses')
        .insert({
          tender_id: tender.id,
          user_id: user.id,
          responses: responses
        });

      if (error) {
        throw error;
      }

      toast({
        title: 'Успіх',
        description: 'Вашу заявку успішно подано',
      });

      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося подати заявку. Спробуйте ще раз.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: TenderFormQuestion) => {
    const isRequired = question.is_required;
    
    switch (question.question_type) {
      case 'text':
        return (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={question.id}>
              {question.question}
              {isRequired && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={question.id}
              value={responses[question.id] || ''}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              required={isRequired}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={question.id}>
              {question.question}
              {isRequired && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              id={question.id}
              value={responses[question.id] || ''}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              required={isRequired}
            />
          </div>
        );

      case 'select':
        return (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={question.id}>
              {question.question}
              {isRequired && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select
              value={responses[question.id] || ''}
              onValueChange={(value) => handleResponseChange(question.id, value)}
              required={isRequired}
            >
              <SelectTrigger>
                <SelectValue placeholder="Оберіть варіант" />
              </SelectTrigger>
              <SelectContent>
                {question.options?.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'radio':
        return (
          <div key={question.id} className="space-y-2">
            <Label>
              {question.question}
              {isRequired && <span className="text-destructive ml-1">*</span>}
            </Label>
            <RadioGroup
              value={responses[question.id] || ''}
              onValueChange={(value) => handleResponseChange(question.id, value)}
            >
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                  <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'checkbox':
        return (
          <div key={question.id} className="space-y-2">
            <Label>
              {question.question}
              {isRequired && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${question.id}-${index}`}
                    checked={responses[question.id]?.includes?.(option) || false}
                    onCheckedChange={(checked) => {
                      const currentResponses = responses[question.id] || [];
                      if (checked) {
                        handleResponseChange(question.id, [...currentResponses, option]);
                      } else {
                        handleResponseChange(question.id, currentResponses.filter((r: string) => r !== option));
                      }
                    }}
                  />
                  <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Заявка на тендер: {tender.title}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Завантаження форми...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {questions.map(renderQuestion)}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Скасувати
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Подача заявки...
                  </>
                ) : (
                  'Подати заявку'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};