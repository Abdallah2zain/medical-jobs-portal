import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  MessageSquare,
  Instagram,
  Twitter,
  Facebook,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation, useParams } from "wouter";

const verificationStatuses = {
  verified: { label: "تم التحقق", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
  pending: { label: "جاري التحقق", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" },
  unverified: { label: "لم يتم التحقق", icon: AlertCircle, color: "text-gray-500", bg: "bg-gray-100" },
};

const facilityTypes: Record<string, string> = {
  hospital: "مستشفى",
  complex: "مجمع طبي",
  center: "مركز طبي",
  clinic: "عيادة",
  other: "أخرى",
};

export default function FacilityDetails() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const facilityId = parseInt(params.id || "0");

  const { data: facility, isLoading } = trpc.facilities.getById.useQuery(
    { id: facilityId },
    { enabled: !!facilityId }
  );

  const { data: notes, refetch: refetchNotes } = trpc.facilityNotes.list.useQuery(
    { facilityId },
    { enabled: !!facilityId }
  );

  const { data: jobs } = trpc.jobs.getByFacility.useQuery(
    { facilityId },
    { enabled: !!facilityId }
  );

  const [newNote, setNewNote] = useState("");
  const [noteImages, setNoteImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  const createNoteMutation = trpc.facilityNotes.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الملاحظة بنجاح");
      setNewNote("");
      setNoteImages([]);
      refetchNotes();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ");
    },
  });

  const deleteNoteMutation = trpc.facilityNotes.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الملاحظة");
      refetchNotes();
    },
  });

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast.error("يرجى كتابة ملاحظة");
      return;
    }
    createNoteMutation.mutate({
      facilityId,
      note: newNote,
      images: noteImages.length > 0 ? noteImages : undefined,
    });
  };

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setNoteImages([...noteImages, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">المنشأة غير موجودة</p>
        <Button variant="link" onClick={() => setLocation("/admin/facilities")}>
          العودة للقائمة
        </Button>
      </div>
    );
  }

  const statusInfo = verificationStatuses[facility.verificationStatus as keyof typeof verificationStatuses];
  const StatusIcon = statusInfo?.icon || AlertCircle;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/admin/facilities")}>
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{facility.name}</h1>
          {facility.nameEn && <p className="text-muted-foreground">{facility.nameEn}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                معلومات المنشأة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {facility.imageUrl ? (
                  <img
                    src={facility.imageUrl}
                    alt={facility.name}
                    className="h-24 w-24 rounded-xl object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-xl bg-muted flex items-center justify-center">
                    <Building2 className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo?.bg}`}>
                    <StatusIcon className={`h-4 w-4 ${statusInfo?.color}`} />
                    <span className={`text-sm font-medium ${statusInfo?.color}`}>
                      {statusInfo?.label}
                    </span>
                  </div>
                  <p className="mt-2 text-muted-foreground">
                    {facilityTypes[facility.type]} • {facility.city}
                  </p>
                </div>
              </div>

              {facility.address && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">العنوان</p>
                    <p className="text-sm text-muted-foreground">{facility.address}</p>
                    {facility.googleMapsUrl && (
                      <a
                        href={facility.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        عرض على الخريطة
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {facility.phone && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">الهاتف</p>
                      <p className="font-medium" dir="ltr">{facility.phone}</p>
                    </div>
                  </div>
                )}
                {facility.email && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                      <p className="font-medium" dir="ltr">{facility.email}</p>
                    </div>
                  </div>
                )}
                {facility.website && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">الموقع الإلكتروني</p>
                      <a
                        href={facility.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                        dir="ltr"
                      >
                        {facility.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Media */}
              <div className="flex flex-wrap gap-3">
                {facility.instagram && (
                  <a
                    href={`https://instagram.com/${facility.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors"
                  >
                    <Instagram className="h-4 w-4" />
                    <span className="text-sm">{facility.instagram}</span>
                  </a>
                )}
                {facility.twitter && (
                  <a
                    href={`https://twitter.com/${facility.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    <Twitter className="h-4 w-4" />
                    <span className="text-sm">{facility.twitter}</span>
                  </a>
                )}
                {facility.facebook && (
                  <a
                    href={`https://facebook.com/${facility.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <Facebook className="h-4 w-4" />
                    <span className="text-sm">فيسبوك</span>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Jobs */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                الوظائف المتاحة ({jobs?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!jobs || jobs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  لا توجد وظائف متاحة حالياً
                </p>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-muted-foreground">{job.city}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        verificationStatuses[job.verificationStatus as keyof typeof verificationStatuses]?.bg
                      } ${verificationStatuses[job.verificationStatus as keyof typeof verificationStatuses]?.color}`}>
                        {verificationStatuses[job.verificationStatus as keyof typeof verificationStatuses]?.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notes Sidebar */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                ملاحظات المالك
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Textarea
                  placeholder="أضف ملاحظة جديدة..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                
                {/* Image URLs */}
                <div className="space-y-2">
                  <Label className="text-sm">إرفاق صور (روابط)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="رابط الصورة"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      dir="ltr"
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={addImageUrl}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {noteImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {noteImages.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt=""
                            className="h-16 w-16 rounded object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setNoteImages(noteImages.filter((_, i) => i !== index))}
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleAddNote}
                  disabled={createNoteMutation.isPending}
                  className="w-full"
                >
                  {createNoteMutation.isPending ? "جاري الإضافة..." : "إضافة ملاحظة"}
                </Button>
              </div>

              <div className="border-t pt-4 space-y-4">
                {!notes || notes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4 text-sm">
                    لا توجد ملاحظات
                  </p>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
                      <div className="flex items-start justify-between">
                        <p className="text-sm whitespace-pre-wrap">{note.note}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => deleteNoteMutation.mutate({ id: note.id })}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      {note.images && (note.images as string[]).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {(note.images as string[]).map((img, i) => (
                            <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                              <img
                                src={img}
                                alt=""
                                className="h-16 w-16 rounded object-cover hover:opacity-80 transition-opacity"
                              />
                            </a>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(note.createdAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
