import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Search, CheckCircle2, Clock, AlertCircle, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const jobTypes = [
  { value: "full_time", label: "دوام كامل" },
  { value: "part_time", label: "دوام جزئي" },
  { value: "contract", label: "عقد" },
  { value: "temporary", label: "مؤقت" },
];

const verificationStatuses = [
  { value: "verified", label: "تم التحقق", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
  { value: "pending", label: "جاري التحقق", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" },
  { value: "unverified", label: "لم يتم التحقق", icon: AlertCircle, color: "text-gray-500", bg: "bg-gray-100" },
];

export default function AdminJobs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);

  const { data: jobs, isLoading, refetch } = trpc.jobs.list.useQuery({
    city: filterCity || undefined,
    verificationStatus: filterStatus || undefined,
  });

  const { data: facilities } = trpc.facilities.list.useQuery();
  const { data: cities } = trpc.facilities.getCities.useQuery();

  const createMutation = trpc.jobs.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الوظيفة بنجاح");
      setIsAddDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء الإضافة");
    },
  });

  const updateMutation = trpc.jobs.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الوظيفة بنجاح");
      setEditingJob(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء التحديث");
    },
  });

  const deleteMutation = trpc.jobs.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الوظيفة بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء الحذف");
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الوظيفة؟")) {
      deleteMutation.mutate({ id });
    }
  };

  const filteredJobs = jobs?.filter((job) => {
    if (!searchTerm) return true;
    return (
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.titleEn?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getVerificationBadge = (status: string) => {
    const statusInfo = verificationStatuses.find((s) => s.value === status);
    if (!statusInfo) return null;
    const Icon = statusInfo.icon;
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${statusInfo.bg}`}>
        <Icon className={`h-3.5 w-3.5 ${statusInfo.color}`} />
        <span className={`text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
      </div>
    );
  };

  const getFacilityName = (facilityId: number) => {
    return facilities?.find((f) => f.id === facilityId)?.name || "غير معروف";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الوظائف</h1>
          <p className="text-muted-foreground mt-1">إدارة الفرص الوظيفية المتاحة</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة وظيفة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة وظيفة جديدة</DialogTitle>
            </DialogHeader>
            <JobForm
              facilities={facilities || []}
              onSubmit={(data) => createMutation.mutate(data)}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث عن وظيفة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={filterCity} onValueChange={setFilterCity}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="المدينة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {cities?.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="حالة التحقق" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {verificationStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !filteredJobs || filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد وظائف</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الوظيفة</TableHead>
                    <TableHead>المنشأة</TableHead>
                    <TableHead>المدينة</TableHead>
                    <TableHead>الراتب</TableHead>
                    <TableHead>حالة التحقق</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{job.title}</p>
                          {job.titleEn && (
                            <p className="text-xs text-muted-foreground">{job.titleEn}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getFacilityName(job.facilityId)}</TableCell>
                      <TableCell>{job.city}</TableCell>
                      <TableCell>
                        {job.salaryMin || job.salaryMax ? (
                          <span dir="ltr">
                            {job.salaryMin?.toLocaleString()} - {job.salaryMax?.toLocaleString()} ر.س
                          </span>
                        ) : (
                          <span className="text-muted-foreground">غير محدد</span>
                        )}
                      </TableCell>
                      <TableCell>{getVerificationBadge(job.verificationStatus)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingJob(job)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(job.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Edit Dialog */}
      <Dialog open={!!editingJob} onOpenChange={() => setEditingJob(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل الوظيفة</DialogTitle>
          </DialogHeader>
          {editingJob && (
            <JobForm
              facilities={facilities || []}
              initialData={editingJob}
              onSubmit={(data) => updateMutation.mutate({ id: editingJob.id, ...data })}
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function JobForm({
  facilities,
  initialData,
  onSubmit,
  isLoading,
}: {
  facilities: any[];
  initialData?: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    facilityId: initialData?.facilityId || "",
    title: initialData?.title || "",
    titleEn: initialData?.titleEn || "",
    description: initialData?.description || "",
    requirements: initialData?.requirements || "",
    city: initialData?.city || "",
    salaryMin: initialData?.salaryMin || "",
    salaryMax: initialData?.salaryMax || "",
    jobType: initialData?.jobType || "full_time",
    experienceYears: initialData?.experienceYears || "",
    sourceUrl: initialData?.sourceUrl || "",
    verificationStatus: initialData?.verificationStatus || "unverified",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      facilityId: parseInt(formData.facilityId),
      salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
      salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
      experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="facilityId">المنشأة *</Label>
          <Select
            value={formData.facilityId.toString()}
            onValueChange={(value) => {
              const facility = facilities.find((f) => f.id.toString() === value);
              setFormData({
                ...formData,
                facilityId: value,
                city: facility?.city || formData.city,
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر المنشأة" />
            </SelectTrigger>
            <SelectContent>
              {facilities.map((facility) => (
                <SelectItem key={facility.id} value={facility.id.toString()}>
                  {facility.name} - {facility.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">المسمى الوظيفي (عربي) *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="titleEn">المسمى الوظيفي (إنجليزي)</Label>
          <Input
            id="titleEn"
            value={formData.titleEn}
            onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
            dir="ltr"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">المدينة *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="jobType">نوع الوظيفة</Label>
          <Select
            value={formData.jobType}
            onValueChange={(value) => setFormData({ ...formData, jobType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {jobTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="salaryMin">الحد الأدنى للراتب</Label>
          <Input
            id="salaryMin"
            type="number"
            value={formData.salaryMin}
            onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
            dir="ltr"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salaryMax">الحد الأقصى للراتب</Label>
          <Input
            id="salaryMax"
            type="number"
            value={formData.salaryMax}
            onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
            dir="ltr"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="experienceYears">سنوات الخبرة المطلوبة</Label>
          <Input
            id="experienceYears"
            type="number"
            value={formData.experienceYears}
            onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
            dir="ltr"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="verificationStatus">حالة التحقق</Label>
          <Select
            value={formData.verificationStatus}
            onValueChange={(value) => setFormData({ ...formData, verificationStatus: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {verificationStatuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">الوصف الوظيفي</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="requirements">المتطلبات</Label>
          <Textarea
            id="requirements"
            value={formData.requirements}
            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
            rows={3}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="sourceUrl">رابط المصدر</Label>
          <Input
            id="sourceUrl"
            value={formData.sourceUrl}
            onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
            dir="ltr"
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "جاري الحفظ..." : initialData ? "تحديث" : "إضافة"}
        </Button>
      </div>
    </form>
  );
}
