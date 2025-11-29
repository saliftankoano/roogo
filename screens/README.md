# Listing Wizard Screens

This directory contains the 3-step mobile wizard for owners to add rental listings.

## Architecture

### Screens

- **ListingStep1Screen.tsx** - Infos (title, type, price, location, publication settings)
- **ListingStep2Screen.tsx** - Détails (rooms, amenities, photos, rental conditions)
- **ListingStep3Screen.tsx** - Aperçu & Publier (preview card + summary)

### Shared Components (in /components)

- **Stepper.tsx** - 3-step progress indicator with animations
- **OutlinedField.tsx** - Consistent text input with focus states
- **ChipSelectable.tsx** - Single/multi-select pill buttons
- **PhotoDropZone.tsx** - Photo picker with thumbnail grid
- **PrimaryButton.tsx** - CTA button with loading state
- **KeyValueRow.tsx** - Summary row component

### Schema & Validation (in /forms)

- **listingSchema.ts** - Zod schema with all validation rules + helper constants

### Theme (in /theme)

- **tokens.ts** - Roogo brand tokens (colors, spacing, typography)

## Flow

1. User taps **Add Property** button (visible only to owners)
2. **Step 1**: Fill in basic info → Validate → Next
3. **Step 2**: Add details & photos (min 3) → Validate → Next
4. **Step 3**: Review preview & summary → Publish
5. Success toast → Navigate to My Properties

## Key Features

- ✅ Real-time validation with inline errors
- ✅ Step-by-step progression blocking
- ✅ Photo picker with multi-select (3-15 photos)
- ✅ Scheduled publication option with date/time pickers
- ✅ Preview card matches listing card design
- ✅ Smooth animations (200ms transitions)
- ✅ Sticky footer CTAs
- ✅ Back navigation preserves form state
- ✅ Minimalist enterprise aesthetic

## Tech Stack

- Expo + React Native + TypeScript
- NativeWind (Tailwind CSS)
- react-hook-form + zod
- expo-image-picker
- @react-native-community/datetimepicker
- lucide-react-native

## Integration

The wizard is integrated into `/app/(tabs)/add-property.tsx` which manages:

- Form state across all steps
- Validation logic
- Step transitions
- Final submission

## Customization

To modify brand colors, spacing, or typography, edit `/app/theme/tokens.ts`.
To update validation rules or add/remove fields, edit `/app/forms/listingSchema.ts`.
