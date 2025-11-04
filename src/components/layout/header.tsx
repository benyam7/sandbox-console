import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { ModeToggle } from '@/components/theme/mode-toggle';

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    return (
        <header className="border-b border-border bg-card">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={onMenuClick}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <h2 className="text-lg font-semibold">Sandbox Console</h2>
                </div>

                <div className="flex items-center gap-2">
                    <ModeToggle />
                </div>
            </div>
        </header>
    );
}
