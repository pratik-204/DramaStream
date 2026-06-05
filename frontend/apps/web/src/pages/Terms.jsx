import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
    return (
        <div className="min-h-screen px-6 py-16 max-w-2xl mx-auto" style={{ backgroundColor: '#050505', color: '#a1a1aa', fontFamily: "'Inter', sans-serif" }}>
            <Link to="/" className="inline-flex items-center gap-2 text-sm mb-10 transition-all duration-200 hover:text-white" style={{ color: '#a1a1aa' }}>
                <ArrowLeft className="w-4 h-4" /> Back
            </Link>

            <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
            <div className="w-10 h-0.5 mb-8" style={{ backgroundColor: '#ff2c55' }} />

            <div className="space-y-6 text-sm leading-relaxed">
                <p>By accessing or using DramaStream, you agree to be bound by these Terms of Service.</p>

                <section>
                    <h2 className="text-white font-semibold mb-2 text-base">Use of Service</h2>
                    <ul className="list-disc list-inside space-y-1.5">
                        <li>You must be at least 13 years old to use DramaStream.</li>
                        <li>You are responsible for maintaining the security of your account.</li>
                        <li>Sharing account credentials is prohibited.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-white font-semibold mb-2 text-base">Content Policy</h2>
                    <ul className="list-disc list-inside space-y-1.5">
                        <li>All content on DramaStream is for personal, non-commercial use only.</li>
                        <li>Downloading, redistributing, or reverse engineering content is strictly prohibited.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-white font-semibold mb-2 text-base">Termination</h2>
                    <p>We reserve the right to suspend or terminate accounts that violate these terms without prior notice.</p>
                </section>

                <section>
                    <h2 className="text-white font-semibold mb-2 text-base">Contact</h2>
                    <p>For any queries regarding these terms, contact <a href="mailto:legal@dramastream.tv" className="hover:text-[#ff2c55] transition-colors duration-200">legal@dramastream.tv</a>.</p>
                </section>

                <p className="text-xs mt-6" style={{ color: 'rgba(161,161,170,0.4)' }}>Last updated: May 2026</p>
            </div>
        </div>
    );
}