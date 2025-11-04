import { z } from 'zod';

// Recursively format a Zod schema into a human-readable string representation
export function formatZodSchema(schema: z.ZodTypeAny): string {
    if (schema instanceof z.ZodObject) {
        const shape = schema.shape;
        const entries = Object.entries(shape);
        const formatted = entries.map(([key, value]) => {
            const formattedValue = formatZodSchema(value as z.ZodTypeAny);
            return `  ${key}: ${formattedValue}`;
        });
        return `{\n${formatted.join(',\n')}\n}`;
    } else if (schema instanceof z.ZodString) {
        return 'string';
    } else if (schema instanceof z.ZodNumber) {
        return 'number';
    } else if (schema instanceof z.ZodBoolean) {
        return 'boolean';
    } else if (schema instanceof z.ZodDate) {
        return 'Date';
    } else if (schema instanceof z.ZodEnum) {
        try {
            const enumDef = schema._def as unknown as {
                values: readonly string[];
            };
            return enumDef.values.map((v) => `"${v}"`).join(' | ');
        } catch {
            return 'enum';
        }
    } else if (schema instanceof z.ZodArray) {
        const innerType = formatZodSchema(
            schema._def.type as unknown as z.ZodTypeAny
        );
        return `${innerType}[]`;
    } else if (schema instanceof z.ZodOptional) {
        const innerType = formatZodSchema(
            schema._def.innerType as unknown as z.ZodTypeAny
        );
        return `${innerType}?`;
    } else if (schema instanceof z.ZodNullable) {
        const innerType = formatZodSchema(
            schema._def.innerType as unknown as z.ZodTypeAny
        );
        return `${innerType} | null`;
    } else if (schema instanceof z.ZodDefault) {
        const innerType = formatZodSchema(
            schema._def.innerType as unknown as z.ZodTypeAny
        );
        return `${innerType} (default)`;
    } else if (schema instanceof z.ZodLiteral) {
        try {
            const literalDef = schema._def as unknown as { value: unknown };
            return JSON.stringify(literalDef.value);
        } catch {
            return 'literal';
        }
    } else {
        return 'unknown';
    }
}
