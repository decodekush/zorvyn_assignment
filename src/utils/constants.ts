/**
 * Role constants used throughout the application.
 * Kept in a single place so changes propagate everywhere.
 */
export const ROLES = {
  VIEWER: "VIEWER",
  ANALYST: "ANALYST",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type Status = (typeof STATUS)[keyof typeof STATUS];

export const RECORD_TYPE = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
} as const;

export type RecordType = (typeof RECORD_TYPE)[keyof typeof RECORD_TYPE];
