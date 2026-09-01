export type InterviewStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'RESCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type InterviewType =
  | 'PHONE_SCREEN'
  | 'VIDEO'
  | 'IN_PERSON'
  | 'TECHNICAL'
  | 'BEHAVIORAL'
  | 'PANEL'
  | 'FINAL';

export type InterviewRecommendation =
  | 'STRONG_HIRE'
  | 'HIRE'
  | 'NO_DECISION'
  | 'NO_HIRE'
  | 'STRONG_NO_HIRE';

export interface InterviewParticipant {
  id: string;
  userId: string;
  role: 'INTERVIEWER' | 'CANDIDATE';
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface InterviewApplicationSummary {
  id: string;
  candidateId: string;
  job: {
    id: string;
    title: string;
    companyId: string;
  };
}

export interface Interview {
  id: string;
  applicationId: string;
  type: InterviewType;
  title: string;
  scheduledAt: string;
  duration: number;
  location: string | null;
  meetingUrl: string | null;
  notes: string | null;
  status: InterviewStatus;
  participants: InterviewParticipant[];
  application: InterviewApplicationSummary;
}

export interface InterviewFeedback {
  id: string;
  interviewId: string;
  reviewerId: string;
  overallRating: number;
  technicalRating: number | null;
  communicationRating: number | null;
  cultureFitRating: number | null;
  strengths: string | null;
  weaknesses: string | null;
  recommendation: InterviewRecommendation;
  privateNotes: string | null;
  createdAt: string;
  reviewer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const INTERVIEW_STATUS_LABELS: Record<InterviewStatus, string> = {
  SCHEDULED: 'Scheduled',
  CONFIRMED: 'Confirmed',
  RESCHEDULED: 'Rescheduled',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No Show',
};

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  PHONE_SCREEN: 'Phone Screen',
  VIDEO: 'Video',
  IN_PERSON: 'In Person',
  TECHNICAL: 'Technical',
  BEHAVIORAL: 'Behavioral',
  PANEL: 'Panel',
  FINAL: 'Final',
};

export const INTERVIEW_RECOMMENDATION_LABELS: Record<InterviewRecommendation, string> = {
  STRONG_HIRE: 'Strong Hire',
  HIRE: 'Hire',
  NO_DECISION: 'No Decision',
  NO_HIRE: 'No Hire',
  STRONG_NO_HIRE: 'Strong No Hire',
};
