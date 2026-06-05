import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function DMCA() {
    return (
        <div className="min-h-screen px-6 py-16 max-w-2xl mx-auto" style={{ backgroundColor: '#050505', color: '#a1a1aa', fontFamily: "'Inter', sans-serif" }}>
            <Link to="/" className="inline-flex items-center gap-2 text-sm mb-10 transition-all duration-200 hover:text-white" style={{ color: '#a1a1aa' }}>
                <ArrowLeft className="w-4 h-4" /> Back
            </Link>

            <h1 className="text-3xl font-bold text-white mb-2">DMCA Policy</h1>
            <div className="w-10 h-0.5 mb-8" style={{ backgroundColor: '#ff2c55' }} />

            <div className="space-y-6 text-sm leading-relaxed">
                <p>DramaStream respects the intellectual property rights of others and expects its users to do the same.</p>

                <section>
                    <h2 className="text-white font-semibold mb-2 text-base">Filing a DMCA Notice</h2>
                    <p>If you believe that your copyrighted work has been copied in a way that constitutes copyright infringement, please provide us with the following information:</p>
                    <ul className="list-disc list-inside mt-3 space-y-1.5" style={{ color: '#a1a1aa' }}>
                        <li>A description of the copyrighted work you claim has been infringed.</li>
                        <li>The URL or location of the infringing material on our platform.</li>
                        <li>Your contact information (name, address, email, phone).</li>
                        <li>A statement that you have a good faith belief the use is not authorized.</li>
                        <li>Your physical or electronic signature.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-white font-semibold mb-2 text-base">Send Notices To</h2>
                    <a href="mailto:dmca@dramastream.tv" className="hover:text-[#ff2c55] transition-colors duration-200">dmca@dramastream.tv</a>
                </section>

                <p className="text-xs mt-6" style={{ color: 'rgba(161,161,170,0.4)' }}>Last updated: May 2026</p>
            </div>
        </div>
    );
}