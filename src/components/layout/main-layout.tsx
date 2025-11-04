import { useState } from 'react';
import Header from './header';
import { useIsMobile } from '@/hooks/use-mobile';
import Sidebar from './sidebar';
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
    const isMobile = useIsMobile();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar - hidden on mobile, shown as overlay when mobileMenuOpen is true */}
            {!isMobile ? (
                <Sidebar />
            ) : (
                <>
                    {/* Mobile sidebar overlay */}
                    {mobileMenuOpen && (
                        <div
                            className="fixed inset-0 bg-black/50 z-40"
                            onClick={closeMobileMenu}
                        />
                    )}
                    <div
                        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
                            mobileMenuOpen
                                ? 'translate-x-0'
                                : '-translate-x-full'
                        }`}
                    >
                        <Sidebar onNavigate={closeMobileMenu} />
                    </div>
                </>
            )}

            {/* Main content area */}
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header onMenuClick={toggleMobileMenu} />

                <main className="flex-1 overflow-y-auto">
                    <div className="container mx-auto p-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
