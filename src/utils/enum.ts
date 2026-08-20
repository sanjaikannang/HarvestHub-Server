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
