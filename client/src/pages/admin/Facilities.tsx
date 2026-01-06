import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Pencil, Trash2, Search, CheckCircle2, Clock, AlertCircle, Building2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";

const facilityTypes = [
  { value: "hospital", label: "مستشفى" },
  { value: "complex", label: "مجمع طبي" },
  { value: "center", label: "مركز طبي" },
  { value: "clinic", label: "عيادة" },
  { value: "other", label: "أخرى" },
];

const verificationStatuses = [
  { value: "verified", label: "تم التحقق", icon: CheckCircle2, color: "text-green-600" },
  { value: "pending", label: "جاري التحقق", icon: Clock, color: "text-yellow-600" },
  { value: "unverified", label: "لم يتم التحقق", icon: AlertCircle, color: "text-gray-500" },
];

export default function AdminFacilities() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<any>(null);

  const { data: facilities, isLoading, refetch } = trpc.facilities.list.useQuery({
    type: filterType || undefined,
    verificationStatus: filterStatus || undefined,
    search: searchTerm || undefined,
  });

  const createMutation = trpc.facilities.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة المنشأة بنجاح");
      setIsAddDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء الإضافة");
    },
  });

  const updateMutation = trpc.facilities.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث المنشأة بنجاح");
      setEditingFacility(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء التحديث");
    },
  });

  const deleteMutation = trpc.facilities.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المنشأة بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء الحذف");
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه المنشأة؟")) {
      deleteMutation.mutate({ id });
    }
  };

  const getVerificationIcon = (status: string) => {
    const statusInfo = verificationStatuses.find((s) => s.value === status);
    if (!statusInfo) return null;
    const Icon = statusInfo.icon;
    return <Icon className={`h-4 w-4 ${statusInfo.color}`} />;
  };

  const getTypeLabel = (type: string) => {
    return facilityTypes.find((t) => t.value === type)?.label || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المنشآت الطبية</h1>
          <p className="text-muted-foreground mt-1">إدارة قاعدة بيانات مقدمي الخدمات الطبية</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة منشأة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة منشأة جديدة</DialogTitle>
            </DialogHeader>
            <FacilityForm
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
                placeholder="البحث عن منشأة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="نوع المنشأة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {facilityTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
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
          ) : !facilities || facilities.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد منشآت</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المنشأة</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>المدينة</TableHead>
                    <TableHead>حالة التحقق</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facilities.map((facility) => (
                    <TableRow key={facility.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {facility.imageUrl ? (
                            <img
                              src={facility.imageUrl}
                              alt={facility.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{facility.name}</p>
                            {facility.nameEn && (
                              <p className="text-xs text-muted-foreground">{facility.nameEn}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeLabel(facility.type)}</TableCell>
                      <TableCell>{facility.city}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getVerificationIcon(facility.verificationStatus)}
                          <span className="text-sm">
                            {verificationStatuses.find((s) => s.value === facility.verificationStatus)?.label}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setLocation(`/admin/facilities/${facility.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingFacility(facility)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(facility.id)}
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
      <Dialog open={!!editingFacility} onOpenChange={() => setEditingFacility(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل المنشأة</DialogTitle>
          </DialogHeader>
          {editingFacility && (
            <FacilityForm
              initialData={editingFacility}
              onSubmit={(data) => updateMutation.mutate({ id: editingFacility.id, ...data })}
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FacilityForm({
  initialData,
  onSubmit,
  isLoading,
}: {
  initialData?: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    nameEn: initialData?.nameEn || "",
    type: initialData?.type || "hospital",
    city: initialData?.city || "",
    address: initialData?.address || "",
    googleMapsUrl: initialData?.googleMapsUrl || "",
    phone: initialData?.phone || "",
    whatsapp: initialData?.whatsapp || "",
    email: initialData?.email || "",
    website: initialData?.website || "",
    imageUrl: initialData?.imageUrl || "",
    snapchat: initialData?.snapchat || "",
    instagram: initialData?.instagram || "",
    facebook: initialData?.facebook || "",
    twitter: initialData?.twitter || "",
    tiktok: initialData?.tiktok || "",
    verificationStatus: initialData?.verificationStatus || "unverified",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">اسم المنشأة (عربي) *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nameEn">اسم المنشأة (إنجليزي)</Label>
          <Input
            id="nameEn"
            value={formData.nameEn}
            onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
            dir="ltr"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">نوع المنشأة *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {facilityTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">العنوان</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={2}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="googleMapsUrl">رابط خرائط جوجل</Label>
          <Input
            id="googleMapsUrl"
            value={formData.googleMapsUrl}
            onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
            dir="ltr"
            placeholder="https://maps.google.com/..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">رقم الهاتف</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            dir="ltr"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsapp">رقم الواتساب</Label>
          <Input
            id="whatsapp"
            value={formData.whatsapp}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
            dir="ltr"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            dir="ltr"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">الموقع الإلكتروني</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            dir="ltr"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="imageUrl">رابط الصورة</Label>
          <Input
            id="imageUrl"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            dir="ltr"
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium mb-4">حسابات التواصل الاجتماعي</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="instagram">انستجرام</Label>
            <Input
              id="instagram"
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              dir="ltr"
              placeholder="@username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitter">تويتر</Label>
            <Input
              id="twitter"
              value={formData.twitter}
              onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
              dir="ltr"
              placeholder="@username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebook">فيسبوك</Label>
            <Input
              id="facebook"
              value={formData.facebook}
              onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="snapchat">سناب شات</Label>
            <Input
              id="snapchat"
              value={formData.snapchat}
              onChange={(e) => setFormData({ ...formData, snapchat: e.target.value })}
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tiktok">تيك توك</Label>
            <Input
              id="tiktok"
              value={formData.tiktok}
              onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
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
