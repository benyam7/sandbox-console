'use client';

import Header from './header';
import { useIsMobile } from '@/hooks/use-mobile';
import Sidebar from './sidebar';
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
    const isMobile = useIsMobile();

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar - hidden on mobile */}
            {!isMobile && <Sidebar />}

            {/* Main content area */}
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header />

                <main className="flex-1 overflow-y-auto">
                    <div className="container mx-auto p-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
