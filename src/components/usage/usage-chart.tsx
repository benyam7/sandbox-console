import * as React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from '@/components/ui/chart';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { UsageService } from '@/lib/usage-service';
import type { DailyUsage, RequestType } from '@/lib/schemas';
import {
    REQUEST_TYPE_CONFIG,
    ALL_REQUEST_TYPES,
} from '@/lib/request-type-config';
import { RequestTypeSelector } from './request-type-selector';
import { ApiKeySelector } from './api-key-selector';

interface UsageChartProps {
    dailyUsage: DailyUsage[];
    apiKeys: Array<{ id: string; name: string }>;
    userId: string;
}

export function UsageChart({ dailyUsage, apiKeys, userId }: UsageChartProps) {
    const [timeRange, setTimeRange] = React.useState('90d');
    const [selectedTypes, setSelectedTypes] =
        React.useState<RequestType[]>(ALL_REQUEST_TYPES);
    const [selectedKeys, setSelectedKeys] = React.useState<string[]>(
        apiKeys.map((k) => k.id)
    );
    const [filteredDailyUsage, setFilteredDailyUsage] =
        React.useState<DailyUsage[]>(dailyUsage);

    // Update selectedKeys when apiKeys change
    React.useEffect(() => {
        setSelectedKeys(apiKeys.map((k) => k.id));
    }, [apiKeys]);

    // Fetch filtered data when keys change
    React.useEffect(() => {
        const fetchFilteredData = async () => {
            if (!userId || selectedKeys.length === 0) return;

            const allKeyIds = apiKeys.map((k) => k.id);
            const isAllSelected =
                selectedKeys.length === allKeyIds.length &&
                selectedKeys.every((id) => allKeyIds.includes(id));

            if (isAllSelected) {
                // Use all data
                const aggregated = await UsageService.getAggregatedDailyUsage(
                    userId
                );
                setFilteredDailyUsage(aggregated);
            } else {
                // Filter by selected keys
                const filtered =
                    await UsageService.getAggregatedDailyUsageByKeys(
                        userId,
                        selectedKeys
                    );
                setFilteredDailyUsage(filtered);
            }
        };

        fetchFilteredData();
    }, [selectedKeys, userId, apiKeys]);

    // Get the full chart data first
    const fullChartData = UsageService.formatForChart(
        filteredDailyUsage,
        selectedTypes
    );

    // Filter data based on time range
    const filteredData = React.useMemo(() => {
        if (fullChartData.length === 0) return [];

        const now = new Date();
        let daysToShow = 90;

        if (timeRange === '30d') {
            daysToShow = 30;
        } else if (timeRange === '7d') {
            daysToShow = 7;
        }

        const cutoffDate = new Date(now);
        cutoffDate.setDate(cutoffDate.getDate() - daysToShow);

        return fullChartData.filter((item) => {
            const itemDate = new Date(item.date);
            return itemDate >= cutoffDate;
        });
    }, [fullChartData, timeRange]);

    // Show empty state if no API keys exist
    if (apiKeys.length === 0) {
        return (
            <Card className="pt-0">
                <CardHeader className="border-b">
                    <CardTitle>API Requests Over Time</CardTitle>
                    <CardDescription>
                        Total requests by status code
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-3 mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-muted-foreground"
                        >
                            <path d="M3 3v18h18" />
                            <path d="m19 9-5 5-4-4-3 3" />
                        </svg>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                        No API Keys Yet
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                        Create your first API key to start tracking usage and
                        viewing analytics.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="pt-0">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                    <CardTitle>API Requests Over Time</CardTitle>
                    <CardDescription>
                        Total requests by status code
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    {apiKeys.length > 0 && (
                        <ApiKeySelector
                            apiKeys={apiKeys}
                            selectedKeys={selectedKeys}
                            onSelectionChange={setSelectedKeys}
                        />
                    )}
                    <RequestTypeSelector
                        selectedTypes={selectedTypes}
                        onSelectionChange={setSelectedTypes}
                    />
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger
                            className="w-[160px] rounded-lg"
                            aria-label="Select a time range"
                        >
                            <SelectValue placeholder="Last 3 months" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="90d" className="rounded-lg">
                                Last 3 months
                            </SelectItem>
                            <SelectItem value="30d" className="rounded-lg">
                                Last 30 days
                            </SelectItem>
                            <SelectItem value="7d" className="rounded-lg">
                                Last 7 days
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={{
                        totalRequests: {
                            label: 'Total Requests',
                            color: 'hsl(var(--chart-1))',
                        },
                        requests2xx: {
                            label: REQUEST_TYPE_CONFIG['2xx'].label,
                            color: REQUEST_TYPE_CONFIG['2xx'].color,
                        },
                        requests4xx: {
                            label: REQUEST_TYPE_CONFIG['4xx'].label,
                            color: REQUEST_TYPE_CONFIG['4xx'].color,
                        },
                        requests5xx: {
                            label: REQUEST_TYPE_CONFIG['5xx'].label,
                            color: REQUEST_TYPE_CONFIG['5xx'].color,
                        },
                    }}
                    className="aspect-auto h-[250px] w-full"
                >
                    <AreaChart
                        data={filteredData}
                        margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient
                                id="fillTotalRequests"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-totalRequests)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-totalRequests)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient
                                id="fillRequests2xx"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-requests2xx)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-requests2xx)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient
                                id="fillRequests4xx"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-requests4xx)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-requests4xx)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient
                                id="fillRequests5xx"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-requests5xx)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-requests5xx)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                });
                            }}
                        />
                        <YAxis tickLine={false} axisLine={false} />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => {
                                        return new Date(
                                            value
                                        ).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        });
                                    }}
                                    indicator="dot"
                                />
                            }
                        />
                        {selectedTypes.includes('5xx') && (
                            <Area
                                dataKey="requests5xx"
                                type="natural"
                                fill="url(#fillRequests5xx)"
                                stroke="var(--color-requests5xx)"
                                stackId="a"
                                name={REQUEST_TYPE_CONFIG['5xx'].label}
                            />
                        )}
                        {selectedTypes.includes('4xx') && (
                            <Area
                                dataKey="requests4xx"
                                type="natural"
                                fill="url(#fillRequests4xx)"
                                stroke="var(--color-requests4xx)"
                                stackId="a"
                                name={REQUEST_TYPE_CONFIG['4xx'].label}
                            />
                        )}
                        {selectedTypes.includes('2xx') && (
                            <Area
                                dataKey="requests2xx"
                                type="natural"
                                fill="url(#fillRequests2xx)"
                                stroke="var(--color-requests2xx)"
                                stackId="a"
                                name={REQUEST_TYPE_CONFIG['2xx'].label}
                            />
                        )}
                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
