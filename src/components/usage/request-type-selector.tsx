import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { RequestType } from '@/lib/schemas';
import {
    ALL_REQUEST_TYPES,
    REQUEST_TYPE_CONFIG,
} from '@/lib/request-type-config';
import { Filter } from 'lucide-react';

interface RequestTypeSelectorProps {
    selectedTypes: RequestType[];
    onSelectionChange: (types: RequestType[]) => void;
    showBadges?: boolean;
}

export function RequestTypeSelector({
    selectedTypes,
    onSelectionChange,
    showBadges = true,
}: RequestTypeSelectorProps) {
    const handleToggle = (type: RequestType) => {
        const isSelected = selectedTypes.includes(type);

        if (isSelected) {
            // Remove if already selected
            const newSelection = selectedTypes.filter((t) => t !== type);
            // Ensure at least one type is selected
            if (newSelection.length > 0) {
                onSelectionChange(newSelection);
            }
        } else {
            // Add to selection
            onSelectionChange([...selectedTypes, type]);
        }
    };

    const handleSelectAll = () => {
        onSelectionChange(ALL_REQUEST_TYPES);
    };

    const handleClearAll = () => {
        // Keep at least one selected (default to 2xx)
        onSelectionChange(['2xx']);
    };

    const allSelected = selectedTypes.length === ALL_REQUEST_TYPES.length;
    const someSelected =
        selectedTypes.length > 0 &&
        selectedTypes.length < ALL_REQUEST_TYPES.length;

    return (
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Request Types
                        {someSelected && (
                            <Badge
                                variant="secondary"
                                className="ml-2 rounded-sm px-1"
                            >
                                {selectedTypes.length}
                            </Badge>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>
                        Filter by Request Type
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {ALL_REQUEST_TYPES.map((type) => {
                        const config = REQUEST_TYPE_CONFIG[type];
                        const isSelected = selectedTypes.includes(type);

                        return (
                            <DropdownMenuCheckboxItem
                                key={type}
                                checked={isSelected}
                                onCheckedChange={() => handleToggle(type)}
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{
                                            backgroundColor: config.chartColor,
                                        }}
                                    />
                                    <span>{config.label}</span>
                                </div>
                            </DropdownMenuCheckboxItem>
                        );
                    })}
                    <DropdownMenuSeparator />
                    <div className="flex gap-1 p-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 flex-1 text-xs"
                            onClick={handleSelectAll}
                            disabled={allSelected}
                        >
                            Select All
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 flex-1 text-xs"
                            onClick={handleClearAll}
                            disabled={selectedTypes.length === 1}
                        >
                            Clear
                        </Button>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            {showBadges && selectedTypes.length < ALL_REQUEST_TYPES.length && (
                <div className="flex items-center gap-1">
                    {selectedTypes.map((type) => {
                        const config = REQUEST_TYPE_CONFIG[type];
                        return (
                            <Badge
                                key={type}
                                variant="outline"
                                className="gap-1"
                                style={{
                                    borderColor: config.chartColor,
                                    color: config.chartColor,
                                }}
                            >
                                <div
                                    className="h-2 w-2 rounded-full"
                                    style={{
                                        backgroundColor: config.chartColor,
                                    }}
                                />
                                {config.shortLabel}
                            </Badge>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
