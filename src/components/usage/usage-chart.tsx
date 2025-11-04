import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
} from 'recharts';
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
} from '@/components/ui/chart';
import { UsageService } from '@/lib/usage-service';
import type { DailyUsage } from '@/lib/schemas';

interface UsageChartProps {
    dailyUsage: DailyUsage[];
}

export function UsageChart({ dailyUsage }: UsageChartProps) {
    const chartData = UsageService.formatForChart(dailyUsage);

    return (
        <Card>
            <CardHeader>
                <CardTitle>API Requests Over Time</CardTitle>
                <CardDescription>Total requests by status code</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={{
                        totalRequests: {
                            label: 'Total Requests',
                            color: 'hsl(var(--chart-1))',
                        },
                        requests2xx: {
                            label: '2xx Success',
                            color: 'hsl(var(--chart-2))',
                        },
                        requests4xx: {
                            label: '4xx Client Error',
                            color: 'hsl(var(--chart-3))',
                        },
                        requests5xx: {
                            label: '5xx Server Error',
                            color: 'hsl(var(--chart-4))',
                        },
                    }}
                    className="h-[400px]"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="totalRequests"
                                stroke="var(--color-totalRequests)"
                                strokeWidth={2}
                            />
                            <Line
                                type="monotone"
                                dataKey="requests2xx"
                                stroke="var(--color-requests2xx)"
                                strokeWidth={1}
                            />
                            <Line
                                type="monotone"
                                dataKey="requests4xx"
                                stroke="var(--color-requests4xx)"
                                strokeWidth={1}
                            />
                            <Line
                                type="monotone"
                                dataKey="requests5xx"
                                stroke="var(--color-requests5xx)"
                                strokeWidth={1}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
