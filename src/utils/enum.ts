// Roles derived from HarvestHub-Server/database/users.md and modules/01-auth-user-management.
// SUPER_ADMIN, DISTRICT_ADMIN and INSPECTOR are "thin" roles — all their data lives directly
// on the User document (see src/schemas/User/user.schema.ts). FARMER, BUYER and
// DELIVERY_PARTNER are expected to grow their own profile collections
// (farmer-profiles / buyer-profiles / delivery-partner-profiles per the database docs)
// once their feature modules are built — that's intentionally not done yet.
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  DISTRICT_ADMIN = 'DISTRICT_ADMIN',
  INSPECTOR = 'INSPECTOR',
  FARMER = 'FARMER',
  BUYER = 'BUYER',
  DELIVERY_PARTNER = 'DELIVERY_PARTNER',
}

// Drives the UI language on login and the language used for outbound notifications
// (see modules/09-notification, not yet built) — per users.md.
export enum PreferredLanguage {
  EN = 'en',
  TA = 'ta',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHERS = 'OTHERS',
}

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
}

export enum Nationality {
  INDIAN = 'INDIAN'
}

export enum Country {
  INDIA = 'INDIA'
}

export enum MediaStatus {
  PENDING_UPLOAD = 'PENDING_UPLOAD',
  UPLOADING = 'UPLOADING',
  UPLOAD_COMPLETE = 'UPLOAD_COMPLETE',
  UPLOAD_FAILED = 'UPLOAD_FAILED'
}

// database/categories.md
export enum PerishabilityTier {
  PERISHABLE = 'perishable',
  SEMI_PERISHABLE = 'semi_perishable',
  NON_PERISHABLE = 'non_perishable',
}

export enum UnitOfMeasure {
  KG = 'kg',
  QUINTAL = 'quintal',
  TON = 'ton',
  DOZEN = 'dozen',
  BUNDLE = 'bundle',
  LITER = 'liter',
}

// database/products.md — full target lifecycle. Only submitted/under_review/
// changes_requested/rejected have transitions today (Catalog module, 03); the
// rest are driven by Inspection (04) and Bidding Engine (06), not built yet.
export enum ProductStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  INSPECTION_SCHEDULED = 'inspection_scheduled',
  INSPECTED = 'inspected',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CHANGES_REQUESTED = 'changes_requested',
  LISTED = 'listed',
  BIDDING_LIVE = 'bidding_live',
  SOLD = 'sold',
  UNSOLD = 'unsold',
}

export enum CollectionMethod {
  DROP_OFF = 'drop_off',
  PICKUP_REQUEST = 'pickup_request',
}

// database/inspections.md — the inspector's own recommendation
export enum RecommendedVerdict {
  APPROVE = 'approve',
  REJECT = 'reject',
  REQUEST_CHANGES = 'request_changes',
}

// database/inspections.md — the district admin's final, binding call
export enum AdminDecision {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CHANGES_REQUESTED = 'changes_requested',
}

// database/collection-center-inventory.md — in_storage is written by Inspection
// (04) on approval; reserved_for_sale/dispatched are manual admin actions today
// (Collection Center Management, 05) until Bidding/Payment (06/07) and
// Order/Delivery (08) can trigger them automatically.
export enum InventoryStatus {
  IN_STORAGE = 'in_storage',
  RESERVED_FOR_SALE = 'reserved_for_sale',
  DISPATCHED = 'dispatched',
}

// database/bidding-sessions.md
export enum BiddingSessionStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  ENDED = 'ended',
}

export enum BiddingOutcome {
  SOLD = 'sold',
  UNSOLD = 'unsold',
}

// database/payments.md
export enum PaymentStatus {
  INITIATED = 'initiated',
  PROCESSING = 'processing',
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

// database/payouts.md
export enum PayoutStatus {
  PENDING = 'pending',
  RELEASED = 'released',
  ON_HOLD = 'on_hold',
  REVERSED = 'reversed',
}

// database/orders.md — full target lifecycle. Only order_confirmed is set
// today (Payment & Escrow, 07, on successful payment); the rest of the
// transitions are Order & Delivery Management (08), not built yet.
export enum DeliveryStatus {
  ORDER_CONFIRMED = 'order_confirmed',
  PREPARING_FOR_DISPATCH = 'preparing_for_dispatch',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
}
