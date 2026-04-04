import sharp from 'sharp';
import { supabase } from '../lib/supabase';
import { UPLOAD_CONSTANTS as U } from '../constants/upload.constants';

export const uploadAvatarToSupabase = async (file: Express.Multer.File): Promise<string> => {
    // resize the image
    const processedBuffer = await sharp(file.buffer)
        .resize(U.AVATAR_RESIZE_DIMENSION, U.AVATAR_RESIZE_DIMENSION, { fit: 'cover', withoutEnlargement: true })
        .webp({ quality: U.AVATAR_WEBP_QUALITY })
        .toBuffer();

    // create the file name
    const fileName = `public/${Date.now()}_avatar.webp`;

    // upload the avatar
    const { error: uploadError } = await supabase.storage
        .from(U.SUPABASE_AVATARS_BUCKET)
        .upload(fileName, processedBuffer, {
            contentType: 'image/webp'
        });
    if (uploadError) throw uploadError;

    // return the url of the avatar
    const { data: publicUrlData } = supabase.storage.from(U.SUPABASE_AVATARS_BUCKET).getPublicUrl(fileName);
    return publicUrlData.publicUrl;
};

export const deleteOldAvatar = async (avatarUrl: string | undefined | null) => {
    // check if the avatar is in storage
    if (avatarUrl && avatarUrl.includes(U.SUPABASE_PUBLIC_PATH)) {
        // get the file path
        const parts = avatarUrl.split(U.SUPABASE_PUBLIC_PATH);
        const filePath = parts[1];

        if (filePath) {
            // remove the avatar
            const { error } = await supabase.storage.from(U.SUPABASE_AVATARS_BUCKET).remove([filePath]);

            if (error) {
                console.error("Failed to delete old avatar:", error);
            }
        }
    }
};