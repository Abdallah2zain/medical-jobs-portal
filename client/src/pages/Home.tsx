import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import {
  Stethoscope,
  Building2,
  FileText,
  Briefcase,
  Search,
  MessageCircle,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Users,
  MapPin,
  ArrowLeft,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const services = [
    {
      icon: Briefcase,
      title: "طلب توظيف",
      description: "قدم طلبك للحصول على وظيفة في المجال الطبي بالمملكة العربية السعودية",
      href: "/apply",
      color: "from-blue-500 to-blue-600",
      features: ["اختيار المدينة والوظيفة", "تتبع حالة الطلب", "تواصل مباشر"],
    },
    {
      icon: FileText,
      title: "إنشاء السيرة الذاتية",
      description: "أنشئ سيرتك الذاتية بشكل احترافي مع دعم الذكاء الاصطناعي",
      href: "/resume",
      color: "from-teal-500 to-teal-600",
      features: ["قوالب احترافية", "دعم عربي وإنجليزي", "اقتراحات ذكية"],
    },
    {
      icon: Sparkles,
      title: "خدمات أخرى",
      description: "خدمات إضافية للتطوير المهني والدورات التدريبية",
      href: "/services",
      color: "from-purple-500 to-purple-600",
      features: ["التطوير المهني", "الدورات التدريبية", "قريباً..."],
      comingSoon: true,
    },
  ];

  const stats = [
    { icon: Building2, value: "500+", label: "منشأة طبية" },
    { icon: Briefcase, value: "1000+", label: "فرصة وظيفية" },
    { icon: Users, value: "5000+", label: "باحث عن عمل" },
    { icon: MapPin, value: "50+", label: "مدينة سعودية" },
  ];

  const features = [
    {
      icon: Search,
      title: "بحث ذكي",
      description: "نظام بحث متقدم يعمل على مدار الساعة للعثور على أحدث الفرص الوظيفية",
    },
    {
      icon: Shield,
      title: "بيانات موثوقة",
      description: "نتحقق من جميع بيانات المنشآت الطبية لضمان دقة المعلومات",
    },
    {
      icon: Zap,
      title: "سرعة في التواصل",
      description: "نربطك مباشرة بالمنشآت الطبية المناسبة لمؤهلاتك",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-medical flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">بوابة التوظيف الطبي</h1>
              <p className="text-xs text-muted-foreground">المملكة العربية السعودية</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  مرحباً، {user?.name}
                </span>
                {user?.role === "admin" && (
                  <Button variant="outline" onClick={() => setLocation("/admin")}>
                    لوحة التحكم
                  </Button>
                )}
              </>
            ) : (
              <Button onClick={() => (window.location.href = getLoginUrl())}>
                تسجيل الدخول
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        
        <div className="container relative py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              منصة التوظيف الطبي الأولى في السعودية
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              ابدأ مسيرتك المهنية في{" "}
              <span className="text-primary">القطاع الصحي</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              نربط الكفاءات الطبية بأفضل المنشآت الصحية في المملكة العربية السعودية.
              اكتشف الفرص الوظيفية وأنشئ سيرتك الذاتية بسهولة.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="gap-2 h-12 px-8" onClick={() => setLocation("/apply")}>
                قدم طلبك الآن
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 h-12 px-8"
                onClick={() => setLocation("/facilities")}
              >
                <Building2 className="h-4 w-4" />
                تصفح المنشآت الطبية
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-3">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">خدماتنا</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              نقدم مجموعة متكاملة من الخدمات لمساعدتك في الحصول على وظيفة أحلامك
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card
                key={index}
                className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group ${
                  service.comingSoon ? "opacity-80" : ""
                }`}
                onClick={() => !service.comingSoon && setLocation(service.href)}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${service.color}`} />
                {service.comingSoon && (
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    قريباً
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <service.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription className="text-base">{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {!service.comingSoon && (
                    <Button variant="ghost" className="w-full mt-4 gap-2 group-hover:bg-primary group-hover:text-primary-foreground">
                      ابدأ الآن
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">لماذا تختارنا؟</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              نوفر لك أفضل تجربة للبحث عن وظيفة في المجال الطبي
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Track Application Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 w-fit">
                    <Clock className="h-4 w-4" />
                    تتبع طلبك
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">
                    هل قدمت طلباً مسبقاً؟
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    يمكنك تتبع حالة طلبك ومعرفة آخر التحديثات بسهولة من خلال رقم الطلب
                  </p>
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 w-fit"
                    onClick={() => setLocation("/track")}
                  >
                    <Search className="h-4 w-4" />
                    تتبع طلبك
                  </Button>
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 md:p-12 flex items-center justify-center">
                  <div className="space-y-4 w-full max-w-xs">
                    {[
                      { label: "تم الإرسال", active: true },
                      { label: "جاري العمل", active: false },
                      { label: "تم التسليم", active: false },
                    ].map((step, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          step.active ? "bg-primary text-primary-foreground" : "bg-background"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            step.active
                              ? "bg-primary-foreground text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span className={step.active ? "font-medium" : "text-muted-foreground"}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            هل لديك استفسار؟
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            فريقنا جاهز لمساعدتك في أي وقت. تواصل معنا عبر الواتساب
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="gap-2 h-12 px-8"
            asChild
          >
            <a
              href="https://wa.me/201091858809"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-5 w-5" />
              تواصل معنا عبر الواتساب
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg gradient-medical flex items-center justify-center">
                <Stethoscope className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">بوابة التوظيف الطبي</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
