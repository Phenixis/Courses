import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
};

export default function Privacy() {
    const appName = process.env.APP_NAME || 'NextJs Boilerplate';
    const companyName = process.env.COMPANY_NAME || 'Company';
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@company.com';

    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="prose prose-gray dark:prose-invert max-w-none">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Privacy Policy</h1>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">This Privacy Policy describes how <strong>{companyName}</strong> ("we", "our", "us") collects, uses, and protects your information when you use <strong>{appName}</strong> ("the service").</p>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">1. Information We Collect</h2>
                        
                        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">Personal Information</h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">When you create an account, we collect:</p>
                        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                            <li>Name and email address</li>
                            <li>Profile information you choose to provide</li>
                            <li>Payment information (processed securely by third-party providers)</li>
                        </ul>

                        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">Usage Information</h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">We automatically collect:</p>
                        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                            <li>Device information and browser type</li>
                            <li>IP address and location data</li>
                            <li>Usage patterns and feature interactions</li>
                            <li>Log data and error reports</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">2. How We Use Your Information</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">We use your information to:</p>
                        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                            <li>Provide and maintain our service</li>
                            <li>Process payments and manage subscriptions</li>
                            <li>Send important updates and notifications</li>
                            <li>Improve our service and develop new features</li>
                            <li>Provide customer support</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">3. Information Sharing</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">We do not sell your personal information. We may share your information with:</p>
                        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                            <li><strong>Service Providers:</strong> Third-party companies that help us operate our service (e.g., payment processors, hosting providers)</li>
                            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                            <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">4. Data Security</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">We implement appropriate security measures to protect your information, including:</p>
                        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                            <li>Encryption of data in transit and at rest</li>
                            <li>Regular security assessments</li>
                            <li>Access controls and authentication</li>
                            <li>Secure data centers and infrastructure</li>
                        </ul>
                        <p className="text-gray-700 dark:text-gray-300 mt-4">However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">5. Your Rights</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">You have the right to:</p>
                        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                            <li>Access and review your personal information</li>
                            <li>Update or correct inaccurate information</li>
                            <li>Delete your account and associated data</li>
                            <li>Export your data in a portable format</li>
                            <li>Opt out of marketing communications</li>
                            <li>Object to certain processing activities</li>
                        </ul>
                        <p className="text-gray-700 dark:text-gray-300 mt-4">To exercise these rights, please contact us at <a href={`mailto:${supportEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline">{supportEmail}</a>.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">6. Cookies and Tracking</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">We use cookies and similar technologies to:</p>
                        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                            <li>Maintain your session and preferences</li>
                            <li>Analyze usage and improve our service</li>
                            <li>Provide personalized experiences</li>
                        </ul>
                        <p className="text-gray-700 dark:text-gray-300 mt-4">You can control cookie settings through your browser preferences.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">7. Data Retention</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">We retain your information for as long as necessary to provide our service and comply with legal obligations. When you delete your account, we will delete your personal information within 30 days, except where retention is required by law.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">8. Third-Party Services</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">Our service may integrate with third-party services (such as payment processors, analytics providers, or social media platforms). These third parties have their own privacy policies, and we encourage you to review them.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">9. International Data Transfers</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">Your information may be processed and stored in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this privacy policy.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">10. Children's Privacy</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">Our service is not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">11. Changes to This Policy</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of the service after such changes constitutes acceptance of the updated policy.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">12. Contact Us</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">If you have any questions about this Privacy Policy or our privacy practices, please contact us at <a href={`mailto:${supportEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline">{supportEmail}</a>.</p>
                    </section>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">Last updated: <strong>{new Date().toLocaleDateString()}</strong></p>
                </div>
            </div>
        </article>
    );
}