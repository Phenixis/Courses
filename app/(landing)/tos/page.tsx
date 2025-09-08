import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms Of Services',
};

export default function Tos() {
    const appName = process.env.APP_NAME || 'NextJs Boilerplate';
    const companyName = process.env.COMPANY_NAME || 'Company';
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@company.com';

    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="prose prose-gray dark:prose-invert max-w-none">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Terms of Service</h1>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">Welcome to <strong>{appName}</strong>, provided by <strong>{companyName}</strong> ("we", "our", "us"). By using <strong>{appName}</strong>, you agree to these Terms of Service ("Terms").</p>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">1. User Accounts</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">You must register an account to use certain features of <strong>{appName}</strong>. You agree to provide accurate information and keep your account credentials secure. You are responsible for all activity under your account.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">2. Subscriptions and Payments</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4"><strong>{appName}</strong> offers free and paid plans. Paid plans are billed monthly or annually and renew automatically unless canceled. Refunds may be provided at our discretion as per our refund policy. Payment processing is handled by third-party providers, and we disclaim liability for their actions.</p>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">If you cancel a subscription, you will retain access to paid features until the end of the current billing cycle.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">3. Content and Ownership</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">You retain ownership of the content you upload to <strong>{appName}</strong>. By using the service, you grant us a non-exclusive, worldwide, royalty-free license to display, store, and distribute your content as necessary to provide our services. Unauthorized sharing or reproduction of paid content is prohibited.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">4. Prohibited Activities</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">You agree not to:</p>
                        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                            <li>Engage in illegal or unauthorized activities.</li>
                            <li>Disrupt or interfere with the service's functionality.</li>
                            <li>Upload harmful or malicious content, including viruses or spam.</li>
                            <li>Scrape or collect data without permission.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">5. Beta Features</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">We may offer beta or experimental features. These features are provided "as is" and may change or be removed without notice.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">6. Data Collection and Privacy</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">Your use of <strong>{appName}</strong> is subject to our <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</a>. We collect and process data as described in the policy, including for improving our services.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">7. Third-party Services</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4"><strong>{appName}</strong> may integrate with third-party services. We are not responsible for the availability, security, or performance of these services.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">8. Liability</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">We are not liable for:</p>
                        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                            <li>Loss of data, revenue, or business opportunities.</li>
                            <li>Service interruptions or errors beyond our control.</li>
                            <li>Actions of third-party payment processors or integrated services.</li>
                        </ul>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">Our maximum liability is limited to the amount paid by you for the service in the past 12 months.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">9. Dispute Resolution</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">Disputes arising from these Terms are governed by applicable laws. You agree to resolve disputes through appropriate legal channels. Any claims must be filed within one year of the cause of action.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">10. Accessibility</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">We are committed to making <strong>{appName}</strong> accessible to all users. If you encounter accessibility issues, please contact us at <a href={`mailto:${supportEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline"><strong>{supportEmail}</strong></a>.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">11. Updates</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">We reserve the right to update these Terms at any time. Users will be notified via email or website notification. Continued use of the service indicates acceptance of updated Terms.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">12. Contact</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">If you have questions about these Terms, please contact us at <a href={`mailto:${supportEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline"><strong>{supportEmail}</strong></a>.</p>
                    </section>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">Last updated: <strong>{new Date().toLocaleDateString()}</strong></p>
                </div>
            </div>
        </article>
    );
}