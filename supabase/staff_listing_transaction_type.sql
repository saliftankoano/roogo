-- Migration: Add 'staff_listing' to transaction_type enum
-- This allows tracking when staff members create free listings for owners
-- Created: January 26, 2026

-- 1. Add 'staff_listing' to transaction_type enum
DO $$ BEGIN
    ALTER TYPE transaction_type ADD VALUE 'staff_listing';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add comment explaining the transaction types
COMMENT ON TYPE transaction_type IS 'Transaction types: 
  - listing_submission: Owner paid to list property
  - photography: Professional photography service
  - property_lock: Early bird reservation payment
  - boost: Property boost/promotion
  - staff_listing: Free listing created by staff (amount=0)';
