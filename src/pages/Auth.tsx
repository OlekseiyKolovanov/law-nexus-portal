import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Scale } from 'lucide-react';

const signUpSchema = z.object({
  email: z.string().email('Невірний формат email'),
  password: z.string().min(6, 'Пароль має містити мінімум 6 символів'),
  nickname: z.string().min(2, 'Нік має містити мінімум 2 символи').max(20, 'Нік не може бути довшим за 20 символів'),
});

const signInSchema = z.object({
  email: z.string().email('Невірний формат email'),
  password: z.string().min(1, 'Введіть пароль'),
});

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      nickname: '',
    },
  });

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if already logged in
  if (user) {
    navigate('/');
    return null;
  }

  const handleSignUp = async (values: z.infer<typeof signUpSchema>) => {
    setLoading(true);

    try {
      // Check if nickname is already taken
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('nickname', values.nickname)
        .single();

      if (existingProfile) {
        toast({
          title: "Помилка",
          description: "Цей нік вже зайнятий",
          variant: "destructive",
        });
        return;
      }

      const result = await signUp(values.email, values.password);
      
      if (result.error) {
        toast({
          title: "Помилка",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        // Create profile with nickname
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('profiles')
            .insert({
              id: user.id,
              nickname: values.nickname,
            });
        }

        toast({
          title: "Реєстрація успішна",
          description: "Ласкаво просимо!",
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: "Помилка",
        description: "Щось пішло не так. Спробуйте ще раз.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (values: z.infer<typeof signInSchema>) => {
    setLoading(true);

    try {
      const result = await signIn(values.email, values.password);
      
      if (result.error) {
        toast({
          title: "Помилка",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Вхід успішний",
          description: "Ласкаво просимо!",
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: "Помилка",
        description: "Щось пішло не так. Спробуйте ще раз.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-glow animate-scale-in bg-gradient-card border border-border/20 rounded-3xl floating-element">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-gradient-icon rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow icon-glow">
            <Scale className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">
            {isSignUp ? 'Реєстрація' : 'Вхід'}
          </CardTitle>
          <CardDescription>
            {isSignUp 
              ? 'Створіть новий обліковий запис' 
              : 'Увійдіть у свій обліковий запис'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSignUp ? (
            <Form {...signUpForm}>
              <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                <FormField
                  control={signUpForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Електронна пошта</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="example@email.com"
                          type="email"
                          autoComplete="email"
                          {...field}
                          disabled={loading}
                          className="transition-all duration-300 focus:shadow-medium rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signUpForm.control}
                  name="nickname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Нік</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ваш унікальний нік"
                          type="text"
                          autoComplete="username"
                          {...field}
                          disabled={loading}
                          className="transition-all duration-300 focus:shadow-medium rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signUpForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Пароль</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          disabled={loading}
                          className="transition-all duration-300 focus:shadow-medium rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-500 rounded-2xl hover:scale-105" 
                  disabled={loading}
                >
                  {loading ? 'Завантаження...' : 'Зареєструватися'}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...signInForm}>
              <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                <FormField
                  control={signInForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Електронна пошта</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="example@email.com"
                          {...field}
                          disabled={loading}
                          className="transition-all duration-300 focus:shadow-medium rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signInForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Пароль</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          disabled={loading}
                          className="transition-all duration-300 focus:shadow-medium rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-500 rounded-2xl hover:scale-105" 
                  disabled={loading}
                >
                  {loading ? 'Завантаження...' : 'Увійти'}
                </Button>
              </form>
            </Form>
          )}
          
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-foreground transition-all duration-300 underline-offset-4 hover:underline hover:scale-105"
              disabled={loading}
            >
              {isSignUp 
                ? 'Вже маєте обліковий запис? Увійдіть' 
                : 'Немає облікового запису? Зареєструйтеся'
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;