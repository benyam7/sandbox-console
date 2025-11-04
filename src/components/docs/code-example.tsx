import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

interface CodeExampleProps {
    title: string;
    code: string;
    language?: string;
}

export function CodeExample({ title, code, language = '' }: CodeExampleProps) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">{title}</h4>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopy}
                    className="h-8"
                >
                    {isCopied ? (
                        <>
                            <Check className="h-3 w-3 mr-1 text-green-600" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                        </>
                    )}
                </Button>
            </div>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                <code className={`text-sm font-mono ${language}`}>{code}</code>
            </pre>
        </div>
    );
}
