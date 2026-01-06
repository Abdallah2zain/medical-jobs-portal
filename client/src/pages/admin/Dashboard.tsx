import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Briefcase, Users, LogIn, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();

  const statCards = [
    {
      title: "الوظائف المتاحة",
      value: stats?.totalJobs ?? 0,
      icon: Briefcase,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "المنشآت الطبية",
      value: stats?.totalFacilities ?? 0,
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "المستخدمين",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "تسجيلات الدخول",
      value: stats?.totalLogins ?? 0,
      icon: LogIn,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "طلبات التوظيف",
      value: stats?.totalApplications ?? 0,
      icon: FileText,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
        <p className="text-muted-foreground mt-1">نظرة عامة على إحصائيات المنصة</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stat.value.toLocaleString('ar-SA')}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">آخر طلبات التوظيف</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentApplications />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">آخر الوظائف المضافة</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentJobs />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RecentApplications() {
  const { data: applications, isLoading } = trpc.applications.list.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        لا توجد طلبات حتى الآن
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {applications.slice(0, 5).map((app) => (
        <div
          key={app.id}
          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
        >
          <div>
            <p className="font-medium text-sm">{app.jobTitle}</p>
            <p className="text-xs text-muted-foreground">{app.city}</p>
          </div>
          <StatusBadge status={app.status} />
        </div>
      ))}
    </div>
  );
}

function RecentJobs() {
  const { data: jobs, isLoading } = trpc.jobs.list.useQuery({ activeOnly: true });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        لا توجد وظائف حتى الآن
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.slice(0, 5).map((job) => (
        <div
          key={job.id}
          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
        >
          <div>
            <p className="font-medium text-sm">{job.title}</p>
            <p className="text-xs text-muted-foreground">{job.city}</p>
          </div>
          <VerificationBadge status={job.verificationStatus} />
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    submitted: "bg-blue-100 text-blue-800",
    processing: "bg-yellow-100 text-yellow-800",
    delivered: "bg-green-100 text-green-800",
  };

  const labels = {
    submitted: "تم الإرسال",
    processing: "جاري المعالجة",
    delivered: "تم التسليم",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.submitted}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}

function VerificationBadge({ status }: { status: string }) {
  const styles = {
    verified: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    unverified: "bg-gray-100 text-gray-600",
  };

  const labels = {
    verified: "تم التحقق",
    pending: "جاري التحقق",
    unverified: "لم يتم التحقق",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.unverified}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}
