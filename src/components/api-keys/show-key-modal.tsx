import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, Check } from 'lucide-react';

interface ShowKeyModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    apiKey: string;
    keyName: string;
    title?: string;
    description?: string;
}

export function ShowKeyModal({
    isOpen,
    onOpenChange,
    apiKey,
    keyName,
    title = 'Your API Key',
    description = "Save your API key securely. You won't be able to see it again.",
}: ShowKeyModalProps) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(apiKey);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    };

    const handleClose = () => {
        setIsCopied(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <Card className="bg-muted/50 border-primary/20">
                        <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground mb-2">
                                {keyName}
                            </p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 truncate bg-background px-3 py-2 rounded text-sm font-mono">
                                    {apiKey}
                                </code>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleCopyToClipboard}
                                    className="shrink-0"
                                >
                                    {isCopied ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <p className="text-xs text-muted-foreground">
                        ⚠️ This is the only time your API key will be visible.
                        Store it in a secure location.
                    </p>

                    <Button onClick={handleClose} className="w-full">
                        Done
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
