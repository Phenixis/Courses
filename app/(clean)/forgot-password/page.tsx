import { ForgotPasswordForm } from './forgot-password-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Forgot Password',
};

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <ForgotPasswordForm />
        </div>
    );
}