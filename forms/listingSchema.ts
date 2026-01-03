import { z } from "zod";
import { getInterdictionIds } from "../utils/interdictions";

export const listingSchema = z.object({
  // Step 1: Infos
  titre: z.string().min(4, "Le titre doit contenir au moins 4 caractères"),
  type: z.enum(["villa", "appartement", "maison", "terrain", "commercial"], {
    required_error: "Veuillez sélectionner un type de propriété",
  }),
  prixMensuel: z.coerce
    .number({ invalid_type_error: "Le prix doit être un nombre" })
    .int()
    .min(1000, "Le prix doit être au moins 1000 FCFA"),
  quartier: z
    .string()
    .min(2, "Le quartier doit contenir au moins 2 caractères"),
  ville: z.enum(["ouaga", "bobo"], {
    required_error: "Veuillez sélectionner une ville",
  }),

  // Step 2: Détails
  chambres: z.coerce.number().int().min(0).optional(),
  sdb: z.coerce.number().int().min(0).optional(),
  superficie: z.coerce.number().int().min(1).optional(),
  vehicules: z.coerce.number().int().min(0).optional(),
  description: z
    .string()
    .max(1200, "La description ne doit pas dépasser 1200 caractères")
    .optional(),
  photos: z
    .array(
      z.object({
        uri: z.string(),
        width: z.number(),
        height: z.number(),
      })
    )
    .min(3, "Veuillez ajouter au moins 3 photos")
    .max(15, "Vous ne pouvez ajouter que 15 photos maximum"),
  equipements: z
    .array(
      z.enum(["wifi", "securite", "jardin", "solaires", "piscine", "meuble"])
    )
    .optional(),
  cautionMois: z.coerce.number().int().min(0).max(12).optional(),
  interdictions: z
    .array(z.enum(getInterdictionIds() as [string, ...string[]]))
    .optional(),
  tier_id: z.enum(["essentiel", "standard", "premium"]).optional(),
});

export type ListingDraft = z.infer<typeof listingSchema>;

// Helper constants
export const PROPERTY_TYPES = [
  { id: "appartement", label: "Appartement", icon: "🏢" },
  { id: "villa", label: "Villa", icon: "🏡" },
  { id: "commercial", label: "Commercial", icon: "🏬" },
] as const;

export const CITIES = [
  { id: "ouaga", label: "Ouagadougou" },
  { id: "bobo", label: "Bobo-Dioulasso" },
] as const;

export const EQUIPEMENTS = [
  { id: "wifi", label: "WiFi" },
  { id: "securite", label: "Sécurité" },
  { id: "jardin", label: "Jardin" },
  { id: "solaires", label: "Panneaux solaires" },
  { id: "piscine", label: "Piscine" },
  { id: "meuble", label: "Meublé" },
] as const;

export const TIERS = [
  {
    id: "essentiel",
    name: "Essentiel",
    photo_limit: 8,
    slot_limit: 25,
    video_included: false,
    open_house_limit: 1,
    base_fee: 15000,
  },
  {
    id: "standard",
    name: "Standard",
    photo_limit: 8,
    slot_limit: 50,
    video_included: true,
    open_house_limit: 2,
    base_fee: 25000,
  },
  {
    id: "premium",
    name: "Premium",
    photo_limit: 15,
    slot_limit: 100,
    video_included: true,
    open_house_limit: 3,
    base_fee: 45000,
    has_badge: true,
  },
] as const;

// Re-export from utility for backward compatibility
export { INTERDICTIONS_CONFIG as INTERDICTIONS } from "../utils/interdictions";
