import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { GraduationCap, Search, ExternalLink, BookOpen } from 'lucide-react';

interface SchoolTopic {
  id: string;
  title: string;
  content?: string;
  link?: string;
  created_at: string;
}

const LegalSchool = () => {
  const [topics, setTopics] = useState<SchoolTopic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<SchoolTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const { data, error } = await supabase
          .from('legal_school')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching legal school topics:', error);
        } else if (data) {
          setTopics(data);
          setFilteredTopics(data);
        }
      } catch (error) {
        console.error('Error fetching legal school topics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  useEffect(() => {
    const filtered = topics.filter(topic =>
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (topic.content && topic.content.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredTopics(filtered);
  }, [searchTerm, topics]);

  if (loading) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Школа права</h1>
            <p className="text-muted-foreground">Завантаження...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <section className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Школа права
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Навчальні матеріали та курси з правознавства для громадян України
          </p>
        </section>

        {/* Search */}
        <section className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Пошук навчальних матеріалів..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </section>

        {/* Topics List */}
        <section>
          {filteredTopics.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Матеріалів за вашим запитом не знайдено.' : 'Навчальні матеріали будуть додані найближчим часом.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredTopics.map((topic, index) => (
                <Card 
                  key={topic.id} 
                  className="hover:shadow-medium transition-all duration-300 hover:-translate-y-1 animate-scale-in bg-gradient-card border-0"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 leading-relaxed">
                          {topic.title}
                        </CardTitle>
                        <CardDescription>
                          Додано: {new Date(topic.created_at).toLocaleDateString('uk-UA')}
                        </CardDescription>
                      </div>
                      {topic.link && (
                        <Button asChild variant="outline" size="sm" className="ml-4 shrink-0">
                          <a href={topic.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Відкрити
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  {topic.content && (
                    <CardContent>
                      <div className="prose prose-sm max-w-none text-muted-foreground">
                        <p>{topic.content}</p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default LegalSchool;