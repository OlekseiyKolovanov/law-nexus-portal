import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Briefcase, Plus, Edit, Trash2, Loader2, Eye, MessageSquare, X } from 'lucide-react';

interface Tender {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  has_form: boolean;
  created_at: string;
}

interface TenderQuestion {
  id?: string;
  question_text: string;
  question_type: string;
  is_required: boolean;
  order_index: number;
}

interface TenderResponse {
  id: string;
  question_id: string;
  response_text: string;
  tender_id: string;
  user_id: string;
  created_at: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    nickname?: string;
  } | null;
}

export const AdminTenders = () => {
  const { toast } = useToast();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTender, setEditingTender] = useState<Tender | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_active: true,
    has_form: false,
  });
  const [questions, setQuestions] = useState<TenderQuestion[]>([]);
  const [responses, setResponses] = useState<TenderResponse[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [responsesDialogOpen, setResponsesDialogOpen] = useState(false);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    try {
      const { data, error } = await supabase
        .from('tenders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTenders(data || []);
    } catch (error) {
      console.error('Error fetching tenders:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити тендери',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let tenderId = editingTender?.id;
      
      if (editingTender) {
        const { error } = await supabase
          .from('tenders')
          .update(formData)
          .eq('id', editingTender.id);

        if (error) throw error;

        toast({
          title: 'Успіх',
          description: 'Тендер оновлено',
        });
      } else {
        const { data, error } = await supabase
          .from('tenders')
          .insert([formData])
          .select()
          .single();

        if (error) throw error;
        tenderId = data.id;

        toast({
          title: 'Успіх',
          description: 'Новий тендер додано',
        });
      }

      // Save questions if has_form is true
      if (formData.has_form && questions.length > 0 && tenderId) {
        // Delete existing questions if editing
        if (editingTender) {
          await supabase
            .from('tender_form_questions')
            .delete()
            .eq('tender_id', tenderId);
        }

        // Insert new questions
        const questionsToInsert = questions.map((q, index) => ({
          tender_id: tenderId,
          question: q.question,
          question_type: q.question_type,
          options: q.options.length > 0 ? q.options : null,
          is_required: q.is_required,
          order_index: index
        }));

        const { error: questionsError } = await supabase
          .from('tender_form_questions')
          .insert(questionsToInsert);

        if (questionsError) throw questionsError;
      }

      await fetchTenders();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving tender:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося зберегти тендер',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цей тендер?')) return;

    try {
      const { error } = await supabase
        .from('tenders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Успіх',
        description: 'Тендер видалено',
      });

      await fetchTenders();
    } catch (error) {
      console.error('Error deleting tender:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося видалити тендер',
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('tenders')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Успіх',
        description: `Тендер ${!currentStatus ? 'активовано' : 'деактивовано'}`,
      });

      await fetchTenders();
    } catch (error) {
      console.error('Error toggling tender status:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося змінити статус тендера',
        variant: 'destructive',
      });
    }
  };

  const fetchResponses = async (tenderId: string) => {
    try {
      // First get responses without profiles to avoid RLS issues
      const { data: responsesData, error: responsesError } = await supabase
        .from('tender_form_responses')
        .select('*')
        .eq('tender_id', tenderId)
        .order('submitted_at', { ascending: false });

      if (responsesError) throw responsesError;

      // Then get profiles for users who submitted responses
      const userIds = responsesData?.map(r => r.user_id).filter(Boolean) || [];
      let profilesData = [];
      
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, nickname')
          .in('user_id', userIds);
        
        if (!profilesError) {
          profilesData = profiles || [];
        }
      }

      // Combine responses with profiles
      const combinedData = responsesData?.map(response => {
        const profile = profilesData.find(p => p.user_id === response.user_id);
        return {
          ...response,
          profiles: profile || null
        };
      }) || [];

      setResponses(combinedData as TenderResponse[]);
    } catch (error) {
      console.error('Error fetching responses:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити відповіді',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      is_active: true,
      has_form: false,
    });
    setQuestions([]);
    setEditingTender(null);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        question_type: 'text',
        options: [],
        is_required: false,
        order_index: questions.length
      }
    ]);
  };

  const updateQuestion = (index: number, field: keyof TenderQuestion, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].options = [...updated[questionIndex].options, ''];
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].options = updated[questionIndex].options.filter((_, i) => i !== optionIndex);
    setQuestions(updated);
  };

  const openEditDialog = async (tender: Tender) => {
    setEditingTender(tender);
    setFormData({
      title: tender.title,
      content: tender.content,
      is_active: tender.is_active,
      has_form: tender.has_form,
    });

    // Load existing questions if tender has form
    if (tender.has_form) {
      try {
        const { data, error } = await supabase
          .from('tender_form_questions')
          .select('*')
          .eq('tender_id', tender.id)
          .order('order_index');

        if (error) throw error;
        
        const existingQuestions = (data || []).map(q => ({
          id: q.id,
          question: q.question,
          question_type: q.question_type as TenderQuestion['question_type'],
          options: q.options || [],
          is_required: q.is_required,
          order_index: q.order_index
        }));
        
        setQuestions(existingQuestions);
      } catch (error) {
        console.error('Error loading questions:', error);
      }
    }

    setDialogOpen(true);
  };

  const openResponsesDialog = async (tender: Tender) => {
    setSelectedTender(tender);
    await fetchResponses(tender.id);
    setResponsesDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Завантаження тендерів...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          <h2 className="text-2xl font-bold">Керування тендерами</h2>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Додати тендер
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTender ? 'Редагувати тендер' : 'Додати новий тендер'}
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Основна інформація</TabsTrigger>
                <TabsTrigger value="questions" disabled={!formData.has_form}>
                  Питання форми
                </TabsTrigger>
              </TabsList>
              
              <form onSubmit={handleSubmit}>
                <TabsContent value="basic" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Назва тендера *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content">Опис тендера *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={5}
                      required
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Активний тендер</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="has_form"
                      checked={formData.has_form}
                      onCheckedChange={(checked) => {
                        setFormData({ ...formData, has_form: checked });
                        if (!checked) setQuestions([]);
                      }}
                    />
                    <Label htmlFor="has_form">Має форму для заявок</Label>
                  </div>
                </TabsContent>

                <TabsContent value="questions" className="space-y-4">
                  {formData.has_form && (
                    <>
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Питання форми</h3>
                        <Button type="button" onClick={addQuestion} variant="outline" size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Додати питання
                        </Button>
                      </div>

                      {questions.map((question, qIndex) => (
                        <Card key={qIndex} className="p-4">
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1 space-y-4">
                                <div className="space-y-2">
                                  <Label>Питання *</Label>
                                  <Input
                                    value={question.question}
                                    onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                    placeholder="Введіть текст питання"
                                    required
                                  />
                                </div>

                                <div className="flex gap-4">
                                  <div className="space-y-2">
                                    <Label>Тип питання</Label>
                                    <Select
                                      value={question.question_type}
                                      onValueChange={(value) => updateQuestion(qIndex, 'question_type', value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="text">Текстове поле</SelectItem>
                                        <SelectItem value="textarea">Багаторядкове поле</SelectItem>
                                        <SelectItem value="select">Випадаючий список</SelectItem>
                                        <SelectItem value="radio">Радіо кнопки</SelectItem>
                                        <SelectItem value="checkbox">Чекбокси</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      checked={question.is_required}
                                      onCheckedChange={(checked) => updateQuestion(qIndex, 'is_required', checked)}
                                    />
                                    <Label>Обов'язкове</Label>
                                  </div>
                                </div>

                                {['select', 'radio', 'checkbox'].includes(question.question_type) && (
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <Label>Варіанти відповідей</Label>
                                      <Button
                                        type="button"
                                        onClick={() => addOption(qIndex)}
                                        variant="outline"
                                        size="sm"
                                      >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Додати варіант
                                      </Button>
                                    </div>
                                    {question.options.map((option, oIndex) => (
                                      <div key={oIndex} className="flex gap-2">
                                        <Input
                                          value={option}
                                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                          placeholder="Варіант відповіді"
                                        />
                                        <Button
                                          type="button"
                                          onClick={() => removeOption(qIndex, oIndex)}
                                          variant="outline"
                                          size="sm"
                                        >
                                          <X className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <Button
                                type="button"
                                onClick={() => removeQuestion(qIndex)}
                                variant="outline"
                                size="sm"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </>
                  )}
                </TabsContent>

                <Separator className="my-4" />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Скасувати
                  </Button>
                  <Button type="submit">
                    {editingTender ? 'Оновити' : 'Додати'}
                  </Button>
                </div>
              </form>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {tenders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Тендери поки що не додано</p>
            </CardContent>
          </Card>
        ) : (
          tenders.map((tender) => (
            <Card key={tender.id} className={!tender.is_active ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="leading-relaxed">{tender.title}</CardTitle>
                      {!tender.is_active && (
                        <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded">
                          Неактивний
                        </span>
                      )}
                      {tender.has_form && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                          Має форму
                        </span>
                      )}
                    </div>
                    <CardDescription>
                      Додано: {new Date(tender.created_at).toLocaleDateString('uk-UA')}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {tender.has_form && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openResponsesDialog(tender)}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(tender.id, tender.is_active)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(tender)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(tender.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{tender.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Responses Dialog */}
      <Dialog open={responsesDialogOpen} onOpenChange={setResponsesDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Відповіді на тендер: {selectedTender?.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {responses.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Поки що немає відповідей на цей тендер</p>
              </div>
            ) : (
              responses.map((response) => (
                <Card key={response.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Заявка від: {response.profiles?.nickname || 
                        `${response.profiles?.first_name || ''} ${response.profiles?.last_name || ''}`.trim() || 
                        'Анонімний користувач'}
                    </CardTitle>
                    <CardDescription>
                      Подано: {new Date(response.submitted_at).toLocaleString('uk-UA')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(response.responses).map(([questionId, answer]) => (
                        <div key={questionId} className="border-l-2 border-primary pl-4">
                          <p className="font-medium text-sm text-muted-foreground mb-1">
                            Питання ID: {questionId}
                          </p>
                          <p className="text-foreground">
                            {Array.isArray(answer) ? answer.join(', ') : String(answer)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};