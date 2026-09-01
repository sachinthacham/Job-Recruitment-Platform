export type NotificationType =
  | 'APPLICATION_SUBMITTED'
  | 'APPLICATION_STATUS_CHANGED'
  | 'CANDIDATE_SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEW_REMINDER'
  | 'INTERVIEW_CANCELLED'
  | 'MESSAGE_RECEIVED'
  | 'OFFER_RECEIVED'
  | 'OFFER_ACCEPTED'
  | 'OFFER_REJECTED'
  | 'JOB_ALERT_MATCH'
  | 'SYSTEM';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown>;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  APPLICATION_SUBMITTED: '📝',
  APPLICATION_STATUS_CHANGED: '🔄',
  CANDIDATE_SHORTLISTED: '⭐',
  INTERVIEW_SCHEDULED: '📅',
  INTERVIEW_REMINDER: '⏰',
  INTERVIEW_CANCELLED: '❌',
  MESSAGE_RECEIVED: '💬',
  OFFER_RECEIVED: '🎉',
  OFFER_ACCEPTED: '✅',
  OFFER_REJECTED: '🚫',
  JOB_ALERT_MATCH: '🔔',
  SYSTEM: 'ℹ️',
};
