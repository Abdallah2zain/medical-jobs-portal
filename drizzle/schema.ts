import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Login logs for tracking user activity
 */
export const loginLogs = mysqlTable("login_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  loginAt: timestamp("loginAt").defaultNow().notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
});

export type LoginLog = typeof loginLogs.$inferSelect;
export type InsertLoginLog = typeof loginLogs.$inferInsert;

/**
 * Medical facilities database
 */
export const medicalFacilities = mysqlTable("medical_facilities", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("nameEn", { length: 255 }),
  type: mysqlEnum("type", ["hospital", "complex", "center", "clinic", "other"]).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  address: text("address"),
  googleMapsUrl: text("googleMapsUrl"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  phone: varchar("phone", { length: 20 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  email: varchar("email", { length: 320 }),
  website: text("website"),
  imageUrl: text("imageUrl"),
  // Social media accounts
  snapchat: varchar("snapchat", { length: 100 }),
  instagram: varchar("instagram", { length: 100 }),
  facebook: varchar("facebook", { length: 100 }),
  twitter: varchar("twitter", { length: 100 }),
  tiktok: varchar("tiktok", { length: 100 }),
  // Verification status
  verificationStatus: mysqlEnum("verificationStatus", ["verified", "pending", "unverified"]).default("unverified").notNull(),
  verifiedAt: timestamp("verifiedAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MedicalFacility = typeof medicalFacilities.$inferSelect;
export type InsertMedicalFacility = typeof medicalFacilities.$inferInsert;

/**
 * Facility notes with images (for admin)
 */
export const facilityNotes = mysqlTable("facility_notes", {
  id: int("id").autoincrement().primaryKey(),
  facilityId: int("facilityId").notNull(),
  note: text("note").notNull(),
  images: json("images").$type<string[]>(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FacilityNote = typeof facilityNotes.$inferSelect;
export type InsertFacilityNote = typeof facilityNotes.$inferInsert;

/**
 * Jobs table
 */
export const jobs = mysqlTable("jobs", {
  id: int("id").autoincrement().primaryKey(),
  facilityId: int("facilityId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  titleEn: varchar("titleEn", { length: 255 }),
  description: text("description"),
  requirements: text("requirements"),
  city: varchar("city", { length: 100 }).notNull(),
  salaryMin: int("salaryMin"),
  salaryMax: int("salaryMax"),
  jobType: mysqlEnum("jobType", ["full_time", "part_time", "contract", "temporary"]).default("full_time"),
  experienceYears: int("experienceYears"),
  sourceUrl: text("sourceUrl"),
  verificationStatus: mysqlEnum("verificationStatus", ["verified", "pending", "unverified"]).default("unverified").notNull(),
  verifiedAt: timestamp("verifiedAt"),
  isActive: boolean("isActive").default(true).notNull(),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;

/**
 * Job applications
 */
export const jobApplications = mysqlTable("job_applications", {
  id: int("id").autoincrement().primaryKey(),
  applicationNumber: varchar("applicationNumber", { length: 20 }).notNull().unique(),
  userId: int("userId"),
  city: varchar("city", { length: 100 }).notNull(),
  jobTitle: varchar("jobTitle", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  status: mysqlEnum("status", ["submitted", "processing", "delivered"]).default("submitted").notNull(),
  matchedJobs: json("matchedJobs").$type<number[]>(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertJobApplication = typeof jobApplications.$inferInsert;

/**
 * Resumes / CVs
 */
export const resumes = mysqlTable("resumes", {
  id: int("id").autoincrement().primaryKey(),
  uniqueId: varchar("uniqueId", { length: 36 }).notNull().unique(),
  userId: int("userId"),
  language: mysqlEnum("language", ["ar", "en"]).default("ar").notNull(),
  templateId: varchar("templateId", { length: 50 }).default("classic"),
  // Font settings
  headingFont: varchar("headingFont", { length: 100 }),
  headingSize: int("headingSize"),
  headingColor: varchar("headingColor", { length: 20 }),
  subheadingFont: varchar("subheadingFont", { length: 100 }),
  subheadingSize: int("subheadingSize"),
  subheadingColor: varchar("subheadingColor", { length: 20 }),
  bodyFont: varchar("bodyFont", { length: 100 }),
  bodySize: int("bodySize"),
  bodyColor: varchar("bodyColor", { length: 20 }),
  // Personal info
  fullName: varchar("fullName", { length: 255 }),
  photoUrl: text("photoUrl"),
  address: text("address"),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  // Saudi-specific fields
  mumaresNumber: varchar("mumaresNumber", { length: 50 }),
  dataflowNumber: varchar("dataflowNumber", { length: 50 }),
  iqamaNumber: varchar("iqamaNumber", { length: 50 }),
  entryDate: varchar("entryDate", { length: 20 }),
  // Content sections
  summary: text("summary"),
  education: json("education").$type<Array<{
    degree: string;
    institution: string;
    year: string;
    description?: string;
  }>>(),
  experience: json("experience").$type<Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description?: string;
  }>>(),
  courses: json("courses").$type<Array<{
    name: string;
    institution: string;
    year: string;
  }>>(),
  skills: json("skills").$type<string[]>(),
  languages: json("languages").$type<Array<{
    language: string;
    level: string;
  }>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Resume = typeof resumes.$inferSelect;
export type InsertResume = typeof resumes.$inferInsert;

/**
 * Site statistics (for dashboard)
 */
export const siteStats = mysqlTable("site_stats", {
  id: int("id").autoincrement().primaryKey(),
  date: timestamp("date").notNull(),
  pageViews: int("pageViews").default(0),
  uniqueVisitors: int("uniqueVisitors").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SiteStat = typeof siteStats.$inferSelect;
export type InsertSiteStat = typeof siteStats.$inferInsert;
