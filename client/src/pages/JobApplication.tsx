import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  MapPin, 
  Briefcase, 
  Phone, 
  Mail, 
  Send, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  MessageCircle,
  FileText
} from "lucide-react";
import { useLocation } from "wouter";

const WHATSAPP_NUMBER = "201091858809";

export default function JobApplication() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    city: "",
    jobTitle: "",
    phone: "",
    email: "",
  });
  const [applicationResult, setApplicationResult] = useState<{
    applicationNumber: string;
    matchedJobsCount: number;
  } | null>(null);

  const { data: cities, isLoading: citiesLoading } = trpc.facilities.getCitiesWithJobs.useQuery();
  const { data: jobTitles, isLoading: titlesLoading } = trpc.jobs.getTitlesByCity.useQuery(
    { city: formData.city },
    { enabled: !!formData.city }
  );

  const createMutation = trpc.applications.create.useMutation({
    onSuccess: (data) => {
      setApplicationResult(data);
      setStep(4);
      toast.success("تم إرسال طلبك بنجاح!");
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء إرسال الطلب");
    },
  });

  const handleSubmit = () => {
    if (!formData.city || !formData.jobTitle || !formData.phone || !formData.email) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }
    createMutation.mutate(formData);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!formData.city;
      case 2:
        return !!formData.jobTitle;
      case 3:
        return !!formData.phone && !!formData.email;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Button variant="ghost" onClick={() => setLocation("/")} className="gap-2">
            <ArrowRight className="h-4 w-4" />
            العودة
          </Button>
          <h1 className="font-bold text-lg">طلب توظيف</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="container py-8 max-w-2xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {[
              { num: 1, label: "المدينة", icon: MapPin },
              { num: 2, label: "الوظيفة", icon: Briefcase },
              { num: 3, label: "بياناتك", icon: FileText },
              { num: 4, label: "تم الإرسال", icon: CheckCircle2 },
            ].map((s, index) => (
              <div key={s.num} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    step >= s.num
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <s.icon className="h-5 w-5" />
                </div>
                <span
                  className={`text-xs mt-2 ${
                    step >= s.num ? "text-primary font-medium" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
            {/* Progress Line */}
            <div className="absolute top-6 left-12 right-12 h-0.5 bg-muted -z-0">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step Content */}
        <Card className="border-0 shadow-lg">
          {step === 1 && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">اختر المدينة</CardTitle>
                <CardDescription>
                  حدد المدينة التي تبحث فيها عن وظيفة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>المدينة</Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => {
                      setFormData({ ...formData, city: value, jobTitle: "" });
                    }}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={citiesLoading ? "جاري التحميل..." : "اختر المدينة"} />
                    </SelectTrigger>
                    <SelectContent>
                      {cities?.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full h-12"
                  disabled={!canProceed()}
                  onClick={() => setStep(2)}
                >
                  التالي
                </Button>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">اختر الوظيفة</CardTitle>
                <CardDescription>
                  حدد المسمى الوظيفي الذي تبحث عنه في {formData.city}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>المسمى الوظيفي</Label>
                  <Select
                    value={formData.jobTitle}
                    onValueChange={(value) => setFormData({ ...formData, jobTitle: value })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={titlesLoading ? "جاري التحميل..." : "اختر الوظيفة"} />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTitles?.map((title) => (
                        <SelectItem key={title} value={title}>
                          {title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {jobTitles?.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      لا توجد وظائف متاحة في هذه المدينة حالياً
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(1)}>
                    السابق
                  </Button>
                  <Button
                    className="flex-1 h-12"
                    disabled={!canProceed()}
                    onClick={() => setStep(3)}
                  >
                    التالي
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">بيانات التواصل</CardTitle>
                <CardDescription>
                  أدخل بياناتك للتواصل معك بخصوص الوظائف المتاحة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="05xxxxxxxx"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="h-12 pr-10"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-12 pr-10"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <p className="text-sm font-medium">ملخص الطلب:</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>المدينة: {formData.city}</p>
                    <p>الوظيفة: {formData.jobTitle}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(2)}>
                    السابق
                  </Button>
                  <Button
                    className="flex-1 h-12 gap-2"
                    disabled={!canProceed() || createMutation.isPending}
                    onClick={handleSubmit}
                  >
                    {createMutation.isPending ? (
                      "جاري الإرسال..."
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        إرسال الطلب
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {step === 4 && applicationResult && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <CardTitle className="text-xl text-green-600">تم إرسال طلبك بنجاح!</CardTitle>
                <CardDescription>
                  سيتم التواصل معك قريباً بخصوص الوظائف المتاحة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 rounded-xl bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground mb-2">رقم الطلب</p>
                  <p className="text-2xl font-bold font-mono tracking-wider">
                    {applicationResult.applicationNumber}
                  </p>
                </div>

                {applicationResult.matchedJobsCount > 0 && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm text-center">
                      تم العثور على <span className="font-bold text-primary">{applicationResult.matchedJobsCount}</span> وظيفة مطابقة لطلبك
                    </p>
                  </div>
                )}

                {/* Status Tracker */}
                <div className="space-y-4">
                  <p className="font-medium text-center">حالة الطلب</p>
                  <div className="flex items-center justify-between">
                    {[
                      { label: "تم الإرسال", icon: Send, active: true },
                      { label: "جاري العمل", icon: Clock, active: false },
                      { label: "تم التسليم", icon: CheckCircle2, active: false },
                    ].map((status, index) => (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            status.active
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <status.icon className="h-5 w-5" />
                        </div>
                        <span className={`text-xs mt-2 ${status.active ? "font-medium" : "text-muted-foreground"}`}>
                          {status.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full h-12 gap-2"
                    variant="outline"
                    asChild
                  >
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                        `مرحباً، أريد الاستفسار عن طلب التوظيف رقم: ${applicationResult.applicationNumber}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4" />
                      تواصل معنا عبر الواتساب
                    </a>
                  </Button>
                  <Button
                    className="w-full h-12"
                    onClick={() => setLocation("/")}
                  >
                    العودة للصفحة الرئيسية
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
