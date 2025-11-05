import { CreateKeyInputSchema, APIKeySchema } from '@/lib/schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { CodeExample } from '@/components/docs/code-example';
import { SchemaDisplay } from '@/components/docs/schema-display';
import { getDocsConfig, generateCodeExamples } from '@/lib/docs-service';

const Docs = () => {
    const exampleApiKey = 'your_api_key_here';

    const { apiEndpoint } = getDocsConfig();
    const codeExamples = generateCodeExamples(exampleApiKey, apiEndpoint);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    API Documentation
                </h1>
                <p className="text-muted-foreground mt-2">
                    Learn how to integrate with our API and manage your API keys
                </p>
            </div>

            {/* Installation Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Installation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Get started by creating an API key in your dashboard.
                        Once you have your API key, you can use it to
                        authenticate requests to our API.
                    </p>
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold">
                            1. Create an API Key
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Navigate to the API Keys page and create a new API
                            key. Make sure to save it securely as you won't be
                            able to see it again.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold">
                            2. Include in Requests
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Include your API key in the x-api-key header of all
                            requests:
                        </p>
                        <pre className="bg-muted p-3 rounded text-sm font-mono">
                            <code>x-api-key: YOUR_API_KEY</code>
                        </pre>
                        <Alert className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Common Error</AlertTitle>
                            <AlertDescription>
                                Many developers mistakenly use the API key as an{' '}
                                <code className="bg-muted px-1 rounded">
                                    Authorization
                                </code>{' '}
                                header. However, the API key should be passed as
                                the{' '}
                                <code className="bg-muted px-1 rounded">
                                    x-api-key
                                </code>{' '}
                                header property in API calls.
                            </AlertDescription>
                        </Alert>
                    </div>
                </CardContent>
            </Card>

            {/* Example Code Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Example Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-muted-foreground">
                        Here are examples of how to create an API key using
                        different programming languages:
                    </p>

                    {codeExamples.map((example) => (
                        <CodeExample
                            key={example.title}
                            title={example.title}
                            code={example.code}
                        />
                    ))}
                </CardContent>
            </Card>

            {/* Request Schema Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Request Schema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        The request body schema for creating an API key:
                    </p>
                    <SchemaDisplay
                        title="Create API Key Request"
                        schema={CreateKeyInputSchema}
                    />
                    <div className="space-y-2 text-sm">
                        <p className="font-semibold">Field Descriptions:</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>
                                <code className="bg-muted px-1 rounded">
                                    name
                                </code>{' '}
                                (string, required): A descriptive name for your
                                API key (max 100 characters)
                            </li>
                            <li>
                                <code className="bg-muted px-1 rounded">
                                    userId
                                </code>{' '}
                                (string, required): Your user ID (automatically
                                included in authenticated requests)
                            </li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Response Schema Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Response Schema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        The response schema for API key operations:
                    </p>
                    <SchemaDisplay
                        title="API Key Response"
                        schema={APIKeySchema}
                    />
                    <div className="space-y-2 text-sm">
                        <p className="font-semibold">Field Descriptions:</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>
                                <code className="bg-muted px-1 rounded">
                                    id
                                </code>{' '}
                                (string): Unique identifier for the API key
                            </li>
                            <li>
                                <code className="bg-muted px-1 rounded">
                                    name
                                </code>{' '}
                                (string): The name you provided when creating
                                the key
                            </li>
                            <li>
                                <code className="bg-muted px-1 rounded">
                                    key
                                </code>{' '}
                                (string): The actual API key value (only shown
                                once on creation)
                            </li>
                            <li>
                                <code className="bg-muted px-1 rounded">
                                    maskedKey
                                </code>{' '}
                                (string): A masked version of the key for
                                display (e.g., zk_****abc123)
                            </li>
                            <li>
                                <code className="bg-muted px-1 rounded">
                                    status
                                </code>{' '}
                                ("active" | "revoked"): The current status of
                                the API key
                            </li>
                            <li>
                                <code className="bg-muted px-1 rounded">
                                    createdAt
                                </code>{' '}
                                (Date): When the API key was created
                            </li>
                            <li>
                                <code className="bg-muted px-1 rounded">
                                    lastUsedAt
                                </code>{' '}
                                (Date | null): When the API key was last used
                                (if ever)
                            </li>
                            <li>
                                <code className="bg-muted px-1 rounded">
                                    userId
                                </code>{' '}
                                (string): The ID of the user who owns this API
                                key
                            </li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Docs;
