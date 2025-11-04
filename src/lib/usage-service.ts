import {
    KeyUsageSchema,
    type KeyUsage,
    type DailyUsage,
    type UsageEvent,
    type RequestType,
} from './schemas';

// Cache for usage data to avoid repeated fetches
let cachedUsageData: KeyUsage[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Service for managing usage and analytics data
export const UsageService = {
    clearCache(): void {
        cachedUsageData = null;
        cacheTimestamp = 0;
    },

    // Load usage data from JSON file with caching
    async loadUsageData(forceRefresh = false): Promise<KeyUsage[]> {
        const now = Date.now();

        // Return cached data if valid and not forcing refresh
        if (
            !forceRefresh &&
            cachedUsageData &&
            now - cacheTimestamp < CACHE_DURATION
        ) {
            return cachedUsageData;
        }

        try {
            const response = await fetch('/usage-data.json');
            if (!response.ok) {
                throw new Error(
                    `Failed to load usage data: ${response.statusText}`
                );
            }

            const data = await response.json();

            // Validate and parse the data against schema
            if (!Array.isArray(data.usageData)) {
                throw new Error(
                    'Invalid usage data format: usageData is not an array'
                );
            }

            const validatedUsageData: KeyUsage[] = data.usageData.map(
                (item: unknown) => KeyUsageSchema.parse(item)
            );

            // Update cache
            cachedUsageData = validatedUsageData;
            cacheTimestamp = now;

            return validatedUsageData;
        } catch (error) {
            console.error('Error loading usage data:', error);
            throw new Error(
                `Failed to load usage data: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`
            );
        }
    },

    // Get usage data for a specific key
    async getUsageByKeyId(
        keyId: string,
        userId: string
    ): Promise<KeyUsage | null> {
        try {
            const allUsageData = await this.loadUsageData();
            const keyUsage = allUsageData.find(
                (u) => u.keyId === keyId && u.userId === userId
            );
            return keyUsage || null;
        } catch (error) {
            console.error(`Error getting usage for key ${keyId}:`, error);
            return null;
        }
    },

    // Get all usage data for a user
    async getUsageByUserId(userId: string): Promise<KeyUsage[]> {
        try {
            const allUsageData = await this.loadUsageData();
            return allUsageData.filter((u) => u.userId === userId);
        } catch (error) {
            console.error(`Error getting usage for user ${userId}:`, error);
            return [];
        }
    },

    // Get aggregated daily usage across all keys for a user
    async getAggregatedDailyUsage(userId: string): Promise<DailyUsage[]> {
        try {
            const userUsageData = await this.getUsageByUserId(userId);

            if (userUsageData.length === 0) {
                return [];
            }

            // Aggregate all daily usage data
            const dailyMap = new Map<string, DailyUsage>();

            for (const keyUsage of userUsageData) {
                for (const daily of keyUsage.dailyUsage) {
                    const dateKey = daily.date.toISOString().split('T')[0];

                    if (dailyMap.has(dateKey)) {
                        const existing = dailyMap.get(dateKey)!;
                        existing.totalRequests += daily.totalRequests;
                        existing.requests2xx += daily.requests2xx;
                        existing.requests4xx += daily.requests4xx;
                        existing.requests5xx += daily.requests5xx;
                        existing.totalCost += daily.totalCost;
                        existing.events.push(...daily.events);
                    } else {
                        dailyMap.set(dateKey, { ...daily });
                    }
                }
            }

            // Sort by date descending
            return Array.from(dailyMap.values()).sort(
                (a, b) => b.date.getTime() - a.date.getTime()
            );
        } catch (error) {
            console.error('Error aggregating daily usage:', error);
            return [];
        }
    },

    // Get all events for a user (flattened)
    async getAllEvents(userId: string): Promise<UsageEvent[]> {
        try {
            const userUsageData = await this.getUsageByUserId(userId);
            const allEvents: UsageEvent[] = [];

            for (const keyUsage of userUsageData) {
                for (const daily of keyUsage.dailyUsage) {
                    allEvents.push(...daily.events);
                }
            }

            // Sort by date descending
            return allEvents.sort(
                (a, b) => b.date.getTime() - a.date.getTime()
            );
        } catch (error) {
            console.error('Error getting all events:', error);
            return [];
        }
    },

    // Filter daily usage by date range
    filterByDateRange(
        dailyUsage: DailyUsage[],
        startDate: Date,
        endDate: Date
    ): DailyUsage[] {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        return dailyUsage.filter((usage) => {
            const usageDate = new Date(usage.date);
            return usageDate >= start && usageDate <= end;
        });
    },

    // Filter events by request type
    filterEventsByType(
        events: UsageEvent[],
        selectedTypes: RequestType[]
    ): UsageEvent[] {
        if (selectedTypes.length === 0) {
            return events;
        }
        return events.filter((event) => selectedTypes.includes(event.type));
    },

    // Filter and recalculate daily usage based on selected request types
    filterDailyUsageByTypes(
        dailyUsage: DailyUsage[],
        selectedTypes: RequestType[]
    ): DailyUsage[] {
        if (selectedTypes.length === 0 || selectedTypes.length === 3) {
            return dailyUsage;
        }

        return dailyUsage.map((daily) => {
            // Filter events by selected types
            const filteredEvents = daily.events.filter((event) =>
                selectedTypes.includes(event.type)
            );

            // Recalculate totals based on filtered events
            const requests2xx = selectedTypes.includes('2xx')
                ? daily.requests2xx
                : 0;
            const requests4xx = selectedTypes.includes('4xx')
                ? daily.requests4xx
                : 0;
            const requests5xx = selectedTypes.includes('5xx')
                ? daily.requests5xx
                : 0;

            const totalRequests = requests2xx + requests4xx + requests5xx;
            const totalCost = filteredEvents.reduce(
                (sum, event) => sum + event.cost,
                0
            );

            return {
                ...daily,
                totalRequests,
                requests2xx,
                requests4xx,
                requests5xx,
                totalCost,
                events: filteredEvents,
            };
        });
    },

    // Get date range presets
    getDateRangePreset(preset: 'last7days' | 'last30days' | 'last90days'): {
        startDate: Date;
        endDate: Date;
    } {
        const endDate = new Date();
        const startDate = new Date();

        switch (preset) {
            case 'last7days':
                startDate.setDate(endDate.getDate() - 6);
                break;
            case 'last30days':
                startDate.setDate(endDate.getDate() - 29);
                break;
            case 'last90days':
                startDate.setDate(endDate.getDate() - 89);
                break;
        }

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        return { startDate, endDate };
    },

    // Format data for chart (recharts compatible)
    formatForChart(
        dailyUsage: DailyUsage[],
        selectedTypes?: RequestType[]
    ): Array<{
        date: string;
        totalRequests: number;
        requests2xx: number;
        requests4xx: number;
        requests5xx: number;
        totalCost: number;
    }> {
        // Apply type filter if provided
        const filteredData =
            selectedTypes && selectedTypes.length > 0
                ? this.filterDailyUsageByTypes(dailyUsage, selectedTypes)
                : dailyUsage;

        return filteredData
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map((usage) => ({
                date: usage.date.toISOString().split('T')[0],
                totalRequests: usage.totalRequests,
                requests2xx: usage.requests2xx,
                requests4xx: usage.requests4xx,
                requests5xx: usage.requests5xx,
                totalCost: Number(usage.totalCost.toFixed(2)),
            }));
    },

    // Export events to CSV format
    exportToCSV(events: UsageEvent[]): string {
        // CSV headers
        const headers = ['Date', 'Type', 'Kind', 'Count', 'Cost'];
        const csvRows = [headers.join(',')];

        // Add data rows
        for (const event of events) {
            const row = [
                event.date.toISOString().split('T')[0],
                event.type,
                event.kind,
                event.count.toString(),
                `$${event.cost.toFixed(2)}`,
            ];
            csvRows.push(row.join(','));
        }

        return csvRows.join('\n');
    },

    // Export daily usage to CSV format
    exportDailyUsageToCSV(dailyUsage: DailyUsage[]): string {
        const headers = [
            'Date',
            'Total Requests',
            '2xx Requests',
            '4xx Requests',
            '5xx Requests',
            'Total Cost',
        ];
        const csvRows = [headers.join(',')];

        for (const usage of dailyUsage) {
            const row = [
                usage.date.toISOString().split('T')[0],
                usage.totalRequests.toString(),
                usage.requests2xx.toString(),
                usage.requests4xx.toString(),
                usage.requests5xx.toString(),
                `$${usage.totalCost.toFixed(2)}`,
            ];
            csvRows.push(row.join(','));
        }

        return csvRows.join('\n');
    },

    // Trigger CSV download
    downloadCSV(csvContent: string, filename: string): void {
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    },

    // Calculate summary statistics
    calculateSummary(
        dailyUsage: DailyUsage[],
        selectedTypes?: RequestType[]
    ): {
        totalRequests: number;
        totalCost: number;
        avgRequestsPerDay: number;
        avgCostPerDay: number;
        successRate: number;
        errorRate: number;
    } {
        // Apply type filter if provided
        const filteredData =
            selectedTypes && selectedTypes.length > 0
                ? this.filterDailyUsageByTypes(dailyUsage, selectedTypes)
                : dailyUsage;

        if (filteredData.length === 0) {
            return {
                totalRequests: 0,
                totalCost: 0,
                avgRequestsPerDay: 0,
                avgCostPerDay: 0,
                successRate: 0,
                errorRate: 0,
            };
        }

        const totalRequests = filteredData.reduce(
            (sum, d) => sum + d.totalRequests,
            0
        );
        const totalCost = filteredData.reduce((sum, d) => sum + d.totalCost, 0);
        const total2xx = filteredData.reduce(
            (sum, d) => sum + d.requests2xx,
            0
        );
        const total4xx = filteredData.reduce(
            (sum, d) => sum + d.requests4xx,
            0
        );
        const total5xx = filteredData.reduce(
            (sum, d) => sum + d.requests5xx,
            0
        );

        const successRate =
            totalRequests > 0 ? (total2xx / totalRequests) * 100 : 0;
        const errorRate =
            totalRequests > 0
                ? ((total4xx + total5xx) / totalRequests) * 100
                : 0;

        return {
            totalRequests,
            totalCost: Number(totalCost.toFixed(2)),
            avgRequestsPerDay: Number(
                (totalRequests / filteredData.length).toFixed(0)
            ),
            avgCostPerDay: Number((totalCost / filteredData.length).toFixed(2)),
            successRate: Number(successRate.toFixed(2)),
            errorRate: Number(errorRate.toFixed(2)),
        };
    },
};
