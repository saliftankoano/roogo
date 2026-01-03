# PawaPay Sandbox Test Numbers

## ⚠️ CRITICAL: Use the RIGHT test numbers!

### Orange Money (ORANGE_BFA) ✅

**CORRECT NUMBERS (Complete successfully):**

- `22607345678` → Format in app as: `07 34 56 78` ✅
- Use any 6-digit pre-auth code: `666666`, `123456`, etc.

**WRONG NUMBERS (Will get stuck):**

- `22607345128` → `07 34 51 28` ❌ Gets stuck in SUBMITTED (NO CALLBACK)
- `22607345148` → `07 34 51 48` ❌ Returns PAYMENT_NOT_APPROVED

### Moov Money (MOOV_BFA) ✅

**CORRECT NUMBERS:**

- `22602345678` → Format in app as: `02 34 56 78` ✅

## How to Test

1. **Select Orange Money or Moov Money**
2. **Enter the CORRECT test number:**
   - Orange: `07 34 56 78`
   - Moov: `02 34 56 78`
3. **For Orange only:** Enter any 6-digit code (e.g., `666666`)
4. **Tap "Payer Maintenant"**
5. **Wait 3-5 seconds** - Payment should complete automatically!

## What Happens with Wrong Numbers

### Using `07 34 51 28` (BAD):

- Payment initiates successfully
- Status stays "SUBMITTED" forever
- PawaPay never sends a callback
- App keeps polling for 60 seconds then times out
- **Database status stays "pending"**

### Using `07 34 56 78` (GOOD):

- Payment initiates successfully
- PawaPay immediately returns "ACCEPTED" status
- App detects success within seconds
- Modal closes and success callback fires
- **Database status updates to "accepted"**

## Current Implementation

The app will:

1. Poll every 3 seconds for status updates
2. Stop after 20 attempts (60 seconds) with timeout message
3. Log each poll attempt with status to console
4. Show success when status is "COMPLETED" or "ACCEPTED"
5. Show error when status is "FAILED", "CANCELLED", or "REJECTED"

## Troubleshooting

**Problem:** Payment keeps spinning forever

- **Cause:** Using wrong test number (like `07 34 51 28`)
- **Solution:** Use `07 34 56 78` instead

**Problem:** Payment fails immediately

- **Cause:** Using `07 34 51 48` or similar
- **Solution:** Use `07 34 56 78` instead

**Problem:** Can't find status in logs

- **Check server logs** for lines like: `Deposit <id> status from PawaPay: SUBMITTED`
- **Check database** `transactions` table for the `status` column
