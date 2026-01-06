import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapView } from "@/components/Map";
import {
  ArrowRight,
  Building2,
  MapPin,
  Phone,
  Search,
  Navigation,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
} from "lucide-react";
import { useLocation } from "wouter";

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

// Saudi Arabia center coordinates
const SAUDI_CENTER = { lat: 24.7136, lng: 46.6753 };

export default function FacilitiesMap() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");
  const [selectedFacility, setSelectedFacility] = useState<number | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  const { data: facilities } = trpc.facilities.list.useQuery({
    search: search || undefined,
    city: city !== "all" ? city : undefined,
    verificationStatus: "verified",
  });

  const { data: cities } = trpc.facilities.getCities.useQuery();

  const selectedFacilityData = facilities?.find((f) => f.id === selectedFacility);

  // Update markers when facilities change
  useEffect(() => {
    if (!mapRef.current || !facilities) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      marker.map = null;
    });
    markersRef.current = [];

    // Add new markers
    facilities.forEach((facility) => {
      if (facility.latitude && facility.longitude) {
        const lat = parseFloat(facility.latitude);
        const lng = parseFloat(facility.longitude);

        if (!isNaN(lat) && !isNaN(lng)) {
          const marker = new google.maps.marker.AdvancedMarkerElement({
            map: mapRef.current!,
            position: { lat, lng },
            title: facility.name,
          });

          marker.addListener("click", () => {
            setSelectedFacility(facility.id);
            mapRef.current?.panTo({ lat, lng });
          });

          markersRef.current.push(marker);
        }
      }
    });
  }, [facilities]);

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  const handleGetDirections = () => {
    if (selectedFacilityData?.googleMapsUrl) {
      window.open(selectedFacilityData.googleMapsUrl, "_blank");
    } else if (selectedFacilityData?.latitude && selectedFacilityData?.longitude) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${selectedFacilityData.latitude},${selectedFacilityData.longitude}`,
        "_blank"
      );
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Button variant="ghost" onClick={() => setLocation("/facilities")} className="gap-2">
            <ArrowRight className="h-4 w-4" />
            العودة
          </Button>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h1 className="font-bold text-lg">خريطة المنشآت</h1>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="container py-6">
        {/* Filters */}
        <Card className="border-0 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن منشأة..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-10"
                />
              </div>
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
              <Button variant="outline" onClick={() => setLocation("/facilities")}>
                عرض كقائمة
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Map and Details */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg overflow-hidden">
              <MapView
                className="h-[600px]"
                initialCenter={SAUDI_CENTER}
                initialZoom={6}
                onMapReady={handleMapReady}
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Selected Facility */}
            {selectedFacilityData ? (
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{selectedFacilityData.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setSelectedFacility(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {typeLabels[selectedFacilityData.type] || selectedFacilityData.type}
                    </Badge>
                    {(() => {
                      const v = verificationIcons[selectedFacilityData.verificationStatus as keyof typeof verificationIcons];
                      return (
                        <div className={`px-2 py-0.5 rounded-full ${v.bg} flex items-center gap-1`}>
                          <v.icon className={`h-3 w-3 ${v.color}`} />
                          <span className={`text-xs ${v.color}`}>{v.label}</span>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedFacilityData.city}</span>
                      {selectedFacilityData.address && (
                        <span>- {selectedFacilityData.address}</span>
                      )}
                    </div>
                    {selectedFacilityData.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span dir="ltr">{selectedFacilityData.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 gap-2"
                      onClick={handleGetDirections}
                    >
                      <Navigation className="h-4 w-4" />
                      الاتجاهات
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setLocation(`/facility/${selectedFacilityData.id}`)}
                    >
                      التفاصيل
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-8 text-center">
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    اضغط على علامة في الخريطة لعرض تفاصيل المنشأة
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Facilities List */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>المنشآت ({facilities?.length || 0})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-auto space-y-2">
                {facilities?.map((facility) => (
                  <button
                    key={facility.id}
                    className={`w-full text-right p-3 rounded-lg transition-colors ${
                      selectedFacility === facility.id
                        ? "bg-primary/10 border border-primary"
                        : "bg-muted/50 hover:bg-muted"
                    }`}
                    onClick={() => {
                      setSelectedFacility(facility.id);
                      if (facility.latitude && facility.longitude) {
                        mapRef.current?.panTo({
                          lat: parseFloat(facility.latitude),
                          lng: parseFloat(facility.longitude),
                        });
                        mapRef.current?.setZoom(15);
                      }
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{facility.name}</p>
                        <p className="text-xs text-muted-foreground">{facility.city}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
