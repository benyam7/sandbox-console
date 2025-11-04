import { useState, useEffect } from 'react';
import { UsageChart } from '@/components/usage/usage-chart';

import { useAuth } from '@/contexts/auth-context';
import { UsageService } from '@/lib/usage-service';
import type { DailyUsage, UsageEvent } from '@/lib/schemas';
import { UsageTable } from '@/components/usage/usage-table';

export default function UsagePage() {
    const { user } = useAuth();
    const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
    const [events, setEvents] = useState<UsageEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUsageData = async () => {
            if (!user?.id) return;

            try {
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

            <UsageChart dailyUsage={dailyUsage} />

            <UsageTable events={events} />
        </div>
    );
}
