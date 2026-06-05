import React, { useState } from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import Header from '@/components/Header.jsx';
import DramaStreamFooter from '@/components/DramaStreamFooter.jsx';
import IntroVideo from '@/components/IntroVideo.jsx';
import Contact from './pages/Contact';
import DMCA from './pages/DMCA';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

import HomePage from '@/pages/HomePage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import SignupPage from '@/pages/SignupPage.jsx';
import DramaDetailsPage from '@/pages/DramaDetailsPage.jsx';
import VideoPlayerPage from '@/pages/VideoPlayerPage.jsx';
import UserProfilePage from '@/pages/UserProfilePage.jsx';
import SearchPage from '@/pages/SearchPage.jsx';

function App() {
    const [showIntro, setShowIntro] = useState(() => {
        // Check if intro has been shown before
        const hasSeenIntro = localStorage.getItem('dramastreamIntroShown');
        return !hasSeenIntro; // Show only if NOT seen before
    });

    const handleVideoEnd = () => {
        setShowIntro(false);
        // Mark intro as seen in localStorage
        localStorage.setItem('dramastreamIntroShown', 'true');
    };

    return (
        <AuthProvider>
            <Router>
                {showIntro ? (
                    <IntroVideo onEnd={handleVideoEnd} />
                ) : (
                    <>
                        <ScrollToTop />
                        <div className="min-h-screen flex flex-col bg-background text-foreground">
                            <Header />
                            <main className="flex-1">
                                <Routes>
                                    <Route path="/" element={<HomePage />} />
                                    <Route path="/search" element={<SearchPage />} />
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/signup" element={<SignupPage />} />
                                    <Route path="/drama/:id" element={<DramaDetailsPage />} />
                                    <Route path="/watch/:id" element={<VideoPlayerPage />} />
                                    <Route
                                        path="/profile"
                                        element={
                                            <ProtectedRoute>
                                                <UserProfilePage />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route path="/contact" element={<Contact />} />
                                    <Route path="/dmca" element={<DMCA />} />
                                    <Route path="/privacy" element={<Privacy />} />
                                    <Route path="/terms" element={<Terms />} />
                                    <Route path="*" element={
                                        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                                            <h1 className="text-4xl font-bold mb-4">404</h1>
                                            <p className="text-muted-foreground mb-6">Page not found</p>
                                            <a href="/" className="text-primary hover:underline">Back to home</a>
                                        </div>
                                    } />
                                </Routes>
                            </main>
                            <DramaStreamFooter />
                        </div>
                    </>
                )}
                <Toaster theme="dark" />
            </Router>
        </AuthProvider>
    );
}

export default App;