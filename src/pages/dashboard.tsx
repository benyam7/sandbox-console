import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { UsageService } from '@/lib/usage-service';
import { APIKeyService } from '@/lib/api-key-service';
import type { DailyUsage } from '@/lib/schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Key } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [last7DaysUsage, setLast7DaysUsage] = useState<DailyUsage[]>([]);
    const [hasApiKeys, setHasApiKeys] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUsageData = async () => {
            if (!user?.id) {
                setIsLoading(false);
                return;
            }

            try {
                // Check if user has API keys
                const apiKeys = APIKeyService.getAllKeys(user.id);
                setHasApiKeys(apiKeys.length > 0);

                if (apiKeys.length === 0) {
                    setIsLoading(false);
                    return;
                }

                // Get aggregated daily usage for the user
                const dailyUsage = await UsageService.getAggregatedDailyUsage(
                    user.id
                );

                // Get date range for past 7 days
                const { startDate, endDate } =
                    UsageService.getDateRangePreset('last7days');

                // Filter usage data for the past 7 days
                const filteredUsage = UsageService.filterByDateRange(
                    dailyUsage,
                    startDate,
                    endDate
                );

                setLast7DaysUsage(filteredUsage);
            } catch (error) {
                console.error('Error loading usage data:', error);
                setLast7DaysUsage([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadUsageData();
    }, [user?.id]);

    // Calculate aggregated metrics for the past 7 days
    const successfulRequests = last7DaysUsage.reduce(
        (sum, usage) => sum + usage.requests2xx,
        0
    );
    const failedRequests =
        last7DaysUsage.reduce((sum, usage) => sum + usage.requests4xx, 0) +
        last7DaysUsage.reduce((sum, usage) => sum + usage.requests5xx, 0);
    const totalCost = last7DaysUsage.reduce(
        (sum, usage) => sum + usage.totalCost,
        0
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
        );
    }

    // Empty state: No API keys
    if (!hasApiKeys) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Dashboard
                    </h2>
                    <p className="text-muted-foreground">
                        API key usage overview
                    </p>
                </div>

                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="rounded-full bg-muted p-4 mb-4">
                            <Key className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                            No API Keys Found
                        </h3>
                        <p className="text-muted-foreground text-center max-w-md mb-6">
                            You need to create an API key first to start
                            tracking usage. Create your first API key to see
                            usage statistics here.
                        </p>
                        <Button asChild>
                            <Link to="/api-keys">
                                <Key className="h-4 w-4 mr-2" />
                                Create API Key
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">
                    Past 7 days API key usage overview
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {/* Successful Requests Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-medium">
                            Successful Requests
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-500">
                            {successfulRequests.toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            2xx status codes (last 7 days)
                        </p>
                    </CardContent>
                </Card>

                {/* Failed Requests Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-medium">
                            Failed Requests
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-600 dark:text-red-500">
                            {failedRequests.toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            4xx + 5xx status codes (last 7 days)
                        </p>
                    </CardContent>
                </Card>

                {/* Total Cost Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-medium">
                            Total Cost
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            ${totalCost.toFixed(2)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            API usage cost (last 7 days)
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
