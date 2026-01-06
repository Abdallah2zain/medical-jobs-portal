import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { useLocation } from "wouter";

const fonts = [
  { value: "Tajawal", label: "تجوال" },
  { value: "Cairo", label: "القاهرة" },
  { value: "Amiri", label: "أميري" },
  { value: "Noto Sans Arabic", label: "نوتو سانس" },
  { value: "Inter", label: "Inter" },
  { value: "Roboto", label: "Roboto" },
];

const fontSizes = [
  { value: "12", label: "12px" },
  { value: "14", label: "14px" },
  { value: "16", label: "16px" },
  { value: "18", label: "18px" },
  { value: "20", label: "20px" },
  { value: "24", label: "24px" },
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

interface Language {
  language: string;
  level: string;
}

export default function ResumeBuilder() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("personal");
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const previewRef = useRef<HTMLDivElement>(null);

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
    headingSize: 20,
    headingColor: "#0d9488",
    subheadingFont: "Tajawal",
    subheadingSize: 14,
    subheadingColor: "#374151",
    bodyFont: "Tajawal",
    bodySize: 12,
    bodyColor: "#4b5563",
  });

  // Lists
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [newSkill, setNewSkill] = useState("");

  // AI Suggestions
  const suggestSummaryMutation = trpc.ai.suggestSummary.useMutation({
    onSuccess: (data) => {
      setFormData({ ...formData, summary: data.suggestion });
      toast.success("تم إنشاء النبذة الشخصية");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إنشاء النبذة");
    },
  });

  const suggestSkillsMutation = trpc.ai.suggestSkills.useMutation({
    onSuccess: (data) => {
      setSkills([...skills, ...data.skills.filter((s) => !skills.includes(s))]);
      toast.success("تم إضافة المهارات المقترحة");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء اقتراح المهارات");
    },
  });

  const handleSuggestSummary = () => {
    const jobTitle = experience[0]?.title || "ممارس صحي";
    suggestSummaryMutation.mutate({
      jobTitle,
      experience: experience.map((e) => e.title).join(", "),
      language,
    });
  };

  const handleSuggestSkills = () => {
    const jobTitle = experience[0]?.title || "ممارس صحي";
    suggestSkillsMutation.mutate({ jobTitle, language });
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
    setLanguages([...languages, { language: "", level: "" }]);
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const isRTL = language === "ar";

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Button variant="ghost" onClick={() => setLocation("/")} className="gap-2">
            <ArrowRight className="h-4 w-4" />
            العودة
          </Button>
          <h1 className="font-bold text-lg">إنشاء السيرة الذاتية</h1>
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
                  <span className="hidden sm:inline">شخصي</span>
                </TabsTrigger>
                <TabsTrigger value="experience" className="gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden sm:inline">الخبرات</span>
                </TabsTrigger>
                <TabsTrigger value="education" className="gap-1">
                  <GraduationCap className="h-4 w-4" />
                  <span className="hidden sm:inline">التعليم</span>
                </TabsTrigger>
                <TabsTrigger value="skills" className="gap-1">
                  <Award className="h-4 w-4" />
                  <span className="hidden sm:inline">المهارات</span>
                </TabsTrigger>
                <TabsTrigger value="languages" className="gap-1">
                  <Languages className="h-4 w-4" />
                  <span className="hidden sm:inline">اللغات</span>
                </TabsTrigger>
                <TabsTrigger value="style" className="gap-1">
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">التنسيق</span>
                </TabsTrigger>
              </TabsList>

              {/* Personal Info Tab */}
              <TabsContent value="personal">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      البيانات الشخصية
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 space-y-2">
                        <Label>الاسم الكامل</Label>
                        <Input
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder={language === "ar" ? "محمد أحمد العلي" : "John Doe"}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>رقم الهاتف</Label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+966 5x xxx xxxx"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>البريد الإلكتروني</Label>
                        <Input
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="email@example.com"
                          dir="ltr"
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label>العنوان</Label>
                        <Input
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder={language === "ar" ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia"}
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label>رابط الصورة الشخصية</Label>
                        <Input
                          value={formData.photoUrl}
                          onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                          placeholder="https://..."
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">بيانات مهنية (للممارسين الصحيين)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>رقم ممارس</Label>
                          <Input
                            value={formData.mumaresNumber}
                            onChange={(e) => setFormData({ ...formData, mumaresNumber: e.target.value })}
                            dir="ltr"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>رقم Dataflow</Label>
                          <Input
                            value={formData.dataflowNumber}
                            onChange={(e) => setFormData({ ...formData, dataflowNumber: e.target.value })}
                            dir="ltr"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>رقم الإقامة</Label>
                          <Input
                            value={formData.iqamaNumber}
                            onChange={(e) => setFormData({ ...formData, iqamaNumber: e.target.value })}
                            dir="ltr"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>تاريخ الدخول</Label>
                          <Input
                            type="date"
                            value={formData.entryDate}
                            onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>النبذة الشخصية</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSuggestSummary}
                          disabled={suggestSummaryMutation.isPending}
                          className="gap-1"
                        >
                          <Sparkles className="h-3 w-3" />
                          {suggestSummaryMutation.isPending ? "جاري الإنشاء..." : "اقتراح بالذكاء الاصطناعي"}
                        </Button>
                      </div>
                      <Textarea
                        value={formData.summary}
                        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                        placeholder={language === "ar" ? "اكتب نبذة مختصرة عن نفسك وخبراتك..." : "Write a brief summary about yourself..."}
                        rows={4}
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
                        الخبرات العملية
                      </CardTitle>
                      <Button variant="outline" size="sm" onClick={addExperience} className="gap-1">
                        <Plus className="h-4 w-4" />
                        إضافة
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {experience.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        لم تتم إضافة خبرات بعد
                      </p>
                    ) : (
                      experience.map((exp, index) => (
                        <div key={index} className="p-4 rounded-lg bg-muted/50 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">خبرة #{index + 1}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => setExperience(experience.filter((_, i) => i !== index))}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">المسمى الوظيفي</Label>
                              <Input
                                value={exp.title}
                                onChange={(e) => {
                                  const updated = [...experience];
                                  updated[index].title = e.target.value;
                                  setExperience(updated);
                                }}
                                placeholder="طبيب عام"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">جهة العمل</Label>
                              <Input
                                value={exp.company}
                                onChange={(e) => {
                                  const updated = [...experience];
                                  updated[index].company = e.target.value;
                                  setExperience(updated);
                                }}
                                placeholder="مستشفى الملك فهد"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">تاريخ البدء</Label>
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
                              <Label className="text-xs">تاريخ الانتهاء</Label>
                              <Input
                                type="month"
                                value={exp.endDate || ""}
                                onChange={(e) => {
                                  const updated = [...experience];
                                  updated[index].endDate = e.target.value;
                                  setExperience(updated);
                                }}
                                dir="ltr"
                                placeholder="حتى الآن"
                              />
                            </div>
                            <div className="col-span-2 space-y-1">
                              <Label className="text-xs">الوصف</Label>
                              <Textarea
                                value={exp.description || ""}
                                onChange={(e) => {
                                  const updated = [...experience];
                                  updated[index].description = e.target.value;
                                  setExperience(updated);
                                }}
                                rows={2}
                                placeholder="وصف المهام والإنجازات..."
                              />
                            </div>
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
                        التعليم والدورات
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={addEducation} className="gap-1">
                          <Plus className="h-4 w-4" />
                          تعليم
                        </Button>
                        <Button variant="outline" size="sm" onClick={addCourse} className="gap-1">
                          <Plus className="h-4 w-4" />
                          دورة
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Education */}
                    <div className="space-y-3">
                      <h4 className="font-medium">التعليم</h4>
                      {education.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4 text-sm">
                          لم يتم إضافة مؤهلات تعليمية
                        </p>
                      ) : (
                        education.map((edu, index) => (
                          <div key={index} className="p-3 rounded-lg bg-muted/50 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">مؤهل #{index + 1}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive"
                                onClick={() => setEducation(education.filter((_, i) => i !== index))}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <Input
                                value={edu.degree}
                                onChange={(e) => {
                                  const updated = [...education];
                                  updated[index].degree = e.target.value;
                                  setEducation(updated);
                                }}
                                placeholder="الدرجة العلمية"
                              />
                              <Input
                                value={edu.institution}
                                onChange={(e) => {
                                  const updated = [...education];
                                  updated[index].institution = e.target.value;
                                  setEducation(updated);
                                }}
                                placeholder="الجامعة/المعهد"
                              />
                              <Input
                                value={edu.year}
                                onChange={(e) => {
                                  const updated = [...education];
                                  updated[index].year = e.target.value;
                                  setEducation(updated);
                                }}
                                placeholder="السنة"
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Courses */}
                    <div className="space-y-3 border-t pt-4">
                      <h4 className="font-medium">الدورات التدريبية</h4>
                      {courses.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4 text-sm">
                          لم يتم إضافة دورات
                        </p>
                      ) : (
                        courses.map((course, index) => (
                          <div key={index} className="p-3 rounded-lg bg-muted/50 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">دورة #{index + 1}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive"
                                onClick={() => setCourses(courses.filter((_, i) => i !== index))}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <Input
                                value={course.name}
                                onChange={(e) => {
                                  const updated = [...courses];
                                  updated[index].name = e.target.value;
                                  setCourses(updated);
                                }}
                                placeholder="اسم الدورة"
                              />
                              <Input
                                value={course.institution}
                                onChange={(e) => {
                                  const updated = [...courses];
                                  updated[index].institution = e.target.value;
                                  setCourses(updated);
                                }}
                                placeholder="الجهة المانحة"
                              />
                              <Input
                                value={course.year}
                                onChange={(e) => {
                                  const updated = [...courses];
                                  updated[index].year = e.target.value;
                                  setCourses(updated);
                                }}
                                placeholder="السنة"
                              />
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
                        المهارات
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSuggestSkills}
                        disabled={suggestSkillsMutation.isPending}
                        className="gap-1"
                      >
                        <Sparkles className="h-3 w-3" />
                        {suggestSkillsMutation.isPending ? "جاري..." : "اقتراح مهارات"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="أضف مهارة جديدة..."
                        onKeyDown={(e) => e.key === "Enter" && addSkill()}
                      />
                      <Button onClick={addSkill}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm"
                        >
                          {skill}
                          <button
                            onClick={() => setSkills(skills.filter((_, i) => i !== index))}
                            className="hover:text-destructive"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {skills.length === 0 && (
                        <p className="text-muted-foreground text-sm">لم تتم إضافة مهارات بعد</p>
                      )}
                    </div>
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
                        اللغات
                      </CardTitle>
                      <Button variant="outline" size="sm" onClick={addLanguage} className="gap-1">
                        <Plus className="h-4 w-4" />
                        إضافة
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {languages.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        لم تتم إضافة لغات بعد
                      </p>
                    ) : (
                      languages.map((lang, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Input
                            value={lang.language}
                            onChange={(e) => {
                              const updated = [...languages];
                              updated[index].language = e.target.value;
                              setLanguages(updated);
                            }}
                            placeholder="اللغة"
                            className="flex-1"
                          />
                          <Select
                            value={lang.level}
                            onValueChange={(value) => {
                              const updated = [...languages];
                              updated[index].level = value;
                              setLanguages(updated);
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="المستوى" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="native">لغة أم</SelectItem>
                              <SelectItem value="fluent">طلاقة</SelectItem>
                              <SelectItem value="advanced">متقدم</SelectItem>
                              <SelectItem value="intermediate">متوسط</SelectItem>
                              <SelectItem value="basic">مبتدئ</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => setLanguages(languages.filter((_, i) => i !== index))}
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
                      تنسيق السيرة الذاتية
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Heading Style */}
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        العناوين الرئيسية
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">الخط</Label>
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
                                  {font.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">الحجم</Label>
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
                          <Label className="text-xs">اللون</Label>
                          <div className="flex gap-1">
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
                        النص الأساسي
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">الخط</Label>
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
                                  {font.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">الحجم</Label>
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
                          <Label className="text-xs">اللون</Label>
                          <div className="flex gap-1">
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
                    المعاينة
                  </CardTitle>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="h-4 w-4" />
                    تحميل PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-auto h-[calc(100%-4rem)]">
                <div
                  ref={previewRef}
                  className="bg-white min-h-full"
                  style={{ direction: isRTL ? "rtl" : "ltr" }}
                >
                  {/* Resume Preview - 1/3 + 2/3 Layout */}
                  <div className="flex min-h-[842px]">
                    {/* Sidebar - 1/3 */}
                    <div
                      className="w-1/3 p-6"
                      style={{ backgroundColor: styles.headingColor + "15" }}
                    >
                      {/* Photo */}
                      {formData.photoUrl && (
                        <div className="mb-6">
                          <img
                            src={formData.photoUrl}
                            alt="Profile"
                            className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-lg"
                          />
                        </div>
                      )}

                      {/* Contact Info */}
                      <div className="space-y-4 mb-6">
                        <h3
                          style={{
                            fontFamily: styles.headingFont,
                            fontSize: `${styles.headingSize - 4}px`,
                            color: styles.headingColor,
                          }}
                          className="font-bold border-b pb-2"
                        >
                          {language === "ar" ? "معلومات التواصل" : "Contact"}
                        </h3>
                        {formData.phone && (
                          <p style={{ fontFamily: styles.bodyFont, fontSize: `${styles.bodySize}px`, color: styles.bodyColor }}>
                            {formData.phone}
                          </p>
                        )}
                        {formData.email && (
                          <p style={{ fontFamily: styles.bodyFont, fontSize: `${styles.bodySize}px`, color: styles.bodyColor }}>
                            {formData.email}
                          </p>
                        )}
                        {formData.address && (
                          <p style={{ fontFamily: styles.bodyFont, fontSize: `${styles.bodySize}px`, color: styles.bodyColor }}>
                            {formData.address}
                          </p>
                        )}
                      </div>

                      {/* Professional Info */}
                      {(formData.mumaresNumber || formData.dataflowNumber || formData.iqamaNumber) && (
                        <div className="space-y-3 mb-6">
                          <h3
                            style={{
                              fontFamily: styles.headingFont,
                              fontSize: `${styles.headingSize - 4}px`,
                              color: styles.headingColor,
                            }}
                            className="font-bold border-b pb-2"
                          >
                            {language === "ar" ? "بيانات مهنية" : "Professional Info"}
                          </h3>
                          {formData.mumaresNumber && (
                            <p style={{ fontFamily: styles.bodyFont, fontSize: `${styles.bodySize}px`, color: styles.bodyColor }}>
                              <span className="font-medium">ممارس:</span> {formData.mumaresNumber}
                            </p>
                          )}
                          {formData.dataflowNumber && (
                            <p style={{ fontFamily: styles.bodyFont, fontSize: `${styles.bodySize}px`, color: styles.bodyColor }}>
                              <span className="font-medium">Dataflow:</span> {formData.dataflowNumber}
                            </p>
                          )}
                          {formData.iqamaNumber && (
                            <p style={{ fontFamily: styles.bodyFont, fontSize: `${styles.bodySize}px`, color: styles.bodyColor }}>
                              <span className="font-medium">الإقامة:</span> {formData.iqamaNumber}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Skills */}
                      {skills.length > 0 && (
                        <div className="space-y-3 mb-6">
                          <h3
                            style={{
                              fontFamily: styles.headingFont,
                              fontSize: `${styles.headingSize - 4}px`,
                              color: styles.headingColor,
                            }}
                            className="font-bold border-b pb-2"
                          >
                            {language === "ar" ? "المهارات" : "Skills"}
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
                                }}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Languages */}
                      {languages.length > 0 && (
                        <div className="space-y-3">
                          <h3
                            style={{
                              fontFamily: styles.headingFont,
                              fontSize: `${styles.headingSize - 4}px`,
                              color: styles.headingColor,
                            }}
                            className="font-bold border-b pb-2"
                          >
                            {language === "ar" ? "اللغات" : "Languages"}
                          </h3>
                          {languages.map((lang, i) => (
                            <p
                              key={i}
                              style={{ fontFamily: styles.bodyFont, fontSize: `${styles.bodySize}px`, color: styles.bodyColor }}
                            >
                              {lang.language} - {lang.level === "native" ? "لغة أم" : lang.level === "fluent" ? "طلاقة" : lang.level === "advanced" ? "متقدم" : lang.level === "intermediate" ? "متوسط" : "مبتدئ"}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Main Content - 2/3 */}
                    <div className="w-2/3 p-6">
                      {/* Name & Title */}
                      <div className="mb-6 pb-4 border-b">
                        <h1
                          style={{
                            fontFamily: styles.headingFont,
                            fontSize: `${styles.headingSize + 8}px`,
                            color: styles.headingColor,
                          }}
                          className="font-bold"
                        >
                          {formData.fullName || (language === "ar" ? "الاسم الكامل" : "Full Name")}
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
                        <div className="mb-6">
                          <h2
                            style={{
                              fontFamily: styles.headingFont,
                              fontSize: `${styles.headingSize}px`,
                              color: styles.headingColor,
                            }}
                            className="font-bold mb-2"
                          >
                            {language === "ar" ? "نبذة شخصية" : "Summary"}
                          </h2>
                          <p
                            style={{
                              fontFamily: styles.bodyFont,
                              fontSize: `${styles.bodySize}px`,
                              color: styles.bodyColor,
                              lineHeight: 1.6,
                            }}
                          >
                            {formData.summary}
                          </p>
                        </div>
                      )}

                      {/* Experience */}
                      {experience.length > 0 && (
                        <div className="mb-6">
                          <h2
                            style={{
                              fontFamily: styles.headingFont,
                              fontSize: `${styles.headingSize}px`,
                              color: styles.headingColor,
                            }}
                            className="font-bold mb-3"
                          >
                            {language === "ar" ? "الخبرات العملية" : "Experience"}
                          </h2>
                          <div className="space-y-4">
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
                                      fontSize: `${styles.bodySize - 2}px`,
                                      color: styles.bodyColor,
                                    }}
                                  >
                                    {exp.startDate} - {exp.endDate || (language === "ar" ? "حتى الآن" : "Present")}
                                  </span>
                                </div>
                                {exp.description && (
                                  <p
                                    style={{
                                      fontFamily: styles.bodyFont,
                                      fontSize: `${styles.bodySize}px`,
                                      color: styles.bodyColor,
                                      lineHeight: 1.5,
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
                        <div className="mb-6">
                          <h2
                            style={{
                              fontFamily: styles.headingFont,
                              fontSize: `${styles.headingSize}px`,
                              color: styles.headingColor,
                            }}
                            className="font-bold mb-3"
                          >
                            {language === "ar" ? "التعليم" : "Education"}
                          </h2>
                          <div className="space-y-3">
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
                                    fontSize: `${styles.bodySize - 2}px`,
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
                            className="font-bold mb-3"
                          >
                            {language === "ar" ? "الدورات التدريبية" : "Courses"}
                          </h2>
                          <div className="space-y-2">
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
                                    fontSize: `${styles.bodySize - 2}px`,
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
