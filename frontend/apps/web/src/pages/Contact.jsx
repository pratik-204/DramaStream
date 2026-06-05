import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle } from 'lucide-react';

export default function Contact() {
    return (
        <div className="min-h-screen px-6 py-16 max-w-2xl mx-auto" style={{ backgroundColor: '#050505', color: '#a1a1aa', fontFamily: "'Inter', sans-serif" }}>
            <Link to="/" className="inline-flex items-center gap-2 text-sm mb-10 transition-all duration-200 hover:text-white" style={{ color: '#a1a1aa' }}>
                <ArrowLeft className="w-4 h-4" /> Back
            </Link>

            <h1 className="text-3xl font-bold text-white mb-2">Contact Us</h1>
            <div className="w-10 h-0.5 mb-8" style={{ backgroundColor: '#ff2c55' }} />

            <p className="text-sm leading-relaxed mb-8">
                Have questions, feedback, or need help? Reach out to us — we're always happy to hear from you.
            </p>

            <div className="space-y-5">
                <div className="flex items-center gap-4 p-5 rounded-xl border" style={{ borderColor: '#1a1a1a', backgroundColor: '#0d0d0d' }}>
                    <Mail className="w-5 h-5 shrink-0" style={{ color: '#ff2c55' }} />
                    <div>
                        <p className="text-xs uppercase tracking-widest mb-1 text-white/40">Email</p>
                        <a href="mailto:support@dramastream.tv" className="text-sm text-white hover:text-[#ff2c55] transition-colors duration-200">
                            support@dramastream.tv
                        </a>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-5 rounded-xl border" style={{ borderColor: '#1a1a1a', backgroundColor: '#0d0d0d' }}>
                    <MessageCircle className="w-5 h-5 shrink-0" style={{ color: '#ff2c55' }} />
                    <div>
                        <p className="text-xs uppercase tracking-widest mb-1 text-white/40">Discord</p>
                        <a href="#discord" className="text-sm text-white hover:text-[#ff2c55] transition-colors duration-200">
                            discord.gg/dramastream
                        </a>
                    </div>
                </div>
            </div>

            <p className="text-xs mt-10" style={{ color: 'rgba(161,161,170,0.4)' }}>
                We typically respond within 24–48 hours.
            </p>
        </div>
    );
}