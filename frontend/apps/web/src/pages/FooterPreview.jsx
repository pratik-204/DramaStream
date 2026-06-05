import React from 'react';
import DramaStreamFooter from '../components/DramaStreamFooter';

export default function FooterPreview() {
    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0a0a0a' }}>
            {/* Fake content area to simulate page above footer */}
            <div className="flex-1 flex items-center justify-center" style={{ minHeight: '60vh' }}>
                <p className="text-white/20 text-sm uppercase tracking-widest">— Page Content Above —</p>
            </div>

            <DramaStreamFooter />
        </div>
    );
}