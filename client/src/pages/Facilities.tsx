import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Building2,
  MapPin,
  Phone,
  Globe,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Stethoscope,
  ExternalLink,
  Briefcase,
} from "lucide-react";
import { useLocation } from "wouter";

const facilityTypes = [
  { value: "all", label: "جميع الأنواع" },
  { value: "hospital", label: "مستشفى" },
  { value: "complex", label: "مجمع طبي" },
  { value: "center", label: "مركز طبي" },
  { value: "clinic", label: "عيادة" },
  { value: "other", label: "أخرى" },
];

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

export default function Facilities() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [city, setCity] = useState("all");

  const { data: facilities, isLoading } = trpc.facilities.list.useQuery({
    search: search || undefined,
    type: type !== "all" ? type : undefined,
    city: city !== "all" ? city : undefined,
    verificationStatus: "verified", // Show only verified facilities to users
  });

  const { data: cities } = trpc.facilities.getCities.useQuery();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Button variant="ghost" onClick={() => setLocation("/")} className="gap-2">
            <ArrowRight className="h-4 w-4" />
            العودة
          </Button>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h1 className="font-bold text-lg">المنشآت الطبية</h1>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="container py-8">
        {/* Filters */}
        <Card className="border-0 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن منشأة..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="نوع المنشأة" />
                </SelectTrigger>
                <SelectContent>
                  {facilityTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger>
                  <SelectValue placeholder="المدينة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المدن</SelectItem>
                  {cities?.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setLocation("/facilities/map")} className="gap-2">
                <MapPin className="h-4 w-4" />
                عرض على الخريطة
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-0 shadow-sm animate-pulse">
                <CardContent className="p-6">
                  <div className="h-40 bg-muted rounded-lg mb-4" />
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : facilities?.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">لا توجد نتائج</h3>
              <p className="text-muted-foreground">
                جرب تغيير معايير البحث للعثور على منشآت
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              تم العثور على {facilities?.length} منشأة
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilities?.map((facility) => {
                const verification = verificationIcons[facility.verificationStatus as keyof typeof verificationIcons];
                return (
                  <Card
                    key={facility.id}
                    className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
                    onClick={() => setLocation(`/facility/${facility.id}`)}
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
                      {facility.imageUrl ? (
                        <img
                          src={facility.imageUrl}
                          alt={facility.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="h-16 w-16 text-primary/30" />
                        </div>
                      )}
                      {/* Type Badge */}
                      <Badge className="absolute top-3 right-3 bg-background/90 text-foreground hover:bg-background">
                        {typeLabels[facility.type] || facility.type}
                      </Badge>
                      {/* Verification Badge */}
                      <div
                        className={`absolute top-3 left-3 px-2 py-1 rounded-full ${verification.bg} flex items-center gap-1`}
                      >
                        <verification.icon className={`h-3 w-3 ${verification.color}`} />
                        <span className={`text-xs font-medium ${verification.color}`}>
                          {verification.label}
                        </span>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {facility.name}
                      </h3>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span>{facility.city}</span>
                          {facility.address && (
                            <span className="truncate">- {facility.address}</span>
                          )}
                        </div>
                        
                        {facility.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 shrink-0" />
                            <span dir="ltr">{facility.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* View Details */}
                      <div className="mt-3 pt-3 border-t flex items-center justify-between">
                        <span className="text-sm text-primary font-medium">
                          عرض التفاصيل
                        </span>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
