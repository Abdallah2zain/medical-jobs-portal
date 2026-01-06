import { eq, sql, desc, and, gte, lte, like, or, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  medicalFacilities, InsertMedicalFacility, MedicalFacility,
  facilityNotes, InsertFacilityNote,
  jobs, InsertJob, Job,
  jobApplications, InsertJobApplication,
  resumes, InsertResume,
  loginLogs, InsertLoginLog,
  siteStats
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { nanoid } from 'nanoid';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER FUNCTIONS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getUsersCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: count() }).from(users);
  return result[0]?.count ?? 0;
}

// ============ LOGIN LOGS ============

export async function createLoginLog(log: InsertLoginLog) {
  const db = await getDb();
  if (!db) return;
  await db.insert(loginLogs).values(log);
}

export async function getLoginLogsCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: count() }).from(loginLogs);
  return result[0]?.count ?? 0;
}

// ============ MEDICAL FACILITIES ============

export async function createFacility(facility: InsertMedicalFacility) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(medicalFacilities).values(facility);
  return result[0].insertId;
}

export async function updateFacility(id: number, facility: Partial<InsertMedicalFacility>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(medicalFacilities).set(facility).where(eq(medicalFacilities.id, id));
}

export async function deleteFacility(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(medicalFacilities).where(eq(medicalFacilities.id, id));
}

export async function getFacilityById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(medicalFacilities).where(eq(medicalFacilities.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getAllFacilities(filters?: {
  type?: string;
  city?: string;
  verificationStatus?: string;
  search?: string;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(medicalFacilities);
  const conditions = [];
  
  if (filters?.type) {
    conditions.push(eq(medicalFacilities.type, filters.type as any));
  }
  if (filters?.city) {
    conditions.push(eq(medicalFacilities.city, filters.city));
  }
  if (filters?.verificationStatus) {
    conditions.push(eq(medicalFacilities.verificationStatus, filters.verificationStatus as any));
  }
  if (filters?.search) {
    conditions.push(
      or(
        like(medicalFacilities.name, `%${filters.search}%`),
        like(medicalFacilities.nameEn, `%${filters.search}%`)
      )
    );
  }
  
  if (conditions.length > 0) {
    return db.select().from(medicalFacilities).where(and(...conditions)).orderBy(desc(medicalFacilities.createdAt));
  }
  
  return db.select().from(medicalFacilities).orderBy(desc(medicalFacilities.createdAt));
}

export async function getFacilitiesCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: count() }).from(medicalFacilities);
  return result[0]?.count ?? 0;
}

export async function getUniqueCities() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.selectDistinct({ city: medicalFacilities.city }).from(medicalFacilities).where(eq(medicalFacilities.isActive, true));
  return result.map(r => r.city);
}

export async function getCitiesWithJobs() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.selectDistinct({ city: jobs.city }).from(jobs).where(eq(jobs.isActive, true));
  return result.map(r => r.city);
}

// ============ FACILITY NOTES ============

export async function createFacilityNote(note: InsertFacilityNote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(facilityNotes).values(note);
  return result[0].insertId;
}

export async function getFacilityNotes(facilityId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(facilityNotes).where(eq(facilityNotes.facilityId, facilityId)).orderBy(desc(facilityNotes.createdAt));
}

export async function deleteFacilityNote(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(facilityNotes).where(eq(facilityNotes.id, id));
}

// ============ JOBS ============

export async function createJob(job: InsertJob) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Set expiration date to 30 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  
  const result = await db.insert(jobs).values({
    ...job,
    expiresAt,
  });
  return result[0].insertId;
}

export async function updateJob(id: number, job: Partial<InsertJob>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(jobs).set(job).where(eq(jobs.id, id));
}

export async function deleteJob(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(jobs).where(eq(jobs.id, id));
}

export async function getJobById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getAllJobs(filters?: {
  city?: string;
  facilityId?: number;
  verificationStatus?: string;
  activeOnly?: boolean;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  
  if (filters?.city) {
    conditions.push(eq(jobs.city, filters.city));
  }
  if (filters?.facilityId) {
    conditions.push(eq(jobs.facilityId, filters.facilityId));
  }
  if (filters?.verificationStatus) {
    conditions.push(eq(jobs.verificationStatus, filters.verificationStatus as any));
  }
  if (filters?.activeOnly) {
    conditions.push(eq(jobs.isActive, true));
    conditions.push(gte(jobs.expiresAt, new Date()));
  }
  
  if (conditions.length > 0) {
    return db.select().from(jobs).where(and(...conditions)).orderBy(desc(jobs.publishedAt));
  }
  
  return db.select().from(jobs).orderBy(desc(jobs.publishedAt));
}

export async function getActiveJobsCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: count() }).from(jobs).where(
    and(
      eq(jobs.isActive, true),
      gte(jobs.expiresAt, new Date())
    )
  );
  return result[0]?.count ?? 0;
}

export async function getJobTitlesByCity(city: string) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.selectDistinct({ title: jobs.title }).from(jobs).where(
    and(
      eq(jobs.city, city),
      eq(jobs.isActive, true),
      gte(jobs.expiresAt, new Date())
    )
  );
  return result.map(r => r.title);
}

export async function deleteExpiredJobs() {
  const db = await getDb();
  if (!db) return;
  await db.update(jobs).set({ isActive: false }).where(lte(jobs.expiresAt, new Date()));
}

export async function getJobsByFacility(facilityId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobs).where(
    and(
      eq(jobs.facilityId, facilityId),
      eq(jobs.isActive, true)
    )
  ).orderBy(desc(jobs.publishedAt));
}

// ============ JOB APPLICATIONS ============

export async function createJobApplication(application: Omit<InsertJobApplication, 'applicationNumber'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const applicationNumber = `APP-${Date.now().toString(36).toUpperCase()}-${nanoid(4).toUpperCase()}`;
  
  const result = await db.insert(jobApplications).values({
    ...application,
    applicationNumber,
  });
  
  return { id: result[0].insertId, applicationNumber };
}

export async function updateApplicationStatus(id: number, status: 'submitted' | 'processing' | 'delivered', matchedJobs?: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: Partial<InsertJobApplication> = { status };
  if (matchedJobs) {
    updateData.matchedJobs = matchedJobs;
  }
  
  await db.update(jobApplications).set(updateData).where(eq(jobApplications.id, id));
}

export async function getApplicationById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(jobApplications).where(eq(jobApplications.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getApplicationByNumber(applicationNumber: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(jobApplications).where(eq(jobApplications.applicationNumber, applicationNumber)).limit(1);
  return result[0] ?? null;
}

export async function getAllApplications() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobApplications).orderBy(desc(jobApplications.createdAt));
}

export async function getApplicationsCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: count() }).from(jobApplications);
  return result[0]?.count ?? 0;
}

export async function findMatchingJobs(city: string, jobTitle: string, limit: number = 5) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(jobs).where(
    and(
      eq(jobs.city, city),
      eq(jobs.isActive, true),
      gte(jobs.expiresAt, new Date()),
      like(jobs.title, `%${jobTitle}%`)
    )
  ).orderBy(desc(jobs.publishedAt)).limit(limit);
}

// ============ RESUMES ============

export async function createResume(resume: Omit<InsertResume, 'uniqueId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const uniqueId = nanoid(12);
  
  const result = await db.insert(resumes).values({
    ...resume,
    uniqueId,
  });
  
  return { id: result[0].insertId, uniqueId };
}

export async function updateResume(id: number, resume: Partial<InsertResume>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(resumes).set(resume).where(eq(resumes.id, id));
}

export async function getResumeById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(resumes).where(eq(resumes.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getResumeByUniqueId(uniqueId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(resumes).where(eq(resumes.uniqueId, uniqueId)).limit(1);
  return result[0] ?? null;
}

export async function getUserResumes(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(resumes).where(eq(resumes.userId, userId)).orderBy(desc(resumes.updatedAt));
}

export async function deleteResume(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(resumes).where(eq(resumes.id, id));
}

// ============ DASHBOARD STATS ============

export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return {
    totalJobs: 0,
    totalFacilities: 0,
    totalUsers: 0,
    totalLogins: 0,
    totalApplications: 0,
  };
  
  const [jobsCount, facilitiesCount, usersCount, loginsCount, applicationsCount] = await Promise.all([
    getActiveJobsCount(),
    getFacilitiesCount(),
    getUsersCount(),
    getLoginLogsCount(),
    getApplicationsCount(),
  ]);
  
  return {
    totalJobs: jobsCount,
    totalFacilities: facilitiesCount,
    totalUsers: usersCount,
    totalLogins: loginsCount,
    totalApplications: applicationsCount,
  };
}
