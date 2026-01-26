# Mobile App Manual Testing Checklist

This document provides comprehensive test scenarios for all critical workflows in the Roogo mobile app. Use this checklist to systematically verify functionality before releases.

## Test Environment Setup

**Prerequisites:**

- Expo development build running (`npx expo start`)
- Test accounts: one for each user type (Renter, Owner, Agent)
- Test phone numbers for payment testing (see [PAWAPAY_TEST_NUMBERS.md](PAWAPAY_TEST_NUMBERS.md))
- Active network connection (some flows require online status)

---

## 1. Authentication and Onboarding

### 1.1 Fresh Install / First Launch

| Step | Action             | Expected Result                                                  |
| ---- | ------------------ | ---------------------------------------------------------------- | ------- |
| 1    | Launch app fresh   | Welcome screen with property background image                    | Success |
| 2    | Verify UI elements | "Bienvenue sur Roogo" title, sign-up and sign-in buttons visible | Success |
| 3    | Tap "S'inscrire"   | Navigate to sign-up screen                                       | Success |

### 1.2 Sign Up Flow

| Step | Action                      | Expected Result                                 |
| ---- | --------------------------- | ----------------------------------------------- |
| 1    | On sign-up screen           | OAuth buttons (Google, Facebook, Apple) visible |
| 2    | Sign up with OAuth          | Success, redirect to user type selection        |
| 3    | Select "Locataire" (Renter) | Continue button enabled                         |
| 4    | Tap Continue                | Navigate to home screen with renter tabs        |

### 1.3 Agent Sign Up (Additional Step)

| Step | Action                              | Expected Result                        |
| ---- | ----------------------------------- | -------------------------------------- |
| 1    | Select "Agent Immobilier"           | Additional form appears                |
| 2    | Enter company name and Facebook URL | Continue button enabled                |
| 3    | Tap Continue                        | Navigate to home with owner/agent tabs |

### 1.4 Sign In Flow

| Step | Action                        | Expected Result                                      |
| ---- | ----------------------------- | ---------------------------------------------------- | ------- |
| 1    | Tap "Se connecter"            | Navigate to sign-in screen                           | Success |
| 2    | Sign in with existing account | Redirect to home or user type selection (if not set) | Success |
| 3    | Missing user type             | UserTypeSelection modal appears                      | Success |

### 1.5 Sign Out

| Step | Action                         | Expected Result                     |
| ---- | ------------------------------ | ----------------------------------- | ------- |
| 1    | Go to Profile tab              | Profile screen loads with user info | Success |
| 2    | Scroll to bottom, tap Sign Out | Sign out confirmation               | Success |
| 3    | Confirm                        | Return to welcome/onboarding screen | Success |

---

## 2. Property Browsing (Renter Flow)

### 2.1 Home Screen

| Step | Action                 | Expected Result                           |
| ---- | ---------------------- | ----------------------------------------- |
| 1    | Land on home tab       | Property cards displayed, sponsored first |
| 2    | Category pills visible | "Tout", "Residential", "Business" options |
| 3    | Tap category pill      | Filter applied, properties updated        |
| 4    | Pull to refresh        | Properties reload                         |

### 2.2 Filter Modal

| Step | Action                   | Expected Result                             |
| ---- | ------------------------ | ------------------------------------------- |
| 1    | Tap filter icon          | Filter modal opens                          |
| 2    | Select neighborhood chip | Chip highlighted                            |
| 3    | Adjust price slider      | Min/max values update, histogram highlights |
| 4    | Select bedrooms dropdown | Value selected                              |
| 5    | Tap "X Resultats" button | Modal closes, filtered results shown        |
| 6    | Tap "Reset" button       | All filters cleared                         |

### 2.3 Property Details

| Step | Action            | Expected Result                             |
| ---- | ----------------- | ------------------------------------------- |
| 1    | Tap property card | Navigate to details screen                  |
| 2    | Image gallery     | Swipeable images, tap to expand             |
| 3    | Property info     | Title, price, location, amenities visible   |
| 4    | Agent card        | Agent name, company, contact button visible |
| 5    | Slot meter        | Shows available application slots           |
| 6    | Back navigation   | Return to home                              |

### 2.4 Favorites

| Step | Action                     | Expected Result                          |
| ---- | -------------------------- | ---------------------------------------- |
| 1    | On details, tap heart icon | Property added to favorites, heart fills |
| 2    | Navigate to Favorites tab  | Favorited property appears in list       |
| 3    | Tap property card          | Navigate to details                      |
| 4    | Tap filled heart           | Removed from favorites                   |
| 5    | Return to Favorites tab    | Property no longer in list               |
| 6    | Empty state                | "Aucun favori" message when empty        |

---

## 3. Property Application and Visit Booking

### 3.1 Apply for Property

| Step | Action                      | Expected Result                                |
| ---- | --------------------------- | ---------------------------------------------- |
| 1    | On property details         | "Postuler" button visible (if slots available) |
| 2    | Tap Apply (unauthenticated) | Auth prompt modal appears                      |
| 3    | Tap Apply (authenticated)   | Application submitted or duplicate error       |
| 4    | Duplicate application       | Error message "Vous avez deja postule"         |

### 3.2 Open House Booking

| Step | Action                         | Expected Result                         |
| ---- | ------------------------------ | --------------------------------------- |
| 1    | Property with open house slots | "Reserver une visite" button visible    |
| 2    | Tap book visit                 | OpenHousePickerModal opens              |
| 3    | View slots                     | Date, time, capacity shown              |
| 4    | Select slot                    | Radio button selected                   |
| 5    | Tap confirm                    | Booking submitted                       |
| 6    | Success state                  | Confirmation message, modal auto-closes |
| 7    | Already booked                 | Error message for duplicate             |

### 3.3 Contact Agent

| Step | Action                 | Expected Result                              |
| ---- | ---------------------- | -------------------------------------------- |
| 1    | Tap "Contacter" button | ContactSheet opens                           |
| 2    | WhatsApp option        | Opens WhatsApp with pre-filled message       |
| 3    | Lead form option       | Form appears with name, phone, email fields  |
| 4    | Fill form, submit      | Success state with WhatsApp follow-up option |
| 5    | Offline state          | Submit button disabled                       |

---

## 4. Property Listing (Owner/Agent Flow)

### 4.1 Step 1 - Basic Information

| Step | Action                       | Expected Result                             |
| ---- | ---------------------------- | ------------------------------------------- |
| 1    | Tap "Add Property" tab       | Listing wizard step 1                       |
| 2    | Enter title                  | Text input accepts value                    |
| 3    | Select property type         | Dropdown selection works                    |
| 4    | Enter price                  | Numeric formatting applied                  |
| 5    | Select city                  | Dropdown selection works                    |
| 6    | Enter quartier               | Text input accepts value                    |
| 7    | Continue with missing fields | Validation errors shown                     |
| 8    | Complete all fields          | Continue button enabled, navigate to step 2 |

### 4.2 Step 2 - Details and Photos

| Step | Action                              | Expected Result         |
| ---- | ----------------------------------- | ----------------------- |
| 1    | Select bedrooms, bathrooms, parking | Dropdowns work          |
| 2    | Enter area (surface)                | Numeric input           |
| 3    | Select amenities                    | Chips toggle on/off     |
| 4    | Tap add photos                      | Photo picker opens      |
| 5    | Select multiple photos              | Photos appear in grid   |
| 6    | Reorder photos                      | Drag to reorder         |
| 7    | Delete photo                        | Tap X, photo removed    |
| 8    | Enter conditions                    | Text area accepts value |
| 9    | Continue                            | Navigate to step 3      |

### 4.3 Step 3 - Preview and Tier Selection

| Step | Action             | Expected Result                      |
| ---- | ------------------ | ------------------------------------ |
| 1    | Preview visible    | All entered data displayed correctly |
| 2    | Tier cards visible | Multiple tiers with prices           |
| 3    | Select tier        | Tier highlighted                     |
| 4    | Tap "Publier"      | Upsell modal may appear              |

### 4.4 Upsell Modal

| Step | Action             | Expected Result          |
| ---- | ------------------ | ------------------------ |
| 1    | Upsell modal opens | Add-on options displayed |
| 2    | Select add-ons     | Price updates            |
| 3    | Skip or Continue   | Proceed to payment       |

---

## 5. Payment Flow

### 5.1 Provider Selection

| Step | Action              | Expected Result                           |
| ---- | ------------------- | ----------------------------------------- |
| 1    | Payment modal opens | Provider cards (Orange Money, Moov Money) |
| 2    | Tap Orange Money    | Card selected with orange border          |
| 3    | Tap Moov Money      | Card selected with blue border            |

### 5.2 Phone Input

| Step | Action             | Expected Result                          |
| ---- | ------------------ | ---------------------------------------- |
| 1    | Enter phone number | Auto-formatting (70 12 34 56)            |
| 2    | Invalid length     | Validation error                         |
| 3    | Test phone number  | Use numbers from PAWAPAY_TEST_NUMBERS.md |

### 5.3 OTP Input (Orange Money Only)

| Step | Action                  | Expected Result        |
| ---- | ----------------------- | ---------------------- |
| 1    | USSD instructions shown | "*144*4\*6#" displayed |
| 2    | Enter 6-digit OTP       | Input accepts digits   |
| 3    | Invalid OTP length      | Validation error       |

### 5.4 Payment Processing

| Step | Action                 | Expected Result                              |
| ---- | ---------------------- | -------------------------------------------- |
| 1    | Tap "Payer Maintenant" | Loading state, "Ne fermez pas cette fenetre" |
| 2    | Polling state          | ActivityIndicator visible                    |
| 3    | Payment success        | Green checkmark, success message             |
| 4    | Payment failure        | Red X, error message, retry option           |
| 5    | Timeout                | Clock icon, timeout message                  |

### 5.5 Post-Payment

| Step | Action                  | Expected Result                               |
| ---- | ----------------------- | --------------------------------------------- |
| 1    | Listing payment success | Property submitted, navigate to My Properties |
| 2    | Lock payment success    | Property locked for 48h                       |
| 3    | Boost payment success   | Boost activated                               |

---

## 6. Property Management (Owner/Agent)

### 6.1 My Properties Tab

| Step | Action                    | Expected Result                      |
| ---- | ------------------------- | ------------------------------------ |
| 1    | Navigate to My Properties | List of user's properties            |
| 2    | Status filters            | Tout/Active/En attente/Expirée/Vendu |
| 3    | Sort options              | Date, price, views                   |
| 4    | Empty state               | "Aucune propriete" message           |

### 6.2 Property Actions

| Step | Action            | Expected Result                    |
| ---- | ----------------- | ---------------------------------- |
| 1    | Tap property card | Property preview modal or navigate |
| 2    | Edit action       | Navigate to edit flow              |
| 3    | Delete action     | Confirmation dialog                |
| 4    | Confirm delete    | Property removed from list         |

---

## 7. Photography / Boosts Tab

### 7.1 Upgrade Selection

| Step | Action                      | Expected Result           |
| ---- | --------------------------- | ------------------------- |
| 1    | Navigate to Photography tab | Upgrade options displayed |
| 2    | Select property             | Property picker works     |
| 3    | Swipe upgrade cards         | Cards swipeable           |
| 4    | Select upgrade              | Form appears              |

### 7.2 Boost Request

| Step | Action            | Expected Result                     |
| ---- | ----------------- | ----------------------------------- |
| 1    | Fill request form | Fields accept values                |
| 2    | Submit            | Payment modal opens                 |
| 3    | Complete payment  | Boost activated, confirmation shown |

---

## 8. Early Bird Locking (Renter)

### 8.1 Lock Flow

| Step | Action                 | Expected Result                         |
| ---- | ---------------------- | --------------------------------------- |
| 1    | View unlocked property | Early Bird banner visible (if eligible) |
| 2    | Tap lock button        | Lock confirmation modal                 |
| 3    | Confirm lock           | Payment modal opens                     |
| 4    | Complete payment       | Property locked for 48h                 |
| 5    | Locked property view   | Lock status visible, countdown timer    |

---

## 9. Edge Cases and Error Handling

### 9.1 Offline Behavior

| Step | Action             | Expected Result                  |
| ---- | ------------------ | -------------------------------- |
| 1    | Disable network    | Offline banner appears           |
| 2    | Try to submit form | Submit disabled or error message |
| 3    | Re-enable network  | Banner disappears, actions work  |

### 9.2 Session Expiry

| Step | Action          | Expected Result                    |
| ---- | --------------- | ---------------------------------- |
| 1    | Session expires | Auth prompt or redirect to sign-in |

### 9.3 API Errors

| Step | Action            | Expected Result                      |
| ---- | ----------------- | ------------------------------------ |
| 1    | API returns error | User-friendly error message          |
| 2    | Retry option      | Where applicable, retry button shown |

---

## 10. Profile Tab

### 10.1 User Info

| Step | Action       | Expected Result                                |
| ---- | ------------ | ---------------------------------------------- |
| 1    | View profile | Name, email, avatar displayed                  |
| 2    | User stats   | Properties/views (owner) or favorites (renter) |

### 10.2 Avatar Upload

| Step | Action       | Expected Result    |
| ---- | ------------ | ------------------ |
| 1    | Tap avatar   | Image picker opens |
| 2    | Select image | Avatar updates     |

---

## Test Data Requirements

**Test Accounts:**

- Renter account (Clerk test user)
- Owner account (Clerk test user)
- Agent account (with company info)

**Payment Test Numbers (from PAWAPAY_TEST_NUMBERS.md):**

- Orange Money sandbox numbers
- Moov Money sandbox numbers
- Test OTP codes

**Test Properties:**

- Properties with open house slots
- Properties eligible for Early Bird lock
- Properties with different statuses

---

## Testing Tips

1. **Test on multiple devices**: iOS and Android may have different behaviors
2. **Test different screen sizes**: Phone and tablet layouts
3. **Test network conditions**: Offline, slow 3G, fast WiFi
4. **Test with real payment providers**: Use sandbox mode with test numbers
5. **Document bugs**: Include screenshots, device info, and steps to reproduce
6. **Regression testing**: Re-test critical flows after any changes
7. **Performance testing**: Monitor app responsiveness during heavy operations

## Bug Report Template

When you find issues, document them with:

- **Title**: Short description of the issue
- **Priority**: Critical / High / Medium / Low
- **Steps to reproduce**: Numbered list
- **Expected result**: What should happen
- **Actual result**: What actually happens
- **Device**: iOS/Android version, device model
- **Screenshots/Video**: Visual evidence
- **Workaround**: If any temporary solution exists
