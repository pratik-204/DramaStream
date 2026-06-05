import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
    return (
        <div className="min-h-screen px-6 py-16 max-w-2xl mx-auto" style={{ backgroundColor: '#050505', color: '#a1a1aa', fontFamily: "'Inter', sans-serif" }}>
            <Link to="/" className="inline-flex items-center gap-2 text-sm mb-10 transition-all duration-200 hover:text-white" style={{ color: '#a1a1aa' }}>
                <ArrowLeft className="w-4 h-4" /> Back
            </Link>

            <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
            <div className="w-10 h-0.5 mb-8" style={{ backgroundColor: '#ff2c55' }} />

            <div className="space-y-6 text-sm leading-relaxed">
                <p>Your privacy matters to us. This policy outlines how DramaStream collects, uses, and protects your information.</p>

                <section>
                    <h2 className="text-white font-semibold mb-2 text-base">Information We Collect</h2>
                    <ul className="list-disc list-inside space-y-1.5">
                        <li>Account details (name, email) provided during registration.</li>
                        <li>Viewing history and preferences to personalize your experience.</li>
                        <li>Device and usage data for analytics and performance improvements.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-white font-semibold mb-2 text-base">How We Use Your Data</h2>
                    <ul className="list-disc list-inside space-y-1.5">
                        <li>To provide and improve our streaming services.</li>
                        <li>To send important service updates and notifications.</li>
                        <li>We never sell your personal data to third parties.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-white font-semibold mb-2 text-base">Your Rights</h2>
                    <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us at <a href="mailto:privacy@dramastream.tv" className="hover:text-[#ff2c55] transition-colors duration-200">privacy@dramastream.tv</a>.</p>
                </section>

                <p className="text-xs mt-6" style={{ color: 'rgba(161,161,170,0.4)' }}>Last updated: May 2026</p>
            </div>
        </div>
    );
}