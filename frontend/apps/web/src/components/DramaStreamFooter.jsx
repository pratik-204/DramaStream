import React from 'react';
import { Instagram, MessageCircle, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

const footerLinks = [
    { heading: 'Browse', items: ['Anime', 'Movies', 'Trending', 'New'] },
    { heading: 'Legal & Support', items: ['Contact', 'DMCA', 'Privacy', 'Terms'] },
];

const socials = [
    { name: 'Instagram', icon: Instagram },
    { name: 'Discord', icon: MessageCircle },
    { name: 'GitHub', icon: Github },
];

export default function DramaStreamFooter() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="w-full select-none" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Cinematic Atmos Gradient Transition */}
            <div
                className="h-20 w-full pointer-events-none"
                style={{
                    background: 'linear-gradient(to bottom, transparent, #050505)',
                }}
                aria-hidden="true"
            />

            {/* Footer Body */}
            <div className="w-full" style={{ backgroundColor: '#050505' }}>
                <div className="max-w-6xl mx-auto px-6 pb-10">
                    {/* Top thin border */}
                    <div className="w-full h-px mb-10" style={{ backgroundColor: '#1a1a1a' }} />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
                        {/* Brand */}
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={scrollToTop}
                                className="text-2xl font-bold tracking-tight italic text-white transition-transform hover:scale-[1.02]"
                                style={{ cursor: 'pointer' }}
                                aria-label="Scroll to top"
                            >
                                Drama<span style={{ color: '#ff2c55' }}>Stream</span>
                            </button>
                            <p
                                className="text-sm max-w-xs"
                                style={{ color: '#a1a1aa', lineHeight: '1.6', letterSpacing: '0.025em' }}
                            >
                                Stream Beyond Reality. Experience an immersive collection of elite drama, anime, and cinema.
                            </p>
                        </div>

                        {/* Link Columns */}
                        {footerLinks.map((section) => (
                            <div key={section.heading} className="space-y-5">
                                <h3
                                    className="text-[11px] uppercase font-semibold text-white"
                                    style={{ letterSpacing: '0.2em' }}
                                >
                                    {section.heading}
                                </h3>
                                <ul className="space-y-2.5">
                                    {section.items.map((item) => (
                                        <li key={item}>
                                            {section.heading === 'Legal & Support' ? (
                                                <Link
                                                    to={`/${item.toLowerCase()}`}
                                                    className="text-sm inline-block transition-all duration-300 ease-out"
                                                    style={{ color: '#a1a1aa', letterSpacing: '0.025em' }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.color = '#ff2c55';
                                                        e.currentTarget.style.textShadow = '0 0 10px rgba(255,44,85,0.4)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.color = '#a1a1aa';
                                                        e.currentTarget.style.textShadow = 'none';
                                                    }}
                                                >
                                                    {item}
                                                </Link>
                                            ) : (
                                                <a
                                                    href={`#${item.toLowerCase()}`}
                                                    className="text-sm inline-block transition-all duration-300 ease-out"
                                                    style={{ color: '#a1a1aa', letterSpacing: '0.025em' }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.color = '#ff2c55';
                                                        e.currentTarget.style.textShadow = '0 0 10px rgba(255,44,85,0.4)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.color = '#a1a1aa';
                                                        e.currentTarget.style.textShadow = 'none';
                                                    }}
                                                >
                                                    {item}
                                                </a>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        {/* Socials */}
                        <div className="space-y-5">
                            <h3
                                className="text-[11px] uppercase font-semibold text-white"
                                style={{ letterSpacing: '0.2em' }}
                            >
                                Connect
                            </h3>
                            <div className="flex space-x-5">
                                {socials.map(({ name, icon: Icon }) => (
                                    <a
                                        key={name}
                                        href={`#${name.toLowerCase()}`}
                                        aria-label={name}
                                        className="group relative flex flex-col items-center"
                                    >
                                        <Icon
                                            className="w-[18px] h-[18px] transition-all duration-300 ease-in-out group-hover:-translate-y-0.5"
                                            style={{ color: '#a1a1aa' }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.color = '#ff2c55';
                                                e.currentTarget.style.filter = 'drop-shadow(0 0 8px rgba(255,44,85,0.5))';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.color = '#a1a1aa';
                                                e.currentTarget.style.filter = 'none';
                                            }}
                                        />
                                        {/* Underline glow */}
                                        <span
                                            className="absolute -bottom-1.5 h-px bg-transparent group-hover:w-full w-0 transition-all duration-300 opacity-0 group-hover:opacity-100"
                                            style={{ backgroundColor: '#ff2c55' }}
                                        />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div
                        className="mt-14 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3"
                        style={{ borderTop: '1px solid #1a1a1a' }}
                    >
                        <p
                            className="text-[10px] uppercase"
                            style={{ color: 'rgba(161,161,170,0.5)', letterSpacing: '0.15em' }}
                        >
                            © 2026 DramaStream — All Rights Reserved.
                        </p>
                        <div className="flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span
                                className="text-[10px] uppercase"
                                style={{ color: 'rgba(161,161,170,0.5)', letterSpacing: '0.15em' }}
                            >
                                System Operational
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}