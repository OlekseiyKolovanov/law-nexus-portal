import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useUserRole } from '@/hooks/use-user-role';
import { useToast } from '@/hooks/use-toast';
import { Scale, ThumbsUp, ThumbsDown, Minus, ExternalLink, Users, BarChart3 } from 'lucide-react';

interface Voting {
  id: string;
  title: string;
  law_link: string;
  additional_info?: string;
  is_active: boolean;
  created_at: string;
}

interface Vote {
  id: string;
  voting_id: string;
  user_id: string;
  vote_type: 'for' | 'against' | 'abstain';
  created_at: string;
}

interface VotingStats {
  for_count: number;
  against_count: number;
  abstain_count: number;
  total_votes: number;
  user_vote?: 'for' | 'against' | 'abstain';
}

const Voting = () => {
  const { user } = useAuth();
  const { isDeputy } = useUserRole();
  const { toast } = useToast();
  const [votings, setVotings] = useState<Voting[]>([]);
  const [votingStats, setVotingStats] = useState<Record<string, VotingStats>>({});
  const [loading, setLoading] = useState(true);
  const [votingLoading, setVotingLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchVotings();
  }, []);

  const fetchVotings = async () => {
    try {
      const { data, error } = await supabase
        .from('votings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setVotings(data || []);
      
      // Fetch stats for each voting
      if (data) {
        for (const voting of data) {
          await fetchVotingStats(voting.id);
        }
      }
    } catch (error) {
      console.error('Error fetching votings:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити голосування',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVotingStats = async (votingId: string) => {
    try {
      const { data: votes, error } = await supabase
        .from('votes')
        .select('vote_type, user_id')
        .eq('voting_id', votingId);

      if (error) throw error;

      const forCount = votes?.filter(v => v.vote_type === 'for').length || 0;
      const againstCount = votes?.filter(v => v.vote_type === 'against').length || 0;
      const abstainCount = votes?.filter(v => v.vote_type === 'abstain').length || 0;
      const userVote = votes?.find(v => v.user_id === user?.id)?.vote_type;

      setVotingStats(prev => ({
        ...prev,
        [votingId]: {
          for_count: forCount,
          against_count: againstCount,
          abstain_count: abstainCount,
          total_votes: forCount + againstCount + abstainCount,
          user_vote,
        }
      }));
    } catch (error) {
      console.error('Error fetching voting stats:', error);
    }
  };

  const handleVote = async (votingId: string, voteType: 'for' | 'against' | 'abstain') => {
    if (!user || !isDeputy()) {
      toast({
        title: 'Помилка',
        description: 'Тільки депутати можуть голосувати',
        variant: 'destructive',
      });
      return;
    }

    setVotingLoading(votingId);

    try {
      const { error } = await supabase
        .from('votes')
        .upsert({
          voting_id: votingId,
          user_id: user.id,
          vote_type: voteType,
        });

      if (error) throw error;

      toast({
        title: 'Успіх',
        description: 'Ваш голос зараховано',
      });

      await fetchVotingStats(votingId);
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося проголосувати',
        variant: 'destructive',
      });
    } finally {
      setVotingLoading(null);
    }
  };

  const getVoteIcon = (voteType: 'for' | 'against' | 'abstain') => {
    switch (voteType) {
      case 'for': return <ThumbsUp className="w-4 h-4" />;
      case 'against': return <ThumbsDown className="w-4 h-4" />;
      case 'abstain': return <Minus className="w-4 h-4" />;
    }
  };

  const getVoteLabel = (voteType: 'for' | 'against' | 'abstain') => {
    switch (voteType) {
      case 'for': return 'ЗА';
      case 'against': return 'ПРОТИ';
      case 'abstain': return 'УТРИМАВСЯ';
    }
  };

  const getVoteColor = (voteType: 'for' | 'against' | 'abstain') => {
    switch (voteType) {
      case 'for': return 'bg-green-500 hover:bg-green-600';
      case 'against': return 'bg-red-500 hover:bg-red-600';
      case 'abstain': return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Голосування</h1>
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
              <Scale className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Голосування
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Голосування депутатів Верховної Ради України за законопроекти
          </p>
          {!user && (
            <p className="text-sm text-muted-foreground">
              <a href="/auth" className="text-primary hover:underline">Увійдіть</a> для перегляду результатів голосування
            </p>
          )}
          {user && !isDeputy() && (
            <p className="text-sm text-muted-foreground">
              Тільки депутати можуть голосувати. Ви можете переглядати результати.
            </p>
          )}
        </section>

        {/* Votings List */}
        <section>
          {votings.length === 0 ? (
            <div className="text-center py-12">
              <Scale className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Активних голосувань наразі немає.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {votings.map((voting, index) => {
                const stats = votingStats[voting.id];
                const userVote = stats?.user_vote;
                const totalVotes = stats?.total_votes || 0;
                
                return (
                  <Card 
                    key={voting.id} 
                    className="hover:shadow-medium transition-all duration-300 hover:-translate-y-1 animate-scale-in bg-gradient-card border-0"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2 leading-relaxed">
                            {voting.title}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4" />
                            Голосів: {totalVotes}
                          </CardDescription>
                          {voting.additional_info && (
                            <p className="text-sm text-muted-foreground mb-4">
                              {voting.additional_info}
                            </p>
                          )}
                        </div>
                        <Button asChild variant="outline" size="sm" className="ml-4 shrink-0">
                          <a href={voting.law_link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Переглянути закон
                          </a>
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Voting Results */}
                      {stats && totalVotes > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <ThumbsUp className="w-4 h-4 text-green-600" />
                              ЗА: {stats.for_count}
                            </span>
                            <span className="flex items-center gap-2">
                              <ThumbsDown className="w-4 h-4 text-red-600" />
                              ПРОТИ: {stats.against_count}
                            </span>
                            <span className="flex items-center gap-2">
                              <Minus className="w-4 h-4 text-gray-600" />
                              УТРИМАЛИСЬ: {stats.abstain_count}
                            </span>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>ЗА ({Math.round((stats.for_count / totalVotes) * 100)}%)</span>
                              <span>ПРОТИ ({Math.round((stats.against_count / totalVotes) * 100)}%)</span>
                            </div>
                            <div className="flex h-2 rounded-full overflow-hidden bg-gray-200">
                              <div 
                                className="bg-green-500" 
                                style={{ width: `${(stats.for_count / totalVotes) * 100}%` }}
                              />
                              <div 
                                className="bg-red-500" 
                                style={{ width: `${(stats.against_count / totalVotes) * 100}%` }}
                              />
                              <div 
                                className="bg-gray-400" 
                                style={{ width: `${(stats.abstain_count / totalVotes) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Voting Buttons */}
                      {user && isDeputy() && (
                        <div className="flex gap-2 pt-4 border-t">
                          {(['for', 'against', 'abstain'] as const).map((voteType) => (
                            <Button
                              key={voteType}
                              onClick={() => handleVote(voting.id, voteType)}
                              disabled={votingLoading === voting.id}
                              variant={userVote === voteType ? "default" : "outline"}
                              size="sm"
                              className={`flex items-center gap-2 ${
                                userVote === voteType 
                                  ? getVoteColor(voteType) + ' text-white' 
                                  : 'hover:scale-105'
                              }`}
                            >
                              {getVoteIcon(voteType)}
                              {getVoteLabel(voteType)}
                            </Button>
                          ))}
                        </div>
                      )}

                      {userVote && (
                        <div className="text-center pt-2">
                          <Badge variant="outline" className="text-xs">
                            Ваш голос: {getVoteLabel(userVote)}
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Voting;