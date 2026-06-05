import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HorizontalScroll = ({ title, children, viewAllLink }) => {
    const scrollRef = useRef(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(true);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowLeft(scrollLeft > 0);
        setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    };

    useEffect(() => {
        handleScroll();
        window.addEventListener('resize', handleScroll);
        return () => window.removeEventListener('resize', handleScroll);
    }, [children]);

    const scroll = (direction) => {
        if (!scrollRef.current) return;
        const { clientWidth } = scrollRef.current;
        const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    };

    return (
        <div className="relative py-3 group/section">
            <div className="flex items-end justify-between mb-3 px-4 md:px-5">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
                {viewAllLink && (
                    <Link to={viewAllLink} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        View All
                    </Link>
                )}
            </div>

            <div className="relative">
                {/* Left gradient fade overlay - always visible */}
                <div className="absolute left-0 top-0 bottom-0 w-12 md:w-16 bg-gradient-to-r from-background via-background/60 to-transparent z-40 pointer-events-none" />
                
                {/* Right gradient fade overlay - always visible */}
                <div className="absolute right-0 top-0 bottom-0 w-12 md:w-16 bg-gradient-to-l from-background via-background/60 to-transparent z-20 pointer-events-none" />

                {showLeft && (
                    <div className="absolute left-0 top-1/4 w-16 flex items-center justify-start px-2 opacity-0 group-hover/section:opacity-100 transition-opacity duration-300 z-30 pointer-events-auto">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground border-none shadow-lg"
                            onClick={() => scroll('left')}
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                    </div>
                )}

                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex items-start gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 pt-2"
                >
                    <div className="w-4 md:w-20 shrink-0" />
                    {children}
                    <div className="w-4 md:w-20 shrink-0" />
                </div>

                {showRight && (
                    <div className="absolute right-0 top-1/4 w-16 flex items-center justify-end px-2 opacity-0 group-hover/section:opacity-100 transition-opacity duration-300 z-30 pointer-events-auto">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground border-none shadow-lg"
                            onClick={() => scroll('right')}
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HorizontalScroll;