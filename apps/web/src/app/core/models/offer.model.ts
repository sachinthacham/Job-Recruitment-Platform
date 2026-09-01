export type OfferStatus =
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'WITHDRAWN';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'LKR' | 'INR' | 'AUD' | 'CAD' | 'JPY' | 'SGD';

export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'INTERNSHIP'
  | 'FREELANCE'
  | 'TEMPORARY';

export interface OfferApplicationSummary {
  id: string;
  candidateId: string;
  job: {
    id: string;
    title: string;
    companyId: string;
  };
}

export interface Offer {
  id: string;
  applicationId: string;
  candidateId: string;
  salary: number;
  currency: Currency;
  benefits: string | null;
  startDate: string;
  employmentType: EmploymentType;
  expirationDate: string;
  additionalTerms: string | null;
  status: OfferStatus;
  respondedAt: string | null;
  createdById: string;
  application: OfferApplicationSummary;
}

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  VIEWED: 'Viewed',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
  WITHDRAWN: 'Withdrawn',
};
