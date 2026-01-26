# Trust Builder Launch - Execution Plan

> Getting Roogo's first 10 verified properties and building real trust signals.

---

## Team Composition & Assets

### Core Team

| Name | Role | Strengths | Primary Focus |
|------|------|-----------|---------------|
| **Salif** | Founder/Product | Tech, strategy, product | App development, oversight |
| **Ablassé** | Video & Marketing | Insta 360 X5, real estate connections, content creation | Property videos, social content, owner relationships |
| **Aroun** | Sales & Outreach | High energy, persistent, people person | Cold outreach, owner acquisition, closing deals |

### Physical Assets

| Asset | Status | Use Case |
|-------|--------|----------|
| Insta 360 X5 Camera | Ready | 360° property videos, virtual tours |
| Physical Office | Opens Sunday (Feb 2, 2026) | Team HQ, owner meetings, credibility |
| Smartphones | Ready | Property photos, WhatsApp communication |

### Digital Assets

| Asset | Status | Use Case |
|-------|--------|----------|
| Roogo App (Expo) | In development | Core product |
| Roogo Web | In development | Property listings, admin |
| Facebook presence | To establish | Owner outreach, marketing |
| Instagram presence | To establish | Property showcases |
| WhatsApp Business | To setup | Owner/renter communication |

---

## Phase 1: First 10 Properties (Week 1-2)

### Goal
Get 10 real property owners to list their rentals on Roogo **for free** in exchange for:
- Professional 360° video tour (Ablassé)
- Featured placement in app
- Priority support
- "Founding Owner" badge

### Target Split

| Team Member | Target | Territory/Approach |
|-------------|--------|-------------------|
| **Ablassé** | 5 properties | Leverage real estate connections, property managers, existing network |
| **Aroun** | 5 properties | Facebook groups, cold outreach, door-to-door if needed |

### Outreach Script (French)

```
Bonjour [Nom],

Je suis [Ablassé/Aroun] de Roogo, une nouvelle application de location immobilière à Ouagadougou.

Nous lançons notre plateforme et cherchons 10 propriétaires pour être nos "Propriétaires Fondateurs".

Ce qu'on vous offre GRATUITEMENT:
✅ Vidéo 360° professionnelle de votre propriété
✅ Annonce vérifiée avec badge de confiance
✅ Placement prioritaire dans l'application
✅ Accès direct aux locataires sérieux

En échange, nous avons juste besoin de:
- 30 minutes pour visiter et filmer la propriété
- Votre accord pour publier sur Roogo

Intéressé(e)? Je peux passer cette semaine.

[Ablassé/Aroun]
📱 [Numéro WhatsApp]
```

### Facebook Groups to Target

| Group Type | Example Names | Who Handles |
|------------|---------------|-------------|
| Ouaga Real Estate | "Location Ouagadougou", "Immobilier Burkina" | Aroun |
| Expat Groups | "Expats Ouagadougou", "Français au Burkina" | Aroun |
| Property Managers | Direct outreach via Ablassé's network | Ablassé |
| Neighborhood Groups | "Ouaga 2000", "Zone du Bois" | Both |

### Property Criteria (Priority Order)

1. **Ready to rent NOW** - Not hypothetical
2. **Decent photos possible** - Not under construction
3. **Owner responsive** - Will answer calls/WhatsApp
4. **Price range variety** - Mix of budgets (50k-300k FCFA)
5. **Location variety** - Different quartiers

### Tracking Sheet

| # | Owner Name | Property Location | Bedrooms | Price | Assigned To | Status | Video Done | Listed |
|---|------------|-------------------|----------|-------|-------------|--------|------------|--------|
| 1 | | | | | Ablassé | | [ ] | [ ] |
| 2 | | | | | Ablassé | | [ ] | [ ] |
| 3 | | | | | Ablassé | | [ ] | [ ] |
| 4 | | | | | Ablassé | | [ ] | [ ] |
| 5 | | | | | Ablassé | | [ ] | [ ] |
| 6 | | | | | Aroun | | [ ] | [ ] |
| 7 | | | | | Aroun | | [ ] | [ ] |
| 8 | | | | | Aroun | | [ ] | [ ] |
| 9 | | | | | Aroun | | [ ] | [ ] |
| 10 | | | | | Aroun | | [ ] | [ ] |

---

## Phase 2: Verified Badge System ✅ DONE

### Implementation Complete (Jan 26, 2026)

**What was implemented:**

1. **Verified badge on PropertyCard** - Shows "✓ Vérifié" badge with green checkmark on all properties with `status === "en_ligne"`
   - Location: Bottom-left of property image
   - Icon: `SealCheckIcon` from phosphor-react-native
   - Colors: Green (#16A34A) with white/green background

2. **Staff can add properties for free** - Modified `/api/properties` route:
   - Staff users (`user_type === "staff"`) can now create listings
   - Staff listings are **auto-verified** (status: `en_ligne` immediately)
   - No payment required for staff
   - Generous defaults: 100 slot limit, 20 photos, 5 open houses
   - Staff can optionally specify `owner_id` to assign property to actual owner

### Files Changed
- `roogo/components/PropertyCard.tsx` - Added verified badge
- `roogo-web/app/api/properties/route.ts` - Staff listing support

---

## Phase 3: Trust Stats Strategy

### The Question: Should We Fake Stats?

**Recommendation: No, but reframe honestly.**

Instead of fake stats, use these approaches:

### Option A: Forward-Looking Statements (Honest)
```
"Chaque propriété est vérifiée par notre équipe"
"Zéro fausse annonce - nous visitons chaque bien"
"Contact direct avec les vrais propriétaires"
```
These are promises about your process, not inflated numbers.

### Option B: Founder Testimonials (Real)
After listing the first 5 properties, ask owners:

```
"Bonjour [Propriétaire],

Merci d'avoir rejoint Roogo comme Propriétaire Fondateur!

Pouvez-vous nous donner un court témoignage (2-3 phrases) sur votre expérience?
Par exemple:
- Pourquoi avez-vous choisi Roogo?
- Comment s'est passée la visite/vidéo?
- Recommanderiez-vous Roogo à d'autres propriétaires?

Votre témoignage sera affiché dans l'app avec votre prénom.

Merci!
```

### Option C: Activity Stats (Real, Growing)
Once you have real data, show:
- "X propriétés vérifiées" (starts at 10)
- "X quartiers couverts" (count unique quartiers)
- "Réponse en moins de 24h" (if you can commit to this)

### What NOT to Do
- ❌ "2,000+ locations réussies" (lie)
- ❌ "80% de satisfaction" (no data)
- ❌ Fake testimonials with stock photos

### Trust Elements for Launch (No Fake Stats Needed)

| Element | What to Show | Where |
|---------|--------------|-------|
| Verified Badge | "✓ Vérifié Roogo" | Property cards |
| Process Promise | "Nous visitons chaque propriété" | Onboarding, about page |
| Local Team | "Équipe basée à Ouagadougou" | About page |
| Real Testimonials | From first 5 owners | Onboarding step 4 |
| Response Time | "Réponse sous 24h" | Contact sections |

---

## Phase 4: Content Creation (Ablassé)

### Property Video Workflow

1. **Schedule visit** (30-45 min per property)
2. **Capture with Insta 360 X5**:
   - Exterior approach
   - Each room (360° sweep)
   - Key features (kitchen, bathroom, balcony)
   - Neighborhood context
3. **Edit** (15-20 min per property):
   - Trim and stabilize
   - Add Roogo watermark
   - Export for app + social
4. **Upload** to property listing

### Marketing Content to Create

| Content Type | Platform | Quantity | Purpose |
|--------------|----------|----------|---------|
| Property tour videos | Instagram Reels, TikTok | 10 (1 per property) | Showcase quality |
| "How Roogo Works" video | All platforms | 1 | Explain value prop |
| Owner testimonial clips | Instagram Stories | 5 | Build trust |
| Office reveal | Instagram, Facebook | 1 | Show legitimacy |
| Team intro | All platforms | 1 | Humanize brand |

---

## Phase 5: Timeline

### Week 1 (Jan 27 - Feb 2)

| Day | Salif | Ablassé | Aroun |
|-----|-------|---------|-------|
| Mon | ~~Implement verified badge~~ ✅ DONE | Start outreach (connections) | Start Facebook outreach |
| Tue | ~~Badge testing~~ ✅ DONE | Schedule first visits | Continue outreach, confirm leads |
| Wed | Support team, fix bugs | Film 1-2 properties | Continue outreach |
| Thu | Onboarding flow work | Film 1-2 properties | Close remaining leads |
| Fri | Integration | Edit videos, upload | Help with visits if needed |
| Sat | Testing | Content creation | Rest / backup visits |
| **Sun** | **Office Opening** | **Office Opening** | **Office Opening** |

### Week 2 (Feb 3 - Feb 9)

| Focus | Tasks |
|-------|-------|
| Complete 10 properties | Finish any remaining visits/uploads |
| Collect testimonials | Get 5 owner quotes |
| Create marketing content | Property videos, team intro |
| Soft launch | Invite first renters to test |

---

## Success Metrics

### Phase 1 Complete When:
- [ ] 10 properties listed and verified
- [ ] All have photos (minimum 5 per property)
- [ ] At least 5 have 360° video tours
- [ ] Variety: 3+ different quartiers, 3+ price ranges

### Phase 2 Complete When:
- [x] Verified badge shows on all approved properties ✅
- [x] Badge visible on PropertyCard ✅
- [x] Staff can add properties for free ✅
- [ ] Badge visible on property details page (optional enhancement)

### Phase 3 Complete When:
- [ ] 5 real owner testimonials collected
- [ ] Testimonials formatted and ready for onboarding

### Phase 4 Complete When:
- [ ] 10 property tour videos created
- [ ] 1 "How Roogo Works" video created
- [ ] Social media accounts set up and posting

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Owners say no | Medium | High | Emphasize FREE, lead with video value |
| Properties rent before we list | Medium | Medium | Move fast, prioritize ready properties |
| Poor quality properties | Low | Medium | Be selective, we're curating |
| Team bandwidth | Medium | Medium | Focus on 10 only, don't overcommit |
| Tech issues | Low | High | Salif prioritizes critical bugs |

---

## Budget

| Item | Cost (FCFA) | Notes |
|------|-------------|-------|
| Transport (visits) | 50,000 | Moto/taxi for property visits |
| Data/Airtime | 20,000 | WhatsApp, uploads |
| Contingency | 30,000 | Unexpected costs |
| **Total** | **100,000** | ~$165 USD |

---

## Phase 6: App Store Publishing

### Current Status
- **Android**: Not yet published to Google Play Store
- **iOS**: Not yet published to App Store

### Prerequisites for Google Play Store

1. **Google Play Developer Account** ($25 one-time fee)
   - Register at: https://play.google.com/console/signup

2. **App Store Listing Assets Needed**:
   | Asset | Specs | Status |
   |-------|-------|--------|
   | App Icon | 512x512 PNG | Have `icon.png` |
   | Feature Graphic | 1024x500 PNG | Need to create |
   | Screenshots | Min 2, phone size | Need to capture |
   | Short Description | Max 80 chars | Need to write |
   | Full Description | Max 4000 chars | Need to write |
   | Privacy Policy URL | Required | Need to host |

3. **Build Production APK/AAB**:
   ```bash
   # Build Android App Bundle for Play Store
   eas build --platform android --profile production
   ```

4. **Submit for Review**:
   ```bash
   # Submit to Play Store (after build completes)
   eas submit --platform android
   ```

### App Configuration (Already Done)
- Package name: `com.salift_roogo.roogo`
- EAS Project ID: `101419dc-288d-4948-ad6f-207ddfcf361b`
- Owner: `kazedra-technologies`

### Publishing Checklist
- [ ] Create Google Play Developer account
- [ ] Create Feature Graphic (1024x500)
- [ ] Capture 4-5 app screenshots
- [ ] Write short description (French)
- [ ] Write full description (French)
- [ ] Create/host Privacy Policy page
- [ ] Run production build: `eas build --platform android --profile production`
- [ ] Submit to Play Store: `eas submit --platform android`
- [ ] Respond to any review feedback

### Timeline Suggestion
- Week 2 (after 10 properties): Start publishing process
- Reason: Better to have real content in screenshots

---

## Notes for Future Reference

### Team Quick Facts
- **Ablassé**: Video guy, Insta 360 X5, real estate connections, marketing
- **Aroun**: Sales/outreach, high energy, persistent closer
- **Office**: Opens Sunday Feb 2, 2026

### Key Learnings to Document
- Which Facebook groups converted best?
- What objections did owners have?
- How long did visits actually take?
- Which quartiers were easiest to find owners?

---

*Created: January 26, 2026*
*Last Updated: January 26, 2026*
*Status: Tech implementation DONE - Ready for ground execution*
