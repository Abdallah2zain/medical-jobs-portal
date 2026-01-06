/**
 * خدمة تحديث قاعدة البيانات التلقائية
 * تقوم بالبحث عن بيانات جديدة للمنشآت الطبية والوظائف وتحديث قاعدة البيانات
 */

import { getDb } from "./db";
import { medicalFacilities, jobs } from "../drizzle/schema";
import { eq, lt, and, isNull, or } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";

// قائمة المدن السعودية الرئيسية
const SAUDI_CITIES = [
  "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام",
  "الخبر", "الظهران", "الأحساء", "الطائف", "تبوك",
  "بريدة", "خميس مشيط", "حائل", "نجران", "جازان",
  "ينبع", "أبها", "الجبيل", "القطيف", "الخرج"
];

// أنواع المنشآت الطبية
const FACILITY_TYPES = ["hospital", "complex", "center", "clinic"] as const;

/**
 * البحث عن منشآت طبية جديدة باستخدام الذكاء الاصطناعي
 */
export async function searchNewFacilities(city: string): Promise<any[]> {
  try {
    const prompt = `ابحث عن المنشآت الطبية في مدينة ${city} بالمملكة العربية السعودية.
    
    أريد قائمة بأهم المستشفيات والمجمعات الطبية والمراكز الصحية والعيادات.
    
    لكل منشأة، قدم المعلومات التالية بصيغة JSON:
    - name: اسم المنشأة بالعربية
    - nameEn: اسم المنشأة بالإنجليزية (إن وجد)
    - type: نوع المنشأة (hospital, complex, center, clinic)
    - city: المدينة
    - address: العنوان التفصيلي
    - phone: رقم الهاتف
    - website: الموقع الإلكتروني
    - description: وصف مختصر
    
    أعد النتائج كمصفوفة JSON فقط بدون أي نص إضافي.`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: "أنت مساعد متخصص في البحث عن المنشآت الطبية في السعودية. قدم معلومات دقيقة وموثوقة فقط." },
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "facilities_list",
          strict: true,
          schema: {
            type: "object",
            properties: {
              facilities: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    nameEn: { type: "string" },
                    type: { type: "string" },
                    city: { type: "string" },
                    address: { type: "string" },
                    phone: { type: "string" },
                    website: { type: "string" },
                    description: { type: "string" }
                  },
                  required: ["name", "type", "city"],
                  additionalProperties: false
                }
              }
            },
            required: ["facilities"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (content && typeof content === 'string') {
      const parsed = JSON.parse(content);
      return parsed.facilities || [];
    }
    return [];
  } catch (error) {
    console.error(`[DataUpdate] Error searching facilities in ${city}:`, error);
    return [];
  }
}

/**
 * إضافة منشآت جديدة إلى قاعدة البيانات
 */
export async function addNewFacilities(facilities: any[]): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  let added = 0;
  for (const facility of facilities) {
    try {
      // التحقق من عدم وجود المنشأة مسبقاً
      const existing = await db.select()
        .from(medicalFacilities)
        .where(eq(medicalFacilities.name, facility.name))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(medicalFacilities).values({
          name: facility.name,
          nameEn: facility.nameEn || null,
          type: facility.type || "hospital",
          city: facility.city,
          address: facility.address || null,
          phone: facility.phone || null,
          website: facility.website || null,
          verificationStatus: "pending",
          isActive: true
        });
        added++;
      }
    } catch (error) {
      console.error(`[DataUpdate] Error adding facility ${facility.name}:`, error);
    }
  }
  return added;
}

/**
 * تحديث قاعدة البيانات بالكامل
 */
export async function runFullDatabaseUpdate(): Promise<{
  citiesProcessed: number;
  facilitiesAdded: number;
  errors: string[];
}> {
  const result = {
    citiesProcessed: 0,
    facilitiesAdded: 0,
    errors: [] as string[]
  };

  for (const city of SAUDI_CITIES) {
    try {
      console.log(`[DataUpdate] Processing city: ${city}`);
      const facilities = await searchNewFacilities(city);
      const added = await addNewFacilities(facilities);
      result.facilitiesAdded += added;
      result.citiesProcessed++;
      console.log(`[DataUpdate] Added ${added} facilities in ${city}`);
    } catch (error) {
      const errorMsg = `Error processing ${city}: ${error}`;
      result.errors.push(errorMsg);
      console.error(`[DataUpdate] ${errorMsg}`);
    }
  }

  return result;
}

/**
 * حذف الوظائف المنتهية الصلاحية (أكثر من 30 يوم)
 */
export async function deleteExpiredJobs(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await db.delete(jobs)
      .where(lt(jobs.createdAt, thirtyDaysAgo));

    console.log(`[DataUpdate] Deleted expired jobs`);
    return 1;
  } catch (error) {
    console.error("[DataUpdate] Error deleting expired jobs:", error);
    return 0;
  }
}

/**
 * تشغيل التحديث الدوري
 */
export async function runScheduledUpdate(): Promise<void> {
  console.log("[DataUpdate] Starting scheduled update...");
  
  // حذف الوظائف المنتهية
  await deleteExpiredJobs();
  
  // تحديث قاعدة البيانات
  const result = await runFullDatabaseUpdate();
  
  console.log(`[DataUpdate] Update completed:`, result);
}
