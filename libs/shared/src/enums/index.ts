// ─── User Roles ────────────────────────────────────────────
export enum UserRole {
  CANDIDATE = 'CANDIDATE',
  RECRUITER = 'RECRUITER',
  HIRING_MANAGER = 'HIRING_MANAGER',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
}

// ─── Account Status ───────────────────────────────────────
export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

// ─── Job Status Lifecycle ─────────────────────────────────
export enum JobStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  PUBLISHED = 'PUBLISHED',
  PAUSED = 'PAUSED',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

// ─── Employment Type ──────────────────────────────────────
export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  FREELANCE = 'FREELANCE',
  TEMPORARY = 'TEMPORARY',
}

// ─── Remote Type ──────────────────────────────────────────
export enum RemoteType {
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID',
  ON_SITE = 'ON_SITE',
}

// ─── Experience Level ─────────────────────────────────────
export enum ExperienceLevel {
  ENTRY = 'ENTRY',
  JUNIOR = 'JUNIOR',
  MID = 'MID',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD',
  EXECUTIVE = 'EXECUTIVE',
}

// ─── Application Status ──────────────────────────────────
export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEW = 'INTERVIEW',
  OFFERED = 'OFFERED',
  HIRED = 'HIRED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

// ─── Interview Status ────────────────────────────────────
export enum InterviewStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  RESCHEDULED = 'RESCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

// ─── Interview Type ──────────────────────────────────────
export enum InterviewType {
  PHONE_SCREEN = 'PHONE_SCREEN',
  VIDEO = 'VIDEO',
  IN_PERSON = 'IN_PERSON',
  TECHNICAL = 'TECHNICAL',
  BEHAVIORAL = 'BEHAVIORAL',
  PANEL = 'PANEL',
  FINAL = 'FINAL',
}

// ─── Interview Recommendation ─────────────────────────────
export enum InterviewRecommendation {
  STRONG_HIRE = 'STRONG_HIRE',
  HIRE = 'HIRE',
  NO_DECISION = 'NO_DECISION',
  NO_HIRE = 'NO_HIRE',
  STRONG_NO_HIRE = 'STRONG_NO_HIRE',
}

// ─── Offer Status ────────────────────────────────────────
export enum OfferStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  WITHDRAWN = 'WITHDRAWN',
}

// ─── Notification Type ───────────────────────────────────
export enum NotificationType {
  APPLICATION_SUBMITTED = 'APPLICATION_SUBMITTED',
  APPLICATION_STATUS_CHANGED = 'APPLICATION_STATUS_CHANGED',
  CANDIDATE_SHORTLISTED = 'CANDIDATE_SHORTLISTED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  INTERVIEW_REMINDER = 'INTERVIEW_REMINDER',
  INTERVIEW_CANCELLED = 'INTERVIEW_CANCELLED',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  OFFER_RECEIVED = 'OFFER_RECEIVED',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  OFFER_REJECTED = 'OFFER_REJECTED',
  JOB_ALERT_MATCH = 'JOB_ALERT_MATCH',
  SYSTEM = 'SYSTEM',
}

// ─── Notification Channel ────────────────────────────────
export enum NotificationChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
}

// ─── Screening Question Type ─────────────────────────────
export enum ScreeningQuestionType {
  YES_NO = 'YES_NO',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TEXT = 'TEXT',
  NUMERIC = 'NUMERIC',
}

// ─── Subscription Plan ───────────────────────────────────
export enum SubscriptionPlan {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

// ─── Subscription Status ─────────────────────────────────
export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  PAST_DUE = 'PAST_DUE',
  TRIALING = 'TRIALING',
  EXPIRED = 'EXPIRED',
}

// ─── Payment Status ──────────────────────────────────────
export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

// ─── Audit Action ────────────────────────────────────────
export enum AuditAction {
  // Auth
  USER_REGISTERED = 'USER_REGISTERED',
  USER_LOGGED_IN = 'USER_LOGGED_IN',
  USER_LOGGED_OUT = 'USER_LOGGED_OUT',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_RESET = 'PASSWORD_RESET',

  // User
  USER_UPDATED = 'USER_UPDATED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
  USER_SUSPENDED = 'USER_SUSPENDED',
  USER_ACTIVATED = 'USER_ACTIVATED',

  // Company
  COMPANY_CREATED = 'COMPANY_CREATED',
  COMPANY_UPDATED = 'COMPANY_UPDATED',

  // Job
  JOB_CREATED = 'JOB_CREATED',
  JOB_UPDATED = 'JOB_UPDATED',
  JOB_PUBLISHED = 'JOB_PUBLISHED',
  JOB_PAUSED = 'JOB_PAUSED',
  JOB_CLOSED = 'JOB_CLOSED',
  JOB_ARCHIVED = 'JOB_ARCHIVED',
  JOB_DELETED = 'JOB_DELETED',

  // Application
  APPLICATION_SUBMITTED = 'APPLICATION_SUBMITTED',
  APPLICATION_STATUS_CHANGED = 'APPLICATION_STATUS_CHANGED',
  APPLICATION_WITHDRAWN = 'APPLICATION_WITHDRAWN',

  // Interview
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  INTERVIEW_RESCHEDULED = 'INTERVIEW_RESCHEDULED',
  INTERVIEW_CANCELLED = 'INTERVIEW_CANCELLED',
  INTERVIEW_COMPLETED = 'INTERVIEW_COMPLETED',
  INTERVIEW_FEEDBACK_SUBMITTED = 'INTERVIEW_FEEDBACK_SUBMITTED',

  // Offer
  OFFER_CREATED = 'OFFER_CREATED',
  OFFER_SENT = 'OFFER_SENT',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  OFFER_REJECTED = 'OFFER_REJECTED',
  OFFER_WITHDRAWN = 'OFFER_WITHDRAWN',

  // Subscription
  SUBSCRIPTION_CREATED = 'SUBSCRIPTION_CREATED',
  SUBSCRIPTION_UPDATED = 'SUBSCRIPTION_UPDATED',
  SUBSCRIPTION_CANCELLED = 'SUBSCRIPTION_CANCELLED',
}

// ─── Company Size ────────────────────────────────────────
export enum CompanySize {
  STARTUP = 'STARTUP',       // 1-10
  SMALL = 'SMALL',           // 11-50
  MEDIUM = 'MEDIUM',         // 51-200
  LARGE = 'LARGE',           // 201-1000
  ENTERPRISE = 'ENTERPRISE', // 1000+
}

// ─── Currency ────────────────────────────────────────────
export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  LKR = 'LKR',
  INR = 'INR',
  AUD = 'AUD',
  CAD = 'CAD',
  JPY = 'JPY',
  SGD = 'SGD',
}

// ─── Skill Level ─────────────────────────────────────────
export enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}
