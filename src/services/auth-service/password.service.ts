import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
    private readonly saltRounds = 12

    // Hashing Password
    async hashPassword(password: string): Promise<string> {
        try {
            return await bcrypt.hash(password, this.saltRounds);
        } catch (error) {
            throw new InternalServerErrorException('Failed to hash password', error);
        }
    }

    // Compare Password
    async comparePassword(password: string, hash: string): Promise<boolean> {
        try {
            const isMatch = await bcrypt.compare(password, hash);
            return isMatch;
        } catch (error) {
            throw new InternalServerErrorException('Failed to compare password', error);
        }
    }

    // Generate Random Password
    generateRandomPassword(length: number = 12): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';

        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return password;
    }

    // Validate Password Strength
    validatePasswordStrength(password: string): { isValid: boolean; message: string } {
        if (password.length < 8) {
            return { isValid: false, message: 'Password must be at least 8 characters long' };
        }

        if (!/(?=.*[a-z])/.test(password)) {
            return { isValid: false, message: 'Password must contain at least one lowercase letter' };
        }

        if (!/(?=.*[A-Z])/.test(password)) {
            return { isValid: false, message: 'Password must contain at least one uppercase letter' };
        }

        if (!/(?=.*\d)/.test(password)) {
            return { isValid: false, message: 'Password must contain at least one number' };
        }

        return { isValid: true, message: 'Password is valid' };
    }
}
