import {
  UserRole,
  AccountStatus,
  JobStatus,
  EmploymentType,
  RemoteType,
  ExperienceLevel,
  ApplicationStatus,
  InterviewStatus,
  InterviewType,
  InterviewRecommendation,
  OfferStatus,
  NotificationType,
  ScreeningQuestionType,
  SubscriptionPlan,
  SubscriptionStatus,
  CompanySize,
  Currency,
  SkillLevel,
} from '../enums';

// ─── API Response ────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
  requestId: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── User ────────────────────────────────────────────────
export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  roles: UserRole[];
  status: AccountStatus;
  tenantId?: string;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Auth ────────────────────────────────────────────────
export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole.CANDIDATE | UserRole.RECRUITER;
}

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}

export interface IRefreshTokenRequest {
  refreshToken: string;
}

// ─── Tenant ──────────────────────────────────────────────
export interface ITenant {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Company ─────────────────────────────────────────────
export interface ICompany {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  industry?: string;
  companySize?: CompanySize;
  website?: string;
  location?: string;
  foundedYear?: number;
  socialLinks?: ISocialLinks;
  benefits?: string[];
  culture?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ISocialLinks {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
}

// ─── Candidate Profile ──────────────────────────────────
export interface ICandidateProfile {
  id: string;
  userId: string;
  headline?: string;
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  salaryExpectationMin?: number;
  salaryExpectationMax?: number;
  salaryCurrency?: Currency;
  employmentTypePreference?: EmploymentType[];
  remotePreference?: RemoteType;
  preferredLocations?: string[];
  noticePeriodDays?: number;
  skills: ICandidateSkill[];
  education: IEducation[];
  workExperience: IWorkExperience[];
  certifications: ICertification[];
  languages: ICandidateLanguage[];
  createdAt: string;
  updatedAt: string;
}

export interface ICandidateSkill {
  id: string;
  skillId: string;
  skillName: string;
  level: SkillLevel;
  yearsOfExperience?: number;
}

export interface IEducation {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  grade?: string;
  description?: string;
}

export interface IWorkExperience {
  id: string;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
}

export interface ICertification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface ICandidateLanguage {
  id: string;
  language: string;
  proficiency: string;
}

// ─── Skill ───────────────────────────────────────────────
export interface ISkill {
  id: string;
  name: string;
  category?: string;
  isVerified: boolean;
}

// ─── Job ─────────────────────────────────────────────────
export interface IJob {
  id: string;
  tenantId: string;
  companyId: string;
  company?: ICompany;
  createdById: string;
  title: string;
  slug: string;
  description: string;
  responsibilities?: string;
  requirements?: string;
  skills: IJobSkill[];
  experienceLevel: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  currency?: Currency;
  employmentType: EmploymentType;
  remoteType: RemoteType;
  location?: string;
  department?: string;
  benefits?: string[];
  applicationDeadline?: string;
  numberOfOpenings: number;
  status: JobStatus;
  publishedAt?: string;
  closedAt?: string;
  applicationsCount: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IJobSkill {
  skillId: string;
  skillName: string;
  isRequired: boolean;
}

// ─── Application ─────────────────────────────────────────
export interface IApplication {
  id: string;
  jobId: string;
  job?: IJob;
  candidateId: string;
  candidate?: IUser;
  resumeId?: string;
  status: ApplicationStatus;
  coverLetter?: string;
  screeningAnswers?: IScreeningAnswer[];
  statusHistory: IApplicationStatusHistory[];
  appliedAt: string;
  updatedAt: string;
}

export interface IApplicationStatusHistory {
  id: string;
  previousStatus: ApplicationStatus | null;
  newStatus: ApplicationStatus;
  changedById: string;
  notes?: string;
  createdAt: string;
}

// ─── Screening Questions ─────────────────────────────────
export interface IScreeningQuestion {
  id: string;
  jobId: string;
  question: string;
  type: ScreeningQuestionType;
  options?: string[];
  isRequired: boolean;
  orderIndex: number;
}

export interface IScreeningAnswer {
  questionId: string;
  question: string;
  answer: string;
}

// ─── Interview ───────────────────────────────────────────
export interface IInterview {
  id: string;
  applicationId: string;
  application?: IApplication;
  type: InterviewType;
  title: string;
  scheduledAt: string;
  duration: number; // minutes
  location?: string;
  meetingUrl?: string;
  status: InterviewStatus;
  notes?: string;
  participants: IInterviewParticipant[];
  feedback: IInterviewFeedback[];
  createdAt: string;
  updatedAt: string;
}

export interface IInterviewParticipant {
  id: string;
  userId: string;
  user?: IUser;
  role: string;
  isOptional: boolean;
}

export interface IInterviewFeedback {
  id: string;
  interviewId: string;
  reviewerId: string;
  reviewer?: IUser;
  overallRating: number;
  technicalRating?: number;
  communicationRating?: number;
  cultureFitRating?: number;
  strengths?: string;
  weaknesses?: string;
  recommendation: InterviewRecommendation;
  privateNotes?: string;
  createdAt: string;
}

// ─── Offer ───────────────────────────────────────────────
export interface IOffer {
  id: string;
  applicationId: string;
  application?: IApplication;
  candidateId: string;
  salary: number;
  currency: Currency;
  benefits?: string;
  startDate: string;
  employmentType: EmploymentType;
  expirationDate: string;
  additionalTerms?: string;
  status: OfferStatus;
  respondedAt?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Resume ──────────────────────────────────────────────
export interface IResume {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  version: number;
  isDefault: boolean;
  createdAt: string;
}

// ─── Notification ────────────────────────────────────────
export interface INotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// ─── Conversation & Message ──────────────────────────────
export interface IConversation {
  id: string;
  participants: IConversationParticipant[];
  lastMessage?: IMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IConversationParticipant {
  userId: string;
  user?: IUser;
  lastReadAt?: string;
}

export interface IMessage {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: IUser;
  content: string;
  attachmentUrl?: string;
  attachmentName?: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Saved Job ───────────────────────────────────────────
export interface ISavedJob {
  id: string;
  userId: string;
  jobId: string;
  job?: IJob;
  savedAt: string;
}

// ─── Job Alert ───────────────────────────────────────────
export interface IJobAlert {
  id: string;
  userId: string;
  title: string;
  keywords?: string[];
  skills?: string[];
  location?: string;
  remoteType?: RemoteType;
  employmentType?: EmploymentType;
  minSalary?: number;
  currency?: Currency;
  isActive: boolean;
  lastTriggeredAt?: string;
  createdAt: string;
}

// ─── Subscription ────────────────────────────────────────
export interface ISubscription {
  id: string;
  tenantId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Audit Log ───────────────────────────────────────────
export interface IAuditLog {
  id: string;
  userId?: string;
  tenantId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  previousValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// ─── Health ──────────────────────────────────────────────
export interface IHealthCheck {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  checks: IHealthCheckResult[];
}

export interface IHealthCheckResult {
  name: string;
  status: 'up' | 'down';
  responseTime?: number;
  message?: string;
}
