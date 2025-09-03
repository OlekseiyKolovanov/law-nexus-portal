import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Mail, Phone, MapPin, Loader2 } from 'lucide-react';

export const ContactForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message_type: 'question',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          ...formData,
          user_id: user?.id || null,
        });

      if (error) {
        throw error;
      }

      toast({
        title: 'Успіх',
        description: 'Ваше повідомлення успішно відправлено. Ми зв\'яжемося з вами найближчим часом.',
      });

      setFormData({
        name: '',
        email: '',
        message_type: 'question',
        subject: '',
        message: '',
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося відправити повідомлення. Спробуйте ще раз.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const messageTypes = {
    question: 'Питання',
    complaint: 'Скарга',
    suggestion: 'Пропозиція',
    message: 'Повідомлення',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="text-center space-y-4">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
            <MessageSquare className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Зв'язок з нами
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Залиште ваше питання, скаргу або пропозицію. Ми обов'язково розглянемо ваше звернення.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Form */}
        <Card className="bg-gradient-card border-0 shadow-medium">
          <CardHeader>
            <CardTitle>Форма зворотного зв'язку</CardTitle>
            <CardDescription>
              Заповніть форму нижче, і ми зв'яжемося з вами найближчим часом
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message_type">Тип звернення *</Label>
                <Select
                  value={formData.message_type}
                  onValueChange={(value) => setFormData({ ...formData, message_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Оберіть тип звернення" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(messageTypes).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Тема *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Повідомлення *</Label>
                <Textarea
                  id="message"
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Відправлення...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Відправити повідомлення
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="space-y-6">
          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardHeader>
              <CardTitle>Контактна інформація</CardTitle>
              <CardDescription>
                Інші способи зв'язку з Верховною Радою України
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Гаряча лінія</p>
                  <p className="text-muted-foreground">+380 (44) 255-38-69</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Електронна пошта</p>
                  <p className="text-muted-foreground">info@rada.gov.ua</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Адреса</p>
                  <p className="text-muted-foreground">
                    вул. М. Грушевського, 5<br />
                    Київ, 01008, Україна
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardHeader>
              <CardTitle>Режим роботи</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Понеділок - П'ятниця:</span>
                <span className="font-medium">09:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span>Субота - Неділя:</span>
                <span className="text-muted-foreground">Вихідні</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};