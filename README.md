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
  `sold`/`unsold` — is driven by Inspection (04) and Bidding Engine (06), both
  done now. Also added `GET /products/marketplace` (any authenticated role,
  no district/ownership scoping) — Buyers had no way to browse what's for
  sale until Bidding Engine needed it.
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
  to log the receipt) — the rest was filled in by module 05. Approval now
  moves the product straight to `listed` (not just `approved`) — by the time
  the inventory receipt is logged in the same call, the only real gate on
  "Listed" (goods received, `in_storage`) is already satisfied.
- **Collection Center Management module** (`src/api/collection-center-management/`)
  — District Admin (own district's collection centers only)/Super Admin can
  list/get inventory (optionally filtered by `collectionCenterId`/`status`),
  reserve an in-storage entry for sale (`PATCH /collection-center-inventory/:id/reserve`),
  and dispatch a reserved entry to a Delivery Partner
  (`PATCH /collection-center-inventory/:id/dispatch`). Both reserve and
  dispatch are exposed as manual admin actions for now — per requirement.md
  they're normally triggered automatically by a successful sale + payment
  (Bidding Engine 06 / Payment Escrow 07) and by the Delivery Partner
  recording pickup (Order & Delivery Management 08), none of which are built
  yet. The business rule "a product can't go live for bidding unless
  in_storage" also can't be wired up until Bidding Engine (06) exists.
- **Inspector & Delivery Partner accounts** — account creation for these two
  onboarded-not-self-registered roles didn't exist anywhere, and both
  Inspection Management (04) and this module need real users to assign, so:
  `POST /auth/create-inspector` + `GET /auth/inspectors` (District Admin
  only to create — always assigned to the creating admin's own district;
  District Admin: own district, Super Admin: all or filtered, to list), and
  `POST /auth/create-delivery-partner` + `GET /auth/delivery-partners`
  (Super Admin *or* District Admin can create, per requirement.md; not
  district-scoped at all, since a delivery partner's real coverage area lives
  in `delivery-partner-profiles`, module 08, not built). `DISTRICT_ADMIN`
  account creation is still missing — `districts/:id/assign-admin` still
  expects a user that already has that role.
- **Bidding Engine module** (`src/api/bidding-engine/`, new `src/gateways/`)
  — a `@nestjs/schedule` cron (every 10s) opens a `bidding-sessions` entry the
  moment a `listed` product's `biddingStartTime` arrives (→ product status
  `bidding_live`), and closes it once `currentEndTime` passes, picking a
  winner (→ product `sold`) or marking it `unsold` if nobody bid. Bid
  placement (`POST /bidding-sessions/:productId/bids`, Buyer with verified
  phone only) is atomic against the live document via a MongoDB
  aggregation-pipeline `findOneAndUpdate` — re-checked at write time, not just
  read time, so no lost updates under concurrent bids (verified with a real
  concurrent-request test) — and anti-sniping extension (+30s inside the last
  30s, repeatable) is folded into that same atomic update. Real-time updates
  (`bid-placed`/`session-started`/`session-ended`) broadcast over a new
  Socket.IO gateway (`@nestjs/websockets` + `@nestjs/platform-socket.io`,
  newly installed), one room per product. `GET /bidding-sessions/:productId`
  and its `/bids` history are open to Buyers/Admins/Inspectors and to the
  owning Farmer (read-only, per requirement.md); `GET /bids/mine` is a
  Buyer's own bid history. Deferred, per requirement.md's own dependency
  list: the minimum-bid-increment is a flat default (not yet configurable per
  category), the delivery-address-verification half of the bid-eligibility
  check (no `BuyerProfile` exists to hold one), and the post-win payment
  window + non-payment cascade-to-next-bidder (Payment & Escrow, module 07,
  not built) — a win currently goes straight to `sold` with no payment step.
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

Everything in `modules/07` through `modules/12` (payments/escrow,
orders/delivery, notifications, disputes, admin reporting, localization) —
those are real business modules to build next, using the same layering
pattern demonstrated so far. `database/*.md` describes the target schema for
each of those collections. `product-interests` (buyer "mark interested" +
reminder tracking) is still deferred — its only stated purpose is feeding the
5-minutes-before-bidding reminder, which needs the Notification module (09).

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
