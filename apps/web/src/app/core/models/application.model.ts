export type ApplicationStatus =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'OFFERED'
  | 'HIRED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface ApplicationStatusHistoryEntry {
  id: string;
  previousStatus: ApplicationStatus | null;
  newStatus: ApplicationStatus;
  notes: string | null;
  createdAt: string;
}

export interface ApplicationCandidateSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  candidateProfile?: {
    headline: string | null;
    location: string | null;
  } | null;
}

export interface ApplicationJobSummary {
  id: string;
  title: string;
  slug: string;
  companyId: string;
  company: {
    name: string;
    logoUrl: string | null;
  };
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  coverLetter: string | null;
  appliedAt: string;
  updatedAt: string;
  job: ApplicationJobSummary;
  candidate: ApplicationCandidateSummary;
  statusHistory?: ApplicationStatusHistoryEntry[];
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: 'Applied',
  UNDER_REVIEW: 'Under Review',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW: 'Interview',
  OFFERED: 'Offered',
  HIRED: 'Hired',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};
