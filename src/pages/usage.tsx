import { useState, useEffect } from 'react';
import { UsageChart } from '@/components/usage/usage-chart';
import { useAuth } from '@/contexts/auth-context';
import { UsageService } from '@/lib/usage-service';
import { APIKeyService } from '@/lib/api-key-service';
import type { DailyUsage, UsageEvent } from '@/lib/schemas';
import { UsageTable } from '@/components/usage/usage-table';

interface ApiKeyInfo {
    id: string;
    name: string;
}

export default function UsagePage() {
    const { user } = useAuth();
    const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
    const [events, setEvents] = useState<UsageEvent[]>([]);
    const [apiKeys, setApiKeys] = useState<ApiKeyInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUsageData = async () => {
            if (!user?.id) return;

            try {
                // Load all key usage data
                const allKeyUsage = await UsageService.getUsageByUserId(
                    user.id
                );

                // Load API keys to get names
                const userApiKeys = APIKeyService.getAllKeys(user.id);
                const keyInfo = allKeyUsage.map((ku) => {
                    const apiKey = userApiKeys.find((k) => k.id === ku.keyId);
                    return {
                        id: ku.keyId,
                        name: apiKey?.name || ku.keyId,
                    };
                });
                setApiKeys(keyInfo);

                // Initial load with all keys
                const aggregatedUsage =
                    await UsageService.getAggregatedDailyUsage(user.id);
                const allEvents = await UsageService.getAllEvents(user.id);

                setDailyUsage(aggregatedUsage);
                setEvents(allEvents);
            } catch (error) {
                console.error('[v0] Error loading usage data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadUsageData();
    }, [user?.id]);

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Usage & Analytics
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Monitor your API usage, requests, and costs
                    </p>
                </div>
                <div className="text-center text-muted-foreground">
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Usage & Analytics
                </h1>
                <p className="text-muted-foreground mt-2">
                    Monitor your API usage, requests, and costs
                </p>
            </div>

            <UsageChart
                dailyUsage={dailyUsage}
                apiKeys={apiKeys}
                userId={user?.id || ''}
            />

            <UsageTable
                events={events}
                apiKeys={apiKeys}
                userId={user?.id || ''}
            />
        </div>
    );
}
