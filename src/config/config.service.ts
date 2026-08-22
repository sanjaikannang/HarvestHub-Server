import * as dotenv from "dotenv";

export class ConfigService {

    constructor() {
        dotenv.config({
            path: `.env`,
        });
    }

    private getValue(key: string, throwOnMissing = true): string {
        const value = process.env[key];
        if (!value && throwOnMissing) {
            throw new Error(`config error - missing environment variable: ${key}`);
        }

        return value || '';
    }

    getPort() {
        return this.getValue("PORT", true);
    }

    getFrontEndBaseUrl1() {
        return this.getValue("FRONT_END_BASE_URL_1", true);
    }

    getFrontEndBaseUrl2() {
        return this.getValue("FRONT_END_BASE_URL_2", true);
    }

    getMongoDbUri() {
        return this.getValue("MONGODB_URI");
    }

    getJWTSecretKey() {
        return this.getValue("JWT_SECRET_KEY");
    }

    // Cast as `any` — newer @types/jsonwebtoken types `expiresIn` as a template-literal
    // "StringValue" union instead of plain `string`, which a runtime env var can't satisfy.
    getJWTExpiresIn(): any {
        return this.getValue("JWT_EXPIRES_IN");
    }

    getJwtRefreshSecretKey() {
        return this.getValue("JWT_REFRESH_SECRET_KEY", true);
    }

    getJwtRefreshExpiry(): any {
        return this.getValue("JWT_REFRESH_EXPIRY_IN", true);
    }

    getPasswordResetJwtSecretKey() {
        return this.getValue("PASSWORD_RESET_JWT_SECRET_KEY", true);
    }

    getNodeEnv() {
        return process.env.NODE_ENV || 'development';
    }

    getInitialAdminEmail() {
        return this.getValue("INITIAL_ADMIN_EMAIL", true);
    }

    getInitialAdminPassword() {
        return this.getValue("INITIAL_ADMIN_PASSWORD", true);
    }

    getCloudinaryCloudName() {
        return this.getValue("CLOUDINARY_CLOUD_NAME", true);
    }

    getCloudinaryApiKey() {
        return this.getValue("CLOUDINARY_API_KEY", true);
    }

    getCloudinaryApiSecret() {
        return this.getValue("CLOUDINARY_API_SECRET", true);
    }

    getRazorpayKeyId() {
        return this.getValue("RAZORPAY_KEY_ID", true);
    }

    getRazorpayKeySecret() {
        return this.getValue("RAZORPAY_KEY_SECRET", true);
    }

    getRazorpayWebhookSecret() {
        return this.getValue("RAZORPAY_WEBHOOK_SECRET", true);
    }
}
