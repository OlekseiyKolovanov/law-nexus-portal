import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { User, GraduationCap, Award, Calendar } from 'lucide-react';

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

export default function PresidentBio() {
  const [bio, setBio] = useState<PresidentBio | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Завантаження...</p>
        </div>
      </Layout>
    );
  }

  if (!bio) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="festive-card">
            <CardContent className="text-center py-12">
              <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                Інформація про президента тимчасово недоступна
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gradient-festive mb-2">
            Біографія Президента
          </h1>
          <p className="text-muted-foreground">
            Інформація про главу держави
          </p>
        </div>

        <Card className="festive-card">
          <CardHeader className="text-center">
            {bio.photo_url && (
              <div className="mb-6">
                <img
                  src={bio.photo_url}
                  alt={bio.full_name}
                  className="w-48 h-48 rounded-full mx-auto object-cover shadow-lg"
                />
              </div>
            )}
            <CardTitle className="text-3xl text-gradient-festive mb-2">
              {bio.full_name}
            </CardTitle>
            <p className="text-xl text-muted-foreground">{bio.position}</p>
          </CardHeader>
          <CardContent className="space-y-8">
            {bio.birth_date && (
              <div className="flex items-start gap-3">
                <Calendar className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-1">Дата народження</h3>
                  <p className="text-muted-foreground">
                    {new Date(bio.birth_date).toLocaleDateString('uk-UA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <User className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Біографія</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {bio.bio}
                </p>
              </div>
            </div>

            {bio.education && (
              <div className="flex items-start gap-3">
                <GraduationCap className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Освіта</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {bio.education}
                  </p>
                </div>
              </div>
            )}

            {bio.achievements && (
              <div className="flex items-start gap-3">
                <Award className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Досягнення</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {bio.achievements}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
