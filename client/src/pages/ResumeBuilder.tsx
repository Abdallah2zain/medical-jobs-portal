import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ArrowRight,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  Sparkles,
  Plus,
  Trash2,
  Download,
  Eye,
  Palette,
  Type,
  FileText,
  Image,
  Loader2,
  Upload,
} from "lucide-react";
import { useLocation } from "wouter";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// الخطوط المتاحة
const fonts = [
  { value: "Tajawal", label: "تجوال", labelEn: "Tajawal" },
  { value: "Cairo", label: "القاهرة", labelEn: "Cairo" },
  { value: "Amiri", label: "أميري", labelEn: "Amiri" },
  { value: "Noto Sans Arabic", label: "نوتو سانس", labelEn: "Noto Sans" },
  { value: "Inter", label: "Inter", labelEn: "Inter" },
  { value: "Roboto", label: "Roboto", labelEn: "Roboto" },
];

const fontSizes = [
  { value: "10", label: "10px" },
  { value: "11", label: "11px" },
  { value: "12", label: "12px" },
  { value: "14", label: "14px" },
  { value: "16", label: "16px" },
  { value: "18", label: "18px" },
];

const defaultColors = [
  "#0d9488", // teal
  "#2563eb", // blue
  "#7c3aed", // purple
  "#dc2626", // red
  "#059669", // green
  "#d97706", // amber
  "#374151", // gray
];

// الترجمات
const translations = {
  ar: {
    back: "العودة",
    createResume: "إنشاء السيرة الذاتية",
    personal: "شخصي",
    experience: "الخبرات",
    education: "التعليم",
    skills: "المهارات",
    languages: "اللغات",
    style: "التنسيق",
    personalInfo: "البيانات الشخصية",
    fullName: "الاسم الكامل",
    phone: "رقم الهاتف",
    email: "البريد الإلكتروني",
    address: "العنوان",
    photoUrl: "رابط الصورة الشخصية",
    professionalInfo: "البيانات المهنية",
    mumaresNumber: "رقم ممارس",
    dataflowNumber: "رقم Dataflow",
    iqamaNumber: "رقم الإقامة",
    entryDate: "تاريخ الدخول",
    summary: "النبذة الشخصية",
    suggestWithAI: "اقتراح بالذكاء الاصطناعي",
    workExperience: "الخبرات العملية",
    addExperience: "إضافة خبرة",
    jobTitle: "المسمى الوظيفي",
    company: "جهة العمل",
    startDate: "تاريخ البدء",
    endDate: "تاريخ الانتهاء",
    currentJob: "وظيفة حالية",
    description: "الوصف",
    educationTitle: "التعليم والشهادات",
    addEducation: "إضافة شهادة",
    degree: "الدرجة العلمية",
    institution: "المؤسسة التعليمية",
    year: "السنة",
    coursesTitle: "الدورات التدريبية",
    addCourse: "إضافة دورة",
    courseName: "اسم الدورة",
    skillsTitle: "المهارات",
    addSkill: "إضافة مهارة",
    suggestSkills: "اقتراح مهارات",
    languagesTitle: "اللغات",
    addLanguage: "إضافة لغة",
    language: "اللغة",
    level: "المستوى",
    native: "لغة أم",
    fluent: "طلاقة",
    advanced: "متقدم",
    intermediate: "متوسط",
    basic: "مبتدئ",
    styleTitle: "تنسيق السيرة الذاتية",
    mainHeadings: "العناوين الرئيسية",
    bodyText: "النص الأساسي",
    font: "الخط",
    size: "الحجم",
    color: "اللون",
    preview: "المعاينة",
    downloadPDF: "تحميل PDF",
    downloadImage: "تحميل صورة",
    contactInfo: "معلومات التواصل",
    professionalData: "بيانات مهنية",
    present: "حتى الآن",
    noExperience: "لم تتم إضافة خبرات بعد",
    noEducation: "لم تتم إضافة شهادات بعد",
    noCourses: "لم تتم إضافة دورات بعد",
    noSkills: "لم تتم إضافة مهارات بعد",
    noLanguages: "لم تتم إضافة لغات بعد",
    placeholderName: "الاسم الكامل",
    placeholderPhone: "+966 5x xxx xxxx",
    placeholderEmail: "email@example.com",
    placeholderAddress: "الرياض، المملكة العربية السعودية",
    downloading: "جاري التحميل...",
    downloadSuccess: "تم التحميل بنجاح",
    downloadError: "حدث خطأ أثناء التحميل",
  },
  en: {
    back: "Back",
    createResume: "Create Resume",
    personal: "Personal",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    languages: "Languages",
    style: "Style",
    personalInfo: "Personal Information",
    fullName: "Full Name",
    phone: "Phone Number",
    email: "Email Address",
    address: "Address",
    photoUrl: "Photo URL",
    professionalInfo: "Professional Information",
    mumaresNumber: "Mumares Number",
    dataflowNumber: "Dataflow Number",
    iqamaNumber: "Iqama Number",
    entryDate: "Entry Date",
    summary: "Summary",
    suggestWithAI: "Suggest with AI",
    workExperience: "Work Experience",
    addExperience: "Add Experience",
    jobTitle: "Job Title",
    company: "Company",
    startDate: "Start Date",
    endDate: "End Date",
    currentJob: "Current Job",
    description: "Description",
    educationTitle: "Education",
    addEducation: "Add Education",
    degree: "Degree",
    institution: "Institution",
    year: "Year",
    coursesTitle: "Courses & Training",
    addCourse: "Add Course",
    courseName: "Course Name",
    skillsTitle: "Skills",
    addSkill: "Add Skill",
    suggestSkills: "Suggest Skills",
    languagesTitle: "Languages",
    addLanguage: "Add Language",
    language: "Language",
    level: "Level",
    native: "Native",
    fluent: "Fluent",
    advanced: "Advanced",
    intermediate: "Intermediate",
    basic: "Basic",
    styleTitle: "Resume Style",
    mainHeadings: "Main Headings",
    bodyText: "Body Text",
    font: "Font",
    size: "Size",
    color: "Color",
    preview: "Preview",
    downloadPDF: "Download PDF",
    downloadImage: "Download Image",
    contactInfo: "Contact Information",
    professionalData: "Professional Data",
    present: "Present",
    noExperience: "No experience added yet",
    noEducation: "No education added yet",
    noCourses: "No courses added yet",
    noSkills: "No skills added yet",
    noLanguages: "No languages added yet",
    placeholderName: "Full Name",
    placeholderPhone: "+966 5x xxx xxxx",
    placeholderEmail: "email@example.com",
    placeholderAddress: "Riyadh, Saudi Arabia",
    downloading: "Downloading...",
    downloadSuccess: "Downloaded successfully",
    downloadError: "Error downloading",
  },
};

interface Education {
  degree: string;
  institution: string;
  year: string;
  description?: string;
}

interface Experience {
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

interface Course {
  name: string;
  institution: string;
  year: string;
}

interface LanguageItem {
  language: string;
  level: string;
}

export default function ResumeBuilder() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("personal");
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [isDownloading, setIsDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // الحصول على الترجمات
  const t = translations[language];

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    photoUrl: "",
    address: "",
    phone: "",
    email: "",
    mumaresNumber: "",
    dataflowNumber: "",
    iqamaNumber: "",
    entryDate: "",
    summary: "",
  });

  // Style state
  const [styles, setStyles] = useState({
    headingFont: "Tajawal",
    headingSize: 14,
    headingColor: "#0d9488",
    subheadingFont: "Tajawal",
    subheadingSize: 12,
    subheadingColor: "#374151",
    bodyFont: "Tajawal",
    bodySize: 10,
    bodyColor: "#4b5563",
  });

  // Lists
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [languagesList, setLanguagesList] = useState<LanguageItem[]>([]);
  const [newSkill, setNewSkill] = useState("");

  // AI Suggestions
  const suggestSummaryMutation = trpc.ai.suggestSummary.useMutation({
    onSuccess: (data) => {
      setFormData({ ...formData, summary: data.suggestion });
      toast.success(language === "ar" ? "تم إنشاء النبذة الشخصية" : "Summary generated");
    },
    onError: () => {
      toast.error(language === "ar" ? "حدث خطأ أثناء إنشاء النبذة" : "Error generating summary");
    },
  });

  const suggestSkillsMutation = trpc.ai.suggestSkills.useMutation({
    onSuccess: (data) => {
      setSkills([...skills, ...data.skills.filter((s) => !skills.includes(s))]);
      toast.success(language === "ar" ? "تم إضافة المهارات المقترحة" : "Skills added");
    },
    onError: () => {
      toast.error(language === "ar" ? "حدث خطأ أثناء اقتراح المهارات" : "Error suggesting skills");
    },
  });

  const handleSuggestSummary = () => {
    const jobTitle = experience[0]?.title || (language === "ar" ? "ممارس صحي" : "Healthcare Professional");
    suggestSummaryMutation.mutate({
      jobTitle,
      experience: experience.map((e) => e.title).join(", "),
      language,
    });
  };

  const handleSuggestSkills = () => {
    const jobTitle = experience[0]?.title || (language === "ar" ? "ممارس صحي" : "Healthcare Professional");
    suggestSkillsMutation.mutate({ jobTitle, language });
  };

  // تحميل PDF - طريقة الطباعة
  const handleDownloadPDF = () => {
    if (!previewRef.current) return;
    
    setIsDownloading(true);
    toast.info(language === 'ar' ? 'جاري فتح نافذة الطباعة...' : 'Opening print dialog...');
    
    try {
      // إنشاء نافذة طباعة جديدة
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        toast.error(language === 'ar' ? 'يرجى السماح بالنوافذ المنبثقة' : 'Please allow popups');
        setIsDownloading(false);
        return;
      }
      
      const content = previewRef.current.innerHTML;
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${language}">
        <head>
          <meta charset="UTF-8">
          <title>${formData.fullName || 'CV'} - Resume</title>
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&family=Cairo:wght@400;500;700&family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            @page { size: A4; margin: 0; }
            html, body { 
              width: 210mm; 
              min-height: 297mm; 
              font-family: 'Tajawal', sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            body { background: white; }
            .resume-container { 
              width: 210mm; 
              min-height: 297mm; 
              margin: 0 auto;
              background: white;
            }
            @media print {
              html, body { width: 210mm; height: 297mm; }
              .resume-container { width: 100%; height: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="resume-container">
            ${content}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          <\/script>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      toast.success(language === 'ar' ? 'اختر حفظ كـ PDF من نافذة الطباعة' : 'Select Save as PDF from print dialog');
    } catch (error) {
      console.error('Error:', error);
      toast.error(t.downloadError);
    } finally {
      setIsDownloading(false);
    }
  };

  // تحميل صورة
  const handleDownloadImage = async () => {
    if (!previewRef.current) return;
    
    setIsDownloading(true);
    toast.info(language === 'ar' ? 'جاري إنشاء الصورة...' : 'Generating image...');
    
    try {
      const element = previewRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });
      
      // تحويل إلى blob وتحميل
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${formData.fullName || 'CV'}_Resume.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success(t.downloadSuccess);
        } else {
          toast.error(t.downloadError);
        }
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error(t.downloadError);
    } finally {
      setIsDownloading(false);
    }
  };

  const addEducation = () => {
    setEducation([...education, { degree: "", institution: "", year: "" }]);
  };

  const addExperience = () => {
    setExperience([...experience, { title: "", company: "", startDate: "" }]);
  };

  const addCourse = () => {
    setCourses([...courses, { name: "", institution: "", year: "" }]);
  };

  const addLanguage = () => {
    setLanguagesList([...languagesList, { language: "", level: "" }]);
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const isRTL = language === "ar";

  // ترجمة مستوى اللغة
  const getLevelText = (level: string) => {
    const levels: Record<string, { ar: string; en: string }> = {
      native: { ar: "لغة أم", en: "Native" },
      fluent: { ar: "طلاقة", en: "Fluent" },
      advanced: { ar: "متقدم", en: "Advanced" },
      intermediate: { ar: "متوسط", en: "Intermediate" },
      basic: { ar: "مبتدئ", en: "Basic" },
    };
    return levels[level]?.[language] || level;
  };

  return (
    <div className="min-h-screen bg-muted/30" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Button variant="ghost" onClick={() => setLocation("/")} className="gap-2">
            <ArrowRight className={`h-4 w-4 ${!isRTL ? "rotate-180" : ""}`} />
            {t.back}
          </Button>
          <h1 className="font-bold text-lg">{t.createResume}</h1>
          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={(v) => setLanguage(v as "ar" | "en")}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-6 w-full">
                <TabsTrigger value="personal" className="gap-1">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.personal}</span>
                </TabsTrigger>
                <TabsTrigger value="experience" className="gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.experience}</span>
                </TabsTrigger>
                <TabsTrigger value="education" className="gap-1">
                  <GraduationCap className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.education}</span>
                </TabsTrigger>
                <TabsTrigger value="skills" className="gap-1">
                  <Award className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.skills}</span>
                </TabsTrigger>
                <TabsTrigger value="languages" className="gap-1">
                  <Languages className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.languages}</span>
                </TabsTrigger>
                <TabsTrigger value="style" className="gap-1">
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.style}</span>
                </TabsTrigger>
              </TabsList>

              {/* Personal Info Tab */}
              <TabsContent value="personal">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {t.personalInfo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 space-y-2">
                        <Label>{t.fullName}</Label>
                        <Input
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder={t.placeholderName}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t.phone}</Label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder={t.placeholderPhone}
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t.email}</Label>
                        <Input
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder={t.placeholderEmail}
                          dir="ltr"
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label>{t.address}</Label>
                        <Input
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder={t.placeholderAddress}
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label>{t.photoUrl}</Label>
                        <div className="flex gap-2">
                          <Input
                            value={formData.photoUrl}
                            onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                            placeholder="https://..."
                            dir="ltr"
                            className="flex-1"
                          />
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const result = event.target?.result as string;
                                    setFormData({ ...formData, photoUrl: result });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            <Button type="button" variant="outline" asChild>
                              <span className="flex items-center gap-1">
                                <Upload className="h-4 w-4" />
                                {language === 'ar' ? 'رفع صورة' : 'Upload'}
                              </span>
                            </Button>
                          </label>
                        </div>
                        {formData.photoUrl && formData.photoUrl.startsWith('data:') && (
                          <div className="mt-2 flex items-center gap-2">
                            <img src={formData.photoUrl} alt="Preview" className="w-12 h-12 rounded-full object-cover" />
                            <span className="text-sm text-muted-foreground">
                              {language === 'ar' ? 'تم رفع الصورة' : 'Image uploaded'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Professional Info */}
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium mb-3">{t.professionalInfo}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t.mumaresNumber}</Label>
                          <Input
                            value={formData.mumaresNumber}
                            onChange={(e) => setFormData({ ...formData, mumaresNumber: e.target.value })}
                            dir="ltr"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t.dataflowNumber}</Label>
                          <Input
                            value={formData.dataflowNumber}
                            onChange={(e) => setFormData({ ...formData, dataflowNumber: e.target.value })}
                            dir="ltr"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t.iqamaNumber}</Label>
                          <Input
                            value={formData.iqamaNumber}
                            onChange={(e) => setFormData({ ...formData, iqamaNumber: e.target.value })}
                            dir="ltr"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t.entryDate}</Label>
                          <Input
                            type="date"
                            value={formData.entryDate}
                            onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label>{t.summary}</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={handleSuggestSummary}
                          disabled={suggestSummaryMutation.isPending}
                        >
                          {suggestSummaryMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                          {t.suggestWithAI}
                        </Button>
                      </div>
                      <Textarea
                        value={formData.summary}
                        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                        rows={4}
                        className="resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Experience Tab */}
              <TabsContent value="experience">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        {t.workExperience}
                      </CardTitle>
                      <Button variant="outline" size="sm" onClick={addExperience} className="gap-1">
                        <Plus className="h-4 w-4" />
                        {t.addExperience}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {experience.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">{t.noExperience}</p>
                    ) : (
                      experience.map((exp, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="grid grid-cols-2 gap-3 flex-1">
                              <div className="space-y-1">
                                <Label className="text-xs">{t.jobTitle}</Label>
                                <Input
                                  value={exp.title}
                                  onChange={(e) => {
                                    const updated = [...experience];
                                    updated[index].title = e.target.value;
                                    setExperience(updated);
                                  }}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">{t.company}</Label>
                                <Input
                                  value={exp.company}
                                  onChange={(e) => {
                                    const updated = [...experience];
                                    updated[index].company = e.target.value;
                                    setExperience(updated);
                                  }}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">{t.startDate}</Label>
                                <Input
                                  type="month"
                                  value={exp.startDate}
                                  onChange={(e) => {
                                    const updated = [...experience];
                                    updated[index].startDate = e.target.value;
                                    setExperience(updated);
                                  }}
                                  dir="ltr"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">{t.endDate}</Label>
                                <Input
                                  type="month"
                                  value={exp.endDate || ""}
                                  onChange={(e) => {
                                    const updated = [...experience];
                                    updated[index].endDate = e.target.value;
                                    setExperience(updated);
                                  }}
                                  disabled={exp.current}
                                  dir="ltr"
                                />
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => setExperience(experience.filter((_, i) => i !== index))}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">{t.description}</Label>
                            <Textarea
                              value={exp.description || ""}
                              onChange={(e) => {
                                const updated = [...experience];
                                updated[index].description = e.target.value;
                                setExperience(updated);
                              }}
                              rows={2}
                              className="resize-none"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Education Tab */}
              <TabsContent value="education">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        {t.educationTitle}
                      </CardTitle>
                      <Button variant="outline" size="sm" onClick={addEducation} className="gap-1">
                        <Plus className="h-4 w-4" />
                        {t.addEducation}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {education.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">{t.noEducation}</p>
                    ) : (
                      education.map((edu, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="grid grid-cols-3 gap-3 flex-1">
                              <div className="space-y-1">
                                <Label className="text-xs">{t.degree}</Label>
                                <Input
                                  value={edu.degree}
                                  onChange={(e) => {
                                    const updated = [...education];
                                    updated[index].degree = e.target.value;
                                    setEducation(updated);
                                  }}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">{t.institution}</Label>
                                <Input
                                  value={edu.institution}
                                  onChange={(e) => {
                                    const updated = [...education];
                                    updated[index].institution = e.target.value;
                                    setEducation(updated);
                                  }}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">{t.year}</Label>
                                <Input
                                  value={edu.year}
                                  onChange={(e) => {
                                    const updated = [...education];
                                    updated[index].year = e.target.value;
                                    setEducation(updated);
                                  }}
                                  dir="ltr"
                                />
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => setEducation(education.filter((_, i) => i !== index))}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}

                    {/* Courses Section */}
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{t.coursesTitle}</h4>
                        <Button variant="outline" size="sm" onClick={addCourse} className="gap-1">
                          <Plus className="h-4 w-4" />
                          {t.addCourse}
                        </Button>
                      </div>
                      {courses.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">{t.noCourses}</p>
                      ) : (
                        courses.map((course, index) => (
                          <div key={index} className="border rounded-lg p-3 mb-2">
                            <div className="flex justify-between items-start">
                              <div className="grid grid-cols-3 gap-2 flex-1">
                                <div className="space-y-1">
                                  <Label className="text-xs">{t.courseName}</Label>
                                  <Input
                                    value={course.name}
                                    onChange={(e) => {
                                      const updated = [...courses];
                                      updated[index].name = e.target.value;
                                      setCourses(updated);
                                    }}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">{t.institution}</Label>
                                  <Input
                                    value={course.institution}
                                    onChange={(e) => {
                                      const updated = [...courses];
                                      updated[index].institution = e.target.value;
                                      setCourses(updated);
                                    }}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">{t.year}</Label>
                                  <Input
                                    value={course.year}
                                    onChange={(e) => {
                                      const updated = [...courses];
                                      updated[index].year = e.target.value;
                                      setCourses(updated);
                                    }}
                                    dir="ltr"
                                  />
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => setCourses(courses.filter((_, i) => i !== index))}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Skills Tab */}
              <TabsContent value="skills">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        {t.skillsTitle}
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={handleSuggestSkills}
                        disabled={suggestSkillsMutation.isPending}
                      >
                        {suggestSkillsMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                        {t.suggestSkills}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder={t.addSkill}
                        onKeyDown={(e) => e.key === "Enter" && addSkill()}
                      />
                      <Button onClick={addSkill} className="gap-1">
                        <Plus className="h-4 w-4" />
                        {t.addSkill}
                      </Button>
                    </div>
                    {skills.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">{t.noSkills}</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary"
                          >
                            <span>{skill}</span>
                            <button
                              onClick={() => setSkills(skills.filter((_, i) => i !== index))}
                              className="hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Languages Tab */}
              <TabsContent value="languages">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Languages className="h-5 w-5" />
                        {t.languagesTitle}
                      </CardTitle>
                      <Button variant="outline" size="sm" onClick={addLanguage} className="gap-1">
                        <Plus className="h-4 w-4" />
                        {t.addLanguage}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {languagesList.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">{t.noLanguages}</p>
                    ) : (
                      languagesList.map((lang, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Input
                            value={lang.language}
                            onChange={(e) => {
                              const updated = [...languagesList];
                              updated[index].language = e.target.value;
                              setLanguagesList(updated);
                            }}
                            placeholder={t.language}
                            className="flex-1"
                          />
                          <Select
                            value={lang.level}
                            onValueChange={(value) => {
                              const updated = [...languagesList];
                              updated[index].level = value;
                              setLanguagesList(updated);
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder={t.level} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="native">{t.native}</SelectItem>
                              <SelectItem value="fluent">{t.fluent}</SelectItem>
                              <SelectItem value="advanced">{t.advanced}</SelectItem>
                              <SelectItem value="intermediate">{t.intermediate}</SelectItem>
                              <SelectItem value="basic">{t.basic}</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => setLanguagesList(languagesList.filter((_, i) => i !== index))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Style Tab */}
              <TabsContent value="style">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      {t.styleTitle}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Heading Style */}
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        {t.mainHeadings}
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">{t.font}</Label>
                          <Select
                            value={styles.headingFont}
                            onValueChange={(v) => setStyles({ ...styles, headingFont: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {fonts.map((font) => (
                                <SelectItem key={font.value} value={font.value}>
                                  {language === "ar" ? font.label : font.labelEn}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t.size}</Label>
                          <Select
                            value={styles.headingSize.toString()}
                            onValueChange={(v) => setStyles({ ...styles, headingSize: parseInt(v) })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {fontSizes.map((size) => (
                                <SelectItem key={size.value} value={size.value}>
                                  {size.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t.color}</Label>
                          <div className="flex gap-1 flex-wrap">
                            {defaultColors.map((color) => (
                              <button
                                key={color}
                                className={`w-6 h-6 rounded-full border-2 ${
                                  styles.headingColor === color ? "border-foreground" : "border-transparent"
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => setStyles({ ...styles, headingColor: color })}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Body Style */}
                    <div className="space-y-3 border-t pt-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {t.bodyText}
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">{t.font}</Label>
                          <Select
                            value={styles.bodyFont}
                            onValueChange={(v) => setStyles({ ...styles, bodyFont: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {fonts.map((font) => (
                                <SelectItem key={font.value} value={font.value}>
                                  {language === "ar" ? font.label : font.labelEn}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t.size}</Label>
                          <Select
                            value={styles.bodySize.toString()}
                            onValueChange={(v) => setStyles({ ...styles, bodySize: parseInt(v) })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {fontSizes.map((size) => (
                                <SelectItem key={size.value} value={size.value}>
                                  {size.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t.color}</Label>
                          <div className="flex gap-1 flex-wrap">
                            {defaultColors.map((color) => (
                              <button
                                key={color}
                                className={`w-6 h-6 rounded-full border-2 ${
                                  styles.bodyColor === color ? "border-foreground" : "border-transparent"
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => setStyles({ ...styles, bodyColor: color })}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Panel */}
          <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
            <Card className="border-0 shadow-lg h-full overflow-hidden">
              <CardHeader className="border-b bg-muted/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    {t.preview}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={handleDownloadImage}
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Image className="h-4 w-4" />
                      )}
                      {t.downloadImage}
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="gap-1"
                      onClick={handleDownloadPDF}
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      {t.downloadPDF}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-auto h-[calc(100%-4rem)]">
                <div
                  ref={previewRef}
                  className="bg-white"
                  style={{ 
                    direction: isRTL ? "rtl" : "ltr",
                    width: "210mm",
                    minHeight: "297mm",
                    margin: "0 auto",
                  }}
                >
                  {/* Resume Preview - 1/3 + 2/3 Layout */}
                  <div className="flex" style={{ minHeight: "297mm" }}>
                    {/* Sidebar - 1/3 */}
                    <div
                      className="p-4 overflow-hidden"
                      style={{ 
                        backgroundColor: styles.headingColor + "15",
                        width: "33.33%",
                        flexShrink: 0,
                      }}
                    >
                      {/* Photo */}
                      {formData.photoUrl && (
                        <div className="mb-4 flex justify-center">
                          <img
                            src={formData.photoUrl}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                          />
                        </div>
                      )}

                      {/* Contact Info */}
                      <div className="space-y-2 mb-4">
                        <h3
                          style={{
                            fontFamily: styles.headingFont,
                            fontSize: `${styles.headingSize - 2}px`,
                            color: styles.headingColor,
                          }}
                          className="font-bold border-b pb-1"
                        >
                          {t.contactInfo}
                        </h3>
                        {formData.phone && (
                          <p 
                            className="break-words text-xs"
                            style={{ fontFamily: styles.bodyFont, fontSize: `${styles.bodySize}px`, color: styles.bodyColor }}
                          >
                            {formData.phone}
                          </p>
                        )}
                        {formData.email && (
                          <p 
                            className="break-all text-xs"
                            style={{ fontFamily: styles.bodyFont, fontSize: `${styles.bodySize}px`, color: styles.bodyColor }}
                          >
                            {formData.email}
                          </p>
                        )}
                        {formData.address && (
                          <p 
                            className="break-words text-xs"
                            style={{ fontFamily: styles.bodyFont, fontSize: `${styles.bodySize}px`, color: styles.bodyColor }}
                          >
                            {formData.address}
                          </p>
                        )}
                      </div>

                      {/* Professional Info */}
                      {(formData.mumaresNumber || formData.dataflowNumber || formData.iqamaNumber) && (
                        <div className="space-y-2 mb-4">
                          <h3
                            style={{
                              fontFamily: styles.headingFont,
                              fontSize: `${styles.headingSize - 2}px`,
                              color: styles.headingColor,
                            }}
                            className="font-bold border-b pb-1"
                          >
                            {t.professionalData}
                          </h3>
                          {formData.mumaresNumber && (
                            <p 
                              className="text-xs"
                              style={{ fontFamily: styles.bodyFont, fontSize: `${styles.bodySize}px`, color: styles.bodyColor }}
                            >
                              <span className="font-medium">{language === "ar" ? "ممارس:" : "Mumares:"}</span> {formData.mumaresNumber}
                            </p>
                          )}
                          {formData.dataflowNumber && (
                            <p 
                              className="text-xs"
                              style={{ fontFamily: styles.bodyFont, fontSize: `${styles.bodySize}px`, color: styles.bodyColor }}
                            >
                              <span className="font-medium">Dataflow:</span> {formData.dataflowNumber}
                            </p>
                          )}
                          {formData.iqamaNumber && (
                            <p 
                              className="text-xs"
                              style={{ fontFamily: styles.bodyFont, fontSize: `${styles.bodySize}px`, color: styles.bodyColor }}
                            >
                              <span className="font-medium">{language === "ar" ? "الإقامة:" : "Iqama:"}</span> {formData.iqamaNumber}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Skills */}
                      {skills.length > 0 && (
                        <div className="space-y-2 mb-4">
                          <h3
                            style={{
                              fontFamily: styles.headingFont,
                              fontSize: `${styles.headingSize - 2}px`,
                              color: styles.headingColor,
                            }}
                            className="font-bold border-b pb-1"
                          >
                            {t.skillsTitle}
                          </h3>
                          <div className="flex flex-wrap gap-1">
                            {skills.map((skill, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded text-xs"
                                style={{
                                  backgroundColor: styles.headingColor + "20",
                                  color: styles.headingColor,
                                  fontFamily: styles.bodyFont,
                                  fontSize: `${styles.bodySize - 1}px`,
                                }}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Languages */}
                      {languagesList.length > 0 && (
                        <div className="space-y-2">
                          <h3
                            style={{
                              fontFamily: styles.headingFont,
                              fontSize: `${styles.headingSize - 2}px`,
                              color: styles.headingColor,
                            }}
                            className="font-bold border-b pb-1"
                          >
                            {t.languagesTitle}
                          </h3>
                          {languagesList.map((lang, i) => (
                            <p
                              key={i}
                              className="text-xs"
                              style={{ fontFamily: styles.bodyFont, fontSize: `${styles.bodySize}px`, color: styles.bodyColor }}
                            >
                              {lang.language} - {getLevelText(lang.level)}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Main Content - 2/3 */}
                    <div className="p-4" style={{ width: "66.67%" }}>
                      {/* Name & Title */}
                      <div className="mb-4 pb-3 border-b">
                        <h1
                          style={{
                            fontFamily: styles.headingFont,
                            fontSize: `${styles.headingSize + 6}px`,
                            color: styles.headingColor,
                          }}
                          className="font-bold"
                        >
                          {formData.fullName || t.placeholderName}
                        </h1>
                        {experience[0]?.title && (
                          <p
                            style={{
                              fontFamily: styles.subheadingFont,
                              fontSize: `${styles.subheadingSize}px`,
                              color: styles.subheadingColor,
                            }}
                            className="mt-1"
                          >
                            {experience[0].title}
                          </p>
                        )}
                      </div>

                      {/* Summary */}
                      {formData.summary && (
                        <div className="mb-4">
                          <h2
                            style={{
                              fontFamily: styles.headingFont,
                              fontSize: `${styles.headingSize}px`,
                              color: styles.headingColor,
                            }}
                            className="font-bold mb-2"
                          >
                            {t.summary}
                          </h2>
                          <p
                            style={{
                              fontFamily: styles.bodyFont,
                              fontSize: `${styles.bodySize}px`,
                              color: styles.bodyColor,
                              lineHeight: 1.5,
                            }}
                          >
                            {formData.summary}
                          </p>
                        </div>
                      )}

                      {/* Experience */}
                      {experience.length > 0 && (
                        <div className="mb-4">
                          <h2
                            style={{
                              fontFamily: styles.headingFont,
                              fontSize: `${styles.headingSize}px`,
                              color: styles.headingColor,
                            }}
                            className="font-bold mb-2"
                          >
                            {t.workExperience}
                          </h2>
                          <div className="space-y-3">
                            {experience.map((exp, i) => (
                              <div key={i}>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3
                                      style={{
                                        fontFamily: styles.subheadingFont,
                                        fontSize: `${styles.subheadingSize}px`,
                                        color: styles.subheadingColor,
                                      }}
                                      className="font-semibold"
                                    >
                                      {exp.title}
                                    </h3>
                                    <p
                                      style={{
                                        fontFamily: styles.bodyFont,
                                        fontSize: `${styles.bodySize}px`,
                                        color: styles.bodyColor,
                                      }}
                                    >
                                      {exp.company}
                                    </p>
                                  </div>
                                  <span
                                    style={{
                                      fontFamily: styles.bodyFont,
                                      fontSize: `${styles.bodySize - 1}px`,
                                      color: styles.bodyColor,
                                    }}
                                  >
                                    {exp.startDate} - {exp.endDate || t.present}
                                  </span>
                                </div>
                                {exp.description && (
                                  <p
                                    style={{
                                      fontFamily: styles.bodyFont,
                                      fontSize: `${styles.bodySize}px`,
                                      color: styles.bodyColor,
                                      lineHeight: 1.4,
                                    }}
                                    className="mt-1"
                                  >
                                    {exp.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Education */}
                      {education.length > 0 && (
                        <div className="mb-4">
                          <h2
                            style={{
                              fontFamily: styles.headingFont,
                              fontSize: `${styles.headingSize}px`,
                              color: styles.headingColor,
                            }}
                            className="font-bold mb-2"
                          >
                            {t.educationTitle}
                          </h2>
                          <div className="space-y-2">
                            {education.map((edu, i) => (
                              <div key={i} className="flex justify-between">
                                <div>
                                  <h3
                                    style={{
                                      fontFamily: styles.subheadingFont,
                                      fontSize: `${styles.subheadingSize}px`,
                                      color: styles.subheadingColor,
                                    }}
                                    className="font-semibold"
                                  >
                                    {edu.degree}
                                  </h3>
                                  <p
                                    style={{
                                      fontFamily: styles.bodyFont,
                                      fontSize: `${styles.bodySize}px`,
                                      color: styles.bodyColor,
                                    }}
                                  >
                                    {edu.institution}
                                  </p>
                                </div>
                                <span
                                  style={{
                                    fontFamily: styles.bodyFont,
                                    fontSize: `${styles.bodySize - 1}px`,
                                    color: styles.bodyColor,
                                  }}
                                >
                                  {edu.year}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Courses */}
                      {courses.length > 0 && (
                        <div>
                          <h2
                            style={{
                              fontFamily: styles.headingFont,
                              fontSize: `${styles.headingSize}px`,
                              color: styles.headingColor,
                            }}
                            className="font-bold mb-2"
                          >
                            {t.coursesTitle}
                          </h2>
                          <div className="space-y-1">
                            {courses.map((course, i) => (
                              <div key={i} className="flex justify-between">
                                <div>
                                  <span
                                    style={{
                                      fontFamily: styles.subheadingFont,
                                      fontSize: `${styles.subheadingSize}px`,
                                      color: styles.subheadingColor,
                                    }}
                                    className="font-medium"
                                  >
                                    {course.name}
                                  </span>
                                  <span
                                    style={{
                                      fontFamily: styles.bodyFont,
                                      fontSize: `${styles.bodySize}px`,
                                      color: styles.bodyColor,
                                    }}
                                  >
                                    {" - "}{course.institution}
                                  </span>
                                </div>
                                <span
                                  style={{
                                    fontFamily: styles.bodyFont,
                                    fontSize: `${styles.bodySize - 1}px`,
                                    color: styles.bodyColor,
                                  }}
                                >
                                  {course.year}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
