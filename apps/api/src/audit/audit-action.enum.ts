/**
 * Mirrors the AuditAction union from libs/shared/src/enums (not imported directly —
 * this codebase duplicates rather than wires up the shared lib; AuditLog.action is a
 * free-form VarChar column, not an FK'd enum, so these values are a convention, not a DB constraint).
 */
export enum AuditAction {
  // Job
  JOB_CREATED = 'JOB_CREATED',
  JOB_UPDATED = 'JOB_UPDATED',
  JOB_DELETED = 'JOB_DELETED',

  // Application
  APPLICATION_STATUS_CHANGED = 'APPLICATION_STATUS_CHANGED',

  // Interview
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  INTERVIEW_CANCELLED = 'INTERVIEW_CANCELLED',

  // Offer
  OFFER_SENT = 'OFFER_SENT',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  OFFER_REJECTED = 'OFFER_REJECTED',

  // Subscription
  SUBSCRIPTION_CREATED = 'SUBSCRIPTION_CREATED',
  SUBSCRIPTION_UPDATED = 'SUBSCRIPTION_UPDATED',
  SUBSCRIPTION_CANCELLED = 'SUBSCRIPTION_CANCELLED',

  // User (admin actions)
  USER_SUSPENDED = 'USER_SUSPENDED',
  USER_ACTIVATED = 'USER_ACTIVATED',
}
