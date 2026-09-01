export interface RecruiterDashboardStats {
  totalJobs: number;
  activeJobs: number;
  applicationsByStatus: Record<string, number>;
  offersByStatus: Record<string, number>;
  upcomingInterviews: number;
  hires: number;
  averageTimeToHireDays: number | null;
  topJobsByApplications: { id: string; title: string; applicationCount: number }[];
}

export interface CandidateDashboardStats {
  totalApplications: number;
  applicationsByStatus: Record<string, number>;
  upcomingInterviews: number;
  activeOffers: number;
}

export interface PlatformDashboardStats {
  totalUsers: number;
  totalCandidates: number;
  totalRecruiters: number;
  totalCompanies: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  totalHires: number;
  applicationsPerDay: { day: string; count: number }[];
}
