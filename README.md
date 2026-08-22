# HarvestHub-Server

NestJS + MongoDB backend for HarvestHub, an agricultural marketplace platform.
Scaffolded from the same framework/conventions as XaminityIQ-Server, adapted to
HarvestHub's own domain (see `database/` and `modules/` for the full requirement
docs this scaffold was built against).

## What's implemented

- **Auth module** (`src/api/auth/`) — login (by phone or email), self-registration
  (Farmer/Buyer only), logout, JWT access+refresh tokens, forced first-login
  password change, forgot/reset password.
- **District Management module** (`src/api/district-management/`) — Super Admin
  CRUD on districts (create/update/deactivate), assign/reassign a District Admin
  (maintains the 1 district <-> 1 admin invariant from both sides), a district
  directory with summary stats (active farmers/buyers — products/orders are
  stubbed at 0 until Catalog/Order modules exist), and Collection Center
  create/update/list/get with District Admin access scoped to their own
  district (enforced by loading their `User.districtId`, since it isn't in the
  JWT payload).
- **Catalog Management module** (`src/api/catalog-management/`) — Super Admin
  CRUD on the category/subcategory taxonomy (bilingual name, perishability
  tier, default unit); Farmer product submission and editing (create, edit
  while `submitted`/`under_review`/`changes_requested`/`rejected`, list own,
  get own) with `biddingEndTime` computed server-side as `biddingStartTime +
  30 min`; and a District Admin/Super Admin review queue (`start-review`,
  `request-changes`, `reject`, scoped to district for District Admin) that
  writes to a new generic `audit-logs` collection. Editing a `rejected` or
  `changes_requested` product resubmits it (back to `submitted`), per the
  requirement doc. Everything past that — `inspection_scheduled` through
  `sold`/`unsold` — is driven by Inspection (04, done now) and Bidding Engine
  (06, not built).
- **Inspection Management module** (`src/api/inspection-management/`) — District
  Admin/Super Admin schedules an inspection against a `submitted`/`under_review`
  product (assigns an Inspector, who must belong to the same district — enforced
  business rule); the assigned Inspector records findings (verified
  quantity/grade/condition/photos + a recommended verdict) via `/inspections/mine`
  and `PATCH /inspections/:id/findings`; District Admin/Super Admin then makes the
  binding decision (`PATCH /inspections/:id/decision`) — approve (locks
  `verifiedQuantity`/`qualityGrade`/`finalStartingPrice` onto the product and logs
  a receipt into a new minimal `collection-center-inventory` collection),
  reject, or request changes (both reuse the Catalog module's
  `rejectionReason`/`changeRequestNotes` fields, so a farmer's resubmit-on-edit
  flow from module 03 just works here too). A decision requires findings to
  already be recorded, and each inspection can only be decided once.
  `collection-center-inventory` here is a deliberately thin slice (just enough
  to log the receipt) — full inventory CRUD/reporting is Collection Center
  Management (05), not built.
- **Inspector accounts** — since District Admin/Inspector account creation
  didn't exist yet anywhere and Inspection Management needs real Inspector
  users to assign, added `POST /auth/create-inspector` (District Admin only,
  always assigned to the creating admin's own district) and
  `GET /auth/inspectors` (District Admin: own district, Super Admin: all or
  filtered) to `src/api/auth/`. `DISTRICT_ADMIN` account creation is still
  missing — `districts/:id/assign-admin` still expects a user that already has
  that role.
- **Roles** (`src/utils/enum.ts`) — `SUPER_ADMIN`, `DISTRICT_ADMIN`, `INSPECTOR`,
  `FARMER`, `BUYER`, `DELIVERY_PARTNER` all have at least one working module now.
- **One working example endpoint per existing role** — `GET /<role>/profile`,
  following the controller → service → repository → schema layering convention.
  None of the roles have a dedicated profile schema yet (see below) — the
  endpoint just returns the base `User` fields for now.
- **Generic infra** — global JWT/role guards, `@Roles()`/`@CurrentUser()`
  decorators, `ConfigService` (env accessor), `CloudinaryService` (signed
  uploads), refresh-token cookie helpers, and the seeder pattern
  (`npm run seed` bootstraps the initial Super Admin from `.env`).

## What's intentionally NOT built yet

Everything in `modules/05` through `modules/12` (full Collection Center
inventory management, bidding, payments/escrow, orders/delivery,
notifications, disputes, admin reporting, localization) — those are real
business modules to build next, using the same layering pattern demonstrated
so far. `database/*.md` describes the target schema for each of those
collections. `product-interests` (buyer "mark interested" + reminder
tracking) is deferred to whichever of Bidding Engine (06) / Notification (09)
actually needs it — its only stated purpose is feeding a reminder those
modules haven't built yet.

Also not built within District Management itself: the business rule blocking
district deactivation while it has products in an active lifecycle state
(needs the Catalog module — done now — but the check itself is still a `TODO`
in `src/services/district-service/district.service.ts`; wiring it up is a
small follow-up, not a new module).

Also not built: OTP-based phone verification (needs the Notification module —
this also means `createProductAPI` will reject every real farmer until OTP
verification exists, since `isPhoneVerified` defaults `false`), and dedicated
`FarmerProfile`/`BuyerProfile`/`DeliveryPartnerProfile` schemas (see
`database/farmer-profiles.md` etc.) — those roles currently only have the base
`User` fields.

## Setup

```bash
npm install
cp .env.example .env   # fill in MongoDB URI, JWT secrets, Cloudinary creds, initial admin creds
npm run seed            # creates the initial Super Admin account
npm run start:dev
```
