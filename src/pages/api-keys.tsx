import { APIKeysTable } from '@/components/api-keys/api-keys-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function APIKeysPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        API Keys
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your API keys and access tokens
                    </p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Key
                </Button>
            </div>

            <APIKeysTable />
        </div>
    );
}
