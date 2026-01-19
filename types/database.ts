/**
 * Database and API type definitions
 * Replaces `any` types throughout the codebase with explicit interfaces
 */

import type { UserType } from "../hooks/useUserType";

// ============================================================================
// Clerk Metadata Types
// ============================================================================

/**
 * Metadata stored in Clerk publicMetadata for users
 */
export interface ClerkMetadata {
  userType: UserType;
  companyName?: string;
  facebookUrl?: string;
  location?: string;
}

// ============================================================================
// Payment Types
// ============================================================================

/**
 * Tier information for property listing payment
 */
export interface PaymentTierInfo {
  id: string;
  name: string;
  base_fee: number;
}

/**
 * Add-on item in payment metadata
 */
export interface PaymentAddOn {
  id: string;
  name: string;
  price: number;
}

/**
 * Metadata passed to payment service for listing submissions
 */
export interface PaymentMetadata {
  tier?: PaymentTierInfo;
  commission?: number;
  add_ons?: PaymentAddOn[];
  total?: number;
}

// ============================================================================
// Database Property Types
// ============================================================================

/**
 * Property image as stored in database
 */
export interface DatabasePropertyImage {
  id: string;
  url: string;
  width: number;
  height: number;
  is_primary: boolean;
}

/**
 * Amenity as stored in database
 */
export interface DatabaseAmenity {
  name: string;
  icon: string;
}

/**
 * Open house slot as stored in database
 */
export interface DatabaseOpenHouseSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  bookings_count?: number;
}

/**
 * Agent/User as returned from database joins
 */
export interface DatabaseAgent {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  email: string | null;
  user_type: string | null;
  clerk_id?: string;
}

/**
 * Property status enum values
 */
export type PropertyStatus = "en_attente" | "en_ligne" | "expired" | "locked" | "finalized";

/**
 * Property type enum values
 */
export type PropertyType = "villa" | "appartement" | "maison" | "terrain" | "commercial";

/**
 * Listing type enum values
 */
export type ListingType = "louer" | "vendre";

/**
 * Raw property data as returned from Supabase database
 */
export interface DatabaseProperty {
  id: string;
  agent_id: string;
  title: string;
  description: string | null;
  price: number;
  listing_type: ListingType;
  property_type: PropertyType;
  status: PropertyStatus;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  parking_spaces: number | null;
  address: string;
  city: string;
  quartier: string;
  latitude: number | null;
  longitude: number | null;
  period: string | null;
  caution_mois: number | null;
  interdictions: string[] | null;
  slots_filled: number | null;
  slot_limit: number | null;
  is_boosted: boolean | null;
  boost_expires_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  views_count: number;
  is_locked?: boolean;
  // Joined relations
  property_images?: DatabasePropertyImage[];
  property_amenities?: { amenities: DatabaseAmenity }[];
  users?: DatabaseAgent | DatabaseAgent[];
  open_house_slots?: DatabaseOpenHouseSlot[];
  // Aliases used in some queries
  images?: DatabasePropertyImage[];
  amenities?: DatabaseAmenity[];
  agent?: DatabaseAgent;
}

// ============================================================================
// User/Favorites Types
// ============================================================================

/**
 * User favorite as stored in database
 */
export interface DatabaseUserFavorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
}

/**
 * User stats response
 */
export interface UserStatsResponse {
  propertiesCount: number;
  viewsCount: number;
  pendingCount: number;
  favoritesCount: number;
  rating: number;
  reviewsCount: number;
}

// ============================================================================
// Transaction Types
// ============================================================================

/**
 * Transaction as stored in database
 */
export interface DatabaseTransaction {
  id: string;
  user_id: string;
  property_id: string | null;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  provider: "ORANGE_MONEY" | "MOOV_MONEY";
  deposit_id: string;
  transaction_type: "listing_submission" | "photography" | "property_lock" | "boost";
  metadata: PaymentMetadata | null;
  created_at: string;
  updated_at: string;
}
