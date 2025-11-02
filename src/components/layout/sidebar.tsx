import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { LayoutDashboard, LogOut, Key, ChartLine, Book } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate('/sign-in');
    };

    return (
        <aside className="w-64 border-r border-border bg-sidebar flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-sidebar-border">
                <h1 className="text-xl font-bold text-sidebar-foreground">
                    ZamaDev
                </h1>
                <p className="text-xs text-sidebar-foreground/60 mt-1">
                    Developer Sandbox Console
                </p>
            </div>

            {/* User Info */}
            {user && (
                <div className="px-6 py-4 border-b border-sidebar-border">
                    <p className="text-sm font-medium text-sidebar-foreground">
                        {user.name}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60">
                        {user.email}
                    </p>
                    <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-sidebar-accent text-sidebar-accent-foreground rounded">
                        {user.role}
                    </span>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                <Link to="/dashboard" className="block">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
                    >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                    </Button>
                </Link>

                <Link to="/api-keys" className="block">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
                    >
                        <Key className="h-4 w-4 mr-2" />
                        API Keys
                    </Button>
                </Link>

                <Link to="/usage" className="block">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
                    >
                        <ChartLine className="h-4 w-4 mr-2" />
                        Usage
                    </Button>
                </Link>

                <Link to="/docs" className="block">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
                    >
                        <Book className="h-4 w-4 mr-2" />
                        Docs
                    </Button>
                </Link>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-sidebar-border">
                <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full justify-start text-sidebar-foreground bg-transparent"
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                </Button>
            </div>
        </aside>
    );
}
