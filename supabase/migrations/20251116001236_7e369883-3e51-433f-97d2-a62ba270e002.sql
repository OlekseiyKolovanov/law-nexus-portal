-- Add new role for AAU manager (must be in separate transaction)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'aau_manager';