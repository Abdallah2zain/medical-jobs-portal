import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Sparkles,
  GraduationCap,
  Award,
  BookOpen,
  Users,
  TrendingUp,
  Clock,
} from "lucide-react";
import { useLocation } from "wouter";

export default function OtherServices() {
  const [, setLocation] = useLocation();

  const upcomingServices = [
    {
      icon: GraduationCap,
      title: "الدورات التدريبية",
      description: "دورات متخصصة في المجال الطبي معتمدة من جهات رسمية",
    },
    {
      icon: Award,
      title: "الشهادات المهنية",
      description: "مساعدتك في الحصول على الشهادات المهنية المطلوبة",
    },
    {
      icon: BookOpen,
      title: "التطوير المهني",
      description: "برامج تطوير مهني متكاملة للممارسين الصحيين",
    },
    {
      icon: Users,
      title: "الإرشاد المهني",
      description: "جلسات إرشادية مع خبراء في المجال الطبي",
    },
    {
      icon: TrendingUp,
      title: "تحليل السوق",
      description: "تقارير وتحليلات عن سوق العمل الطبي في السعودية",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Button variant="ghost" onClick={() => setLocation("/")} className="gap-2">
            <ArrowRight className="h-4 w-4" />
            العودة
          </Button>
          <h1 className="font-bold text-lg">خدمات أخرى</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="container py-16">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">قريباً</h1>
          <p className="text-xl text-muted-foreground">
            نعمل على تطوير خدمات إضافية لمساعدتك في تطوير مسيرتك المهنية في المجال الطبي
          </p>
        </div>

        {/* Coming Soon Services */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {upcomingServices.map((service, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-primary/30" />
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <service.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                <p className="text-muted-foreground text-sm">{service.description}</p>
                <div className="mt-4 flex items-center gap-2 text-primary text-sm">
                  <Clock className="h-4 w-4" />
                  <span>قريباً</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter */}
        <Card className="border-0 shadow-xl max-w-2xl mx-auto mt-16 overflow-hidden">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">كن أول من يعلم</h3>
            <p className="text-muted-foreground mb-6">
              سجل اهتمامك وسنخبرك فور إطلاق هذه الخدمات
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Button
                size="lg"
                className="flex-1"
                onClick={() => window.open("https://wa.me/201091858809?text=" + encodeURIComponent("مرحباً، أريد أن أعرف عند إطلاق الخدمات الجديدة"), "_blank")}
              >
                سجل اهتمامك عبر الواتساب
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" onClick={() => setLocation("/")}>
            العودة للصفحة الرئيسية
          </Button>
        </div>
      </main>
    </div>
  );
}
