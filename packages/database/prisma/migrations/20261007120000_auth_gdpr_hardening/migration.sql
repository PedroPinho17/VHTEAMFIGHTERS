-- Postgres forbids using a newly added enum value in the same transaction.
-- This migration only adds the value; defaults/columns come in the next one.
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'NONE';
