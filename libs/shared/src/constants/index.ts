// ─── Pagination ──────────────────────────────────────────
export const DEFAULT_PAGE = 1;
export const DEFAULT_PER_PAGE = 20;
export const MAX_PER_PAGE = 100;

// ─── Validation ──────────────────────────────────────────
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const NAME_MAX_LENGTH = 100;
export const EMAIL_MAX_LENGTH = 255;
export const BIO_MAX_LENGTH = 2000;
export const DESCRIPTION_MAX_LENGTH = 5000;
export const TITLE_MAX_LENGTH = 200;
export const SLUG_MAX_LENGTH = 250;

// ─── File Upload ─────────────────────────────────────────
export const MAX_RESUME_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;  // 5 MB
export const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024;    // 5 MB

export const ALLOWED_RESUME_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

// ─── Auth ────────────────────────────────────────────────
export const MAX_LOGIN_ATTEMPTS = 5;
export const ACCOUNT_LOCKOUT_DURATION_MINUTES = 30;
export const REFRESH_TOKEN_FAMILY_SIZE = 5;

// ─── Job ─────────────────────────────────────────────────
export const MAX_SCREENING_QUESTIONS = 10;
export const MAX_JOB_SKILLS = 20;
export const MAX_JOB_BENEFITS = 20;

// ─── Application ─────────────────────────────────────────
export const MAX_COVER_LETTER_LENGTH = 5000;

// ─── Interview ───────────────────────────────────────────
export const MIN_INTERVIEW_DURATION = 15;  // minutes
export const MAX_INTERVIEW_DURATION = 480; // minutes
export const MAX_INTERVIEW_PARTICIPANTS = 10;

// ─── Rating ──────────────────────────────────────────────
export const MIN_RATING = 1;
export const MAX_RATING = 5;

// ─── Subscription Limits ─────────────────────────────────
export const PLAN_LIMITS = {
  FREE: {
    activeJobs: 3,
    recruiters: 1,
    candidatesPerJob: 50,
    jobAlerts: 3,
    analyticsAccess: false,
    apiAccess: false,
  },
  STARTER: {
    activeJobs: 10,
    recruiters: 3,
    candidatesPerJob: 200,
    jobAlerts: 10,
    analyticsAccess: true,
    apiAccess: false,
  },
  PROFESSIONAL: {
    activeJobs: 50,
    recruiters: 10,
    candidatesPerJob: 1000,
    jobAlerts: 50,
    analyticsAccess: true,
    apiAccess: true,
  },
  ENTERPRISE: {
    activeJobs: -1,  // unlimited
    recruiters: -1,
    candidatesPerJob: -1,
    jobAlerts: -1,
    analyticsAccess: true,
    apiAccess: true,
  },
} as const;

// ─── Job Status Transitions ─────────────────────────────
// Maps current status to allowed next statuses
export const JOB_STATUS_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['PENDING_REVIEW', 'PUBLISHED'],
  PENDING_REVIEW: ['PUBLISHED', 'DRAFT'],
  PUBLISHED: ['PAUSED', 'CLOSED'],
  PAUSED: ['PUBLISHED', 'CLOSED'],
  CLOSED: ['ARCHIVED'],
  ARCHIVED: [],
};

// ─── Application Status Transitions ─────────────────────
export const APPLICATION_STATUS_TRANSITIONS: Record<string, string[]> = {
  APPLIED: ['UNDER_REVIEW', 'REJECTED', 'WITHDRAWN'],
  UNDER_REVIEW: ['SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
  SHORTLISTED: ['INTERVIEW', 'REJECTED', 'WITHDRAWN'],
  INTERVIEW: ['OFFERED', 'REJECTED', 'WITHDRAWN'],
  OFFERED: ['HIRED', 'REJECTED', 'WITHDRAWN'],
  HIRED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

// ─── Offer Status Transitions ────────────────────────────
export const OFFER_STATUS_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['SENT', 'WITHDRAWN'],
  SENT: ['VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'WITHDRAWN'],
  VIEWED: ['ACCEPTED', 'REJECTED', 'EXPIRED', 'WITHDRAWN'],
  ACCEPTED: [],
  REJECTED: [],
  EXPIRED: [],
  WITHDRAWN: [],
};
