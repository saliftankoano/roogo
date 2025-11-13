import { z } from "zod";

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
      z.enum([
        "wifi",
        "parking",
        "securite",
        "jardin",
        "solaires",
        "piscine",
        "meuble",
      ])
    )
    .optional(),
  cautionMois: z.coerce.number().int().min(0).max(12).optional(),
  interdictions: z
    .array(
      z.enum(["no_animaux", "no_fumeurs", "no_etudiants", "no_colocation"])
    )
    .optional(),
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
  { id: "parking", label: "Parking" },
  { id: "securite", label: "Sécurité" },
  { id: "jardin", label: "Jardin" },
  { id: "solaires", label: "Panneaux solaires" },
  { id: "piscine", label: "Piscine" },
  { id: "meuble", label: "Meublé" },
] as const;

export const INTERDICTIONS = [
  { id: "no_animaux", label: "Pas d'animaux" },
  { id: "no_fumeurs", label: "Pas de fumeurs" },
  { id: "no_etudiants", label: "Pas d'étudiants" },
  { id: "no_colocation", label: "Pas de colocation" },
] as const;
