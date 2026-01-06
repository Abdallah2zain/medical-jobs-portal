/**
 * خدمة إشعارات الواتساب
 * ترسل إشعارات للمالك عند استلام طلبات توظيف جديدة
 */

// رابط الواتساب المحدد للتواصل
const WHATSAPP_NUMBER = "201091858809";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

interface JobApplicationNotification {
  applicationNumber: string;
  fullName: string;
  city: string;
  jobTitle: string;
  phone: string;
  email: string;
  matchingJobs?: Array<{
    title: string;
    facility: string;
    city: string;
  }>;
}

/**
 * إنشاء رسالة الواتساب لطلب التوظيف
 */
export function createWhatsAppMessage(notification: JobApplicationNotification): string {
  let message = `🏥 *طلب توظيف جديد*\n\n`;
  message += `📋 *رقم الطلب:* ${notification.applicationNumber}\n`;
  message += `👤 *الاسم:* ${notification.fullName}\n`;
  message += `📍 *المدينة:* ${notification.city}\n`;
  message += `💼 *الوظيفة المطلوبة:* ${notification.jobTitle}\n`;
  message += `📱 *الهاتف:* ${notification.phone}\n`;
  message += `📧 *البريد:* ${notification.email}\n`;

  if (notification.matchingJobs && notification.matchingJobs.length > 0) {
    message += `\n🎯 *أفضل 5 وظائف مطابقة:*\n`;
    notification.matchingJobs.slice(0, 5).forEach((job, index) => {
      message += `${index + 1}. ${job.title} - ${job.facility} (${job.city})\n`;
    });
  }

  message += `\n⏰ *وقت الطلب:* ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}`;

  return message;
}

/**
 * إنشاء رابط الواتساب مع الرسالة
 */
export function createWhatsAppLink(notification: JobApplicationNotification): string {
  const message = createWhatsAppMessage(notification);
  const encodedMessage = encodeURIComponent(message);
  return `${WHATSAPP_LINK}?text=${encodedMessage}`;
}

/**
 * إرسال إشعار الواتساب (يفتح رابط الواتساب)
 * ملاحظة: هذه الدالة تُرجع رابط الواتساب فقط
 * الإرسال الفعلي يتم عبر WhatsApp Business API أو يدوياً
 */
export async function sendWhatsAppNotification(notification: JobApplicationNotification): Promise<{
  success: boolean;
  whatsappLink: string;
  message: string;
}> {
  try {
    const whatsappLink = createWhatsAppLink(notification);
    const message = createWhatsAppMessage(notification);

    // في بيئة الإنتاج، يمكن استخدام WhatsApp Business API
    // أو خدمات مثل Twilio للإرسال التلقائي
    
    console.log(`[WhatsApp] Notification prepared for application ${notification.applicationNumber}`);
    console.log(`[WhatsApp] Link: ${whatsappLink}`);

    return {
      success: true,
      whatsappLink,
      message
    };
  } catch (error) {
    console.error("[WhatsApp] Error preparing notification:", error);
    return {
      success: false,
      whatsappLink: WHATSAPP_LINK,
      message: ""
    };
  }
}

/**
 * الحصول على رابط الواتساب الأساسي
 */
export function getWhatsAppLink(): string {
  return WHATSAPP_LINK;
}

/**
 * الحصول على رقم الواتساب
 */
export function getWhatsAppNumber(): string {
  return WHATSAPP_NUMBER;
}
