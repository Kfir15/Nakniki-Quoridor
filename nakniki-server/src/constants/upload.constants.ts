export const UPLOAD_CONSTANTS = {
    MAX_AVATAR_SIZE_BYTES: 5 * 1024 * 1024,
    AVATAR_RESIZE_DIMENSION: 256,
    AVATAR_WEBP_QUALITY: 80,
    SUPABASE_AVATARS_BUCKET: 'avatars',
    SUPABASE_PUBLIC_PATH: '/storage/v1/object/public/avatars/',
} as const;