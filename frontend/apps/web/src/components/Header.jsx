import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Search, Menu, User, LogOut, Film } from 'lucide-react';
import logoImage from '../../logo/logo.png';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';

const Header = () => {
    const auth = useAuth() || {};
    const { isAuthenticated, currentUser, logout } = auth;
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Browse', path: '/search' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo & Desktop Nav */}
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-2 text-primary transition-transform hover:scale-105">
                        <img src={logoImage} alt="DramaStream logo" className="h-9 w-auto object-contain" />
                        <span className="text-xl font-bold tracking-tight">DramaStream</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-sm font-medium transition-colors hover:text-primary ${isActive(link.path) ? 'text-primary' : 'text-muted-foreground'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 md:gap-4">
                    <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-primary">
                        <Link to="/search" aria-label="Search">
                            <Search className="h-5 w-5" />
                        </Link>
                    </Button>

                    {isAuthenticated ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full ring-2 ring-transparent hover:ring-primary/50 transition-all">
                                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                                        {currentUser?.username?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <div className="flex items-center justify-start gap-2 p-2">
                                    <div className="flex flex-col space-y-1 leading-none">
                                        {currentUser?.username && <p className="font-medium">{currentUser.username}</p>}
                                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                                            {currentUser?.email}
                                        </p>
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link to="/profile" className="cursor-pointer w-full flex items-center">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="hidden md:flex items-center gap-2">
                            <Button variant="ghost" asChild>
                                <Link to="/login">Login</Link>
                            </Button>
                            <Button asChild>
                                <Link to="/signup">Sign Up</Link>
                            </Button>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild className="md:hidden">
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                            <SheetHeader>
                                <SheetTitle className="text-left flex items-center gap-2 text-primary">
                                    <img src={logoImage} alt="DramaStream logo" className="h-6 w-auto object-contain" />
                                    DramaStream
                                </SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col gap-6 mt-8">
                                <nav className="flex flex-col gap-4">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`text-lg font-medium ${isActive(link.path) ? 'text-primary' : 'text-foreground/70'
                                                }`}
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </nav>

                                {!isAuthenticated && (
                                    <div className="flex flex-col gap-3 pt-6 border-t">
                                        <Button variant="outline" asChild className="w-full justify-start">
                                            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                                        </Button>
                                        <Button asChild className="w-full justify-start">
                                            <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
};

export default Header;