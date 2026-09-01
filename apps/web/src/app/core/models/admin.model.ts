export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: AccountStatus;
  emailVerified: boolean;
  lastLoginAt: string | null;
  tenantId: string | null;
  createdAt: string;
  roles: string[];
}

export interface AdminCompany {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  industry: string | null;
  isVerified: boolean;
  tenantId: string;
  createdAt: string;
  tenant: { name: string; isActive: boolean };
  _count: { jobs: number; recruiterProfiles: number };
}

export interface AuditLogEntry {
  id: string;
  userId: string | null;
  tenantId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  previousValue: unknown;
  newValue: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; email: string } | null;
}

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
  PENDING_VERIFICATION: 'Pending Verification',
};
