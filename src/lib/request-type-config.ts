import type { RequestType } from './schemas';

// Configuration for request types (colors, labels, descriptions)
export const REQUEST_TYPE_CONFIG = {
    '2xx': {
        label: 'Successful (2xx)',
        shortLabel: '2xx',
        color: 'hsl(142, 76%, 36%)', // Green
        chartColor: '#10b981',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        borderColor: 'border-green-300',
        description: 'Successful requests',
    },
    '4xx': {
        label: 'Client Errors (4xx)',
        shortLabel: '4xx',
        color: 'hsl(45, 93%, 47%)', // Yellow/Orange
        chartColor: '#f59e0b',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-300',
        description: 'Client-side errors',
    },
    '5xx': {
        label: 'Server Errors (5xx)',
        shortLabel: '5xx',
        color: 'hsl(0, 84%, 60%)', // Red
        chartColor: '#ef4444',
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        borderColor: 'border-red-300',
        description: 'Server-side errors',
    },
} as const;

// Helper to get all request types
export const ALL_REQUEST_TYPES: RequestType[] = ['2xx', '4xx', '5xx'];

// Helper to get config for a specific type
export const getRequestTypeConfig = (type: RequestType) => {
    return REQUEST_TYPE_CONFIG[type];
};

// Helper to get chart colors for selected types
export const getChartColors = (selectedTypes: RequestType[]) => {
    return selectedTypes.map((type) => REQUEST_TYPE_CONFIG[type].chartColor);
};

// Helper to format request type label
export const formatRequestTypeLabel = (
    type: RequestType,
    short = false
): string => {
    const config = REQUEST_TYPE_CONFIG[type];
    return short ? config.shortLabel : config.label;
};
