import React from 'react';
import { ChevronLeft, ScrollText, Shield, CreditCard, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TermsAndConditions: React.FC = () => {
    const navigate = useNavigate();

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white shadow-md sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Go back"
                        >
                            <ChevronLeft className="w-6 h-6 text-gray-600" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <ScrollText className="w-6 h-6 text-indigo-600" />
                            Legal Documents
                        </h1>
                    </div>
                </div>

                {/* Quick Navigation */}
                <div className="border-t border-gray-100 bg-white overflow-x-auto">
                    <div className="max-w-4xl mx-auto px-4 flex gap-6 text-sm font-medium whitespace-nowrap">
                        <button
                            onClick={() => scrollToSection('terms')}
                            className="py-3 text-gray-600 hover:text-indigo-600 border-b-2 border-transparent hover:border-indigo-600 transition-colors flex items-center gap-2"
                        >
                            <FileText className="w-4 h-4" /> Terms & Conditions
                        </button>
                        <button
                            onClick={() => scrollToSection('refunds')}
                            className="py-3 text-gray-600 hover:text-indigo-600 border-b-2 border-transparent hover:border-indigo-600 transition-colors flex items-center gap-2"
                        >
                            <CreditCard className="w-4 h-4" /> Refund Policy
                        </button>
                        <button
                            onClick={() => scrollToSection('privacy')}
                            className="py-3 text-gray-600 hover:text-indigo-600 border-b-2 border-transparent hover:border-indigo-600 transition-colors flex items-center gap-2"
                        >
                            <Shield className="w-4 h-4" /> Privacy Policy
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 space-y-8">

                {/* Terms and Conditions Section */}
                <section id="terms" className="bg-white rounded-2xl shadow-sm p-6 md:p-8 scroll-mt-32">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <FileText className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Terms and Conditions</h2>
                            <p className="text-sm text-gray-500">Last Updated: 13 Dec 2025</p>
                        </div>
                    </div>

                    <div className="space-y-6 text-gray-600 leading-relaxed">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Introduction</h3>
                            <p>Welcome to the Fitespero mobile application, owned and operated by Fitespero. By accessing or using our App, you agree to comply with and be bound by the following terms and conditions. Please review them carefully.</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Use of the Application</h3>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>You must be at least 18 years of age or have parental consent to use this App.</li>
                                <li>You agree to use the App only for lawful purposes and in accordance with these Terms.</li>
                                <li>Unauthorized use of the App, such as hacking or data scraping, is prohibited.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Registration</h3>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>To access certain features, you may need to register an account by providing accurate and current information.</li>
                                <li>You are responsible for maintaining the confidentiality of your account credentials and are fully responsible for all activities that occur under your account.</li>
                                <li>Fitespero reserves the right to suspend or terminate accounts that are suspected of fraudulent activity or violations of these Terms.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">User Conduct</h3>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Users agree to not engage in conduct that could damage or harm Fitespero or other users.</li>
                                <li>Harassment, discrimination, or any form of abusive behavior will result in account suspension or termination.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Intellectual Property</h3>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>All content, trademarks, and logos within the App are the property of Fitespero unless otherwise indicated.</li>
                                <li>Users may not reproduce, distribute, or modify any materials from the App without Fitespero’s express permission.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">App Updates and Changes</h3>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Fitespero reserves the right to modify or discontinue any part of the App at any time without notice.</li>
                                <li>Any updates or changes to the App will be governed by these Terms.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Limitation of Liability</h3>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Fitespero is not liable for any direct, indirect, incidental, or consequential damages that may arise from using the App.</li>
                                <li>We are not responsible for any disruptions or data losses caused by third-party services integrated with the App.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Governing Law</h3>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>These Terms are governed by and construed in accordance with the laws of India. Any disputes will be subject to the exclusive jurisdiction of the courts in Delhi.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Refund Policy Section */}
                <section id="refunds" className="bg-white rounded-2xl shadow-sm p-6 md:p-8 scroll-mt-32">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <CreditCard className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Refund and Cancellation Policy</h2>
                            <p className="text-sm text-gray-500">Last Updated: 13 Dec 2025</p>
                        </div>
                    </div>

                    <div className="space-y-6 text-gray-600 leading-relaxed">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Introduction</h3>
                            <p>This Refund and Cancellation Policy explains how cancellations and refunds are handled for any services or subscriptions purchased through the Fitespero mobile application.</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Refund Eligibility</h3>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Refunds are only issued for unused services within the first 7 days after the purchase or subscription date.</li>
                                <li>If the service has been used in any capacity, no refund will be issued.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancellation of Subscription</h3>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>You may cancel your subscription at any time by accessing the subscription settings within the App or by contacting customer support at <a href="mailto:Info.fitespero@gmail.com" className="text-indigo-600 hover:text-indigo-800">Info.fitespero@gmail.com</a></li>
                                <li>Once a subscription is canceled, you will retain access to the services until the end of the billing period.</li>
                                <li>No prorated refunds are offered for unused portions of a subscription once a billing cycle has commenced.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Refunds</h3>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Refunds will be processed within 7–10 business days after approval.</li>
                                <li>Payments will be refunded using the same payment method used during the original purchase.</li>
                                <li>Fitespero is not responsible for delays caused by third-party payment processors.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Changes to the Refund and Cancellation Policy</h3>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Fitespero reserves the right to amend this policy. Any updates will be posted on our App and will take immediate effect.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Privacy Policy Section */}
                <section id="privacy" className="bg-white rounded-2xl shadow-sm p-6 md:p-8 scroll-mt-32">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <Shield className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
                            <p className="text-sm text-gray-500">Last Updated: 13 Dec 2025</p>
                        </div>
                    </div>

                    <div className="space-y-6 text-gray-600 leading-relaxed">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Introduction</h3>
                            <p>At Fitespero, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our App.</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Information We Collect</h3>
                            <p className="mb-2">We collect the following types of information when you interact with the App:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Personal Data:</strong> Name, email address, contact details, and gym attendance information.</li>
                                <li><strong>Device Information:</strong> Device model, IP address, operating system, and app usage data.</li>
                                <li><strong>Location Data:</strong> We may collect your location data if you allow us to customize services and ensure security.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">How We Use Your Information</h3>
                            <p className="mb-2">Your information is used to:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Provide services and features such as attendance tracking.</li>
                                <li>Personalize your user experience.</li>
                                <li>Improve the performance of the App through analytics.</li>
                                <li>Communicate with you regarding service updates, promotions, or support.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sharing Your Information</h3>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Third-Party Providers:</strong> We may share your information with trusted third-party service providers who assist us in operating the App (e.g., hosting, analytics).</li>
                                <li><strong>Legal Compliance:</strong> We may disclose your information to comply with legal obligations or protect the rights and safety of Fitespero and its users.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Security</h3>
                            <p>We take appropriate technical and organizational measures to protect your data against unauthorized access or loss. However, no method of data transmission or storage is 99% secure.</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Rights</h3>
                            <p className="mb-2">You have the following rights regarding your personal data:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Access:</strong> You can request access to the data we hold about you.</li>
                                <li><strong>Correction:</strong> You can ask us to update or correct inaccurate information.</li>
                                <li><strong>Deletion:</strong> You can request the deletion of your data, subject to legal requirements.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Retention</h3>
                            <p>We retain your data for as long as necessary to fulfill the purposes outlined in this Privacy Policy. Once no longer needed, your data will be securely deleted.</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Changes to the Privacy Policy</h3>
                            <p>We may update this Privacy Policy periodically. Any changes will be communicated through the App or via email, and continued use of the App constitutes acceptance of the updated policy.</p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6 mt-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h3>
                            <p className="mb-4">For questions or concerns about these policies, please contact us at:</p>
                            <div className="space-y-2 text-sm">
                                <p><span className="font-semibold w-20 inline-block">Email:</span> <a href="mailto:Info.fitespero@gmail.com" className="text-indigo-600 hover:text-indigo-800">Info.fitespero@gmail.com</a></p>
                                <p><span className="font-semibold w-20 inline-block">Address:</span> Delhi</p>
                                <p><span className="font-semibold w-20 inline-block">Phone:</span> <a href="tel:9102644619" className="text-indigo-600 hover:text-indigo-800">9102644619</a>, <a href="tel:7209312873" className="text-indigo-600 hover:text-indigo-800">7209312873</a></p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
