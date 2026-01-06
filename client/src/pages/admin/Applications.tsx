import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Send, Clock, CheckCircle2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig = {
  submitted: { label: "تم الإرسال", icon: Send, color: "text-blue-600", bg: "bg-blue-100" },
  processing: { label: "جاري المعالجة", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" },
  delivered: { label: "تم التسليم", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
};

export default function AdminApplications() {
  const { data: applications, isLoading, refetch } = trpc.applications.list.useQuery();

  const updateStatusMutation = trpc.applications.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة الطلب");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ");
    },
  });

  const handleStatusChange = (id: number, status: 'submitted' | 'processing' | 'delivered') => {
    updateStatusMutation.mutate({ id, status });
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;
    const Icon = config.icon;
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bg}`}>
        <Icon className={`h-3.5 w-3.5 ${config.color}`} />
        <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
      </div>
    );
  };

  const whatsappNumber = "201091858809";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">طلبات التوظيف</h1>
        <p className="text-muted-foreground mt-1">إدارة ومتابعة طلبات الباحثين عن عمل</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            جميع الطلبات ({applications?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !applications || applications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد طلبات حتى الآن</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الطلب</TableHead>
                    <TableHead>الوظيفة</TableHead>
                    <TableHead>المدينة</TableHead>
                    <TableHead>بيانات التواصل</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                          {app.applicationNumber}
                        </span>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{app.jobTitle}</p>
                      </TableCell>
                      <TableCell>{app.city}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm" dir="ltr">{app.phone}</p>
                          <p className="text-xs text-muted-foreground" dir="ltr">{app.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={app.status}
                          onValueChange={(value) => handleStatusChange(app.id, value as any)}
                        >
                          <SelectTrigger className="w-40 h-8">
                            <SelectValue>
                              {getStatusBadge(app.status)}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusConfig).map(([value, config]) => (
                              <SelectItem key={value} value={value}>
                                <div className="flex items-center gap-2">
                                  <config.icon className={`h-4 w-4 ${config.color}`} />
                                  {config.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {new Date(app.createdAt).toLocaleDateString('ar-SA')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(app.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a
                              href={`https://wa.me/${app.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `مرحباً، بخصوص طلب التوظيف رقم ${app.applicationNumber} للوظيفة: ${app.jobTitle}`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="gap-1"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              تواصل
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Matched Jobs Info */}
      {applications && applications.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>ملاحظات</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• يتم إرسال إشعار تلقائي عند استلام طلب جديد مع أفضل 5 نتائج مطابقة</li>
              <li>• يمكنك تغيير حالة الطلب لإبقاء المتقدم على اطلاع بتقدم طلبه</li>
              <li>• رابط التواصل عبر الواتساب: <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" dir="ltr">wa.me/{whatsappNumber}</a></li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
