import {
  DogIcon,
  CigaretteIcon,
  StudentIcon,
  UsersIcon,
  type IconProps,
} from "phosphor-react-native";
import type { ComponentType } from "react";

export interface InterdictionConfig {
  id: string;
  label: string;
  icon: ComponentType<IconProps>;
}

/**
 * Interdictions configuration with IDs, labels, and icons
 * Used throughout the app for consistent interdiction handling
 */
export const INTERDICTIONS_CONFIG: InterdictionConfig[] = [
  {
    id: "no_animaux",
    label: "Pas d'animaux",
    icon: DogIcon,
  },
  {
    id: "no_fumeurs",
    label: "Pas de fumeurs",
    icon: CigaretteIcon,
  },
  {
    id: "no_etudiants",
    label: "Pas d'étudiants",
    icon: StudentIcon,
  },
  {
    id: "no_colocation",
    label: "Pas de colocation",
    icon: UsersIcon,
  },
];

/**
 * Map interdiction ID to its configuration
 */
export const INTERDICTIONS_MAP = new Map(
  INTERDICTIONS_CONFIG.map((config) => [config.id, config])
);

/**
 * Map interdiction label to its configuration (for reverse lookup)
 */
export const INTERDICTIONS_BY_LABEL = new Map(
  INTERDICTIONS_CONFIG.map((config) => [config.label, config])
);

/**
 * Get interdiction config by ID
 */
export function getInterdictionById(
  id: string
): InterdictionConfig | undefined {
  return INTERDICTIONS_MAP.get(id);
}

/**
 * Get interdiction config by label
 */
export function getInterdictionByLabel(
  label: string
): InterdictionConfig | undefined {
  return INTERDICTIONS_BY_LABEL.get(label);
}

/**
 * Convert interdiction ID to label
 */
export function getIdToLabel(id: string): string {
  return getInterdictionById(id)?.label || id;
}

/**
 * Convert interdiction label to ID (for backward compatibility)
 */
export function getLabelToId(label: string): string | undefined {
  return getInterdictionByLabel(label)?.id;
}

/**
 * Normalize interdiction value (handles both ID and label formats)
 * Returns the label format for consistent storage
 */
export function normalizeInterdiction(value: string): string {
  // If it's an ID (has underscore), convert to label
  if (value.includes("_")) {
    return getIdToLabel(value);
  }
  // If it's already a label, return as-is
  return value;
}

/**
 * Get all interdiction IDs (for form validation)
 */
export function getInterdictionIds(): string[] {
  return INTERDICTIONS_CONFIG.map((config) => config.id);
}

/**
 * Get all interdiction labels (for display)
 */
export function getInterdictionLabels(): string[] {
  return INTERDICTIONS_CONFIG.map((config) => config.label);
}
