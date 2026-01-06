import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Search, 
  Send, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  MessageCircle,
  FileText,
  MapPin,
  Briefcase
} from "lucide-react";
import { useLocation } from "wouter";

const WHATSAPP_NUMBER = "201091858809";

const statusConfig = {
  submitted: { label: "تم الإرسال", icon: Send, color: "text-blue-600", bg: "bg-blue-100", step: 1 },
  processing: { label: "جاري العمل", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100", step: 2 },
  delivered: { label: "تم التسليم", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100", step: 3 },
};

export default function TrackApplication() {
  const [, setLocation] = useLocation();
  const [applicationNumber, setApplicationNumber] = useState("");
  const [searchedNumber, setSearchedNumber] = useState("");

  const { data: application, isLoading, error } = trpc.applications.getByNumber.useQuery(
    { applicationNumber: searchedNumber },
    { enabled: !!searchedNumber, retry: false }
  );

  const handleSearch = () => {
    if (!applicationNumber.trim()) {
      toast.error("يرجى إدخال رقم الطلب");
      return;
    }
    setSearchedNumber(applicationNumber.trim());
  };

  const currentStatus = application ? statusConfig[application.status as keyof typeof statusConfig] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Button variant="ghost" onClick={() => setLocation("/")} className="gap-2">
            <ArrowRight className="h-4 w-4" />
            العودة
          </Button>
          <h1 className="font-bold text-lg">تتبع الطلب</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="container py-8 max-w-2xl">
        {/* Search Card */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">تتبع حالة طلبك</CardTitle>
            <CardDescription>
              أدخل رقم الطلب للاطلاع على حالته
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="applicationNumber">رقم الطلب</Label>
              <div className="flex gap-2">
                <Input
                  id="applicationNumber"
                  placeholder="مثال: JOB-ABC123"
                  value={applicationNumber}
                  onChange={(e) => setApplicationNumber(e.target.value)}
                  className="h-12 font-mono"
                  dir="ltr"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button className="h-12 px-6" onClick={handleSearch} disabled={isLoading}>
                  {isLoading ? "جاري البحث..." : "بحث"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {searchedNumber && !isLoading && (
          <>
            {error || !application ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-12 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-destructive" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">لم يتم العثور على الطلب</h3>
                  <p className="text-muted-foreground text-sm">
                    تأكد من صحة رقم الطلب وحاول مرة أخرى
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">تفاصيل الطلب</CardTitle>
                      <p className="text-sm text-muted-foreground font-mono mt-1">
                        {application.applicationNumber}
                      </p>
                    </div>
                    {currentStatus && (
                      <div className={`px-3 py-1.5 rounded-full ${currentStatus.bg} flex items-center gap-2`}>
                        <currentStatus.icon className={`h-4 w-4 ${currentStatus.color}`} />
                        <span className={`text-sm font-medium ${currentStatus.color}`}>
                          {currentStatus.label}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Application Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">المدينة</span>
                      </div>
                      <p className="font-medium">{application.city}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Briefcase className="h-4 w-4" />
                        <span className="text-sm">الوظيفة</span>
                      </div>
                      <p className="font-medium">{application.jobTitle}</p>
                    </div>
                  </div>

                  {/* Status Progress */}
                  <div className="space-y-4">
                    <p className="font-medium">مراحل الطلب</p>
                    <div className="relative">
                      <div className="flex items-center justify-between">
                        {Object.entries(statusConfig).map(([key, config], index) => {
                          const isActive = currentStatus && config.step <= currentStatus.step;
                          const isCurrent = application.status === key;
                          return (
                            <div key={key} className="flex flex-col items-center flex-1 relative z-10">
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                  isActive
                                    ? isCurrent
                                      ? `${config.bg} ring-4 ring-${config.color.replace('text-', '')}/20`
                                      : "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                <config.icon className={`h-5 w-5 ${isCurrent ? config.color : ""}`} />
                              </div>
                              <span
                                className={`text-xs mt-2 text-center ${
                                  isActive ? "font-medium" : "text-muted-foreground"
                                }`}
                              >
                                {config.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      {/* Progress Line */}
                      <div className="absolute top-6 left-12 right-12 h-0.5 bg-muted -z-0">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${((currentStatus?.step || 1) - 1) / 2 * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">تاريخ تقديم الطلب</p>
                    <p className="font-medium">
                      {new Date(application.createdAt).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {/* Contact */}
                  <Button
                    className="w-full h-12 gap-2"
                    variant="outline"
                    asChild
                  >
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                        `مرحباً، أريد الاستفسار عن طلب التوظيف رقم: ${application.applicationNumber}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4" />
                      تواصل معنا عبر الواتساب
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
