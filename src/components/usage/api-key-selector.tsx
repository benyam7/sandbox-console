import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ApiKeySelectorProps {
    apiKeys: Array<{ id: string; name: string }>;
    selectedKeys: string[];
    onSelectionChange: (selected: string[]) => void;
}

export function ApiKeySelector({
    apiKeys,
    selectedKeys,
    onSelectionChange,
}: ApiKeySelectorProps) {
    const handleToggleKey = (keyId: string) => {
        if (selectedKeys.includes(keyId)) {
            // Remove the key
            const newSelection = selectedKeys.filter((id) => id !== keyId);
            // Ensure at least one key is selected
            if (newSelection.length > 0) {
                onSelectionChange(newSelection);
            }
        } else {
            // Add the key
            onSelectionChange([...selectedKeys, keyId]);
        }
    };

    const handleSelectAll = () => {
        onSelectionChange(apiKeys.map((key) => key.id));
    };

    const allSelected = selectedKeys.length === apiKeys.length;
    const selectedCount = selectedKeys.length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-lg border-dashed"
                >
                    <span className="text-sm">
                        API Keys{' '}
                        {selectedCount < apiKeys.length && `(${selectedCount})`}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuCheckboxItem
                    checked={allSelected}
                    onCheckedChange={() => {
                        if (allSelected) {
                            // Keep at least one selected
                            if (apiKeys.length > 0) {
                                onSelectionChange([apiKeys[0].id]);
                            }
                        } else {
                            handleSelectAll();
                        }
                    }}
                    className="font-medium"
                >
                    All Keys
                </DropdownMenuCheckboxItem>
                <div className="h-px bg-border my-1" />
                {apiKeys.map((key) => (
                    <DropdownMenuCheckboxItem
                        key={key.id}
                        checked={selectedKeys.includes(key.id)}
                        onCheckedChange={() => handleToggleKey(key.id)}
                    >
                        {key.name}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
