import { z } from 'zod';
import { formatZodSchema } from '@/lib/schema-formatter';

interface SchemaDisplayProps {
    title: string;
    schema: z.ZodTypeAny;
}

export function SchemaDisplay({ title, schema }: SchemaDisplayProps) {
    const formattedSchema = formatZodSchema(schema);

    return (
        <div className="space-y-2">
            <h4 className="text-sm font-semibold">{title}</h4>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                <code className="text-sm font-mono">{formattedSchema}</code>
            </pre>
        </div>
    );
}
