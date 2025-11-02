import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export default function Header() {
    return (
        <header className="border-b border-border bg-card">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                    </Button>
                    <h2 className="text-lg font-semibold">Sandbox Console</h2>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        Settings
                    </Button>
                </div>
            </div>
        </header>
    );
}
