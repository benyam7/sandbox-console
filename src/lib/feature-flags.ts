interface FeatureFlags {
    enableThemeToggle: boolean;
}

// parse env variable to boolean
const parseEnvBoolean = (
    value: string | undefined,
    defaultValue: boolean = false
): boolean => {
    if (!value) return defaultValue;
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
};

// get all feature flags from env variables
export const featureFlags: FeatureFlags = {
    enableThemeToggle: parseEnvBoolean(
        import.meta.env.VITE_FEATURE_THEME_TOGGLE,
        true // default to enabled for backwards compatibility
    ),
};
