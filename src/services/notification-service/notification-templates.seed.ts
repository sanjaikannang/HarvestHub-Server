import { NotificationChannel, NotificationType } from 'src/utils/enum';
import { NotificationTemplate } from 'src/schemas/NotificationTemplate/notification-template.schema';

type SeedTemplate = Pick<NotificationTemplate, 'templateKey' | 'channel' | 'translations'>;

// Default bilingual copy for every event in modules/09-notification/requirement.md
// that has a concrete trigger point wired up (see NotificationType's own
// comment for the two events intentionally left out). Farmer-facing events
// also get an `sms` variant, per requirement.md's note that farmers may
// prefer SMS — see SmsService for why delivery on that channel is currently
// a logged no-op. Seeded idempotently on boot by
// NotificationTemplateService.seedDefaultsAPI; editing a template afterwards
// (via the admin API) is never overwritten by a restart.
export const DEFAULT_NOTIFICATION_TEMPLATES: SeedTemplate[] = [
    {
        templateKey: NotificationType.SUBMISSION_RECEIVED,
        channel: NotificationChannel.IN_APP,
        translations: {
            en: { title: 'Submission received', message: '{{productName}} has been submitted and is awaiting review.' },
            ta: { title: 'சமர்ப்பிப்பு பெறப்பட்டது', message: '{{productName}} சமர்ப்பிக்கப்பட்டது, மதிப்பாய்வுக்காக காத்திருக்கிறது.' },
        },
    },
    {
        templateKey: NotificationType.SUBMISSION_RECEIVED,
        channel: NotificationChannel.SMS,
        translations: {
            en: { title: 'Submission received', message: 'HarvestHub: {{productName}} has been submitted and is awaiting review.' },
            ta: { title: 'சமர்ப்பிப்பு பெறப்பட்டது', message: 'HarvestHub: {{productName}} சமர்ப்பிக்கப்பட்டது, மதிப்பாய்வுக்காக காத்திருக்கிறது.' },
        },
    },
    {
        templateKey: NotificationType.INSPECTION_SCHEDULED,
        channel: NotificationChannel.IN_APP,
        translations: {
            en: { title: 'Inspection scheduled', message: 'An inspection for {{productName}} has been scheduled on {{scheduledDate}}.' },
            ta: { title: 'ஆய்வு திட்டமிடப்பட்டது', message: '{{productName}} க்கான ஆய்வு {{scheduledDate}} அன்று திட்டமிடப்பட்டுள்ளது.' },
        },
    },
    {
        templateKey: NotificationType.INSPECTION_SCHEDULED,
        channel: NotificationChannel.SMS,
        translations: {
            en: { title: 'Inspection scheduled', message: 'HarvestHub: Inspection for {{productName}} scheduled on {{scheduledDate}}.' },
            ta: { title: 'ஆய்வு திட்டமிடப்பட்டது', message: 'HarvestHub: {{productName}} க்கான ஆய்வு {{scheduledDate}} அன்று திட்டமிடப்பட்டுள்ளது.' },
        },
    },
    {
        templateKey: NotificationType.PRODUCT_APPROVED,
        channel: NotificationChannel.IN_APP,
        translations: {
            en: { title: 'Product approved', message: '{{productName}} has been approved and listed for bidding.' },
            ta: { title: 'பொருள் அங்கீகரிக்கப்பட்டது', message: '{{productName}} அங்கீகரிக்கப்பட்டு ஏலத்திற்கு பட்டியலிடப்பட்டது.' },
        },
    },
    {
        templateKey: NotificationType.PRODUCT_APPROVED,
        channel: NotificationChannel.SMS,
        translations: {
            en: { title: 'Product approved', message: 'HarvestHub: {{productName}} has been approved and listed for bidding.' },
            ta: { title: 'பொருள் அங்கீகரிக்கப்பட்டது', message: 'HarvestHub: {{productName}} அங்கீகரிக்கப்பட்டு ஏலத்திற்கு பட்டியலிடப்பட்டது.' },
        },
    },
    {
        templateKey: NotificationType.PRODUCT_REJECTED,
        channel: NotificationChannel.IN_APP,
        translations: {
            en: { title: 'Product rejected', message: '{{productName}} was rejected. Reason: {{reason}}' },
            ta: { title: 'பொருள் நிராகரிக்கப்பட்டது', message: '{{productName}} நிராகரிக்கப்பட்டது. காரணம்: {{reason}}' },
        },
    },
    {
        templateKey: NotificationType.PRODUCT_REJECTED,
        channel: NotificationChannel.SMS,
        translations: {
            en: { title: 'Product rejected', message: 'HarvestHub: {{productName}} was rejected. Reason: {{reason}}' },
            ta: { title: 'பொருள் நிராகரிக்கப்பட்டது', message: 'HarvestHub: {{productName}} நிராகரிக்கப்பட்டது. காரணம்: {{reason}}' },
        },
    },
    {
        templateKey: NotificationType.CHANGES_REQUESTED,
        channel: NotificationChannel.IN_APP,
        translations: {
            en: { title: 'Changes requested', message: 'Changes were requested for {{productName}}. Details: {{reason}}' },
            ta: { title: 'மாற்றங்கள் கோரப்பட்டன', message: '{{productName}} க்கு மாற்றங்கள் கோரப்பட்டுள்ளன. விவரம்: {{reason}}' },
        },
    },
    {
        templateKey: NotificationType.CHANGES_REQUESTED,
        channel: NotificationChannel.SMS,
        translations: {
            en: { title: 'Changes requested', message: 'HarvestHub: Changes requested for {{productName}}. Details: {{reason}}' },
            ta: { title: 'மாற்றங்கள் கோரப்பட்டன', message: 'HarvestHub: {{productName}} க்கு மாற்றங்கள் கோரப்பட்டுள்ளன. விவரம்: {{reason}}' },
        },
    },
    {
        templateKey: NotificationType.PRODUCT_SOLD,
        channel: NotificationChannel.IN_APP,
        translations: {
            en: { title: 'Product sold', message: '{{productName}} sold for ₹{{amount}}.' },
            ta: { title: 'பொருள் விற்பனையானது', message: '{{productName}} ₹{{amount}} க்கு விற்பனையானது.' },
        },
    },
    {
        templateKey: NotificationType.PRODUCT_SOLD,
        channel: NotificationChannel.SMS,
        translations: {
            en: { title: 'Product sold', message: 'HarvestHub: {{productName}} sold for ₹{{amount}}.' },
            ta: { title: 'பொருள் விற்பனையானது', message: 'HarvestHub: {{productName}} ₹{{amount}} க்கு விற்பனையானது.' },
        },
    },
    {
        templateKey: NotificationType.PRODUCT_UNSOLD,
        channel: NotificationChannel.IN_APP,
        translations: {
            en: { title: 'Product unsold', message: '{{productName}} received no qualifying bids and remains unsold.' },
            ta: { title: 'பொருள் விற்பனையாகவில்லை', message: '{{productName}} க்கு தகுதியான ஏலம் எதுவும் வரவில்லை.' },
        },
    },
    {
        templateKey: NotificationType.PRODUCT_UNSOLD,
        channel: NotificationChannel.SMS,
        translations: {
            en: { title: 'Product unsold', message: 'HarvestHub: {{productName}} received no qualifying bids and remains unsold.' },
            ta: { title: 'பொருள் விற்பனையாகவில்லை', message: 'HarvestHub: {{productName}} க்கு தகுதியான ஏலம் எதுவும் வரவில்லை.' },
        },
    },
    {
        templateKey: NotificationType.PAYOUT_RELEASED,
        channel: NotificationChannel.IN_APP,
        translations: {
            en: { title: 'Payout released', message: 'Your payout of ₹{{amount}} for {{productName}} has been released.' },
            ta: { title: 'பணம் வழங்கப்பட்டது', message: '{{productName}} க்கான ₹{{amount}} பணம் வழங்கப்பட்டது.' },
        },
    },
    {
        templateKey: NotificationType.PAYOUT_RELEASED,
        channel: NotificationChannel.SMS,
        translations: {
            en: { title: 'Payout released', message: 'HarvestHub: Your payout of ₹{{amount}} for {{productName}} has been released.' },
            ta: { title: 'பணம் வழங்கப்பட்டது', message: 'HarvestHub: {{productName}} க்கான ₹{{amount}} பணம் வழங்கப்பட்டது.' },
        },
    },
    {
        templateKey: NotificationType.OUTBID_ALERT,
        channel: NotificationChannel.IN_APP,
        translations: {
            en: { title: "You've been outbid", message: 'Someone placed a higher bid of ₹{{newBidAmount}} on {{productName}}.' },
            ta: { title: 'உங்கள் ஏலம் மிஞ்சப்பட்டது', message: '{{productName}} க்கு ₹{{newBidAmount}} அதிக ஏலம் விடப்பட்டுள்ளது.' },
        },
    },
    {
        templateKey: NotificationType.BID_WON,
        channel: NotificationChannel.IN_APP,
        translations: {
            en: { title: 'You won the bid!', message: 'You won {{productName}} for ₹{{amount}}. Complete payment to confirm your order.' },
            ta: { title: 'நீங்கள் ஏலத்தில் வென்றீர்கள்!', message: '{{productName}} ஐ ₹{{amount}} க்கு வென்றீர்கள். ஆர்டரை உறுதிப்படுத்த பணம் செலுத்தவும்.' },
        },
    },
    {
        templateKey: NotificationType.PAYMENT_WINDOW_REMINDER,
        channel: NotificationChannel.IN_APP,
        translations: {
            en: { title: 'Payment window closing soon', message: 'Only {{minutesLeft}} minutes left to pay for {{productName}}.' },
            ta: { title: 'பணம் செலுத்தும் நேரம் முடிவடைகிறது', message: '{{productName}} க்கு பணம் செலுத்த {{minutesLeft}} நிமிடங்கள் மட்டுமே உள்ளன.' },
        },
    },
    {
        templateKey: NotificationType.PAYMENT_SUCCESS,
        channel: NotificationChannel.IN_APP,
        translations: {
            en: { title: 'Payment successful', message: 'Your payment of ₹{{amount}} for {{productName}} was successful.' },
            ta: { title: 'பணம் செலுத்தப்பட்டது', message: '{{productName}} க்கான ₹{{amount}} பணம் வெற்றிகரமாக செலுத்தப்பட்டது.' },
        },
    },
    {
        templateKey: NotificationType.PAYMENT_FAILED,
        channel: NotificationChannel.IN_APP,
        translations: {
            en: { title: 'Payment failed', message: 'Your payment for {{productName}} could not be completed.' },
            ta: { title: 'பணம் செலுத்துதல் தோல்வியடைந்தது', message: '{{productName}} க்கான பணம் செலுத்த முடியவில்லை.' },
        },
    },
    {
        templateKey: NotificationType.ORDER_STATUS_CHANGE,
        channel: NotificationChannel.IN_APP,
        translations: {
            en: { title: 'Order update', message: 'Your order for {{productName}} is now {{status}}.' },
            ta: { title: 'ஆர்டர் புதுப்பிப்பு', message: '{{productName}} க்கான உங்கள் ஆர்டர் இப்போது {{status}}.' },
        },
    },
    {
        templateKey: NotificationType.NEW_PRODUCT_SUBMITTED,
        channel: NotificationChannel.IN_APP,
        translations: {
            en: { title: 'New product submitted', message: '{{farmerName}} submitted {{productName}} for review.' },
            ta: { title: 'புதிய பொருள் சமர்ப்பிக்கப்பட்டது', message: '{{farmerName}} {{productName}} ஐ மதிப்பாய்வுக்காக சமர்ப்பித்துள்ளார்.' },
        },
    },
    {
        templateKey: NotificationType.INSPECTION_REPORT_READY,
        channel: NotificationChannel.IN_APP,
        translations: {
            en: { title: 'Inspection report ready', message: 'The inspection report for {{productName}} is ready for your review.' },
            ta: { title: 'ஆய்வு அறிக்கை தயார்', message: '{{productName}} க்கான ஆய்வு அறிக்கை உங்கள் மதிப்பாய்வுக்கு தயாராக உள்ளது.' },
        },
    },
    {
        templateKey: NotificationType.DELIVERY_PARTNER_UNAVAILABLE,
        channel: NotificationChannel.IN_APP,
        translations: {
            en: { title: 'No delivery partner available', message: 'No delivery partner was available to auto-assign for {{productName}}. Manual assignment needed.' },
            ta: { title: 'டெலிவரி பார்ட்னர் இல்லை', message: '{{productName}} க்கு தானாக டெலிவரி பார்ட்னரை நியமிக்க முடியவில்லை. கைமுறையாக நியமிக்கவும்.' },
        },
    },
    {
        templateKey: NotificationType.NEW_ORDER_ASSIGNED,
        channel: NotificationChannel.IN_APP,
        translations: {
            en: { title: 'New delivery assigned', message: 'You have a new delivery for {{productName}} to {{city}}.' },
            ta: { title: 'புதிய டெலிவரி ஒதுக்கப்பட்டது', message: '{{productName}} ஐ {{city}} க்கு டெலிவரி செய்ய ஒதுக்கப்பட்டுள்ளீர்கள்.' },
        },
    },
    {
        templateKey: NotificationType.DISPUTE_RAISED,
        channel: NotificationChannel.IN_APP,
        translations: {
            en: { title: 'New dispute raised', message: 'A dispute was raised for {{productName}}: {{reason}}' },
            ta: { title: 'புதிய புகார் பதிவு செய்யப்பட்டது', message: '{{productName}} க்கு புகார் பதிவு செய்யப்பட்டது: {{reason}}' },
        },
    },
    {
        templateKey: NotificationType.DISPUTE_ESCALATED,
        channel: NotificationChannel.IN_APP,
        translations: {
            en: { title: 'Dispute escalated', message: 'A dispute for {{productName}} has been escalated to you for review.' },
            ta: { title: 'புகார் மேலிடத்திற்கு அனுப்பப்பட்டது', message: '{{productName}} க்கான புகார் உங்கள் மதிப்பாய்வுக்கு அனுப்பப்பட்டுள்ளது.' },
        },
    },
    {
        templateKey: NotificationType.DISPUTE_STATUS_UPDATE,
        channel: NotificationChannel.IN_APP,
        translations: {
            en: { title: 'Dispute update', message: 'Your dispute for {{productName}} is now {{status}}.' },
            ta: { title: 'புகார் புதுப்பிப்பு', message: '{{productName}} க்கான உங்கள் புகார் இப்போது {{status}}.' },
        },
    },
];
