import { APIKeysTable } from '@/components/api-keys/api-keys-table';
import { CreateAPIKeyModal } from '@/components/api-keys/create-api-key-modal';
import { Button } from '@/components/ui/button';
import type { APIKey } from '@/lib/schemas';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export default function APIKeysPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleKeyCreated = (newKey: APIKey) => {
        setRefreshTrigger((prev) => prev + 1);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };
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
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Key
                </Button>
            </div>

            <APIKeysTable refreshTrigger={refreshTrigger} />
            <CreateAPIKeyModal
                isOpen={isModalOpen}
                onOpenChange={handleModalClose}
                onSuccess={handleKeyCreated}
            />
        </div>
    );
}
