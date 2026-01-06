import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { runJobSearchCycle, searchForNewJobs, addJobsToDatabase, deleteExpiredJobs } from "./jobSearchService";
import { sendWhatsAppNotification, getWhatsAppLink } from "./whatsappService";

// Admin procedure - only allows admin users
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Dashboard stats
  dashboard: router({
    stats: adminProcedure.query(async () => {
      return db.getDashboardStats();
    }),
  }),

  // Medical Facilities
  facilities: router({
    list: publicProcedure
      .input(z.object({
        type: z.string().optional(),
        city: z.string().optional(),
        verificationStatus: z.string().optional(),
        search: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getAllFacilities(input);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const facility = await db.getFacilityById(input.id);
        if (!facility) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Facility not found' });
        }
        return facility;
      }),
    
    getCities: publicProcedure.query(async () => {
      return db.getUniqueCities();
    }),
    
    getCitiesWithJobs: publicProcedure.query(async () => {
      return db.getCitiesWithJobs();
    }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        nameEn: z.string().optional(),
        type: z.enum(['hospital', 'complex', 'center', 'clinic', 'other']),
        city: z.string().min(1),
        address: z.string().optional(),
        googleMapsUrl: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        phone: z.string().optional(),
        whatsapp: z.string().optional(),
        email: z.string().email().optional().or(z.literal('')),
        website: z.string().optional(),
        imageUrl: z.string().optional(),
        snapchat: z.string().optional(),
        instagram: z.string().optional(),
        facebook: z.string().optional(),
        twitter: z.string().optional(),
        tiktok: z.string().optional(),
        verificationStatus: z.enum(['verified', 'pending', 'unverified']).optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createFacility({
          ...input,
          latitude: input.latitude || undefined,
          longitude: input.longitude || undefined,
          email: input.email || undefined,
        });
        return { id };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        nameEn: z.string().optional(),
        type: z.enum(['hospital', 'complex', 'center', 'clinic', 'other']).optional(),
        city: z.string().optional(),
        address: z.string().optional(),
        googleMapsUrl: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        phone: z.string().optional(),
        whatsapp: z.string().optional(),
        email: z.string().email().optional().or(z.literal('')),
        website: z.string().optional(),
        imageUrl: z.string().optional(),
        snapchat: z.string().optional(),
        instagram: z.string().optional(),
        facebook: z.string().optional(),
        twitter: z.string().optional(),
        tiktok: z.string().optional(),
        verificationStatus: z.enum(['verified', 'pending', 'unverified']).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateFacility(id, data);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteFacility(input.id);
        return { success: true };
      }),
  }),

  // Facility Notes
  facilityNotes: router({
    list: adminProcedure
      .input(z.object({ facilityId: z.number() }))
      .query(async ({ input }) => {
        return db.getFacilityNotes(input.facilityId);
      }),
    
    create: adminProcedure
      .input(z.object({
        facilityId: z.number(),
        note: z.string().min(1),
        images: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createFacilityNote({
          ...input,
          createdBy: ctx.user.id,
        });
        return { id };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteFacilityNote(input.id);
        return { success: true };
      }),
  }),

  // Jobs
  jobs: router({
    list: publicProcedure
      .input(z.object({
        city: z.string().optional(),
        facilityId: z.number().optional(),
        verificationStatus: z.string().optional(),
        activeOnly: z.boolean().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getAllJobs(input);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const job = await db.getJobById(input.id);
        if (!job) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
        }
        return job;
      }),
    
    getByFacility: publicProcedure
      .input(z.object({ facilityId: z.number() }))
      .query(async ({ input }) => {
        return db.getJobsByFacility(input.facilityId);
      }),
    
    getTitlesByCity: publicProcedure
      .input(z.object({ city: z.string() }))
      .query(async ({ input }) => {
        return db.getJobTitlesByCity(input.city);
      }),
    
    create: adminProcedure
      .input(z.object({
        facilityId: z.number(),
        title: z.string().min(1),
        titleEn: z.string().optional(),
        description: z.string().optional(),
        requirements: z.string().optional(),
        city: z.string().min(1),
        salaryMin: z.number().optional(),
        salaryMax: z.number().optional(),
        jobType: z.enum(['full_time', 'part_time', 'contract', 'temporary']).optional(),
        experienceYears: z.number().optional(),
        sourceUrl: z.string().optional(),
        verificationStatus: z.enum(['verified', 'pending', 'unverified']).optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createJob(input);
        return { id };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        facilityId: z.number().optional(),
        title: z.string().optional(),
        titleEn: z.string().optional(),
        description: z.string().optional(),
        requirements: z.string().optional(),
        city: z.string().optional(),
        salaryMin: z.number().optional(),
        salaryMax: z.number().optional(),
        jobType: z.enum(['full_time', 'part_time', 'contract', 'temporary']).optional(),
        experienceYears: z.number().optional(),
        sourceUrl: z.string().optional(),
        verificationStatus: z.enum(['verified', 'pending', 'unverified']).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateJob(id, data);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteJob(input.id);
        return { success: true };
      }),
  }),

  // Job Applications
  applications: router({
    list: adminProcedure.query(async () => {
      return db.getAllApplications();
    }),
    
    getByNumber: publicProcedure
      .input(z.object({ applicationNumber: z.string() }))
      .query(async ({ input }) => {
        const application = await db.getApplicationByNumber(input.applicationNumber);
        if (!application) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Application not found' });
        }
        return application;
      }),
    
    create: publicProcedure
      .input(z.object({
        city: z.string().min(1),
        jobTitle: z.string().min(1),
        phone: z.string().min(1),
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        // Create the application
        const { id, applicationNumber } = await db.createJobApplication(input);
        
        // Find matching jobs
        const matchingJobs = await db.findMatchingJobs(input.city, input.jobTitle, 5);
        const matchedJobIds = matchingJobs.map(j => j.id);
        
        // Update application with matched jobs
        await db.updateApplicationStatus(id, 'processing', matchedJobIds);
        
        // Notify owner via system notification
        const jobsList = matchingJobs.map((j, i) => `${i + 1}. ${j.title} - ${j.city}`).join('\n');
        await notifyOwner({
          title: `طلب توظيف جديد: ${applicationNumber}`,
          content: `
تم استلام طلب توظيف جديد:
- رقم الطلب: ${applicationNumber}
- المدينة: ${input.city}
- الوظيفة: ${input.jobTitle}
- الهاتف: ${input.phone}
- البريد: ${input.email}

أفضل 5 نتائج مطابقة:
${jobsList || 'لا توجد وظائف مطابقة حالياً'}
          `.trim(),
        });

        // Prepare WhatsApp notification
        const whatsappNotification = await sendWhatsAppNotification({
          applicationNumber,
          fullName: input.email.split('@')[0], // استخدام البريد كاسم مؤقت
          city: input.city,
          jobTitle: input.jobTitle,
          phone: input.phone,
          email: input.email,
          matchingJobs: matchingJobs.map(j => ({
            title: j.title,
            facility: 'غير محدد',
            city: j.city
          }))
        });
        
        return { 
          applicationNumber, 
          matchedJobsCount: matchedJobIds.length,
          whatsappLink: whatsappNotification.whatsappLink
        };
      }),
    
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['submitted', 'processing', 'delivered']),
      }))
      .mutation(async ({ input }) => {
        await db.updateApplicationStatus(input.id, input.status);
        return { success: true };
      }),
  }),

  // Resumes
  resumes: router({
    create: publicProcedure
      .input(z.object({
        language: z.enum(['ar', 'en']).optional(),
        templateId: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, uniqueId } = await db.createResume({
          ...input,
          userId: ctx.user?.id,
        });
        return { id, uniqueId };
      }),
    
    getByUniqueId: publicProcedure
      .input(z.object({ uniqueId: z.string() }))
      .query(async ({ input }) => {
        const resume = await db.getResumeByUniqueId(input.uniqueId);
        if (!resume) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Resume not found' });
        }
        return resume;
      }),
    
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        language: z.enum(['ar', 'en']).optional(),
        templateId: z.string().optional(),
        headingFont: z.string().optional(),
        headingSize: z.number().optional(),
        headingColor: z.string().optional(),
        subheadingFont: z.string().optional(),
        subheadingSize: z.number().optional(),
        subheadingColor: z.string().optional(),
        bodyFont: z.string().optional(),
        bodySize: z.number().optional(),
        bodyColor: z.string().optional(),
        fullName: z.string().optional(),
        photoUrl: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        mumaresNumber: z.string().optional(),
        dataflowNumber: z.string().optional(),
        iqamaNumber: z.string().optional(),
        entryDate: z.string().optional(),
        summary: z.string().optional(),
        education: z.array(z.object({
          degree: z.string(),
          institution: z.string(),
          year: z.string(),
          description: z.string().optional(),
        })).optional(),
        experience: z.array(z.object({
          title: z.string(),
          company: z.string(),
          startDate: z.string(),
          endDate: z.string().optional(),
          current: z.boolean().optional(),
          description: z.string().optional(),
        })).optional(),
        courses: z.array(z.object({
          name: z.string(),
          institution: z.string(),
          year: z.string(),
        })).optional(),
        skills: z.array(z.string()).optional(),
        languages: z.array(z.object({
          language: z.string(),
          level: z.string(),
        })).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateResume(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteResume(input.id);
        return { success: true };
      }),
    
    myResumes: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserResumes(ctx.user.id);
    }),
  }),

  // AI Suggestions
  ai: router({
    suggestSummary: publicProcedure
      .input(z.object({
        jobTitle: z.string(),
        experience: z.string().optional(),
        language: z.enum(['ar', 'en']),
      }))
      .mutation(async ({ input }) => {
        const prompt = input.language === 'ar' 
          ? `اكتب نبذة شخصية احترافية مختصرة (3-4 جمل) لشخص يعمل في مجال "${input.jobTitle}" ${input.experience ? `مع خبرة في: ${input.experience}` : ''}. اكتب بصيغة المتكلم.`
          : `Write a professional summary (3-4 sentences) for someone working as "${input.jobTitle}" ${input.experience ? `with experience in: ${input.experience}` : ''}. Write in first person.`;
        
        const response = await invokeLLM({
          messages: [
            { role: 'system', content: input.language === 'ar' ? 'أنت كاتب سير ذاتية محترف.' : 'You are a professional CV writer.' },
            { role: 'user', content: prompt },
          ],
        });
        
        const content = response.choices[0]?.message?.content || '';
        return { suggestion: typeof content === 'string' ? content : '' };
      }),
    
    suggestExperience: publicProcedure
      .input(z.object({
        jobTitle: z.string(),
        company: z.string().optional(),
        language: z.enum(['ar', 'en']),
      }))
      .mutation(async ({ input }) => {
        const prompt = input.language === 'ar'
          ? `اكتب 3-4 نقاط وصف مهام وإنجازات لوظيفة "${input.jobTitle}" ${input.company ? `في ${input.company}` : ''}. اكتب بصيغة الماضي وبشكل احترافي.`
          : `Write 3-4 bullet points describing responsibilities and achievements for a "${input.jobTitle}" position ${input.company ? `at ${input.company}` : ''}. Write in past tense professionally.`;
        
        const response = await invokeLLM({
          messages: [
            { role: 'system', content: input.language === 'ar' ? 'أنت كاتب سير ذاتية محترف.' : 'You are a professional CV writer.' },
            { role: 'user', content: prompt },
          ],
        });
        
        const content2 = response.choices[0]?.message?.content || '';
        return { suggestion: typeof content2 === 'string' ? content2 : '' };
      }),
    
    suggestSkills: publicProcedure
      .input(z.object({
        jobTitle: z.string(),
        language: z.enum(['ar', 'en']),
      }))
      .mutation(async ({ input }) => {
        const prompt = input.language === 'ar'
          ? `اقترح 8-10 مهارات مهنية مناسبة لوظيفة "${input.jobTitle}" في المجال الطبي. اكتب كل مهارة في سطر منفصل.`
          : `Suggest 8-10 professional skills suitable for a "${input.jobTitle}" position in the medical field. Write each skill on a separate line.`;
        
        const response = await invokeLLM({
          messages: [
            { role: 'system', content: input.language === 'ar' ? 'أنت خبير موارد بشرية في المجال الطبي.' : 'You are an HR expert in the medical field.' },
            { role: 'user', content: prompt },
          ],
        });
        
        const content = response.choices[0]?.message?.content || '';
        const contentStr = typeof content === 'string' ? content : '';
        const skills = contentStr.split('\n').filter((s: string) => s.trim()).map((s: string) => s.replace(/^[-•*]\s*/, '').trim());
        
        return { skills };
      }),
  }),

  // Job Search Service (Admin only)
  jobSearch: router({
    // تشغيل دورة البحث الكاملة
    runCycle: adminProcedure.mutation(async () => {
      const result = await runJobSearchCycle();
      return result;
    }),

    // البحث عن وظائف جديدة فقط
    search: adminProcedure.mutation(async () => {
      const jobs = await searchForNewJobs();
      return { jobs, count: jobs.length };
    }),

    // حذف الوظائف المنتهية
    deleteExpired: adminProcedure.mutation(async () => {
      const deleted = await deleteExpiredJobs();
      return { deleted };
    }),
  }),
});

export type AppRouter = typeof appRouter;
