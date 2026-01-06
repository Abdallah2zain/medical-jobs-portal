/**
 * خدمة إكمال بيانات المنشآت والتحقق منها
 * تقوم بالبحث عن معلومات إضافية للمنشآت والتحقق من صحة البيانات
 */

import { getDb } from "./db";
import { medicalFacilities } from "../drizzle/schema";
import { eq, isNull, or, and } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";

/**
 * البحث عن معلومات إضافية لمنشأة طبية
 */
export async function searchFacilityDetails(facilityName: string, city: string): Promise<any> {
  try {
    const prompt = `ابحث عن معلومات تفصيلية عن "${facilityName}" في مدينة ${city} بالمملكة العربية السعودية.
    
    أريد المعلومات التالية:
    - العنوان التفصيلي
    - رقم الهاتف
    - البريد الإلكتروني
    - الموقع الإلكتروني
    - حسابات التواصل الاجتماعي (تويتر، انستغرام، سناب شات، فيسبوك)
    - إحداثيات الموقع (latitude, longitude)
    - رابط خرائط جوجل
    
    أعد النتائج بصيغة JSON فقط.`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: "أنت مساعد متخصص في البحث عن معلومات المنشآت الطبية. قدم معلومات دقيقة وموثوقة فقط." },
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "facility_details",
          strict: true,
          schema: {
            type: "object",
            properties: {
              address: { type: "string" },
              phone: { type: "string" },
              email: { type: "string" },
              website: { type: "string" },
              twitter: { type: "string" },
              instagram: { type: "string" },
              snapchat: { type: "string" },
              facebook: { type: "string" },
              latitude: { type: "string" },
              longitude: { type: "string" },
              googleMapsUrl: { type: "string" },
              verified: { type: "boolean" }
            },
            required: ["verified"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (content && typeof content === 'string') {
      return JSON.parse(content);
    }
    return null;
  } catch (error) {
    console.error(`[Verification] Error searching details for ${facilityName}:`, error);
    return null;
  }
}

/**
 * تحديث بيانات منشأة في قاعدة البيانات
 */
export async function updateFacilityDetails(facilityId: number, details: any): Promise<boolean> {
  const db = await getDb();
  if (!db || !details) return false;

  try {
    const updateData: any = {};
    
    if (details.address) updateData.address = details.address;
    if (details.phone) updateData.phone = details.phone;
    if (details.email) updateData.email = details.email;
    if (details.website) updateData.website = details.website;
    if (details.twitter) updateData.twitter = details.twitter;
    if (details.instagram) updateData.instagram = details.instagram;
    if (details.snapchat) updateData.snapchat = details.snapchat;
    if (details.facebook) updateData.facebook = details.facebook;
    if (details.latitude) updateData.latitude = details.latitude;
    if (details.longitude) updateData.longitude = details.longitude;
    if (details.googleMapsUrl) updateData.googleMapsUrl = details.googleMapsUrl;
    
    // تحديث حالة التحقق
    if (details.verified) {
      updateData.verificationStatus = "verified";
    } else {
      updateData.verificationStatus = "pending";
    }

    if (Object.keys(updateData).length > 0) {
      await db.update(medicalFacilities)
        .set(updateData)
        .where(eq(medicalFacilities.id, facilityId));
      return true;
    }
    return false;
  } catch (error) {
    console.error(`[Verification] Error updating facility ${facilityId}:`, error);
    return false;
  }
}

/**
 * الحصول على المنشآت التي تحتاج إلى إكمال بياناتها
 */
export async function getIncompleteFacilities(): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const facilities = await db.select()
      .from(medicalFacilities)
      .where(
        or(
          isNull(medicalFacilities.phone),
          isNull(medicalFacilities.address),
          isNull(medicalFacilities.website),
          eq(medicalFacilities.verificationStatus, "unverified"),
          eq(medicalFacilities.verificationStatus, "pending")
        )
      )
      .limit(50);

    return facilities;
  } catch (error) {
    console.error("[Verification] Error getting incomplete facilities:", error);
    return [];
  }
}

/**
 * تشغيل عملية إكمال البيانات والتحقق
 */
export async function runVerificationProcess(): Promise<{
  processed: number;
  updated: number;
  verified: number;
  errors: string[];
}> {
  const result = {
    processed: 0,
    updated: 0,
    verified: 0,
    errors: [] as string[]
  };

  try {
    const facilities = await getIncompleteFacilities();
    console.log(`[Verification] Found ${facilities.length} facilities to process`);

    for (const facility of facilities) {
      try {
        result.processed++;
        console.log(`[Verification] Processing: ${facility.name}`);
        
        const details = await searchFacilityDetails(facility.name, facility.city);
        
        if (details) {
          const updated = await updateFacilityDetails(facility.id, details);
          if (updated) {
            result.updated++;
            if (details.verified) {
              result.verified++;
            }
          }
        }
        
        // تأخير بسيط لتجنب الضغط على API
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        const errorMsg = `Error processing ${facility.name}: ${error}`;
        result.errors.push(errorMsg);
        console.error(`[Verification] ${errorMsg}`);
      }
    }
  } catch (error) {
    console.error("[Verification] Error in verification process:", error);
  }

  return result;
}

/**
 * التحقق من منشأة واحدة
 */
export async function verifySingleFacility(facilityId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const facilities = await db.select()
      .from(medicalFacilities)
      .where(eq(medicalFacilities.id, facilityId))
      .limit(1);

    if (facilities.length === 0) return false;

    const facility = facilities[0];
    const details = await searchFacilityDetails(facility.name, facility.city);
    
    if (details) {
      return await updateFacilityDetails(facilityId, details);
    }
    return false;
  } catch (error) {
    console.error(`[Verification] Error verifying facility ${facilityId}:`, error);
    return false;
  }
}
