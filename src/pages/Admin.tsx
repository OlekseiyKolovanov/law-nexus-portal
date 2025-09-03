import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserRole } from '@/hooks/use-user-role';
import { AdminLeadership } from '@/components/admin/AdminLeadership';
import { AdminLaws } from '@/components/admin/AdminLaws';
import { AdminLegalSchool } from '@/components/admin/AdminLegalSchool';
import { AdminTenders } from '@/components/admin/AdminTenders';
import { AdminLawyers } from '@/components/admin/AdminLawyers';
import { AdminEnterprises } from '@/components/admin/AdminEnterprises';
import { AdminFeedback } from '@/components/admin/AdminFeedback';
import { AdminStatistics } from '@/components/admin/AdminStatistics';
import { AdminUserRoles } from '@/components/admin/AdminUserRoles';
import { 
  Settings, 
  Users, 
  FileText, 
  GraduationCap, 
  Briefcase, 
  Scale, 
  Building2, 
  MessageSquare,
  BarChart3,
  Shield
} from 'lucide-react';

const Admin = () => {
  const { isAdmin, canManageTenders, canManageLegal, loading } = useUserRole();
  const [activeTab, setActiveTab] = useState('statistics');

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p>Завантаження...</p>
        </div>
      </Layout>
    );
  }

  if (!isAdmin() && !canManageTenders() && !canManageLegal()) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p>У вас немає доступу до адміністративної панелі.</p>
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
              <Settings className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Адміністративна панель
          </h1>
          <p className="text-xl text-muted-foreground">
            Керування контентом та налаштуваннями сайту
          </p>
        </section>

        {/* Admin Tabs */}
        <Card className="bg-gradient-card border-0 shadow-medium">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-2 h-auto p-2">
                <TabsTrigger value="statistics" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Статистика</span>
                </TabsTrigger>
                
                {(isAdmin() || canManageLegal()) && (
                  <>
                    <TabsTrigger value="leadership" className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span className="hidden sm:inline">Керівництво</span>
                    </TabsTrigger>
                    <TabsTrigger value="laws" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="hidden sm:inline">Закони</span>
                    </TabsTrigger>
                    <TabsTrigger value="legal-school" className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      <span className="hidden sm:inline">Школа права</span>
                    </TabsTrigger>
                    <TabsTrigger value="lawyers" className="flex items-center gap-2">
                      <Scale className="w-4 h-4" />
                      <span className="hidden sm:inline">Адвокати</span>
                    </TabsTrigger>
                  </>
                )}

                {(isAdmin() || canManageTenders()) && (
                  <>
                    <TabsTrigger value="tenders" className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      <span className="hidden sm:inline">Тендери</span>
                    </TabsTrigger>
                    <TabsTrigger value="enterprises" className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Підприємства</span>
                    </TabsTrigger>
                  </>
                )}

                <TabsTrigger value="feedback" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Зворотний зв'язок</span>
                </TabsTrigger>

                {isAdmin() && (
                  <TabsTrigger value="users" className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span className="hidden sm:inline">Користувачі</span>
                  </TabsTrigger>
                )}
              </TabsList>

              <div className="p-6">
                <TabsContent value="statistics">
                  <AdminStatistics />
                </TabsContent>

                {(isAdmin() || canManageLegal()) && (
                  <>
                    <TabsContent value="leadership">
                      <AdminLeadership />
                    </TabsContent>

                    <TabsContent value="laws">
                      <AdminLaws />
                    </TabsContent>

                    <TabsContent value="legal-school">
                      <AdminLegalSchool />
                    </TabsContent>

                    <TabsContent value="lawyers">
                      <AdminLawyers />
                    </TabsContent>
                  </>
                )}

                {(isAdmin() || canManageTenders()) && (
                  <>
                    <TabsContent value="tenders">
                      <AdminTenders />
                    </TabsContent>

                    <TabsContent value="enterprises">
                      <AdminEnterprises />
                    </TabsContent>
                  </>
                )}

                <TabsContent value="feedback">
                  <AdminFeedback />
                </TabsContent>

                {isAdmin() && (
                  <TabsContent value="users">
                    <AdminUserRoles />
                  </TabsContent>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Admin;