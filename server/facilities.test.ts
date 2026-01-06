import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock database functions
vi.mock("./db", () => ({
  getDashboardStats: vi.fn().mockResolvedValue({
    jobsCount: 100,
    facilitiesCount: 50,
    usersCount: 200,
    loginCount: 500,
    recentApplications: [],
    recentJobs: [],
  }),
  getAllFacilities: vi.fn().mockResolvedValue([
    {
      id: 1,
      name: "مستشفى الملك فهد",
      nameEn: "King Fahd Hospital",
      type: "hospital",
      city: "الرياض",
      address: "شارع الملك فهد",
      verificationStatus: "verified",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getFacilityById: vi.fn().mockImplementation((id: number) => {
    if (id === 1) {
      return Promise.resolve({
        id: 1,
        name: "مستشفى الملك فهد",
        nameEn: "King Fahd Hospital",
        type: "hospital",
        city: "الرياض",
        address: "شارع الملك فهد",
        verificationStatus: "verified",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    return Promise.resolve(null);
  }),
  getUniqueCities: vi.fn().mockResolvedValue(["الرياض", "جدة", "الدمام"]),
  getCitiesWithJobs: vi.fn().mockResolvedValue(["الرياض", "جدة"]),
  getAllJobs: vi.fn().mockResolvedValue([]),
  getJobTitlesByCity: vi.fn().mockResolvedValue(["طبيب", "ممرض"]),
  createApplication: vi.fn().mockResolvedValue({ id: 1, applicationNumber: "APP-123456" }),
  createJobApplication: vi.fn().mockResolvedValue({ id: 1, applicationNumber: "APP-123456" }),
  getMatchingJobs: vi.fn().mockResolvedValue([]),
  findMatchingJobs: vi.fn().mockResolvedValue([]),
  updateApplicationStatus: vi.fn().mockResolvedValue(undefined),
  createResume: vi.fn().mockResolvedValue({ id: 1, uniqueId: "resume-123" }),
  getResumeByUniqueId: vi.fn().mockImplementation((uniqueId: string) => {
    if (uniqueId === "resume-123") {
      return Promise.resolve({
        id: 1,
        uniqueId: "resume-123",
        language: "ar",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    return Promise.resolve(null);
  }),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("facilities router", () => {
  it("lists facilities without authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.facilities.list({});

    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("name");
    expect(result[0]).toHaveProperty("city");
  });

  it("gets facility by id", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.facilities.getById({ id: 1 });

    expect(result).toHaveProperty("id", 1);
    expect(result).toHaveProperty("name", "مستشفى الملك فهد");
  });

  it("throws error for non-existent facility", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.facilities.getById({ id: 999 })).rejects.toThrow("Facility not found");
  });

  it("gets unique cities", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.facilities.getCities();

    expect(result).toBeInstanceOf(Array);
    expect(result).toContain("الرياض");
  });
});

describe("jobs router", () => {
  it("gets job titles by city", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.jobs.getTitlesByCity({ city: "الرياض" });

    expect(result).toBeInstanceOf(Array);
    expect(result).toContain("طبيب");
  });
});

describe("applications router", () => {
  it("creates application without authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.applications.create({
      city: "الرياض",
      jobTitle: "طبيب",
      fullName: "أحمد محمد",
      phone: "0501234567",
      email: "ahmed@example.com",
    });

    expect(result).toHaveProperty("applicationNumber");
    expect(result.applicationNumber).toMatch(/^APP-/);
  });
});

describe("resumes router", () => {
  it("creates resume", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.resumes.create({ language: "ar" });

    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("uniqueId");
  });

  it("gets resume by unique id", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.resumes.getByUniqueId({ uniqueId: "resume-123" });

    expect(result).toHaveProperty("uniqueId", "resume-123");
  });

  it("throws error for non-existent resume", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.resumes.getByUniqueId({ uniqueId: "non-existent" })).rejects.toThrow("Resume not found");
  });
});

describe("dashboard router", () => {
  it("requires admin access for stats", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.dashboard.stats()).rejects.toThrow();
  });

  it("returns stats for admin user", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.stats();

    expect(result).toHaveProperty("jobsCount");
    expect(result).toHaveProperty("facilitiesCount");
    expect(result).toHaveProperty("usersCount");
  });
});
