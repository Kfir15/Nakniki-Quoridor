export const AuthProvider = {
    GOOGLE: 'google',
    GITHUB: 'github',
} as const;

export type AuthProviderType = typeof AuthProvider[keyof typeof AuthProvider];