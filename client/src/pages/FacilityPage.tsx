import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Briefcase,
  Navigation,
  MessageCircle,
} from "lucide-react";
import { useLocation, useParams } from "wouter";

const verificationIcons = {
  verified: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100", label: "تم التحقق" },
  pending: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100", label: "جاري التحقق" },
  unverified: { icon: AlertCircle, color: "text-gray-400", bg: "bg-gray-100", label: "لم يتم التحقق" },
};

const typeLabels: Record<string, string> = {
  hospital: "مستشفى",
  complex: "مجمع طبي",
  center: "مركز طبي",
  clinic: "عيادة",
  other: "أخرى",
};

// Social media icons
const SocialIcon = ({ platform }: { platform: string }) => {
  const icons: Record<string, string> = {
    snapchat: "👻",
    instagram: "📷",
    facebook: "📘",
    twitter: "🐦",
    tiktok: "🎵",
  };
  return <span className="text-lg">{icons[platform] || "🔗"}</span>;
};

export default function FacilityPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const facilityId = parseInt(params.id || "0");

  const { data: facility, isLoading, error } = trpc.facilities.getById.useQuery(
    { id: facilityId },
    { enabled: !!facilityId }
  );

  const { data: jobs } = trpc.jobs.list.useQuery(
    { facilityId },
    { enabled: !!facilityId }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
          <div className="container flex items-center h-16">
            <Button variant="ghost" onClick={() => setLocation("/facilities")} className="gap-2">
              <ArrowRight className="h-4 w-4" />
              العودة
            </Button>
          </div>
        </header>
        <main className="container py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-muted rounded-xl" />
            <div className="h-8 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-1/3" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !facility) {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
          <div className="container flex items-center h-16">
            <Button variant="ghost" onClick={() => setLocation("/facilities")} className="gap-2">
              <ArrowRight className="h-4 w-4" />
              العودة
            </Button>
          </div>
        </header>
        <main className="container py-16 text-center">
          <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">المنشأة غير موجودة</h2>
          <p className="text-muted-foreground mb-4">لم نتمكن من العثور على هذه المنشأة</p>
          <Button onClick={() => setLocation("/facilities")}>
            العودة للمنشآت
          </Button>
        </main>
      </div>
    );
  }

  const verification = verificationIcons[facility.verificationStatus as keyof typeof verificationIcons];
  const socialLinks = [
    { platform: "snapchat", url: facility.snapchat },
    { platform: "instagram", url: facility.instagram },
    { platform: "facebook", url: facility.facebook },
    { platform: "twitter", url: facility.twitter },
    { platform: "tiktok", url: facility.tiktok },
  ].filter((s) => s.url);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Button variant="ghost" onClick={() => setLocation("/facilities")} className="gap-2">
            <ArrowRight className="h-4 w-4" />
            العودة
          </Button>
          <h1 className="font-bold text-lg truncate max-w-xs">{facility.name}</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="container py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="relative h-64 md:h-80 bg-gradient-to-br from-primary/10 to-primary/5">
                {facility.imageUrl ? (
                  <img
                    src={facility.imageUrl}
                    alt={facility.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="h-24 w-24 text-primary/30" />
                  </div>
                )}
                {/* Badges */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Badge className="bg-background/90 text-foreground hover:bg-background">
                    {typeLabels[facility.type] || facility.type}
                  </Badge>
                  <div className={`px-3 py-1 rounded-full ${verification.bg} flex items-center gap-1`}>
                    <verification.icon className={`h-4 w-4 ${verification.color}`} />
                    <span className={`text-sm font-medium ${verification.color}`}>
                      {verification.label}
                    </span>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{facility.name}</h1>
                {facility.nameEn && (
                  <p className="text-muted-foreground mb-4" dir="ltr">
                    {facility.nameEn}
                  </p>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span>{facility.city}</span>
                  {facility.address && <span>- {facility.address}</span>}
                </div>
              </CardContent>
            </Card>

            {/* Jobs */}
            {jobs && jobs.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    الوظائف المتاحة ({jobs.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{job.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {job.city} • {job.jobType === "full_time" ? "دوام كامل" : job.jobType === "part_time" ? "دوام جزئي" : "عقد"}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setLocation("/apply")}
                        >
                          تقدم الآن
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Map */}
            {facility.googleMapsUrl && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    الموقع على الخريطة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-lg bg-muted overflow-hidden">
                    <iframe
                      src={facility.googleMapsUrl.replace("/maps/", "/maps/embed/")}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4 gap-2"
                    asChild
                  >
                    <a href={facility.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                      <Navigation className="h-4 w-4" />
                      الحصول على الاتجاهات
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">معلومات التواصل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {facility.phone && (
                  <a
                    href={`tel:${facility.phone}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">الهاتف</p>
                      <p className="font-medium" dir="ltr">{facility.phone}</p>
                    </div>
                  </a>
                )}

                {facility.whatsapp && (
                  <a
                    href={`https://wa.me/${facility.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">واتساب</p>
                      <p className="font-medium text-green-600" dir="ltr">{facility.whatsapp}</p>
                    </div>
                  </a>
                )}

                {facility.email && (
                  <a
                    href={`mailto:${facility.email}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                      <p className="font-medium text-sm" dir="ltr">{facility.email}</p>
                    </div>
                  </a>
                )}

                {facility.website && (
                  <a
                    href={facility.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">الموقع الإلكتروني</p>
                      <p className="font-medium text-primary text-sm flex items-center gap-1">
                        زيارة الموقع
                        <ExternalLink className="h-3 w-3" />
                      </p>
                    </div>
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Social Media */}
            {socialLinks.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">التواصل الاجتماعي</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {socialLinks.map((social) => (
                      <a
                        key={social.platform}
                        href={social.url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                      >
                        <SocialIcon platform={social.platform} />
                        <span className="text-sm capitalize">{social.platform}</span>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CTA */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              <CardContent className="p-6 text-center">
                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-90" />
                <h3 className="text-lg font-semibold mb-2">هل تبحث عن وظيفة؟</h3>
                <p className="text-sm opacity-90 mb-4">
                  قدم طلبك الآن وسنساعدك في الحصول على الوظيفة المناسبة
                </p>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setLocation("/apply")}
                >
                  تقدم للوظيفة
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
